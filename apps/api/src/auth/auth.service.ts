import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare, hash } from "bcryptjs";
import { Request } from "express";
import {
  AccessSessionStatus,
  MembershipStatus,
  ScopeStatus,
  UserStatus,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService, UserWithAccessContext } from "../users/users.service";
import { JwtPayload } from "./interfaces/jwt-payload.interface";

function parseDurationToSeconds(value: string, fallbackSeconds: number): number {
  const match = value.trim().match(/^(\d+)([smhd])$/i);

  if (!match) {
    return fallbackSeconds;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case "s":
      return amount;
    case "m":
      return amount * 60;
    case "h":
      return amount * 60 * 60;
    case "d":
      return amount * 60 * 60 * 24;
    default:
      return fallbackSeconds;
  }
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string, request: Request) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (user.status !== UserStatus.ACTIVE || !user.isActive) {
      throw new UnauthorizedException("User is not active");
    }

    const passwordMatches = await compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const membership = this.resolveActiveMembership(user.institutions);
    const scopedRoles = user.roles.filter(
      (assignment) =>
        assignment.scopeStatus === ScopeStatus.ACTIVE &&
        (!assignment.institutionMemberId ||
          assignment.institutionMemberId === membership.id),
    );

    if (!scopedRoles.length) {
      throw new UnauthorizedException("User has no active role assignments");
    }

    const roles: string[] = [...new Set(scopedRoles.map((item) => item.role.name))];
    const permissions: string[] = [
      ...new Set(
        scopedRoles.flatMap((item) =>
          item.role.permissions.map((permission) => permission.permission.code),
        ),
      ),
    ];

    return this.issueTokens(
      {
        sub: user.id,
        email: user.email,
        roles,
        permissions,
        institutionId: membership.institutionId,
        institutionMembershipId: membership.id,
        preferredLang: user.preferredLang,
      },
      request,
    );
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? "change-me-refresh",
      });

      const user = await this.usersService.findOne(payload.sub);

      if (!user || user.status !== UserStatus.ACTIVE || !user.isActive) {
        throw new UnauthorizedException("User is not active");
      }

      const session = user.accessSessions.find(
        (item) =>
          item.id === payload.sessionId &&
          item.status === AccessSessionStatus.ACTIVE,
      );

      if (!session?.refreshTokenHash) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      const refreshMatches = await compare(refreshToken, session.refreshTokenHash);

      if (!refreshMatches) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      const membership = this.resolveActiveMembership(user.institutions, payload.institutionMembershipId);
      const scopedRoles = user.roles.filter(
        (assignment) =>
          assignment.scopeStatus === ScopeStatus.ACTIVE &&
          (!assignment.institutionMemberId ||
            assignment.institutionMemberId === membership.id),
      );

      const roles: string[] = [...new Set(scopedRoles.map((item) => item.role.name))];
      const permissions: string[] = [
        ...new Set(
          scopedRoles.flatMap((item) =>
            item.role.permissions.map((permission) => permission.permission.code),
          ),
        ),
      ];

      return this.issueTokens(
        {
          sub: user.id,
          email: user.email,
          roles,
          permissions,
          institutionId: membership.institutionId,
          institutionMembershipId: membership.id,
          sessionId: session.id,
          preferredLang: user.preferredLang,
        },
        undefined,
        session.id,
      );
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  private async issueTokens(
    input: Omit<JwtPayload, "sessionId"> & { sessionId?: string },
    request?: Request,
    existingSessionId?: string,
  ) {
    const accessTtl = parseDurationToSeconds(process.env.JWT_ACCESS_TTL ?? "15m", 900);
    const refreshTtl = parseDurationToSeconds(process.env.JWT_REFRESH_TTL ?? "7d", 604800);
    const expiresAt = new Date(Date.now() + refreshTtl * 1000);

    const sessionId =
      existingSessionId ??
      (
        await this.prisma.accessSession.create({
          data: {
            userId: input.sub,
            institutionMemberId: input.institutionMembershipId,
            ipAddress: request?.ip,
            userAgent: request?.headers["user-agent"],
            expiresAt,
          },
        })
      ).id;

    const payload: JwtPayload = {
      ...input,
      sessionId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET ?? "change-me-access",
        expiresIn: accessTtl,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET ?? "change-me-refresh",
        expiresIn: refreshTtl,
      }),
    ]);

    await this.prisma.accessSession.update({
      where: { id: sessionId },
      data: {
        refreshTokenHash: await hash(refreshToken, 10),
        ipAddress: request?.ip,
        userAgent: request?.headers["user-agent"],
        expiresAt,
        lastSeenAt: new Date(),
      },
    });

    await this.prisma.user.update({
      where: { id: input.sub },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: request?.ip,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: payload.sub,
        email: payload.email,
        roles: payload.roles,
        permissions: payload.permissions,
        institutionId: payload.institutionId,
        institutionMembershipId: payload.institutionMembershipId,
        preferredLang: payload.preferredLang,
        sessionId: payload.sessionId,
      },
    };
  }

  private resolveActiveMembership(
    memberships: UserWithAccessContext["institutions"],
    requestedMembershipId?: string,
  ) {
    const now = new Date();
    const activeMemberships = memberships.filter((membership) => {
      const withinWindow =
        membership.accessStartAt <= now &&
        (!membership.accessEndAt || membership.accessEndAt >= now);

      return (
        membership.membershipStatus === MembershipStatus.ACTIVE &&
        membership.institution.status === "ACTIVE" &&
        withinWindow
      );
    });

    const selected =
      activeMemberships.find((membership) => membership.id === requestedMembershipId) ??
      activeMemberships[0];

    if (!selected) {
      throw new UnauthorizedException("User does not have an active institutional membership");
    }

    return selected;
  }
}
