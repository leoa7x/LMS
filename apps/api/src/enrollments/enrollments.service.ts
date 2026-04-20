import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EnrollmentStatus, ScopeType } from "@prisma/client";
import { AdministrationScopeService } from "../administration-scope/administration-scope.service";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { PrismaService } from "../prisma/prisma.service";
import { AssignLearningPathDto } from "./dto/assign-learning-path.dto";
import { CreateEnrollmentDto } from "./dto/create-enrollment.dto";

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly administrationScopeService: AdministrationScopeService,
  ) {}

  findAll(user: JwtPayload) {
    return this.prisma.studentEnrollment.findMany({
      where: {
        institutionId: user.institutionId,
      },
      include: {
        institution: true,
        course: true,
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        learningPathAssignment: {
          include: {
            learningPath: true,
          },
        },
        progress: true,
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });
  }

  findLearningPathAssignments(user: JwtPayload) {
    return this.prisma.studentLearningPathAssignment.findMany({
      where: {
        institutionId: user.institutionId,
      },
      include: {
        institution: true,
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        learningPath: {
          include: {
            courses: {
              include: {
                course: true,
              },
              orderBy: {
                sortOrder: "asc",
              },
            },
          },
        },
        enrollments: {
          include: {
            course: true,
            progress: true,
          },
        },
      },
      orderBy: {
        effectiveFrom: "desc",
      },
    });
  }

  async create(dto: CreateEnrollmentDto, actor: JwtPayload) {
    this.administrationScopeService.assertInstitutionAccess(
      actor,
      dto.institutionId,
    );

    const studentProfile = await this.prisma.studentAcademicProfile.findUnique({
      where: { userId: dto.studentId },
      include: {
        institutionMember: true,
      },
    });

    if (!studentProfile) {
      throw new BadRequestException(
        "Student must have an academic profile before enrollment",
      );
    }

    if (studentProfile.institutionMember.institutionId !== dto.institutionId) {
      throw new BadRequestException(
        "Student profile does not belong to the selected institution",
      );
    }

    const assignedByUserId = dto.assignedByUserId ?? actor.sub;

    if (dto.assignedByUserId && dto.assignedByUserId !== actor.sub) {
      throw new BadRequestException(
        "assignedByUserId must match the authenticated user",
      );
    }

    const enrollment = await this.prisma.$transaction(async (tx) => {
      const createdEnrollment = await tx.studentEnrollment.create({
        data: {
          institutionId: dto.institutionId,
          studentId: dto.studentId,
          courseId: dto.courseId,
          assignedByUserId,
          assignedLevelCode: dto.assignedLevelCode ?? studentProfile.currentLevel,
          notes: dto.notes,
        },
        include: {
          institution: true,
          course: true,
          student: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      await tx.studentProgress.upsert({
        where: {
          enrollmentId: createdEnrollment.id,
        },
        update: {},
        create: {
          enrollmentId: createdEnrollment.id,
        },
      });

      await tx.studentVisibilityAssignment.create({
        data: {
          studentProfileId: studentProfile.id,
          assignmentType: ScopeType.COURSE,
          courseId: dto.courseId,
          levelCode: dto.assignedLevelCode ?? studentProfile.currentLevel,
          assignedByUserId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: assignedByUserId,
          action: "ENROLLMENT_CREATED",
          entityType: "StudentEnrollment",
          entityId: createdEnrollment.id,
          meta: {
            institutionId: dto.institutionId,
            studentId: dto.studentId,
            courseId: dto.courseId,
            assignedLevelCode: dto.assignedLevelCode ?? studentProfile.currentLevel,
          },
        },
      });

      return createdEnrollment;
    });

    return enrollment;
  }

  async assignLearningPath(dto: AssignLearningPathDto, actor: JwtPayload) {
    this.administrationScopeService.assertInstitutionAccess(
      actor,
      dto.institutionId,
    );

    if (dto.assignedByUserId !== actor.sub) {
      throw new BadRequestException(
        "assignedByUserId must match the authenticated user",
      );
    }

    const studentProfile = await this.prisma.studentAcademicProfile.findUnique({
      where: { userId: dto.studentId },
      include: {
        institutionMember: true,
      },
    });

    if (!studentProfile) {
      throw new BadRequestException(
        "Student must have an academic profile before assigning a learning path",
      );
    }

    if (studentProfile.institutionMember.institutionId !== dto.institutionId) {
      throw new BadRequestException(
        "Student profile does not belong to the selected institution",
      );
    }

    const learningPath = await this.prisma.learningPath.findUnique({
      where: { id: dto.learningPathId },
      include: {
        courses: {
          include: {
            course: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    if (!learningPath) {
      throw new NotFoundException("Learning path not found");
    }

    return this.prisma.$transaction(async (tx) => {
      const assignment = await tx.studentLearningPathAssignment.create({
        data: {
          institutionId: dto.institutionId,
          studentId: dto.studentId,
          learningPathId: dto.learningPathId,
          assignedLevelCode: dto.assignedLevelCode,
          assignedByUserId: dto.assignedByUserId,
          effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : new Date(),
          effectiveUntil: dto.effectiveUntil ? new Date(dto.effectiveUntil) : undefined,
          notes: dto.notes,
          status: EnrollmentStatus.ACTIVE,
        },
      });

      await tx.studentVisibilityAssignment.create({
        data: {
          studentProfileId: studentProfile.id,
          assignmentType: ScopeType.LEARNING_PATH,
          learningPathId: dto.learningPathId,
          levelCode: dto.assignedLevelCode,
          assignedByUserId: dto.assignedByUserId,
          effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : new Date(),
          effectiveUntil: dto.effectiveUntil ? new Date(dto.effectiveUntil) : undefined,
        },
      });

      const enrollments = [];

      for (const linkedCourse of learningPath.courses) {
        const enrollment = await tx.studentEnrollment.upsert({
          where: {
            institutionId_studentId_courseId: {
              institutionId: dto.institutionId,
              studentId: dto.studentId,
              courseId: linkedCourse.courseId,
            },
          },
          update: {
            learningPathAssignmentId: assignment.id,
            assignedByUserId: dto.assignedByUserId,
            assignedLevelCode: dto.assignedLevelCode,
            notes: dto.notes,
            status: EnrollmentStatus.ACTIVE,
          },
          create: {
            institutionId: dto.institutionId,
            studentId: dto.studentId,
            courseId: linkedCourse.courseId,
            learningPathAssignmentId: assignment.id,
            assignedByUserId: dto.assignedByUserId,
            assignedLevelCode: dto.assignedLevelCode,
            notes: dto.notes,
            status: EnrollmentStatus.ACTIVE,
          },
          include: {
            course: true,
          },
        });

        await tx.studentProgress.upsert({
          where: {
            enrollmentId: enrollment.id,
          },
          update: {},
          create: {
            enrollmentId: enrollment.id,
          },
        });

        await tx.studentVisibilityAssignment.create({
          data: {
            studentProfileId: studentProfile.id,
            assignmentType: ScopeType.COURSE,
            courseId: linkedCourse.courseId,
            levelCode: dto.assignedLevelCode,
            assignedByUserId: dto.assignedByUserId,
            effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : new Date(),
            effectiveUntil: dto.effectiveUntil ? new Date(dto.effectiveUntil) : undefined,
          },
        });

        enrollments.push(enrollment);
      }

      await tx.auditLog.create({
        data: {
          userId: dto.assignedByUserId,
          action: "LEARNING_PATH_ASSIGNED",
          entityType: "StudentLearningPathAssignment",
          entityId: assignment.id,
          meta: {
            institutionId: dto.institutionId,
            studentId: dto.studentId,
            learningPathId: dto.learningPathId,
            assignedLevelCode: dto.assignedLevelCode,
            generatedEnrollments: enrollments.map((item) => item.id),
          },
        },
      });

      return {
        assignment,
        enrollments,
      };
    });
  }
}
