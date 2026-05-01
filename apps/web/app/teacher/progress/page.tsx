"use client";

import { useEffect, useMemo, useState } from "react";
import { DataPanel } from "../../../components/data-panel";
import { PortalShell } from "../../../components/portal-shell";
import { RoleGuard } from "../../../components/role-guard";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest } from "../../../lib/client-api";

type EnrollmentRow = {
  id: string;
  student?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  course?: { titleEs?: string } | null;
};

type StudentSummary = {
  totals: {
    averageProgress: number;
    quizzesPassed: number;
    practiceAttempts: number;
    completedSimulatorSessions: number;
  };
  enrollments: Array<{
    courseTitleEs: string;
    progressPct: number;
    assignedLevelCode?: string | null;
    status: string;
  }>;
};

const enrollmentStatusLabels: Record<string, string> = {
  ACTIVE: "Activa",
  COMPLETED: "Completada",
  SUSPENDED: "Suspendida",
  CANCELLED: "Finalizada",
};

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div className="rounded-3xl border border-cloud bg-white px-5 py-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-steel">
        {label}
      </p>
      <p className="mt-3 font-display text-3xl font-semibold text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{helper}</p>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2.5 rounded-full bg-slate-100">
      <div
        className="h-2.5 rounded-full bg-navy transition-[width]"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}

export default function TeacherProgressPage() {
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [summary, setSummary] = useState<StudentSummary | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    apiRequest<EnrollmentRow[]>("/enrollments", accessToken)
      .then(setEnrollments)
      .catch(() => setEnrollments([]));
  }, [accessToken]);

  const studentOptions = useMemo(
    () =>
      Array.from(
        new Map(
          enrollments
            .filter((item) => item.student?.id)
            .map((item) => [
              item.student?.id as string,
              {
                id: item.student?.id as string,
                label:
                  `${item.student?.firstName ?? ""} ${item.student?.lastName ?? ""}`.trim() ||
                  item.student?.email ||
                  "",
                email: item.student?.email ?? "",
                courses: [item.course?.titleEs ?? ""],
              },
            ]),
        ).values(),
      ),
    [enrollments],
  );

  const filteredStudents = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    if (!normalized) {
      return studentOptions;
    }

    return studentOptions.filter((student) =>
      [student.label, student.email].join(" ").toLowerCase().includes(normalized),
    );
  }, [search, studentOptions]);

  useEffect(() => {
    if (!accessToken || !selectedStudentId) {
      setSummary(null);
      return;
    }
    apiRequest<StudentSummary>(
      `/reports/students/${selectedStudentId}/summary`,
      accessToken,
    )
      .then(setSummary)
      .catch(() => setSummary(null));
  }, [accessToken, selectedStudentId]);

  const selectedStudent =
    filteredStudents.find((student) => student.id === selectedStudentId) ?? null;

  return (
    <PortalShell
      eyebrow="Docente"
      title="Progreso del grupo"
      description="Consulta el avance individual de tus estudiantes y revisa con claridad su estado por curso."
    >
      <RoleGuard roles={["TEACHER", "ADMIN"]}>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Estudiantes visibles"
            value={studentOptions.length}
            helper="Participantes con seguimiento disponible dentro de tus cursos."
          />
          <StatCard
            label="Inscripciones visibles"
            value={enrollments.length}
            helper="Registros activos sobre los cursos consultables."
          />
          <StatCard
            label="Avance promedio"
            value={summary ? `${summary.totals.averageProgress.toFixed(1)}%` : "-"}
            helper="Promedio del estudiante seleccionado."
          />
          <StatCard
            label="Evaluaciones aprobadas"
            value={summary?.totals.quizzesPassed ?? "-"}
            helper="Resultados favorables del estudiante seleccionado."
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <DataPanel
            title="Seleccion de estudiante"
            description="Busca un estudiante de tu grupo y carga su seguimiento individual dentro del portal."
          >
            <div className="grid gap-4">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre o correo"
                className="w-full rounded-2xl border border-cloud px-4 py-3 text-sm outline-none transition focus:border-navy"
              />

              <div className="grid gap-3">
                {filteredStudents.length ? (
                  filteredStudents.map((student) => {
                    const isActive = selectedStudentId === student.id;

                    return (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => setSelectedStudentId(student.id)}
                        className={`rounded-3xl border px-5 py-4 text-left transition ${
                          isActive
                            ? "border-navy bg-navy text-white shadow-sm"
                            : "border-cloud bg-white hover:border-slate-300"
                        }`}
                      >
                        <p className="text-base font-semibold">{student.label}</p>
                        <p
                          className={`mt-1 text-sm ${
                            isActive ? "text-slate-200" : "text-slate-500"
                          }`}
                        >
                          {student.email || "Sin correo visible"}
                        </p>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
                    No hay estudiantes que coincidan con la busqueda actual.
                  </div>
                )}
              </div>
            </div>
          </DataPanel>

          <DataPanel
            title="Seguimiento del estudiante"
            description="Revisa el promedio, la actividad evaluativa, las practicas y el estado actual por curso."
          >
            {summary && selectedStudent ? (
              <div className="grid gap-6">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
                  <h3 className="text-lg font-semibold text-slate-950">
                    {selectedStudent.label}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedStudent.email || "Correo no disponible"}
                  </p>

                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Avance promedio
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {summary.totals.averageProgress.toFixed(1)}%
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Practicas registradas
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {summary.totals.practiceAttempts}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Simuladores completados
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {summary.totals.completedSimulatorSessions}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  {summary.enrollments.length ? (
                    summary.enrollments.map((enrollment) => (
                      <article
                        key={`${enrollment.courseTitleEs}-${enrollment.assignedLevelCode ?? ""}`}
                        className="rounded-3xl border border-cloud bg-white px-5 py-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-steel">
                              {enrollment.assignedLevelCode ?? "Nivel general"}
                            </p>
                            <h3 className="mt-2 text-lg font-semibold text-slate-950">
                              {enrollment.courseTitleEs}
                            </h3>
                          </div>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            {enrollmentStatusLabels[enrollment.status] ?? enrollment.status}
                          </span>
                        </div>
                        <div className="mt-4">
                          <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                            <span className="text-slate-600">Progreso registrado</span>
                            <span className="font-semibold text-navy">
                              {enrollment.progressPct.toFixed(1)}%
                            </span>
                          </div>
                          <ProgressBar value={enrollment.progressPct} />
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
                      No hay cursos visibles para este estudiante.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
                Selecciona un estudiante para revisar su progreso.
              </div>
            )}
          </DataPanel>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
