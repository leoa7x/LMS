"use client";

import { useEffect, useMemo, useState } from "react";
import { DataPanel } from "../../../components/data-panel";
import { PortalShell } from "../../../components/portal-shell";
import { RoleGuard } from "../../../components/role-guard";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest } from "../../../lib/client-api";

type ProgressDetailRow = {
  enrollmentId: string;
  assignedLevelCode?: string | null;
  status: string;
  enrolledAt: string;
  course: {
    id: string;
    titleEs?: string | null;
    titleEn?: string | null;
  };
  learningPathAssignment?: {
    id: string;
    learningPath?: {
      titleEs?: string | null;
      titleEn?: string | null;
    } | null;
  } | null;
  progress?: {
    progressPct: number;
    lessonsDone: number;
    practicesDone: number;
    quizzesPassed: number;
    simulatorsDone: number;
    lastActivityAt?: string | null;
  } | null;
  totals: {
    modules: number;
    lessons: number;
    segments: number;
    practices: number;
    quizzes: number;
    simulatorTargets: number;
  };
  componentProgress: {
    lessonsPct: number;
    segmentsPct: number;
    practicesPct: number;
    quizzesPct: number;
    simulatorsPct: number;
  };
  moduleSummaries: Array<{
    id: string;
    titleEs?: string | null;
    titleEn?: string | null;
    lessonsTotal: number;
    lessonsCompleted: number;
    segmentsTotal: number;
    segmentsCompleted: number;
    practicesTotal: number;
    practicesCompleted: number;
    quizzesTotal: number;
    quizzesCompleted: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    happenedAt: string;
    context?: string | null;
  }>;
};

const enrollmentStatusLabels: Record<string, string> = {
  ACTIVE: "Activo",
  COMPLETED: "Completado",
  PAUSED: "En pausa",
  CANCELLED: "Finalizado",
};

const activityTypeLabels: Record<string, string> = {
  LESSON: "Leccion",
  SEGMENT: "Contenido",
  PRACTICE: "Practica",
  QUIZ: "Evaluacion",
  SIMULATOR: "Simulador",
};

