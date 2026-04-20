"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type SessionUser = {
  id: string;
  email: string;
  roles: string[];
  preferredLang?: string;
  institutionId?: string;
};

type SessionState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: SessionUser | null;
};

type AuthContextValue = SessionState & {
  isReady: boolean;
  login: (session: SessionState) => void;
  logout: () => void;
};

const AUTH_STORAGE_KEY = "lms-session";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({
    accessToken: null,
    refreshToken: null,
    user: null,
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (raw) {
      try {
        setState(JSON.parse(raw) as SessionState);
      } catch {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }

    setIsReady(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isReady,
      login(session) {
        setState(session);
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      },
      logout() {
        const emptyState = {
          accessToken: null,
          refreshToken: null,
          user: null,
        };
        setState(emptyState);
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      },
    }),
    [isReady, state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
