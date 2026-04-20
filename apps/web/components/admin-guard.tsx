"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useAuth } from "./auth-provider";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { accessToken, isReady, user, logout } = useAuth();

  if (!isReady) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-sm">
        Cargando sesion del LMS...
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
        <p className="text-sm font-semibold text-amber-900">Sesion requerida</p>
        <p className="mt-2 text-sm leading-6 text-amber-800">
          Debes iniciar sesion para usar el panel administrativo del LMS.
        </p>
        <div className="mt-5 flex gap-3">
          <Link
            href="/login"
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white"
          >
            Ir a login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
        <p className="text-slate-600">
          Sesion activa: <span className="font-medium text-slate-900">{user?.email}</span>
        </p>
        <button
          className="rounded-full border border-slate-300 px-3 py-1.5 font-medium text-slate-700"
          onClick={logout}
          type="button"
        >
          Cerrar sesion
        </button>
      </div>
      {children}
    </>
  );
}
