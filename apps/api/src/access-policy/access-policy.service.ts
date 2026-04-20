import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AccessSessionStatus, MembershipStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UserWithAccessContext } from "../users/users.service";

type MembershipWithContext = UserWithAccessContext["institutions"][number];

@Injectable()
export class AccessPolicyService {
  constructor(private readonly prisma: PrismaService) {}

  resolveActiveMembership(
    memberships: MembershipWithContext[],
    requestedMembershipId?: string,
  ) {
    const now = new Date();
    const activeMemberships = memberships.filter((membership) =>
      this.isMembershipEligibleNow(membership, now),
    );

    const selected =
      activeMemberships.find((membership) => membership.id === requestedMembershipId) ??
      activeMemberships[0];

    if (!selected) {
      throw new UnauthorizedException(
        "User does not have an active institutional membership",
      );
    }

    return {
      membership: selected,
      effectiveAccessEndAt: this.getEffectiveAccessEndAt(selected),
    };
  }

  async enforceConcurrency(
    membership: MembershipWithContext,
    existingSessionId?: string,
  ) {
    const sessionWhereBase = {
      status: AccessSessionStatus.ACTIVE,
      ...(existingSessionId
        ? {
            id: {
              not: existingSessionId,
            },
          }
        : {}),
    } as Prisma.AccessSessionWhereInput;

    if (membership.contractTermId && membership.contractTerm?.concurrentCap) {
      const contractActiveSessions = await this.prisma.accessSession.count({
        where: {
          ...sessionWhereBase,
          institutionMember: {
            contractTermId: membership.contractTermId,
          },
        },
      });

      if (contractActiveSessions >= membership.contractTerm.concurrentCap) {
        throw new UnauthorizedException(
          "Contract concurrent access limit reached",
        );
      }
    }

    if (membership.licenseId && membership.license?.seats) {
      const licenseActiveSessions = await this.prisma.accessSession.count({
        where: {
          ...sessionWhereBase,
          institutionMember: {
            licenseId: membership.licenseId,
          },
        },
      });

      if (licenseActiveSessions >= membership.license.seats) {
        throw new UnauthorizedException("License seat limit reached");
      }
    }
  }

  computeMembershipAccessEnd(args: {
    accessStartAt: Date;
    accessEndAt?: Date;
    license?: { durationMonths: number } | null;
    contractTerm?: { endAt: Date } | null;
  }) {
    const candidates: Date[] = [];

    if (args.accessEndAt) {
      candidates.push(args.accessEndAt);
    }

    if (args.license) {
      const derivedFromLicense = new Date(args.accessStartAt);
      derivedFromLicense.setMonth(
        derivedFromLicense.getMonth() + args.license.durationMonths,
      );
      candidates.push(derivedFromLicense);
    }

    if (args.contractTerm?.endAt) {
      candidates.push(args.contractTerm.endAt);
    }

    if (!candidates.length) {
      return undefined;
    }

    return candidates.reduce((earliest, current) =>
      current.getTime() < earliest.getTime() ? current : earliest,
    );
  }

  async validateMembershipReferences(input: {
    institutionId: string;
    licenseId?: string;
    contractTermId?: string;
  }) {
    let license: { id: string; institutionId: string; durationMonths: number; contractTermId: string | null } | null =
      null;
    let contractTerm: { id: string; institutionId: string; startAt: Date; endAt: Date; concurrentCap: number | null } | null =
      null;

    if (input.licenseId) {
      license = await this.prisma.license.findUnique({
        where: { id: input.licenseId },
        select: {
          id: true,
          institutionId: true,
          durationMonths: true,
          contractTermId: true,
        },
      });

      if (!license || license.institutionId !== input.institutionId) {
        throw new BadRequestException(
          "License must belong to the same institution as the membership",
        );
      }
    }

    if (input.contractTermId) {
      contractTerm = await this.prisma.contractTerm.findUnique({
        where: { id: input.contractTermId },
        select: {
          id: true,
          institutionId: true,
          startAt: true,
          endAt: true,
          concurrentCap: true,
        },
      });

      if (!contractTerm || contractTerm.institutionId !== input.institutionId) {
        throw new BadRequestException(
          "Contract term must belong to the same institution as the membership",
        );
      }
    }

    if (
      license &&
      contractTerm &&
      license.contractTermId &&
      license.contractTermId !== contractTerm.id
    ) {
      throw new BadRequestException(
        "License and contract term are not aligned for this membership",
      );
    }

    return { license, contractTerm };
  }

  private isMembershipEligibleNow(membership: MembershipWithContext, now: Date) {
    const effectiveEndAt = this.getEffectiveAccessEndAt(membership);
    const withinWindow =
      membership.accessStartAt <= now &&
      (!effectiveEndAt || effectiveEndAt >= now);
    const contractActive =
      !membership.contractTerm ||
      (membership.contractTerm.startAt <= now && membership.contractTerm.endAt >= now);

    return (
      membership.membershipStatus === MembershipStatus.ACTIVE &&
      membership.institution.status === "ACTIVE" &&
      withinWindow &&
      contractActive
    );
  }

  private getEffectiveAccessEndAt(membership: MembershipWithContext) {
    return this.computeMembershipAccessEnd({
      accessStartAt: membership.accessStartAt,
      accessEndAt: membership.accessEndAt ?? undefined,
      license: membership.license
        ? {
            durationMonths: membership.license.durationMonths,
          }
        : null,
      contractTerm: membership.contractTerm
        ? {
            endAt: membership.contractTerm.endAt,
          }
        : null,
    });
  }
}
