"use client";

import { useEffect, useState } from "react";
import { DataPanel } from "../../../components/data-panel";
import { PortalShell } from "../../../components/portal-shell";
import { RoleGuard } from "../../../components/role-guard";
import { SimpleTable } from "../../../components/simple-table";
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
    progress: { progressPct: number; practicesDone: number; quizzesPassed: number; simulatorsDone: number };
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

export default function StudentResultsPage() {
  const { accessToken } = useAuth();
  const [dashboard, setDashboard] = useState<StudentDashboard>({ currentCourses: [] });
  const [modules, setModules] = useState<ModuleOption[]>([]);
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
      })
      .catch(() => undefined);
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken || !selectedEnrollmentId) {
      setResult(null);
      return;
    }
    apiRequest<EnrollmentResult>(`/reports/enrollments/${selectedEnrollmentId}/result`, accessToken)
      .then((data) => {
        setResult(data);
        setSelectedModuleId("");
      })
      .catch(() => setResult(null));
  }, [accessToken, selectedEnrollmentId]);

  const moduleOptions = modules.filter((module) => module.courseId === result?.enrollment.course.id);

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
      description="Consulta tu avance por curso y descarga constancias por modulo cuando esten disponibles."
    >
      <RoleGuard roles={["STUDENT", "ADMIN"]}>
        <DataPanel title="Resultado por curso">
          <div className="grid gap-4">
            <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" value={selectedEnrollmentId} onChange={(event)=>setSelectedEnrollmentId(event.target.value)}>
              <option value="">Selecciona curso</option>
              {dashboard.currentCourses.map((course)=>(
                <option key={course.enrollmentId} value={course.enrollmentId}>
                  {course.titleEs}
                </option>
              ))}
            </select>
            {result ? (
              <>
                <SimpleTable
                  columns={[
                    { key: "metric", header: "Indicador", render: (item) => item.metric },
                    { key: "value", header: "Valor", render: (item) => item.value },
                  ]}
                  rows={[
                    { metric: "Curso", value: result.enrollment.course.titleEs },
                    { metric: "Estado", value: resultStatusLabels[result.consolidatedResult.resultStatus] ?? result.consolidatedResult.resultStatus },
                    { metric: "Progreso", value: `${result.consolidatedResult.progress.progressPct.toFixed(1)}%` },
                    { metric: "Practicas", value: result.consolidatedResult.progress.practicesDone },
                    { metric: "Evaluaciones aprobadas", value: result.consolidatedResult.progress.quizzesPassed },
                    { metric: "Simuladores", value: result.consolidatedResult.progress.simulatorsDone },
                    { metric: "Resultado final", value: result.consolidatedResult.finalDecision.finalScore ?? "-" },
                  ]}
                  emptyLabel="No hay informacion disponible."
                />
                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" value={selectedModuleId} onChange={(event)=>setSelectedModuleId(event.target.value)}>
                    <option value="">Selecciona un modulo</option>
                    {moduleOptions.map((module)=>(
                      <option key={module.id} value={module.id}>{module.titleEs}</option>
                    ))}
                  </select>
                  <button className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white disabled:opacity-50" disabled={!selectedModuleId} onClick={handleDownloadPdf} type="button">
                    Descargar constancia
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </DataPanel>
      </RoleGuard>
    </PortalShell>
  );
}
