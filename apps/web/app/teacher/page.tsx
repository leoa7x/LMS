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
      eyebrow="Dashboard docente"
      title="Seguimiento academico por alcance"
      description="Vista del docente para operar cursos, contenidos y estudiantes segun nivel y alcance asignado."
    >
      <RoleGuard roles={["TEACHER", "ADMIN"]}>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Estudiantes" value={summary.trackedStudents} hint="Estudiantes visibles dentro de tu alcance." />
          <MetricCard label="Cursos" value={summary.trackedCourses} hint="Cursos bajo gestion docente." />
          <MetricCard label="Progreso promedio" value={`${summary.averageProgress.toFixed(1)}%`} hint="Promedio consolidado de matriculas visibles." />
          <MetricCard label="Practicas pendientes" value={summary.pendingPracticeReviews} hint="Practicas enviadas que requieren seguimiento." />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <SectionCard title="Alertas academicas" description="Lectura operativa para evitar seguimiento generico.">
            <ul className="space-y-3 text-sm leading-6 text-slate-700">
              <li className="rounded-2xl border border-slate-200 px-4 py-3">
                Estudiantes con progreso bajo: {summary.lowProgressStudents}
              </li>
              <li className="rounded-2xl border border-slate-200 px-4 py-3">
                Intentos fallidos sin reintento: {summary.failedQuizAttemptsWithoutRetake}
              </li>
              <li className="rounded-2xl border border-slate-200 px-4 py-3">
                Simuladores completados: {summary.completedSimulatorSessions}
              </li>
            </ul>
          </SectionCard>

          <SectionCard title="Cursos priorizados" description="Cursos con estudiantes y progreso activo dentro de tu alcance.">
            <ul className="space-y-3 text-sm leading-6 text-slate-700">
              {summary.courseBreakdown.slice(0, 5).map((course) => (
                <li key={course.courseId} className="rounded-2xl border border-slate-200 px-4 py-3">
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
