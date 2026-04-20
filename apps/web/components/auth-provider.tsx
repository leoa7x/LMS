"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AUTH_STORAGE_KEY, SessionState } from "../lib/session";

type AuthContextValue = SessionState & {
  isReady: boolean;
  login: (session: SessionState) => void;
  logout: () => Promise<void>;
};

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
      async logout() {
        if (state.accessToken) {
          try {
            await fetch(
              `${
                process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1"
              }/auth/logout`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${state.accessToken}`,
                },
              },
            );
          } catch {
            // no-op: local logout still proceeds
          }
        }

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
