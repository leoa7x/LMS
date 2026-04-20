"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "../../components/metric-card";
import { PortalShell } from "../../components/portal-shell";
import { RoleGuard } from "../../components/role-guard";
import { SectionCard } from "../../components/section-card";
import { useAuth } from "../../components/auth-provider";
import { apiRequest } from "../../lib/client-api";

type StudentSummary = {
  enrollments: number;
  averageProgress: number;
  unreadNotifications: number;
  completedSimulatorSessions: number;
  currentCourses: Array<{
    enrollmentId: string;
    courseId: string;
    titleEs: string;
    progressPct: number;
    assignedLevelCode?: string | null;
    status: string;
  }>;
};

const emptySummary: StudentSummary = {
  enrollments: 0,
  averageProgress: 0,
  unreadNotifications: 0,
  completedSimulatorSessions: 0,
  currentCourses: [],
};

export default function StudentPage() {
  const { accessToken } = useAuth();
  const [summary, setSummary] = useState<StudentSummary>(emptySummary);

  useEffect(() => {
    if (!accessToken) return;

    apiRequest<StudentSummary>("/dashboard/student/me", accessToken)
      .then(setSummary)
      .catch(() => setSummary(emptySummary));
  }, [accessToken]);

  return (
    <PortalShell
      eyebrow="Dashboard estudiante"
      title="Ruta de aprendizaje activa"
      description="Vista del estudiante para seguir cursos, progreso, contenidos y actividad de simuladores dentro del portal."
    >
      <RoleGuard roles={["STUDENT", "ADMIN"]}>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Cursos activos" value={summary.enrollments} hint="Cursos visibles por matricula o ruta asignada." />
          <MetricCard label="Progreso promedio" value={`${summary.averageProgress.toFixed(1)}%`} hint="Avance consolidado sobre tus cursos activos." />
          <MetricCard label="Notificaciones" value={summary.unreadNotifications} hint="Mensajes pendientes dentro del portal." />
          <MetricCard label="Simuladores" value={summary.completedSimulatorSessions} hint="Sesiones de simulador completadas." />
        </section>

        <section className="mt-6">
          <SectionCard title="Mis cursos" description="Cursos y nivel asignado dentro del contexto academico actual.">
            <ul className="space-y-3 text-sm leading-6 text-slate-700">
              {summary.currentCourses.map((course) => (
                <li key={course.enrollmentId} className="rounded-2xl border border-slate-200 px-4 py-3">
                  {course.titleEs} · {course.progressPct.toFixed(1)}% · {course.assignedLevelCode ?? "Sin nivel"} · {course.status}
                </li>
              ))}
            </ul>
          </SectionCard>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
