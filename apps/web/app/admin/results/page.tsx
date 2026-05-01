"use client";

import { useEffect, useMemo, useState } from "react";
import { DataPanel } from "../../../components/data-panel";
import { PortalShell } from "../../../components/portal-shell";
import { RoleGuard } from "../../../components/role-guard";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest, downloadFile } from "../../../lib/client-api";

type EnrollmentOption = {
  id: string;
  student?: { firstName?: string; lastName?: string; email?: string } | null;
  course?: { id?: string; titleEs?: string } | null;
};
type AssignmentOption = {
  id: string;
  student?: { firstName?: string; lastName?: string; email?: string } | null;
  learningPath?: { titleEs?: string } | null;
};
type ModuleOption = { id: string; titleEs: string; courseId?: string };
type EnrollmentResult = {
  enrollment: {
    student: { id: string; name: string; email: string };
    course: { id: string; titleEs: string };
  };
  consolidatedResult: {
    resultStatus: string;
    progress: {
      progressPct: number;
      lessonsDone: number;
      practicesDone: number;
      quizzesPassed: number;
      simulatorsDone: number;
    };
    finalDecision: { finalScore: number | null; basedOn: string; isPassed: boolean };
  };
};
type LearningPathResult = {
  assignment: {
    student: { id: string; email: string };
    learningPath: { titleEs: string };
  };
  consolidatedResult: {
    resultStatus: string;
    totals: {
      totalCourses: number;
      passedRequiredCourses: number;
      averageProgress: number;
      averageFinalScore: number | null;
    };
  };
};

