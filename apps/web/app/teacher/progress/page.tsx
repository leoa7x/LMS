"use client";

import { useEffect, useState } from "react";
import { DataPanel } from "../../../components/data-panel";
import { PortalShell } from "../../../components/portal-shell";
import { RoleGuard } from "../../../components/role-guard";
import { SimpleTable } from "../../../components/simple-table";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest } from "../../../lib/client-api";

type EnrollmentRow = {
  id: string;
  student?: { id?: string; firstName?: string; lastName?: string; email?: string } | null;
  course?: { titleEs?: string } | null;
};

type StudentSummary = {
  totals: { averageProgress: number; quizzesPassed: number; practiceAttempts: number; completedSimulatorSessions: number };
  enrollments: Array<{ courseTitleEs: string; progressPct: number; assignedLevelCode?: string | null; status: string }>;
};

export default function TeacherProgressPage() {
  const { accessToken } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [summary, setSummary] = useState<StudentSummary | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    apiRequest<EnrollmentRow[]>("/enrollments", accessToken)
      .then(setEnrollments)
      .catch(() => setEnrollments([]));
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken || !selectedStudentId) {
      setSummary(null);
      return;
    }
    apiRequest<StudentSummary>(`/reports/students/${selectedStudentId}/summary`, accessToken)
      .then(setSummary)
      .catch(() => setSummary(null));
  }, [accessToken, selectedStudentId]);

  const studentOptions = Array.from(
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
          },
        ]),
    ).values(),
  );

  return (
    <PortalShell
      eyebrow="Docente"
      title="Progreso por estudiante"
      description="Consulta el avance de tus estudiantes y revisa el detalle de sus cursos activos."
    >
      <RoleGuard roles={["TEACHER", "ADMIN"]}>
        <DataPanel title="Resumen del estudiante">
          <div className="grid gap-4">
            <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" value={selectedStudentId} onChange={(event)=>setSelectedStudentId(event.target.value)}>
              <option value="">Selecciona estudiante</option>
              {studentOptions.map((item)=>(
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
            {summary ? (
              <>
                <SimpleTable
                  columns={[
                    { key: "metric", header: "Metrica", render: (item) => item.metric },
                    { key: "value", header: "Valor", render: (item) => item.value },
                  ]}
                  rows={[
                    { metric: "Progreso promedio", value: `${summary.totals.averageProgress.toFixed(1)}%` },
                    { metric: "Quizzes aprobados", value: summary.totals.quizzesPassed },
                    { metric: "Practicas", value: summary.totals.practiceAttempts },
                    { metric: "Simuladores", value: summary.totals.completedSimulatorSessions },
                  ]}
                  emptyLabel="No hay informacion disponible."
                />
                <SimpleTable
                  columns={[
                    { key: "courseTitleEs", header: "Curso", render: (item) => item.courseTitleEs },
                    { key: "progressPct", header: "Progreso", render: (item) => `${item.progressPct.toFixed(1)}%` },
                    { key: "assignedLevelCode", header: "Nivel", render: (item) => item.assignedLevelCode ?? "-" },
                    { key: "status", header: "Estado", render: (item) => item.status },
                  ]}
                  rows={summary.enrollments}
                  emptyLabel="No hay cursos activos."
                />
              </>
            ) : null}
          </div>
        </DataPanel>
      </RoleGuard>
    </PortalShell>
  );
}
