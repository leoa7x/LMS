"use client";

import { useEffect, useState } from "react";
import { DataPanel } from "../../../components/data-panel";
import { PortalShell } from "../../../components/portal-shell";
import { RoleGuard } from "../../../components/role-guard";
import { SimpleTable } from "../../../components/simple-table";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest } from "../../../lib/client-api";

type StudentSummary = {
  currentCourses: Array<{
    enrollmentId: string;
    titleEs: string;
    progressPct: number;
    assignedLevelCode?: string | null;
    status: string;
  }>;
};

export default function StudentCoursesPage() {
  const { accessToken } = useAuth();
  const [summary, setSummary] = useState<StudentSummary>({ currentCourses: [] });

  useEffect(() => {
    if (!accessToken) return;
    apiRequest<StudentSummary>("/dashboard/student/me", accessToken)
      .then(setSummary)
      .catch(() => setSummary({ currentCourses: [] }));
  }, [accessToken]);

  return (
    <PortalShell
      eyebrow="Estudiante"
      title="Mis cursos visibles"
      description="Cursos activos disponibles por matricula o ruta dentro del contexto del estudiante."
    >
      <RoleGuard roles={["STUDENT", "ADMIN"]}>
        <DataPanel title="Cursos activos">
          <SimpleTable
            columns={[
              { key: "titleEs", header: "Curso", render: (item) => item.titleEs },
              { key: "progressPct", header: "Progreso", render: (item) => `${item.progressPct.toFixed(1)}%` },
              { key: "assignedLevelCode", header: "Nivel", render: (item) => item.assignedLevelCode ?? "-" },
              { key: "status", header: "Estado", render: (item) => item.status },
            ]}
            rows={summary.currentCourses}
            emptyLabel="No hay cursos activos visibles."
          />
        </DataPanel>
      </RoleGuard>
    </PortalShell>
  );
}
