"use client";

import { useEffect, useState } from "react";
import { DataPanel } from "../../../components/data-panel";
import { PortalShell } from "../../../components/portal-shell";
import { RoleGuard } from "../../../components/role-guard";
import { SimpleTable } from "../../../components/simple-table";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest } from "../../../lib/client-api";

type ProgressRow = {
  progressPct: number;
  lessonsDone: number;
  segmentsDone: number;
  practicesDone: number;
  quizzesPassed: number;
  simulatorsDone: number;
  enrollment?: {
    student?: { firstName?: string; lastName?: string; email?: string } | null;
    course?: { titleEs?: string } | null;
  } | null;
};

export default function AdminProgressPage() {
  const { accessToken } = useAuth();
  const [rows, setRows] = useState<ProgressRow[]>([]);

  useEffect(() => {
    if (!accessToken) return;
    apiRequest<ProgressRow[]>("/progress", accessToken)
      .then(setRows)
      .catch(() => setRows([]));
  }, [accessToken]);

  return (
    <PortalShell
      eyebrow="Progreso"
      title="Seguimiento institucional"
      description="Vista consolidada del avance por matricula, pensada para control academico y seguimiento institucional."
    >
      <RoleGuard roles={["ADMIN", "SUPPORT"]}>
        <DataPanel title="Avance por matricula">
          <SimpleTable
            columns={[
              {
                key: "student",
                header: "Estudiante",
                render: (item) =>
                  `${item.enrollment?.student?.firstName ?? ""} ${item.enrollment?.student?.lastName ?? ""}`.trim() ||
                  item.enrollment?.student?.email ||
                  "-",
              },
              {
                key: "course",
                header: "Curso",
                render: (item) => item.enrollment?.course?.titleEs ?? "-",
              },
              {
                key: "progressPct",
                header: "Progreso",
                render: (item) => `${item.progressPct.toFixed(1)}%`,
              },
              { key: "lessonsDone", header: "Lecciones", render: (item) => item.lessonsDone },
              { key: "segmentsDone", header: "Segmentos", render: (item) => item.segmentsDone },
              { key: "practicesDone", header: "Practicas", render: (item) => item.practicesDone },
              { key: "quizzesPassed", header: "Quizzes", render: (item) => item.quizzesPassed },
              { key: "simulatorsDone", header: "Simuladores", render: (item) => item.simulatorsDone },
            ]}
            rows={rows}
            emptyLabel="No hay progreso visible."
          />
        </DataPanel>
      </RoleGuard>
    </PortalShell>
  );
}
