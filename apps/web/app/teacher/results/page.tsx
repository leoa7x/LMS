"use client";

import { useEffect, useMemo, useState } from "react";
import { DataPanel } from "../../../components/data-panel";
import { PortalShell } from "../../../components/portal-shell";
import { RoleGuard } from "../../../components/role-guard";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest, downloadFile } from "../../../lib/client-api";

type EnrollmentOption = {
  id: string;
  student?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  course?: { id?: string; titleEs?: string } | null;
};
type ModuleOption = { id: string; titleEs: string; courseId?: string };
type EnrollmentResult = {
  enrollment: {
    student: { id: string; name: string };
    course: { id: string; titleEs: string };
  };
  consolidatedResult: {
    resultStatus: string;
    progress: {
      progressPct: number;
      practicesDone: number;
      quizzesPassed: number;
      simulatorsDone: number;
    };
    finalDecision: { finalScore: number | null; basedOn: string };
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

export default function TeacherResultsPage() {
  const { accessToken } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentOption[]>([]);
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [search, setSearch] = useState("");
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [result, setResult] = useState<EnrollmentResult | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([
      apiRequest<EnrollmentOption[]>("/enrollments", accessToken),
      apiRequest<ModuleOption[]>("/modules", accessToken),
    ])
      .then(([enrollmentsData, modulesData]) => {
        setEnrollments(enrollmentsData);
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

  useEffect(() => {
    if (!accessToken || !selectedEnrollmentId) {
      setResult(null);
      return;
    }
    apiRequest<EnrollmentResult>(
      `/reports/enrollments/${selectedEnrollmentId}/result`,
      accessToken,
    )
      .then((data) => {
        setResult(data);
        setSelectedModuleId("");
      })
      .catch(() => setResult(null));
  }, [accessToken, selectedEnrollmentId]);

  async function handleDownloadPdf() {
    if (!accessToken || !selectedModuleId || !result) return;
    await downloadFile(
      `/content-resources/modules/${selectedModuleId}/pdf-export?studentId=${result.enrollment.student.id}`,
      accessToken,
      `${selectedModuleId}.pdf`,
    );
  }

  const moduleOptions = modules.filter(
    (module) => module.courseId === result?.enrollment.course.id,
  );

  return (
    <PortalShell
      eyebrow="Docente"
      title="Resultados consolidados"
      description="Revisa el resultado de cada estudiante por curso y descarga constancias por modulo cuando corresponda."
    >
      <RoleGuard roles={["TEACHER", "ADMIN"]}>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Inscripciones visibles"
            value={enrollments.length}
            helper="Registros disponibles para revision academica."
          />
          <StatCard
            label="Estado actual"
            value={
              result
                ? resultStatusLabels[result.consolidatedResult.resultStatus] ??
                  result.consolidatedResult.resultStatus
                : "-"
            }
            helper="Estado del resultado seleccionado."
          />
          <StatCard
            label="Resultado final"
            value={result?.consolidatedResult.finalDecision.finalScore ?? "-"}
            helper="Puntaje consolidado del estudiante seleccionado."
          />
          <StatCard
            label="Practicas aprobadas"
            value={result?.consolidatedResult.progress.practicesDone ?? "-"}
            helper="Practicas registradas con resultado favorable."
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <DataPanel
            title="Seleccion de inscripcion"
            description="Busca por estudiante o curso y abre el resultado consolidado correspondiente."
          >
            <div className="grid gap-4">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por estudiante o curso"
                className="w-full rounded-2xl border border-cloud px-4 py-3 text-sm outline-none transition focus:border-navy"
              />

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
            </div>
          </DataPanel>

          <DataPanel
            title="Resultado consolidado"
            description="Consulta el avance, el resultado final y el criterio aplicado al estudiante seleccionado."
          >
            {result ? (
              <div className="grid gap-6">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-steel">
                        Estudiante
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-950">
                        {result.enrollment.student.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {result.enrollment.course.titleEs}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {resultStatusLabels[result.consolidatedResult.resultStatus] ??
                        result.consolidatedResult.resultStatus}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Resultado final
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {result.consolidatedResult.finalDecision.finalScore ?? "-"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Evaluaciones aprobadas
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {result.consolidatedResult.progress.quizzesPassed}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Simuladores completados
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {result.consolidatedResult.progress.simulatorsDone}
                      </p>
                    </div>
                  </div>
                </div>

                <ResultMeter
                  label="Progreso total del curso"
                  value={result.consolidatedResult.progress.progressPct}
                  helper="Consolidado del avance academico del estudiante."
                />

                <div className="rounded-3xl border border-cloud bg-white px-5 py-5">
                  <p className="text-sm font-medium text-slate-900">
                    Criterio aplicado
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {result.consolidatedResult.finalDecision.basedOn}
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
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
                Selecciona una inscripcion para revisar el resultado consolidado.
              </div>
            )}
          </DataPanel>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
