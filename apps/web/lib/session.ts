export type SessionUser = {
  id: string;
  email: string;
  roles: string[];
  permissions?: string[];
  preferredLang?: string;
  institutionId?: string;
  institutionMembershipId?: string;
  sessionId?: string;
};

export type SessionState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: SessionUser | null;
};

export const AUTH_STORAGE_KEY = "lms-session";
export const AUTH_REASON_STORAGE_KEY = "lms-auth-reason";
export const LOGIN_LANG_STORAGE_KEY = "lms-login-lang";
