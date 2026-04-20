"use client";

import { useEffect, useState } from "react";
import { DataPanel } from "../../../components/data-panel";
import { PortalShell } from "../../../components/portal-shell";
import { RoleGuard } from "../../../components/role-guard";
import { SimpleTable } from "../../../components/simple-table";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest } from "../../../lib/client-api";

type StudentSummary = Array<{
  course?: { titleEs?: string | null } | null;
  progress?: Array<{
    progressPct: number;
    lessonsDone: number;
    segmentsDone: number;
    practicesDone: number;
    quizzesPassed: number;
    simulatorsDone: number;
  }> | null;
  learningPathAssignment?: { learningPath?: { titleEs?: string | null } | null } | null;
}>;

export default function StudentProgressPage() {
  const { accessToken, user } = useAuth();
  const [rows, setRows] = useState<StudentSummary>([]);

  useEffect(() => {
    if (!accessToken || !user) return;
    apiRequest<StudentSummary>(`/progress/student/${user.id}`, accessToken)
      .then(setRows)
      .catch(() => setRows([]));
  }, [accessToken, user]);

  return (
    <PortalShell
      eyebrow="Estudiante"
      title="Mi progreso"
      description="Seguimiento individual de avance por curso y ruta dentro del portal."
    >
      <RoleGuard roles={["STUDENT", "ADMIN"]}>
        <DataPanel title="Resumen por curso">
          <SimpleTable
            columns={[
              { key: "course", header: "Curso", render: (item) => item.course?.titleEs ?? "-" },
              { key: "path", header: "Ruta", render: (item) => item.learningPathAssignment?.learningPath?.titleEs ?? "-" },
              { key: "progress", header: "Progreso", render: (item) => `${(item.progress?.[0]?.progressPct ?? 0).toFixed(1)}%` },
              { key: "lessons", header: "Lecciones", render: (item) => item.progress?.[0]?.lessonsDone ?? 0 },
              { key: "practices", header: "Practicas", render: (item) => item.progress?.[0]?.practicesDone ?? 0 },
              { key: "quizzes", header: "Quizzes", render: (item) => item.progress?.[0]?.quizzesPassed ?? 0 },
              { key: "simulators", header: "Simuladores", render: (item) => item.progress?.[0]?.simulatorsDone ?? 0 },
            ]}
            rows={rows}
            emptyLabel="No hay progreso visible."
          />
        </DataPanel>
      </RoleGuard>
    </PortalShell>
  );
}
