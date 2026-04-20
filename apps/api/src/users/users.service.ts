import {
  AccessSessionStatus,
  MembershipStatus,
  Prisma,
  ScopeStatus,
  ScopeType,
  SystemRole,
  UserLifecycleEventType,
  UserStatus,
} from "@prisma/client";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { hash } from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserStatusDto } from "./dto/update-user-status.dto";

const fullUserInclude = Prisma.validator<Prisma.UserInclude>()({
  institutions: {
    include: {
      institution: true,
      campus: true,
      laboratory: true,
      license: true,
      contractTerm: true,
    },
  },
  roles: {
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
      institutionMembership: {
        include: {
          institution: true,
          campus: true,
          laboratory: true,
          license: true,
          contractTerm: true,
        },
      },
    },
  },
  studentProfile: {
    include: {
      visibilityRules: true,
    },
  },
  teacherScopes: true,
  accessSessions: {
    where: {
      status: AccessSessionStatus.ACTIVE,
    },
    orderBy: {
      issuedAt: "desc",
    },
  },
});

export type UserWithAccessContext = Prisma.UserGetPayload<{
  include: typeof fullUserInclude;
}>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: fullUserInclude,
    });
  }

  findOne(id: string): Promise<UserWithAccessContext | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: fullUserInclude,
    });
  }

  findByEmail(email: string): Promise<UserWithAccessContext | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: fullUserInclude,
    });
  }

  async create(dto: CreateUserDto, actorUserId?: string) {
    const passwordHash = await hash(dto.password, 10);

    const createdUserId = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          passwordHash,
          preferredLang: dto.preferredLang ?? "es",
          status: dto.status ?? UserStatus.ACTIVE,
          isActive: (dto.status ?? UserStatus.ACTIVE) === UserStatus.ACTIVE,
          documentType: dto.documentType,
          documentNumber: dto.documentNumber,
          phone: dto.phone,
          avatarUrl: dto.avatarUrl,
        },
      });

      const membership = await tx.userInstitution.create({
        data: {
          userId: user.id,
          institutionId: dto.membership.institutionId,
          campusId: dto.membership.campusId,
          laboratoryId: dto.membership.laboratoryId,
          licenseId: dto.membership.licenseId,
          contractTermId: dto.membership.contractTermId,
          membershipStatus: dto.membership.membershipStatus ?? MembershipStatus.ACTIVE,
          accessStartAt: dto.membership.accessStartAt
            ? new Date(dto.membership.accessStartAt)
            : new Date(),
          accessEndAt: dto.membership.accessEndAt
            ? new Date(dto.membership.accessEndAt)
            : undefined,
        },
      });

      for (const assignment of dto.roleAssignments) {
        const role = await tx.role.findUnique({
          where: { name: assignment.role },
        });

        if (!role) {
          throw new BadRequestException(`Role ${assignment.role} does not exist`);
        }

        await tx.userRole.create({
          data: {
            userId: user.id,
            roleId: role.id,
            institutionMemberId: membership.id,
            scopeType: assignment.scopeType ?? ScopeType.INSTITUTION,
            scopeStatus: ScopeStatus.ACTIVE,
            campusId: assignment.campusId,
            laboratoryId: assignment.laboratoryId,
            technicalAreaId: assignment.technicalAreaId,
            courseId: assignment.courseId,
            learningPathId: assignment.learningPathId,
            levelCode: assignment.levelCode,
            assignedByUserId: actorUserId,
          },
        });
      }

      if (
        dto.studentProfile &&
        dto.roleAssignments.some((assignment) => assignment.role === SystemRole.STUDENT)
      ) {
        await tx.studentAcademicProfile.create({
          data: {
            userId: user.id,
            institutionMemberId: membership.id,
            currentLevel: dto.studentProfile.currentLevel,
            academicStatus: dto.studentProfile.academicStatus,
            cohort: dto.studentProfile.cohort,
            entryDate: dto.studentProfile.entryDate
              ? new Date(dto.studentProfile.entryDate)
              : undefined,
            expectedEndDate: dto.studentProfile.expectedEndDate
              ? new Date(dto.studentProfile.expectedEndDate)
              : undefined,
          },
        });
      }

      if (dto.teacherScopes?.length) {
        const hasTeacherRole = dto.roleAssignments.some(
          (assignment) => assignment.role === SystemRole.TEACHER,
        );

        if (!hasTeacherRole) {
          throw new BadRequestException(
            "Teacher scopes require a TEACHER role assignment",
          );
        }

        await tx.teacherScopeAssignment.createMany({
          data: dto.teacherScopes.map((scope) => ({
            teacherUserId: user.id,
            scopeType: scope.scopeType,
            institutionId: scope.institutionId ?? dto.membership.institutionId,
            campusId: scope.campusId,
            laboratoryId: scope.laboratoryId,
            technicalAreaId: scope.technicalAreaId,
            courseId: scope.courseId,
            learningPathId: scope.learningPathId,
            levelCode: scope.levelCode,
            effectiveFrom: scope.effectiveFrom ? new Date(scope.effectiveFrom) : new Date(),
            effectiveUntil: scope.effectiveUntil
              ? new Date(scope.effectiveUntil)
              : undefined,
          })),
        });
      }

      await tx.auditLog.create({
        data: {
          userId: actorUserId,
          action: "USER_CREATED",
          entityType: "User",
          entityId: user.id,
          meta: JSON.parse(
            JSON.stringify({
              membership: dto.membership,
              roleAssignments: dto.roleAssignments,
              hasStudentProfile: Boolean(dto.studentProfile),
              teacherScopesCount: dto.teacherScopes?.length ?? 0,
            }),
          ) as Prisma.InputJsonValue,
        },
      });

      await tx.userLifecycleAudit.create({
        data: {
          userId: user.id,
          eventType: UserLifecycleEventType.CREATED,
          performedByUserId: actorUserId ?? user.id,
          afterState: {
            status: user.status,
            membershipStatus: dto.membership.membershipStatus ?? MembershipStatus.ACTIVE,
          },
        },
      });

      return user.id;
    });

    return this.findOneOrFail(createdUserId);
  }

  async updateStatus(userId: string, dto: UpdateUserStatusDto, actorUserId?: string) {
    const existing = await this.findOneOrFail(userId);

    const updatedUserId = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          status: dto.status,
          isActive: dto.status === UserStatus.ACTIVE,
          deactivatedAt: dto.status === UserStatus.ACTIVE ? null : new Date(),
          deactivationReason: dto.status === UserStatus.ACTIVE ? null : dto.reason,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: actorUserId,
          action: dto.status === UserStatus.ACTIVE ? "USER_ACTIVATED" : "USER_DEACTIVATED",
          entityType: "User",
          entityId: userId,
          meta: {
            previousStatus: existing.status,
            newStatus: dto.status,
            reason: dto.reason,
          },
        },
      });

      await tx.userLifecycleAudit.create({
        data: {
          userId,
          eventType:
            dto.status === UserStatus.ACTIVE
              ? UserLifecycleEventType.ACTIVATED
              : UserLifecycleEventType.DEACTIVATED,
          performedByUserId: actorUserId ?? userId,
          reason: dto.reason,
          beforeState: {
            status: existing.status,
            isActive: existing.isActive,
          },
          afterState: {
            status: user.status,
            isActive: user.isActive,
          },
        },
      });

      if (dto.status !== UserStatus.ACTIVE) {
        await tx.accessSession.updateMany({
          where: {
            userId,
            status: AccessSessionStatus.ACTIVE,
          },
          data: {
            status: AccessSessionStatus.REVOKED,
            revokedAt: new Date(),
            revokedReason: dto.reason ?? "User status changed",
          },
        });
      }

      return user.id;
    });

    return this.findOneOrFail(updatedUserId);
  }

  private async findOneOrFail(id: string): Promise<UserWithAccessContext> {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }
}
