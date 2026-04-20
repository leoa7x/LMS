export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
  institutionId: string;
  institutionMembershipId: string;
  sessionId: string;
  preferredLang: string;
}
