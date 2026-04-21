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
  isTrackable: boolean;
  mappings?: Array<{
    id: string;
    practice?: { titleEs?: string | null } | null;
  }> | null;
  sessions?: Array<{ id: string }> | null;
};

type SimulatorMappingRow = {
  id: string;
  simulator?: { name?: string | null } | null;
  practice?: {
    titleEs?: string | null;
    lesson?: {
      titleEs?: string | null;
      module?: {
        titleEs?: string | null;
        course?: { titleEs?: string | null } | null;
      } | null;
    } | null;
  } | null;
};

type SimulatorSessionRow = {
  id: string;
  status: string;
  score?: number | null;
  startedAt: string;
  finishedAt?: string | null;
  simulator?: { name?: string | null; kind?: string | null } | null;
  student?: { firstName?: string | null; lastName?: string | null; email?: string | null } | null;
  enrollment?: { course?: { titleEs?: string | null } | null } | null;
};

export default function AdminSimulatorsPage() {
  const { accessToken } = useAuth();
  const [simulators, setSimulators] = useState<SimulatorRow[]>([]);
  const [mappings, setMappings] = useState<SimulatorMappingRow[]>([]);
  const [sessions, setSessions] = useState<SimulatorSessionRow[]>([]);

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([
      apiRequest<SimulatorRow[]>("/simulators", accessToken),
      apiRequest<SimulatorMappingRow[]>("/simulators/mappings", accessToken),
      apiRequest<SimulatorSessionRow[]>("/simulators/sessions", accessToken),
    ])
      .then(([simulatorsData, mappingsData, sessionsData]) => {
        setSimulators(simulatorsData);
        setMappings(mappingsData);
        setSessions(sessionsData);
      })
      .catch(() => {
        setSimulators([]);
        setMappings([]);
        setSessions([]);
      });
  }, [accessToken]);

  return (
    <PortalShell
      eyebrow="Simuladores"
      title="Catalogo y actividad"
      description="Administra los simuladores disponibles y revisa su uso dentro de las practicas formativas."
    >
      <RoleGuard roles={["ADMIN", "SUPPORT"]}>
        <section className="grid gap-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <DataPanel
              title="Catalogo de simuladores"
              description="Consulta los simuladores disponibles y su tipo de integracion en la plataforma."
            >
              <SimpleTable
                columns={[
                  { key: "name", header: "Simulador", render: (item) => item.name },
                  { key: "kind", header: "Categoria", render: (item) => item.kind },
                  {
                    key: "trackable",
                    header: "Seguimiento",
                    render: (item) => (item.isTrackable ? "Si" : "No"),
                  },
                  {
                    key: "mappings",
                    header: "Practicas",
                    render: (item) => item.mappings?.length ?? 0,
                  },
                  {
                    key: "sessions",
                    header: "Sesiones",
                    render: (item) => item.sessions?.length ?? 0,
                  },
                ]}
                rows={simulators}
                emptyLabel="No hay simuladores visibles."
              />
            </DataPanel>

            <DataPanel
              title="Relacion con las practicas"
              description="Verifica que cada simulador este vinculado a la practica y al curso correspondiente."
            >
              <SimpleTable
                columns={[
                  {
                    key: "simulator",
                    header: "Simulador",
                    render: (item) => item.simulator?.name ?? "-",
                  },
                  {
                    key: "practice",
                    header: "Practica",
                    render: (item) => item.practice?.titleEs ?? "-",
                  },
                  {
                    key: "lesson",
                    header: "Leccion",
                    render: (item) => item.practice?.lesson?.titleEs ?? "-",
                  },
                  {
                    key: "module",
                    header: "Modulo",
                    render: (item) => item.practice?.lesson?.module?.titleEs ?? "-",
                  },
                  {
                    key: "course",
                    header: "Curso",
                    render: (item) =>
                      item.practice?.lesson?.module?.course?.titleEs ?? "-",
                  },
                ]}
                rows={mappings}
                emptyLabel="No hay mapeos visibles."
              />
            </DataPanel>
          </div>

          <DataPanel
            title="Sesiones registradas"
            description="Consulta la actividad reciente de los estudiantes en los simuladores."
          >
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
                { key: "status", header: "Estado", render: (item) => item.status },
                { key: "score", header: "Score", render: (item) => item.score ?? "-" },
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
