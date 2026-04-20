import { AdminShell } from "../../../components/admin-shell";
import { SectionCard } from "../../../components/section-card";
import { SimpleTable } from "../../../components/simple-table";
import { fetchJson } from "../../../lib/api";

type SimulatorRow = {
  name: string;
  kind: string;
  isTrackable: boolean;
  mappings?: Array<{ id: string }>;
};

export default async function SimulatorsAdminPage() {
  const simulators = (await fetchJson<SimulatorRow[]>("/simulators")) ?? [];

  return (
    <AdminShell
      eyebrow="Simuladores"
      title="Integracion y taxonomia"
      description="Panel base para administrar el modulo de simuladores bajo la clasificacion acordada por el proyecto."
    >
      <SectionCard
        title="Catalogo de simuladores"
        description="Esta vista refleja la capa de backend para soporte embebido, adaptado y nativo."
      >
        <SimpleTable
          columns={[
            {
              key: "name",
              header: "Simulador",
              render: (item) => item.name,
            },
            {
              key: "kind",
              header: "Categoria",
              render: (item) => item.kind,
            },
            {
              key: "trackable",
              header: "Seguimiento",
              render: (item) => (item.isTrackable ? "Si" : "No"),
            },
            {
              key: "mappings",
              header: "Mapeos",
              render: (item) => item.mappings?.length ?? 0,
            },
          ]}
          rows={simulators}
          emptyLabel="Aun no hay simuladores cargados o la API no esta respondiendo."
        />
      </SectionCard>
    </AdminShell>
  );
}
