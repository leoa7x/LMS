"use client";

import { AUTH_STORAGE_KEY, SessionState } from "./session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

let refreshPromise: Promise<SessionState | null> | null = null;

function readSession(): SessionState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionState;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function writeSession(session: SessionState | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

async function refreshSession(): Promise<SessionState | null> {
  const currentSession = readSession();

  if (!currentSession?.refreshToken) {
    writeSession(null);
    return null;
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refreshToken: currentSession.refreshToken,
    }),
  });

  if (!response.ok) {
    writeSession(null);
    return null;
  }

  const refreshed = (await response.json()) as SessionState;
  writeSession(refreshed);
  return refreshed;
}

async function getRefreshedSession() {
  if (!refreshPromise) {
    refreshPromise = refreshSession().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

async function performRequest(path: string, token: string, init?: RequestInit) {
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
}

export async function apiRequest<T>(
  path: string,
  accessToken: string,
  init?: RequestInit,
): Promise<T> {
  let response = await performRequest(path, accessToken, init);

  if (response.status === 401) {
    const refreshed = await getRefreshedSession();

    if (refreshed?.accessToken) {
      response = await performRequest(path, refreshed.accessToken, init);
    }
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function downloadFile(
  path: string,
  accessToken: string,
  filename?: string,
) {
  let response = await fetch(`${API_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    const refreshed = await getRefreshedSession();

    if (refreshed?.accessToken) {
      response = await fetch(`${API_URL}${path}`, {
        headers: {
          Authorization: `Bearer ${refreshed.accessToken}`,
        },
      });
    }
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename ?? "download";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}
