"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "../../components/metric-card";
import { PortalShell } from "../../components/portal-shell";
import { RoleGuard } from "../../components/role-guard";
import { SectionCard } from "../../components/section-card";
import { useAuth } from "../../components/auth-provider";
import { apiRequest } from "../../lib/client-api";

type TeacherSummary = {
  trackedStudents: number;
  trackedCourses: number;
  enrollments: number;
  averageProgress: number;
  lowProgressStudents: number;
  pendingPracticeReviews: number;
  completedSimulatorSessions: number;
  failedQuizAttemptsWithoutRetake: number;
  courseBreakdown: Array<{
    courseId: string;
    titleEs: string;
    students: number;
    averageProgress: number;
  }>;
};

const emptySummary: TeacherSummary = {
  trackedStudents: 0,
  trackedCourses: 0,
  enrollments: 0,
  averageProgress: 0,
  lowProgressStudents: 0,
  pendingPracticeReviews: 0,
  completedSimulatorSessions: 0,
  failedQuizAttemptsWithoutRetake: 0,
  courseBreakdown: [],
};

export default function TeacherPage() {
  const { accessToken } = useAuth();
  const [summary, setSummary] = useState<TeacherSummary>(emptySummary);

  useEffect(() => {
    if (!accessToken) return;

    apiRequest<TeacherSummary>("/dashboard/teacher", accessToken)
      .then(setSummary)
      .catch(() => setSummary(emptySummary));
  }, [accessToken]);

  return (
    <PortalShell
      eyebrow="Docente"
      title="Panel principal"
      description="Consulta el estado de tus cursos, el avance de tus estudiantes y las actividades que requieren atencion."
    >
      <RoleGuard roles={["TEACHER", "ADMIN"]}>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Estudiantes" value={summary.trackedStudents} hint="Estudiantes asignados a tus cursos." />
          <MetricCard label="Cursos" value={summary.trackedCourses} hint="Cursos a tu cargo." />
          <MetricCard label="Progreso promedio" value={`${summary.averageProgress.toFixed(1)}%`} hint="Promedio general de avance en tus grupos." />
          <MetricCard label="Practicas pendientes" value={summary.pendingPracticeReviews} hint="Practicas que requieren revision." />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <SectionCard title="Atencion prioritaria" description="Identifica rapidamente los casos que requieren seguimiento.">
            <ul className="space-y-3 text-sm leading-6 text-slate-700">
              <li className="rounded-2xl border border-cloud px-4 py-3">
                Estudiantes con progreso bajo: {summary.lowProgressStudents}
              </li>
              <li className="rounded-2xl border border-cloud px-4 py-3">
                Evaluaciones no aprobadas sin nueva oportunidad: {summary.failedQuizAttemptsWithoutRetake}
              </li>
              <li className="rounded-2xl border border-cloud px-4 py-3">
                Simuladores completados: {summary.completedSimulatorSessions}
              </li>
            </ul>
          </SectionCard>

          <SectionCard title="Cursos destacados" description="Resumen de los cursos con actividad reciente en tu gestion.">
            <ul className="space-y-3 text-sm leading-6 text-slate-700">
              {summary.courseBreakdown.slice(0, 5).map((course) => (
                <li key={course.courseId} className="rounded-2xl border border-cloud px-4 py-3">
                  {course.titleEs} · {course.students} estudiantes · {course.averageProgress.toFixed(1)}%
                </li>
              ))}
            </ul>
          </SectionCard>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