function formatDate(value?: string | null) {
  if (!value) {
    return "Sin registro reciente";
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ProgressBar({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-900">{label}</p>
          <p className="text-xs text-slate-500">{detail}</p>
        </div>
        <span className="text-sm font-semibold text-navy">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100">
        <div
          className="h-2.5 rounded-full bg-navy transition-[width]"
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function StudentProgressPage() {
  const { accessToken, user } = useAuth();
  const [rows, setRows] = useState<ProgressDetailRow[]>([]);
  const [search, setSearch] = useState("");
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState("");

  useEffect(() => {
    if (!accessToken || !user) {
      return;
    }

    apiRequest<ProgressDetailRow[]>(`/progress/student/${user.id}/detail`, accessToken)
      .then((data) => {
        setRows(data);
        setSelectedEnrollmentId((current) => current || data[0]?.enrollmentId || "");
      })
      .catch(() => {
        setRows([]);
        setSelectedEnrollmentId("");
      });
  }, [accessToken, user]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return rows;
    }

    return rows.filter((item) => {
      const routeTitle = item.learningPathAssignment?.learningPath?.titleEs ?? "";

      return [item.course.titleEs ?? "", routeTitle, item.assignedLevelCode ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [rows, search]);

  const selectedEnrollment =
    filteredRows.find((item) => item.enrollmentId === selectedEnrollmentId) ??
    filteredRows[0] ??
    null;

  const overview = useMemo(() => {
    if (!filteredRows.length) {
      return {
        courses: 0,
        avgProgress: 0,
        practicesDone: 0,
        quizzesPassed: 0,
        simulatorsDone: 0,
      };
    }

    const totals = filteredRows.reduce(
      (accumulator, item) => {
        accumulator.progress += item.progress?.progressPct ?? 0;
        accumulator.practices += item.progress?.practicesDone ?? 0;
        accumulator.quizzes += item.progress?.quizzesPassed ?? 0;
        accumulator.simulators += item.progress?.simulatorsDone ?? 0;
        return accumulator;
      },
      {
        progress: 0,
        practices: 0,
        quizzes: 0,
        simulators: 0,
      },
    );

    return {
      courses: filteredRows.length,
      avgProgress: totals.progress / filteredRows.length,
      practicesDone: totals.practices,
      quizzesPassed: totals.quizzes,
      simulatorsDone: totals.simulators,
    };
  }, [filteredRows]);

  return (
    <PortalShell
      eyebrow="Estudiante"
      title="Mi progreso"
      description="Consulta tu avance por curso, revisa lo que ya completaste y ubica tus siguientes actividades."
    >
      <RoleGuard roles={["STUDENT", "ADMIN"]}>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            {
              label: "Cursos activos",
              value: overview.courses,
              helper: "Trayectos con seguimiento disponible",
            },
            {
              label: "Avance general",
              value: `${overview.avgProgress.toFixed(1)}%`,
              helper: "Promedio de progreso en tus cursos",
            },
            {
              label: "Practicas completadas",
              value: overview.practicesDone,
              helper: "Registros aprobados dentro de la plataforma",
            },
            {
              label: "Evaluaciones aprobadas",
              value: overview.quizzesPassed,
              helper: "Resultados favorables registrados",
            },
            {
              label: "Simuladores completados",
              value: overview.simulatorsDone,
              helper: "Sesiones cerradas con evidencia",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-cloud bg-white px-5 py-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-steel">
                {item.label}
              </p>
              <p className="mt-3 font-display text-3xl font-semibold text-slate-950">
                {item.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.helper}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <DataPanel
            title="Cursos con seguimiento"
            description="Filtra tus cursos activos y selecciona uno para revisar el avance por modulo, practica y evaluacion."
          >
            <div className="grid gap-4">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por curso, ruta o nivel"
                className="w-full rounded-2xl border border-cloud px-4 py-3 text-sm outline-none transition focus:border-navy"
              />

              <div className="grid gap-3">
                {filteredRows.length ? (
                  filteredRows.map((item) => {
                    const isActive =
                      (selectedEnrollment?.enrollmentId ?? "") === item.enrollmentId;

                    return (
                      <button
                        key={item.enrollmentId}
                        type="button"
                        onClick={() => setSelectedEnrollmentId(item.enrollmentId)}
                        className={`rounded-3xl border px-5 py-4 text-left transition ${
                          isActive
                            ? "border-navy bg-navy text-white shadow-sm"
                            : "border-cloud bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-lg font-semibold">
                              {item.course.titleEs ?? "Curso disponible"}
                            </p>
                            <p
                              className={`mt-1 text-sm ${
                                isActive ? "text-slate-200" : "text-slate-500"
                              }`}
                            >
                              {item.learningPathAssignment?.learningPath?.titleEs ??
                                "Sin ruta asociada"}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                              isActive
                                ? "bg-white/15 text-white"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {enrollmentStatusLabels[item.status] ?? item.status}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-4">
                          <div>
                            <p
                              className={`text-xs uppercase tracking-[0.18em] ${
                                isActive ? "text-slate-300" : "text-slate-500"
                              }`}
                            >
                              Avance general
                            </p>
                            <p className="mt-1 text-xl font-semibold">
                              {(item.progress?.progressPct ?? 0).toFixed(1)}%
                            </p>
                          </div>

                          <div
                            className={`text-right text-sm ${
                              isActive ? "text-slate-200" : "text-slate-500"
                            }`}
                          >
                            <p>
                              Ultima actividad:{" "}
                              {formatDate(item.progress?.lastActivityAt ?? item.enrolledAt)}
                            </p>
                            <p>Nivel asignado: {item.assignedLevelCode ?? "General"}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
                    No hay cursos que coincidan con tu busqueda.
                  </div>
                )}
              </div>
            </div>
          </DataPanel>

          <DataPanel
            title="Detalle del avance"
            description="Revisa el progreso acumulado del curso seleccionado y el estado de sus componentes principales."
          >
            {selectedEnrollment ? (
              <div className="grid gap-6">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-steel">
                        Curso seleccionado
                      </p>
                      <h3 className="mt-2 font-display text-2xl font-semibold text-slate-950">
                        {selectedEnrollment.course.titleEs}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {selectedEnrollment.learningPathAssignment?.learningPath?.titleEs ??
                          "Seguimiento disponible dentro del portal institucional."}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-cloud bg-white px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-steel">
                        Avance total
                      </p>
                      <p className="mt-2 font-display text-3xl font-semibold text-navy">
                        {(selectedEnrollment.progress?.progressPct ?? 0).toFixed(1)}%
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Estado:{" "}
                        {enrollmentStatusLabels[selectedEnrollment.status] ??
                          selectedEnrollment.status}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <ProgressBar
                    label="Lecciones"
                    value={selectedEnrollment.componentProgress.lessonsPct}
                    detail={`${selectedEnrollment.progress?.lessonsDone ?? 0} de ${selectedEnrollment.totals.lessons} completadas`}
                  />
                  <ProgressBar
                    label="Contenidos por segmento"
                    value={selectedEnrollment.componentProgress.segmentsPct}
                    detail={`${selectedEnrollment.progress?.lessonsDone ?? 0} lecciones con avance registrado`}
                  />
                  <ProgressBar
                    label="Practicas"
                    value={selectedEnrollment.componentProgress.practicesPct}
                    detail={`${selectedEnrollment.progress?.practicesDone ?? 0} de ${selectedEnrollment.totals.practices} registradas como aprobadas`}
                  />
                  <ProgressBar
                    label="Evaluaciones"
                    value={selectedEnrollment.componentProgress.quizzesPct}
                    detail={`${selectedEnrollment.progress?.quizzesPassed ?? 0} de ${selectedEnrollment.totals.quizzes} aprobadas`}
                  />
                  <ProgressBar
                    label="Simuladores"
                    value={selectedEnrollment.componentProgress.simulatorsPct}
                    detail={`${selectedEnrollment.progress?.simulatorsDone ?? 0} de ${selectedEnrollment.totals.simulatorTargets} sesiones objetivo completadas`}
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
                Selecciona un curso para revisar su detalle.
              </div>
            )}
          </DataPanel>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <DataPanel
            title="Avance por modulo"
            description="Consulta el estado de cada modulo y ubica rapidamente lo que ya completaste o lo que aun esta pendiente."
          >
            {selectedEnrollment?.moduleSummaries.length ? (
              <div className="grid gap-4">
                {selectedEnrollment.moduleSummaries.map((module, index) => (
                  <div
                    key={module.id}
                    className="rounded-3xl border border-cloud bg-white px-5 py-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-steel">
                          Modulo {index + 1}
                        </p>
                        <h4 className="mt-2 text-lg font-semibold text-slate-950">
                          {module.titleEs ?? "Modulo academico"}
                        </h4>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      {[
                        {
                          label: "Lecciones",
                          value: `${module.lessonsCompleted}/${module.lessonsTotal}`,
                        },
                        {
                          label: "Contenidos",
                          value: `${module.segmentsCompleted}/${module.segmentsTotal}`,
                        },
                        {
                          label: "Practicas",
                          value: `${module.practicesCompleted}/${module.practicesTotal}`,
                        },
                        {
                          label: "Evaluaciones",
                          value: `${module.quizzesCompleted}/${module.quizzesTotal}`,
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            {item.label}
                          </p>
                          <p className="mt-2 text-xl font-semibold text-slate-950">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
                Aun no hay modulos con seguimiento disponible para este curso.
              </div>
            )}
          </DataPanel>

          <DataPanel
            title="Actividad reciente"
            description="Observa las ultimas acciones registradas dentro de tu recorrido academico."
          >
            {selectedEnrollment?.recentActivity.length ? (
              <div className="grid gap-4">
                {selectedEnrollment.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-3xl border border-cloud bg-white px-5 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-steel">
                          {activityTypeLabels[activity.type] ?? "Actividad"}
                        </p>
                        <p className="mt-2 text-base font-semibold text-slate-950">
                          {activity.title}
                        </p>
                        {activity.context ? (
                          <p className="mt-1 text-sm text-slate-600">{activity.context}</p>
                        ) : null}
                      </div>
                      <p className="text-sm text-slate-500">
                        {formatDate(activity.happenedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
                Aun no hay actividad reciente registrada para este curso.
              </div>
            )}
          </DataPanel>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
