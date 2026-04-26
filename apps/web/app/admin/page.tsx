"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "../../components/metric-card";
import { PortalShell } from "../../components/portal-shell";
import { RoleGuard } from "../../components/role-guard";
import { SectionCard } from "../../components/section-card";
import { useAuth } from "../../components/auth-provider";
import { apiRequest } from "../../lib/client-api";

type AdminSummary = {
  activeMemberships: number;
  activeStudents: number;
  activeTeachers: number;
  publishedCourses: number;
  activeEnrollments: number;
  openSupportTickets: number;
  activeSessions: number;
  expiringMemberships: number;
  completedSimulatorSessions: number;
  averageProgress: number;
};

const defaultSummary: AdminSummary = {
  activeMemberships: 0,
  activeStudents: 0,
  activeTeachers: 0,
  publishedCourses: 0,
  activeEnrollments: 0,
  openSupportTickets: 0,
  activeSessions: 0,
  expiringMemberships: 0,
  completedSimulatorSessions: 0,
  averageProgress: 0,
};

export default function AdminPage() {
  const { accessToken } = useAuth();
  const [summary, setSummary] = useState<AdminSummary>(defaultSummary);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    apiRequest<AdminSummary>("/dashboard/admin", accessToken)
      .then(setSummary)
      .catch(() => setSummary(defaultSummary));
  }, [accessToken]);

  return (
    <PortalShell
      eyebrow="Administracion"
      title="Panel principal"
      description="Supervisa el acceso a la plataforma, la actividad academica, el soporte y el uso general de la institucion."
    >
      <RoleGuard roles={["ADMIN", "SUPPORT"]}>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            hint="Membresias activas con acceso operativo al portal."
            label="Accesos activos"
            value={summary.activeMemberships}
          />
          <MetricCard
            hint="Estudiantes activos bajo la institucion actual."
            label="Estudiantes"
            value={summary.activeStudents}
          />
          <MetricCard
            hint="Docentes activos vinculados a la operacion academica."
            label="Docentes"
            value={summary.activeTeachers}
          />
          <MetricCard
            hint="Matriculas activas dentro del contexto institucional."
            label="Matriculas"
            value={summary.activeEnrollments}
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <SectionCard
            description="Indicadores institucionales sobre acceso, soporte y uso general de la plataforma."
            title="Estado general"
          >
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Cursos publicados
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">
                  {summary.publishedCourses}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Solicitudes abiertas
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">
                  {summary.openSupportTickets}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Sesiones activas
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">
                  {summary.activeSessions}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Vigencias por vencer
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">
                  {summary.expiringMemberships}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Simuladores completados
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">
                  {summary.completedSimulatorSessions}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Progreso promedio
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">
                  {summary.averageProgress.toFixed(1)}%
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            description="Accesos rapidos a las areas mas utilizadas de la gestion institucional."
            title="Tareas destacadas"
          >
            <ul className="space-y-3 text-sm leading-6 text-slate-700">
              <li className="rounded-2xl border border-slate-200 px-4 py-3">
                Gestion de usuarios y accesos institucionales
              </li>
              <li className="rounded-2xl border border-slate-200 px-4 py-3">
                Administracion de cursos, rutas y contenidos
              </li>
              <li className="rounded-2xl border border-slate-200 px-4 py-3">
                Seguimiento academico, simuladores y soporte
              </li>
            </ul>
          </SectionCard>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
