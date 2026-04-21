import { Injectable } from "@nestjs/common";
import { AccessEventType, Prisma } from "@prisma/client";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";
import { PrismaService } from "../prisma/prisma.service";
import { FindAccessEventsQueryDto } from "./dto/find-access-events-query.dto";
import { FindAccessSessionsQueryDto } from "./dto/find-access-sessions-query.dto";
import { FindAuditQueryDto } from "./dto/find-audit-query.dto";

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  private resolveDate(value?: string, endOfDay = false) {
    if (!value) {
      return undefined;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return undefined;
    }

    if (endOfDay) {
      date.setHours(23, 59, 59, 999);
    }

    return date;
  }

  findAll(user: JwtPayload, query: FindAuditQueryDto) {
    const from = this.resolveDate(query.from);
    const to = this.resolveDate(query.to, true);

    return this.prisma.auditLog.findMany({
      where: {
        institutionId: user.institutionId,
        action: query.action,
        entityType: query.entityType,
        userId: query.userId,
        sessionId: query.sessionId,
        createdAt:
          from || to
            ? {
                gte: from,
                lte: to,
              }
            : undefined,
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
    const from = this.resolveDate(query.from);
    const to = this.resolveDate(query.to, true);

    return this.prisma.accessEventLog.findMany({
      where: {
        institutionId: user.institutionId,
        userId: query.userId,
        eventType: query.eventType as AccessEventType | undefined,
        sessionId: query.sessionId,
        createdAt:
          from || to
            ? {
                gte: from,
                lte: to,
              }
            : undefined,
        session:
          query.sessionStatus === "ACTIVE"
            ? {
                status: "ACTIVE",
              }
            : query.sessionStatus === "REVOKED"
              ? {
                  status: "REVOKED",
                }
              : query.sessionStatus === "EXPIRED"
                ? {
                    expiresAt: {
                      lt: new Date(),
                    },
                  }
                : undefined,
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

  findAccessSessions(user: JwtPayload, query: FindAccessSessionsQueryDto) {
    const now = new Date();
    const from = this.resolveDate(query.from);
    const to = this.resolveDate(query.to, true);

    return this.prisma.accessSession.findMany({
      where: {
        institutionMember: {
          institutionId: user.institutionId,
        },
        userId: query.userId,
        ...(query.status === "ACTIVE"
          ? {
              status: "ACTIVE",
            }
          : query.status === "REVOKED"
            ? {
                status: "REVOKED",
              }
            : query.status === "EXPIRED"
              ? {
                  expiresAt: {
                    lt: now,
                  },
                }
              : {}),
        issuedAt:
          from || to
            ? {
                gte: from,
                lte: to,
              }
            : undefined,
      },
      include: {
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
            membershipStatus: true,
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
          },
        },
        accessEvents: {
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        issuedAt: "desc",
      },
    });
  }

  async accessOperationsSummary(user: JwtPayload) {
    const institutionId = user.institutionId;
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      activeSessions,
      revokedSessions,
      expiredSessions,
      recentLogins,
      recentRefreshes,
      recentLogouts,
    ] = await Promise.all([
      this.prisma.accessSession.count({
        where: {
          status: "ACTIVE",
          institutionMember: {
            institutionId,
          },
        },
      }),
      this.prisma.accessSession.count({
        where: {
          status: "REVOKED",
          institutionMember: {
            institutionId,
          },
        },
      }),
      this.prisma.accessSession.count({
        where: {
          status: "ACTIVE",
          expiresAt: {
            lt: now,
          },
          institutionMember: {
            institutionId,
          },
        },
      }),
      this.prisma.accessEventLog.count({
        where: {
          institutionId,
          eventType: "LOGIN_SUCCESS",
          createdAt: {
            gte: last7Days,
          },
        },
      }),
      this.prisma.accessEventLog.count({
        where: {
          institutionId,
          eventType: "TOKEN_REFRESH",
          createdAt: {
            gte: last7Days,
          },
        },
      }),
      this.prisma.accessEventLog.count({
        where: {
          institutionId,
          eventType: "LOGOUT",
          createdAt: {
            gte: last7Days,
          },
        },
      }),
    ]);

    return {
      window: "last_7_days",
      activeSessions,
      revokedSessions,
      expiredSessions,
      recentLogins,
      recentRefreshes,
      recentLogouts,
    };
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
