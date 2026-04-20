"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useAuth } from "./auth-provider";

type RoleGuardProps = {
  children: ReactNode;
  roles: string[];
};

export function RoleGuard({ children, roles }: RoleGuardProps) {
  const { accessToken, isReady, user } = useAuth();

  if (!isReady) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-sm">
        Cargando sesion del LMS...
      </div>
    );
  }

  if (!accessToken || !user) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
        <p className="text-sm font-semibold text-amber-900">Sesion requerida</p>
        <p className="mt-2 text-sm leading-6 text-amber-800">
          Debes iniciar sesion para acceder a este modulo del LMS.
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

  const hasAccess = user.roles.some((role) => roles.includes(role));

  if (!hasAccess) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 shadow-sm">
        <p className="text-sm font-semibold text-rose-900">Acceso restringido</p>
        <p className="mt-2 text-sm leading-6 text-rose-800">
          Tu rol actual no tiene permisos para esta vista dentro del LMS.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
