import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, SupportTicketStatus } from "@prisma/client";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSupportSlaPolicyDto } from "./dto/create-support-sla-policy.dto";
import { CreateSupportTicketCommentDto } from "./dto/create-support-ticket-comment.dto";
import { CreateSupportTicketDto } from "./dto/create-support-ticket.dto";
import { UpdateSupportTicketDto } from "./dto/update-support-ticket.dto";

const supportTicketInclude = Prisma.validator<Prisma.SupportTicketInclude>()({
  institution: {
    select: {
      id: true,
      name: true,
    },
  },
  campus: {
    select: {
      id: true,
      name: true,
    },
  },
  laboratory: {
    select: {
      id: true,
      name: true,
    },
  },
  requester: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  },
  assignedToUser: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  },
  slaPolicy: true,
  comments: {
    include: {
      authorUser: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  },
});

function getHoursUntil(date: Date | null | undefined) {
  if (!date) {
    return null;
  }

  return Number(((date.getTime() - Date.now()) / (1000 * 60 * 60)).toFixed(2));
}

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async findTickets(user: JwtPayload) {
    const isPrivileged = this.isPrivileged(user);

    const tickets = await this.prisma.supportTicket.findMany({
      where: isPrivileged
        ? {
            institutionId: user.institutionId,
          }
        : {
            institutionId: user.institutionId,
            requesterId: user.sub,
          },
      include: supportTicketInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    return tickets.map((ticket) => this.enrichTicket(ticket));
  }

  async findTicket(ticketId: string, user: JwtPayload) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: supportTicketInclude,
    });

    if (!ticket || ticket.institutionId !== user.institutionId) {
      throw new NotFoundException("Support ticket not found");
    }

    if (!this.isPrivileged(user) && ticket.requesterId !== user.sub) {
      throw new ForbiddenException("User cannot access this support ticket");
    }

    return this.enrichTicket(ticket);
  }

  async createTicket(dto: CreateSupportTicketDto, user: JwtPayload) {
    await this.assertCampusAndLaboratory(dto.campusId, dto.laboratoryId, user.institutionId);

    const slaPolicy = await this.prisma.supportSlaPolicy.findFirst({
      where: {
        institutionId: user.institutionId,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const now = new Date();
    const responseHours = slaPolicy?.responseHours ?? 48;
    const resolutionHours = slaPolicy?.resolutionHours ?? null;
    const responseDueAt = new Date(now.getTime() + responseHours * 60 * 60 * 1000);
    const resolutionDueAt = resolutionHours
      ? new Date(now.getTime() + resolutionHours * 60 * 60 * 1000)
      : undefined;

    const ticket = await this.prisma.supportTicket.create({
      data: {
        institutionId: user.institutionId,
        campusId: dto.campusId,
        laboratoryId: dto.laboratoryId,
        requesterId: user.sub,
        slaPolicyId: slaPolicy?.id,
        subject: dto.subject,
        description: dto.description,
        category: dto.category,
        priority: dto.priority,
        responseDueAt,
        resolutionDueAt,
      },
      include: supportTicketInclude,
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.sub,
        action: "SUPPORT_TICKET_CREATED",
        entityType: "SupportTicket",
        entityId: ticket.id,
        meta: JSON.parse(
          JSON.stringify({
            institutionId: user.institutionId,
            campusId: dto.campusId,
            laboratoryId: dto.laboratoryId,
            priority: dto.priority ?? "MEDIUM",
          }),
        ) as Prisma.InputJsonValue,
      },
    });

    return this.enrichTicket(ticket);
  }

  async addComment(
    ticketId: string,
    dto: CreateSupportTicketCommentDto,
    user: JwtPayload,
  ) {
    const ticket = await this.findTicket(ticketId, user);
    const isPrivileged = this.isPrivileged(user);

    if (dto.isInternal && !isPrivileged) {
      throw new ForbiddenException("Internal comments require admin or support access");
    }

    const comment = await this.prisma.supportTicketComment.create({
      data: {
        ticketId: ticket.id,
        authorUserId: user.sub,
        body: dto.body,
        isInternal: dto.isInternal ?? false,
      },
      include: {
        authorUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (isPrivileged) {
      await this.prisma.supportTicket.update({
        where: { id: ticket.id },
        data: {
          firstRespondedAt: ticket.firstRespondedAt ?? new Date(),
          status:
            ticket.status === SupportTicketStatus.OPEN
              ? SupportTicketStatus.IN_PROGRESS
              : ticket.status,
        },
      });
    }

    await this.prisma.auditLog.create({
      data: {
        userId: user.sub,
        action: "SUPPORT_TICKET_COMMENTED",
        entityType: "SupportTicket",
        entityId: ticket.id,
        meta: {
          isInternal: dto.isInternal ?? false,
        } as Prisma.InputJsonValue,
      },
    });

    return comment;
  }

  async updateTicket(
    ticketId: string,
    dto: UpdateSupportTicketDto,
    user: JwtPayload,
  ) {
    if (!this.isPrivileged(user)) {
      throw new ForbiddenException("Only admin or support can update tickets");
    }

    const ticket = await this.findTicket(ticketId, user);

    if (dto.assignedToUserId) {
      const assignee = await this.prisma.userInstitution.findFirst({
        where: {
          userId: dto.assignedToUserId,
          institutionId: user.institutionId,
        },
        include: {
          user: {
            include: {
              roles: {
                include: {
                  role: true,
                },
              },
            },
          },
        },
      });

      if (!assignee) {
        throw new BadRequestException("Assigned user does not belong to this institution");
      }

      const hasSupportPrivilege = assignee.user.roles.some((roleAssignment) =>
        ["ADMIN", "SUPPORT"].includes(roleAssignment.role.name),
      );

      if (!hasSupportPrivilege) {
        throw new BadRequestException(
          "Assigned user must have ADMIN or SUPPORT role",
        );
      }
    }

    const now = new Date();
    const updated = await this.prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        assignedToUserId: dto.assignedToUserId,
        priority: dto.priority,
        status: dto.status,
        firstRespondedAt:
          dto.status === SupportTicketStatus.IN_PROGRESS
            ? ticket.firstRespondedAt ?? now
            : ticket.firstRespondedAt,
        resolvedAt:
          dto.status === SupportTicketStatus.RESOLVED
            ? ticket.resolvedAt ?? now
            : ticket.resolvedAt,
        closedAt:
          dto.status === SupportTicketStatus.CLOSED
            ? ticket.closedAt ?? now
            : ticket.closedAt,
      },
      include: supportTicketInclude,
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.sub,
        action: "SUPPORT_TICKET_UPDATED",
        entityType: "SupportTicket",
        entityId: ticket.id,
        meta: JSON.parse(
          JSON.stringify({
            status: dto.status,
            priority: dto.priority,
            assignedToUserId: dto.assignedToUserId,
          }),
        ) as Prisma.InputJsonValue,
      },
    });

    return this.enrichTicket(updated);
  }

  findSlaPolicies(user: JwtPayload) {
    if (!this.isPrivileged(user)) {
      throw new ForbiddenException("Only admin or support can list SLA policies");
    }

    return this.prisma.supportSlaPolicy.findMany({
      where: {
        institutionId: user.institutionId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOperationsSummary(user: JwtPayload) {
    if (!this.isPrivileged(user)) {
      throw new ForbiddenException("Only admin or support can access SLA operations");
    }

    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const [
      openTickets,
      inProgressTickets,
      responseBreached,
      resolutionBreached,
      responseDueSoon,
      resolutionDueSoon,
    ] = await Promise.all([
      this.prisma.supportTicket.count({
        where: {
          institutionId: user.institutionId,
          status: SupportTicketStatus.OPEN,
        },
      }),
      this.prisma.supportTicket.count({
        where: {
          institutionId: user.institutionId,
          status: SupportTicketStatus.IN_PROGRESS,
        },
      }),
      this.prisma.supportTicket.count({
        where: {
          institutionId: user.institutionId,
          status: {
            in: [SupportTicketStatus.OPEN, SupportTicketStatus.IN_PROGRESS],
          },
          firstRespondedAt: null,
          responseDueAt: {
            lt: now,
          },
        },
      }),
      this.prisma.supportTicket.count({
        where: {
          institutionId: user.institutionId,
          status: {
            in: [SupportTicketStatus.OPEN, SupportTicketStatus.IN_PROGRESS],
          },
          resolutionDueAt: {
            not: null,
            lt: now,
          },
        },
      }),
      this.prisma.supportTicket.count({
        where: {
          institutionId: user.institutionId,
          status: {
            in: [SupportTicketStatus.OPEN, SupportTicketStatus.IN_PROGRESS],
          },
          firstRespondedAt: null,
          responseDueAt: {
            gte: now,
            lte: next24Hours,
          },
        },
      }),
      this.prisma.supportTicket.count({
        where: {
          institutionId: user.institutionId,
          status: {
            in: [SupportTicketStatus.OPEN, SupportTicketStatus.IN_PROGRESS],
          },
          resolutionDueAt: {
            not: null,
            gte: now,
            lte: next24Hours,
          },
        },
      }),
    ]);

    return {
      institutionId: user.institutionId,
      openTickets,
      inProgressTickets,
      responseBreached,
      resolutionBreached,
      responseDueSoon,
      resolutionDueSoon,
    };
  }

  async createSlaPolicy(dto: CreateSupportSlaPolicyDto, user: JwtPayload) {
    if (!user.roles.includes("ADMIN")) {
      throw new ForbiddenException("Only admin can create SLA policies");
    }

    const policy = await this.prisma.supportSlaPolicy.create({
      data: {
        institutionId: user.institutionId,
        name: dto.name,
        responseHours: dto.responseHours ?? 48,
        resolutionHours: dto.resolutionHours,
        isActive: dto.isActive ?? true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.sub,
        action: "SUPPORT_SLA_POLICY_CREATED",
        entityType: "SupportSlaPolicy",
        entityId: policy.id,
        meta: {
          responseHours: policy.responseHours,
          resolutionHours: policy.resolutionHours,
          isActive: policy.isActive,
        } as Prisma.InputJsonValue,
      },
    });

    return policy;
  }

  private isPrivileged(user: JwtPayload) {
    return user.roles.includes("ADMIN") || user.roles.includes("SUPPORT");
  }

  private enrichTicket<
    T extends {
      status: SupportTicketStatus;
      responseDueAt: Date;
      resolutionDueAt: Date | null;
      firstRespondedAt: Date | null;
    },
  >(ticket: T) {
    const responseBreached =
      ticket.firstRespondedAt === null &&
      (ticket.status === SupportTicketStatus.OPEN ||
        ticket.status === SupportTicketStatus.IN_PROGRESS) &&
      ticket.responseDueAt.getTime() < Date.now();
    const resolutionBreached =
      (ticket.status === SupportTicketStatus.OPEN ||
        ticket.status === SupportTicketStatus.IN_PROGRESS) &&
      ticket.resolutionDueAt !== null &&
      ticket.resolutionDueAt.getTime() < Date.now();

    return {
      ...ticket,
      sla: {
        responseDueAt: ticket.responseDueAt,
        resolutionDueAt: ticket.resolutionDueAt,
        firstRespondedAt: ticket.firstRespondedAt,
        responseBreached,
        resolutionBreached,
        responseHoursRemaining: getHoursUntil(ticket.responseDueAt),
        resolutionHoursRemaining: getHoursUntil(ticket.resolutionDueAt),
      },
    };
  }

  private async assertCampusAndLaboratory(
    campusId: string | undefined,
    laboratoryId: string | undefined,
    institutionId: string,
  ) {
    if (campusId) {
      const campus = await this.prisma.campus.findFirst({
        where: {
          id: campusId,
          institutionId,
        },
      });

      if (!campus) {
        throw new BadRequestException("Campus does not belong to the active institution");
      }
    }

    if (laboratoryId) {
      const laboratory = await this.prisma.laboratory.findFirst({
        where: {
          id: laboratoryId,
          campus: {
            institutionId,
          },
        },
      });

      if (!laboratory) {
        throw new BadRequestException(
          "Laboratory does not belong to the active institution",
        );
      }
    }
  }
}