const resultStatusLabels: Record<string, string> = {
  NOT_STARTED: "No iniciado",
  IN_PROGRESS: "En progreso",
  FAILED: "No aprobado",
  PASSED: "Aprobado",
  COMPLETED: "Completado",
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

function ResultMeter({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-900">{label}</p>
          <p className="text-xs text-slate-500">{helper}</p>
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

export default function AdminResultsPage() {
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");
  const [enrollments, setEnrollments] = useState<EnrollmentOption[]>([]);
  const [assignments, setAssignments] = useState<AssignmentOption[]>([]);
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [enrollmentResult, setEnrollmentResult] = useState<EnrollmentResult | null>(
    null,
  );
  const [learningPathResult, setLearningPathResult] =
    useState<LearningPathResult | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([
      apiRequest<EnrollmentOption[]>("/enrollments", accessToken),
      apiRequest<AssignmentOption[]>("/enrollments/learning-path-assignments", accessToken),
      apiRequest<ModuleOption[]>("/modules", accessToken),
    ])
      .then(([enrollmentsData, assignmentsData, modulesData]) => {
        setEnrollments(enrollmentsData);
        setAssignments(assignmentsData);
        setModules(modulesData);
        setSelectedEnrollmentId((current) => current || enrollmentsData[0]?.id || "");
      })
      .catch(() => undefined);
  }, [accessToken]);

  const filteredEnrollments = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    if (!normalized) {
      return enrollments;
    }

    return enrollments.filter((enrollment) =>
      [
        `${enrollment.student?.firstName ?? ""} ${enrollment.student?.lastName ?? ""}`.trim(),
        enrollment.student?.email ?? "",
        enrollment.course?.titleEs ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [enrollments, search]);

  const filteredAssignments = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    if (!normalized) {
      return assignments;
    }

    return assignments.filter((assignment) =>
      [
        `${assignment.student?.firstName ?? ""} ${assignment.student?.lastName ?? ""}`.trim(),
        assignment.student?.email ?? "",
        assignment.learningPath?.titleEs ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [assignments, search]);

  useEffect(() => {
    if (!accessToken || !selectedEnrollmentId) {
      setEnrollmentResult(null);
      return;
    }

    apiRequest<EnrollmentResult>(
      `/reports/enrollments/${selectedEnrollmentId}/result`,
      accessToken,
    )
      .then((result) => {
        setEnrollmentResult(result);
        setSelectedModuleId("");
      })
      .catch(() => setEnrollmentResult(null));
  }, [accessToken, selectedEnrollmentId]);

  useEffect(() => {
    if (!accessToken || !selectedAssignmentId) {
      setLearningPathResult(null);
      return;
    }

    apiRequest<LearningPathResult>(
      `/reports/learning-path-assignments/${selectedAssignmentId}/result`,
      accessToken,
    )
      .then(setLearningPathResult)
      .catch(() => setLearningPathResult(null));
  }, [accessToken, selectedAssignmentId]);

  const moduleOptions = modules.filter(
    (module) => module.courseId === enrollmentResult?.enrollment.course.id,
  );

  async function handleDownloadPdf() {
    if (!accessToken || !selectedModuleId || !enrollmentResult) return;
    await downloadFile(
      `/content-resources/modules/${selectedModuleId}/pdf-export?studentId=${enrollmentResult.enrollment.student.id}`,
      accessToken,
      `${selectedModuleId}.pdf`,
    );
  }

  return (
    <PortalShell
      eyebrow="Resultados"
      title="Resultados y constancias"
      description="Consulta resultados consolidados por inscripcion o ruta y descarga constancias por modulo cuando corresponda."
    >
      <RoleGuard roles={["ADMIN", "TEACHER"]}>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Inscripciones visibles"
            value={enrollments.length}
            helper="Resultados disponibles para lectura institucional."
          />
          <StatCard
            label="Rutas asignadas"
            value={assignments.length}
            helper="Rutas con seguimiento consolidado en la plataforma."
          />
          <StatCard
            label="Resultado final"
            value={enrollmentResult?.consolidatedResult.finalDecision.finalScore ?? "-"}
            helper="Puntaje del registro seleccionado."
          />
          <StatCard
            label="Estado de ruta"
            value={
              learningPathResult
                ? resultStatusLabels[learningPathResult.consolidatedResult.resultStatus] ??
                  learningPathResult.consolidatedResult.resultStatus
                : "-"
            }
            helper="Estado de la ruta seleccionada."
          />
        </section>

        <section className="mt-6 rounded-3xl border border-cloud bg-white px-5 py-5 shadow-sm">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por estudiante, curso o ruta"
            className="w-full rounded-2xl border border-cloud px-4 py-3 text-sm outline-none transition focus:border-navy"
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <DataPanel
            title="Resultado por inscripcion"
            description="Selecciona una inscripcion para revisar el avance consolidado, el resultado final y la constancia por modulo."
          >
            <div className="grid gap-4">
              <div className="grid gap-3">
                {filteredEnrollments.length ? (
                  filteredEnrollments.map((enrollment) => {
                    const isActive = selectedEnrollmentId === enrollment.id;
                    const studentName =
                      `${enrollment.student?.firstName ?? ""} ${enrollment.student?.lastName ?? ""}`.trim() ||
                      enrollment.student?.email ||
                      "Estudiante";

                    return (
                      <button
                        key={enrollment.id}
                        type="button"
                        onClick={() => setSelectedEnrollmentId(enrollment.id)}
                        className={`rounded-3xl border px-5 py-4 text-left transition ${
                          isActive
                            ? "border-navy bg-navy text-white shadow-sm"
                            : "border-cloud bg-white hover:border-slate-300"
                        }`}
                      >
                        <p className="text-base font-semibold">{studentName}</p>
                        <p
                          className={`mt-1 text-sm ${
                            isActive ? "text-slate-200" : "text-slate-500"
                          }`}
                        >
                          {enrollment.course?.titleEs ?? "Curso sin nombre"}
                        </p>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
                    No hay inscripciones que coincidan con la busqueda actual.
                  </div>
                )}
              </div>

              {enrollmentResult ? (
                <div className="grid gap-5 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-steel">
                        Inscripcion seleccionada
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-950">
                        {enrollmentResult.enrollment.student.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {enrollmentResult.enrollment.course.titleEs}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                      {resultStatusLabels[enrollmentResult.consolidatedResult.resultStatus] ??
                        enrollmentResult.consolidatedResult.resultStatus}
                    </span>
                  </div>

                  <ResultMeter
                    label="Progreso total"
                    value={enrollmentResult.consolidatedResult.progress.progressPct}
                    helper="Avance consolidado del recorrido academico."
                  />

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Resultado final
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {enrollmentResult.consolidatedResult.finalDecision.finalScore ?? "-"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Evaluaciones aprobadas
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {enrollmentResult.consolidatedResult.progress.quizzesPassed}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Simuladores completados
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {enrollmentResult.consolidatedResult.progress.simulatorsDone}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-cloud bg-white px-5 py-5">
                    <p className="text-sm font-medium text-slate-900">
                      Criterio aplicado
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {enrollmentResult.consolidatedResult.finalDecision.basedOn}
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <select
                      className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                      value={selectedModuleId}
                      onChange={(event) => setSelectedModuleId(event.target.value)}
                    >
                      <option value="">Selecciona un modulo</option>
                      {moduleOptions.map((module) => (
                        <option key={module.id} value={module.id}>
                          {module.titleEs}
                        </option>
                      ))}
                    </select>
                    <button
                      className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
                      disabled={!selectedModuleId}
                      onClick={handleDownloadPdf}
                      type="button"
                    >
                      Descargar constancia
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </DataPanel>

          <DataPanel
            title="Resultado por ruta"
            description="Selecciona una ruta asignada para revisar el promedio de avance y el cumplimiento de cursos requeridos."
          >
            <div className="grid gap-4">
              <div className="grid gap-3">
                {filteredAssignments.length ? (
                  filteredAssignments.map((assignment) => {
                    const isActive = selectedAssignmentId === assignment.id;
                    const studentName =
                      `${assignment.student?.firstName ?? ""} ${assignment.student?.lastName ?? ""}`.trim() ||
                      assignment.student?.email ||
                      "Estudiante";

                    return (
                      <button
                        key={assignment.id}
                        type="button"
                        onClick={() => setSelectedAssignmentId(assignment.id)}
                        className={`rounded-3xl border px-5 py-4 text-left transition ${
                          isActive
                            ? "border-navy bg-navy text-white shadow-sm"
                            : "border-cloud bg-white hover:border-slate-300"
                        }`}
                      >
                        <p className="text-base font-semibold">{studentName}</p>
                        <p
                          className={`mt-1 text-sm ${
                            isActive ? "text-slate-200" : "text-slate-500"
                          }`}
                        >
                          {assignment.learningPath?.titleEs ?? "Ruta sin nombre"}
                        </p>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
                    No hay rutas que coincidan con la busqueda actual.
                  </div>
                )}
              </div>

              {learningPathResult ? (
                <div className="grid gap-5 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-steel">
                        Ruta seleccionada
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-950">
                        {learningPathResult.assignment.learningPath.titleEs}
                      </h3>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                      {resultStatusLabels[learningPathResult.consolidatedResult.resultStatus] ??
                        learningPathResult.consolidatedResult.resultStatus}
                    </span>
                  </div>

                  <ResultMeter
                    label="Progreso promedio de la ruta"
                    value={learningPathResult.consolidatedResult.totals.averageProgress}
                    helper="Promedio consolidado del avance en la ruta seleccionada."
                  />

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Cursos totales
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {learningPathResult.consolidatedResult.totals.totalCourses}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Cursos requeridos aprobados
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {learningPathResult.consolidatedResult.totals.passedRequiredCourses}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Puntaje promedio
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {learningPathResult.consolidatedResult.totals.averageFinalScore ?? "-"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </DataPanel>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
