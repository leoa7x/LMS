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
import { BrandMark } from "./brand-mark";

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
    <main className="min-h-screen bg-mist text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-white/10 bg-navy px-6 py-8 text-white">
          <div className="mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-sky-200">
              Instituto Profesional y Tecnico de Veraguas
            </p>
            <div className="mt-4">
              <BrandMark compact theme="dark" />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Consulta cursos, contenidos, evaluaciones, progreso y practicas desde
              una experiencia unificada.
            </p>
          </div>

          <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-100">
              Rol activo
            </p>
            <p className="mt-3 text-lg font-semibold text-white">
              {roleLabels[role]}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{user?.email}</p>
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
                      ? "border-white/15 bg-white text-navy"
                      : "border-transparent text-slate-200 hover:border-white/10 hover:bg-white/5 hover:text-white"
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
              className="rounded-full border border-white/20 px-4 py-2 font-medium text-slate-100"
            >
              Inicio
            </Link>
            <button
              className="rounded-full bg-copper px-4 py-2 font-medium text-white"
              onClick={logout}
              type="button"
            >
              Cerrar sesion
            </button>
          </div>
        </aside>

        <section className="px-6 py-8 lg:px-10">
          <header className="mb-8 rounded-3xl border border-cloud bg-white px-6 py-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-navy">
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
