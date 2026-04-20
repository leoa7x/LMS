"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "../../components/admin-guard";
import { AdminShell } from "../../components/admin-shell";
import { MetricCard } from "../../components/metric-card";
import { SectionCard } from "../../components/section-card";
import { useAuth } from "../../components/auth-provider";
import { apiRequest } from "../../lib/client-api";

type AdminSummary = {
  users: number;
  institutions: number;
  courses: number;
  enrollments: number;
  quizzes: number;
  supportTickets: number;
  averageProgress: number;
};

const defaultSummary: AdminSummary = {
  users: 0,
  institutions: 0,
  courses: 0,
  enrollments: 0,
  quizzes: 0,
  supportTickets: 0,
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
    <AdminShell
      eyebrow="Dashboard administrativo"
      title="Control central del LMS tecnico"
      description="Vista operativa para supervisar usuarios, institucion, catalogo academico, evaluacion, progreso y la futura capa de simuladores integrados."
    >
      <AdminGuard>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            hint="Total de cuentas registradas en la plataforma."
            label="Usuarios"
            value={summary.users}
          />
          <MetricCard
            hint="Entidades o sedes asociadas a licencias y matriculas."
            label="Instituciones"
            value={summary.institutions}
          />
          <MetricCard
            hint="Cursos tecnicos creados dentro del catalogo actual."
            label="Cursos"
            value={summary.courses}
          />
          <MetricCard
            hint="Asignaciones activas de estudiantes a cursos."
            label="Matriculas"
            value={summary.enrollments}
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <SectionCard
            description="Resumen de la capa academica y de evaluacion ya implementada."
            title="Estado operativo"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Quizzes
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{summary.quizzes}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Tickets
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">
                  {summary.supportTickets}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
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
            description="Bloques de gestion que deben consolidarse visualmente en el panel."
            title="Prioridades"
          >
            <ul className="space-y-3 text-sm leading-6 text-slate-700">
              <li className="rounded-2xl border border-slate-200 px-4 py-3">
                Usuarios, roles, instituciones y licencias
              </li>
              <li className="rounded-2xl border border-slate-200 px-4 py-3">
                Catalogo tecnico por areas, cursos, modulos y lecciones
              </li>
              <li className="rounded-2xl border border-slate-200 px-4 py-3">
                Progreso, quizzes, simuladores y trazabilidad
              </li>
            </ul>
          </SectionCard>
        </section>
      </AdminGuard>
    </AdminShell>
  );
}
