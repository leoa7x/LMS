"use client";

import { useEffect, useMemo, useState } from "react";
import { DataPanel } from "../../../components/data-panel";
import { PortalShell } from "../../../components/portal-shell";
import { RoleGuard } from "../../../components/role-guard";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest, downloadFile } from "../../../lib/client-api";

type StudentDashboard = {
  currentCourses: Array<{
    enrollmentId: string;
    courseId: string;
    titleEs: string;
  }>;
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

export default function StudentResultsPage() {
  const { accessToken } = useAuth();
  const [dashboard, setDashboard] = useState<StudentDashboard>({ currentCourses: [] });
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [search, setSearch] = useState("");
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [result, setResult] = useState<EnrollmentResult | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([
      apiRequest<StudentDashboard>("/dashboard/student/me", accessToken),
      apiRequest<ModuleOption[]>("/modules", accessToken),
    ])
      .then(([dashboardData, modulesData]) => {
        setDashboard(dashboardData);
        setModules(modulesData);
        setSelectedEnrollmentId((current) => current || dashboardData.currentCourses[0]?.enrollmentId || "");
      })
      .catch(() => undefined);
  }, [accessToken]);

  const filteredCourses = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    if (!normalized) {
      return dashboard.currentCourses;
    }

    return dashboard.currentCourses.filter((course) =>
      course.titleEs.toLowerCase().includes(normalized),
    );
  }, [dashboard.currentCourses, search]);

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

  const moduleOptions = modules.filter(
    (module) => module.courseId === result?.enrollment.course.id,
  );

  async function handleDownloadPdf() {
    if (!accessToken || !selectedModuleId || !result) return;
    await downloadFile(
      `/content-resources/modules/${selectedModuleId}/pdf-export?studentId=${result.enrollment.student.id}`,
      accessToken,
      `${selectedModuleId}.pdf`,
    );
  }

  return (
    <PortalShell
      eyebrow="Estudiante"
      title="Mis resultados"
      description="Consulta tu resultado consolidado por curso y descarga constancias por modulo cuando esten disponibles."
    >
      <RoleGuard roles={["STUDENT", "ADMIN"]}>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Cursos activos"
            value={dashboard.currentCourses.length}
            helper="Cursos con resultado consolidado disponible."
          />
          <StatCard
            label="Estado actual"
            value={
              result
                ? resultStatusLabels[result.consolidatedResult.resultStatus] ??
                  result.consolidatedResult.resultStatus
                : "-"
            }
            helper="Estado del curso seleccionado."
          />
          <StatCard
            label="Resultado final"
            value={result?.consolidatedResult.finalDecision.finalScore ?? "-"}
            helper="Puntaje consolidado registrado por la plataforma."
          />
          <StatCard
            label="Evaluaciones aprobadas"
            value={result?.consolidatedResult.progress.quizzesPassed ?? "-"}
            helper="Resultados favorables del curso seleccionado."
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <DataPanel
            title="Seleccion de curso"
            description="Busca uno de tus cursos activos y abre su resultado consolidado."
          >
            <div className="grid gap-4">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar curso"
                className="w-full rounded-2xl border border-cloud px-4 py-3 text-sm outline-none transition focus:border-navy"
              />

              <div className="grid gap-3">
                {filteredCourses.length ? (
                  filteredCourses.map((course) => {
                    const isActive = selectedEnrollmentId === course.enrollmentId;

                    return (
                      <button
                        key={course.enrollmentId}
                        type="button"
                        onClick={() => setSelectedEnrollmentId(course.enrollmentId)}
                        className={`rounded-3xl border px-5 py-4 text-left transition ${
                          isActive
                            ? "border-navy bg-navy text-white shadow-sm"
                            : "border-cloud bg-white hover:border-slate-300"
                        }`}
                      >
                        <p className="text-base font-semibold">{course.titleEs}</p>
                        <p
                          className={`mt-1 text-sm ${
                            isActive ? "text-slate-200" : "text-slate-500"
                          }`}
                        >
                          Resultado consolidado del curso
                        </p>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
                    No hay cursos que coincidan con la busqueda actual.
                  </div>
                )}
              </div>
            </div>
          </DataPanel>

          <DataPanel
            title="Resultado consolidado"
            description="Revisa tu progreso, el resultado final y las constancias disponibles del curso seleccionado."
          >
            {result ? (
              <div className="grid gap-6">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-steel">
                        Curso
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-950">
                        {result.enrollment.course.titleEs}
                      </h3>
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
                        Practicas aprobadas
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {result.consolidatedResult.progress.practicesDone}
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

                <div className="grid gap-4">
                  <ResultMeter
                    label="Progreso total del curso"
                    value={result.consolidatedResult.progress.progressPct}
                    helper="Porcentaje consolidado del recorrido academico."
                  />
                </div>

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
                Selecciona un curso para revisar tu resultado consolidado.
              </div>
            )}
          </DataPanel>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
