"use client";

import { useEffect, useState } from "react";
import { DataPanel } from "../../../components/data-panel";
import { PortalShell } from "../../../components/portal-shell";
import { RoleGuard } from "../../../components/role-guard";
import { SimpleTable } from "../../../components/simple-table";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest, downloadFile } from "../../../lib/client-api";

type EnrollmentOption = {
  id: string;
  student?: { id?: string; firstName?: string; lastName?: string; email?: string } | null;
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
    progress: { progressPct: number; practicesDone: number; quizzesPassed: number; simulatorsDone: number };
    finalDecision: { finalScore: number | null; basedOn: string };
  };
};

export default function TeacherResultsPage() {
  const { accessToken } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentOption[]>([]);
  const [modules, setModules] = useState<ModuleOption[]>([]);
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

  async function handleDownloadPdf() {
    if (!accessToken || !selectedModuleId || !result) return;
    await downloadFile(
      `/content-resources/modules/${selectedModuleId}/pdf-export?studentId=${result.enrollment.student.id}`,
      accessToken,
      `${selectedModuleId}.pdf`,
    );
  }

  const moduleOptions = modules.filter((module) => module.courseId === result?.enrollment.course.id);

  return (
    <PortalShell
      eyebrow="Docente"
      title="Resultados consolidados"
      description="Consulta de resultados por matricula y exportacion PDF por modulo para seguimiento docente."
    >
      <RoleGuard roles={["TEACHER", "ADMIN"]}>
        <DataPanel title="Resultado por matricula">
          <div className="grid gap-4">
            <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" value={selectedEnrollmentId} onChange={(event)=>setSelectedEnrollmentId(event.target.value)}>
              <option value="">Selecciona matricula</option>
              {enrollments.map((enrollment)=>(
                <option key={enrollment.id} value={enrollment.id}>
                  {`${enrollment.student?.firstName ?? ""} ${enrollment.student?.lastName ?? ""}`.trim() || enrollment.student?.email} · {enrollment.course?.titleEs}
                </option>
              ))}
            </select>
            {result ? (
              <>
                <SimpleTable
                  columns={[
                    { key: "metric", header: "Metrica", render: (item) => item.metric },
                    { key: "value", header: "Valor", render: (item) => item.value },
                  ]}
                  rows={[
                    { metric: "Estudiante", value: result.enrollment.student.name },
                    { metric: "Curso", value: result.enrollment.course.titleEs },
                    { metric: "Estado", value: result.consolidatedResult.resultStatus },
                    { metric: "Progreso", value: `${result.consolidatedResult.progress.progressPct.toFixed(1)}%` },
                    { metric: "Practicas", value: result.consolidatedResult.progress.practicesDone },
                    { metric: "Quizzes", value: result.consolidatedResult.progress.quizzesPassed },
                    { metric: "Simuladores", value: result.consolidatedResult.progress.simulatorsDone },
                    { metric: "Score final", value: result.consolidatedResult.finalDecision.finalScore ?? "-" },
                    { metric: "Base final", value: result.consolidatedResult.finalDecision.basedOn },
                  ]}
                  emptyLabel="Sin datos"
                />
                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" value={selectedModuleId} onChange={(event)=>setSelectedModuleId(event.target.value)}>
                    <option value="">Selecciona modulo para PDF</option>
                    {moduleOptions.map((module)=>(
                      <option key={module.id} value={module.id}>{module.titleEs}</option>
                    ))}
                  </select>
                  <button className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white disabled:opacity-50" disabled={!selectedModuleId} onClick={handleDownloadPdf} type="button">
                    Descargar PDF
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
