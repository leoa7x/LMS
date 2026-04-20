import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { JwtPayload } from "../auth/interfaces/jwt-payload.interface";

@Injectable()
export class AdministrationScopeService {
  assertInstitutionAccess(user: JwtPayload, institutionId: string) {
    if (user.institutionId !== institutionId) {
      throw new ForbiddenException(
        "Operation must stay within the active institution context",
      );
    }
  }

  resolveScopedInstitutionId(user: JwtPayload, institutionId?: string) {
    if (institutionId && institutionId !== user.institutionId) {
      throw new BadRequestException(
        "Requested institution does not match the active institution context",
      );
    }

    return user.institutionId;
  }
}
