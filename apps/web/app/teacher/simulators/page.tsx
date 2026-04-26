"use client";

import { useEffect, useState } from "react";
import { DataPanel } from "../../../components/data-panel";
import { PortalShell } from "../../../components/portal-shell";
import { RoleGuard } from "../../../components/role-guard";
import { SimpleTable } from "../../../components/simple-table";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest } from "../../../lib/client-api";

type SimulatorRow = {
  id: string;
  name: string;
  kind: string;
  mappings?: Array<{
    id: string;
    practice?: {
      titleEs?: string | null;
      lesson?: {
        module?: { course?: { titleEs?: string | null } | null } | null;
      } | null;
    } | null;
  }> | null;
};

type SimulatorSessionRow = {
  id: string;
  status: string;
  score?: number | null;
  simulator?: { name?: string | null } | null;
  student?: { firstName?: string | null; lastName?: string | null; email?: string | null } | null;
  enrollment?: { course?: { titleEs?: string | null } | null } | null;
  startedAt: string;
};

const simulatorKindLabels: Record<string, string> = {
  EMBEDDABLE_EXISTING: "Integrado existente",
  THIRD_PARTY_ADAPTER: "Adaptacion externa",
  NATIVE_BASIC: "Propio basico",
  NATIVE_ADVANCED: "Propio avanzado",
};

const simulatorSessionStatusLabels: Record<string, string> = {
  STARTED: "En curso",
  COMPLETED: "Completada",
  FAILED: "No completada",
  ABANDONED: "Abandonada",
};

export default function TeacherSimulatorsPage() {
  const { accessToken } = useAuth();
  const [simulators, setSimulators] = useState<SimulatorRow[]>([]);
  const [sessions, setSessions] = useState<SimulatorSessionRow[]>([]);

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([
      apiRequest<SimulatorRow[]>("/simulators", accessToken),
      apiRequest<SimulatorSessionRow[]>("/simulators/sessions", accessToken),
    ])
      .then(([simulatorsData, sessionsData]) => {
        setSimulators(simulatorsData);
        setSessions(sessionsData);
      })
      .catch(() => {
        setSimulators([]);
        setSessions([]);
      });
  }, [accessToken]);

  return (
    <PortalShell
      eyebrow="Docente"
      title="Simuladores"
      description="Consulta los simuladores disponibles en tus cursos y revisa la actividad reciente de los estudiantes."
    >
      <RoleGuard roles={["TEACHER", "ADMIN"]}>
        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <DataPanel title="Simuladores disponibles">
            <SimpleTable
              columns={[
                { key: "name", header: "Simulador", render: (item) => item.name },
                {
                  key: "kind",
                  header: "Categoria",
                  render: (item) => simulatorKindLabels[item.kind] ?? item.kind,
                },
                {
                  key: "courses",
                  header: "Cursos",
                  render: (item) =>
                    Array.from(
                      new Set(
                        (item.mappings ?? [])
                          .map(
                            (mapping) =>
                              mapping.practice?.lesson?.module?.course?.titleEs ?? null,
                          )
                          .filter(Boolean),
                      ),
                    ).join(", ") || "-",
                },
              ]}
              rows={simulators}
              emptyLabel="No hay simuladores disponibles."
            />
          </DataPanel>

          <DataPanel title="Sesiones recientes">
            <SimpleTable
              columns={[
                {
                  key: "student",
                  header: "Estudiante",
                  render: (item) =>
                    `${item.student?.firstName ?? ""} ${item.student?.lastName ?? ""}`.trim() ||
                    item.student?.email ||
                    "-",
                },
                {
                  key: "simulator",
                  header: "Simulador",
                  render: (item) => item.simulator?.name ?? "-",
                },
                {
                  key: "course",
                  header: "Curso",
                  render: (item) => item.enrollment?.course?.titleEs ?? "-",
                },
                {
                  key: "status",
                  header: "Estado",
                  render: (item) => simulatorSessionStatusLabels[item.status] ?? item.status,
                },
                { key: "score", header: "Puntaje", render: (item) => item.score ?? "-" },
                {
                  key: "startedAt",
                  header: "Inicio",
                  render: (item) => new Date(item.startedAt).toLocaleString("es-CO"),
                },
              ]}
              rows={sessions}
              emptyLabel="No hay sesiones registradas."
            />
          </DataPanel>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
