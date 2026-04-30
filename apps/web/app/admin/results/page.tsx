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
    progress: { progressPct: number; lessonsDone: number; practicesDone: number; quizzesPassed: number; simulatorsDone: number };
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
    totals: { totalCourses: number; passedRequiredCourses: number; averageProgress: number; averageFinalScore: number | null };
  };
};

const resultStatusLabels: Record<string, string> = {
  NOT_STARTED: "No iniciado",
  IN_PROGRESS: "En progreso",
  FAILED: "No aprobado",
  PASSED: "Aprobado",
  COMPLETED: "Completado",
};

export default function AdminResultsPage() {
  const { accessToken } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentOption[]>([]);
  const [assignments, setAssignments] = useState<AssignmentOption[]>([]);
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [enrollmentResult, setEnrollmentResult] = useState<EnrollmentResult | null>(null);
  const [learningPathResult, setLearningPathResult] = useState<LearningPathResult | null>(null);

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
      })
      .catch(() => undefined);
  }, [accessToken]);

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
      description="Consulta el avance por curso o ruta y descarga constancias por modulo cuando corresponda."
    >
      <RoleGuard roles={["ADMIN", "TEACHER"]}>
        <section className="grid gap-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <DataPanel title="Resultado por inscripcion">
              <div className="grid gap-4">
                <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" value={selectedEnrollmentId} onChange={(event)=>setSelectedEnrollmentId(event.target.value)}>
                  <option value="">Selecciona una inscripcion</option>
                  {enrollments.map((enrollment)=>(
                    <option key={enrollment.id} value={enrollment.id}>
                      {`${enrollment.student?.firstName ?? ""} ${enrollment.student?.lastName ?? ""}`.trim() || enrollment.student?.email} · {enrollment.course?.titleEs}
                    </option>
                  ))}
                </select>
                {enrollmentResult ? (
                  <div className="grid gap-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                      {enrollmentResult.enrollment.student.name} · {enrollmentResult.enrollment.course.titleEs} · {resultStatusLabels[enrollmentResult.consolidatedResult.resultStatus] ?? enrollmentResult.consolidatedResult.resultStatus}
                    </div>
                    <SimpleTable
                      columns={[
                        { key: "metric", header: "Indicador", render: (item) => item.metric },
                        { key: "value", header: "Valor", render: (item) => item.value },
                      ]}
                      rows={[
                        { metric: "Progreso", value: `${enrollmentResult.consolidatedResult.progress.progressPct.toFixed(1)}%` },
                        { metric: "Lecciones", value: enrollmentResult.consolidatedResult.progress.lessonsDone },
                        { metric: "Practicas", value: enrollmentResult.consolidatedResult.progress.practicesDone },
                        { metric: "Evaluaciones aprobadas", value: enrollmentResult.consolidatedResult.progress.quizzesPassed },
                        { metric: "Simuladores", value: enrollmentResult.consolidatedResult.progress.simulatorsDone },
                        { metric: "Resultado final", value: enrollmentResult.consolidatedResult.finalDecision.finalScore ?? "-" },
                        { metric: "Criterio aplicado", value: enrollmentResult.consolidatedResult.finalDecision.basedOn },
                      ]}
                      emptyLabel="Sin datos"
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
                  </div>
                ) : null}
              </div>
            </DataPanel>

            <DataPanel title="Resultado por ruta">
              <div className="grid gap-4">
                <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" value={selectedAssignmentId} onChange={(event)=>setSelectedAssignmentId(event.target.value)}>
                  <option value="">Selecciona una ruta asignada</option>
                  {assignments.map((assignment)=>(
                    <option key={assignment.id} value={assignment.id}>
                      {`${assignment.student?.firstName ?? ""} ${assignment.student?.lastName ?? ""}`.trim() || assignment.student?.email} · {assignment.learningPath?.titleEs}
                    </option>
                  ))}
                </select>
                {learningPathResult ? (
                  <SimpleTable
                    columns={[
                      { key: "metric", header: "Indicador", render: (item) => item.metric },
                      { key: "value", header: "Valor", render: (item) => item.value },
                    ]}
                    rows={[
                      { metric: "Ruta", value: learningPathResult.assignment.learningPath.titleEs },
                      { metric: "Estado", value: resultStatusLabels[learningPathResult.consolidatedResult.resultStatus] ?? learningPathResult.consolidatedResult.resultStatus },
                      { metric: "Cursos totales", value: learningPathResult.consolidatedResult.totals.totalCourses },
                      { metric: "Cursos requeridos aprobados", value: learningPathResult.consolidatedResult.totals.passedRequiredCourses },
                      { metric: "Progreso promedio", value: `${learningPathResult.consolidatedResult.totals.averageProgress.toFixed(1)}%` },
                      { metric: "Puntaje promedio", value: learningPathResult.consolidatedResult.totals.averageFinalScore ?? "-" },
                    ]}
                    emptyLabel="Sin datos"
                  />
                ) : null}
              </div>
            </DataPanel>
          </div>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
