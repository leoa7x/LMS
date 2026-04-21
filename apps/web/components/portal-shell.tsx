"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { useAuth } from "./auth-provider";
import {
  getPrimaryRole,
  navigationByRole,
  roleLabels,
} from "../lib/role-navigation";

type PortalShellProps = {
  title: string;
  eyebrow: string;
  description: string;
  children: ReactNode;
};

export function PortalShell({
  title,
  eyebrow,
  description,
  children,
}: PortalShellProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const role = user ? getPrimaryRole(user.roles) : "ADMIN";
  const navigation = navigationByRole[role];

  return (
    <main className="min-h-screen bg-[#f4f1ea] text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-slate-200 bg-[#fbfaf6] px-6 py-8">
          <div className="mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-sky-700">
              Instituto Profesional y Tecnico de Veraguas
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              Plataforma de formacion tecnica
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Consulta cursos, contenidos, evaluaciones, progreso y practicas desde
              una experiencia unificada.
            </p>
          </div>

          <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Rol activo
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-950">
              {roleLabels[role]}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{user?.email}</p>
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-white hover:text-slate-950"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <Link
              href="/"
              className="rounded-full border border-slate-300 px-4 py-2 font-medium text-slate-700"
            >
              Inicio
            </Link>
            <button
              className="rounded-full bg-slate-950 px-4 py-2 font-medium text-white"
              onClick={logout}
              type="button"
            >
              Cerrar sesion
            </button>
          </div>
        </aside>

        <section className="px-6 py-8 lg:px-10">
          <header className="mb-8 rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
              {eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {description}
            </p>
          </header>

          {children}
        </section>
      </div>
    </main>
  );
}
