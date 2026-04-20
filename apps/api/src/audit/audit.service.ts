import { Injectable } from "@nestjs/common";
import { AccessEventType, Prisma } from "@prisma/client";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { PrismaService } from "../prisma/prisma.service";
import { FindAccessEventsQueryDto } from "./dto/find-access-events-query.dto";
import { FindAuditQueryDto } from "./dto/find-audit-query.dto";

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(user: JwtPayload, query: FindAuditQueryDto) {
    return this.prisma.auditLog.findMany({
      where: {
        institutionId: user.institutionId,
        action: query.action,
        entityType: query.entityType,
        userId: query.userId,
      },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        institutionMember: {
          select: {
            id: true,
            institutionId: true,
          },
        },
        session: {
          select: {
            id: true,
            status: true,
            issuedAt: true,
            lastSeenAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  findAccessEvents(user: JwtPayload, query: FindAccessEventsQueryDto) {
    return this.prisma.accessEventLog.findMany({
      where: {
        institutionId: user.institutionId,
        userId: query.userId,
        eventType: query.eventType as AccessEventType | undefined,
      },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        institutionMember: {
          select: {
            id: true,
            institutionId: true,
          },
        },
        session: {
          select: {
            id: true,
            status: true,
            issuedAt: true,
            lastSeenAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  create(data: {
    institutionId?: string;
    userId?: string;
    institutionMemberId?: string;
    sessionId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    actorRoles?: string[];
    ipAddress?: string;
    userAgent?: string;
    meta?: Record<string, unknown>;
  }) {
    return this.prisma.auditLog.create({
      data: {
        institutionId: data.institutionId,
        userId: data.userId,
        institutionMemberId: data.institutionMemberId,
        sessionId: data.sessionId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        actorRoles: data.actorRoles ?? [],
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        meta: data.meta as Prisma.InputJsonValue | undefined,
      },
    });
  }

  createAccessEvent(data: {
    institutionId?: string;
    userId?: string;
    institutionMemberId?: string;
    sessionId?: string;
    eventType: AccessEventType;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.accessEventLog.create({
      data,
    });
  }
}
