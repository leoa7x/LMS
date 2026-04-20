import { AdminShell } from "../../../components/admin-shell";
import { SectionCard } from "../../../components/section-card";
import { SimpleTable } from "../../../components/simple-table";
import { fetchJson } from "../../../lib/api";

type AuditRow = {
  action: string;
  entityType: string;
  createdAt: string;
  user?: { email?: string | null } | null;
};

export default async function AuditAdminPage() {
  const auditRows = (await fetchJson<AuditRow[]>("/audit")) ?? [];

  return (
    <AdminShell
      eyebrow="Trazabilidad"
      title="Auditoria operativa"
      description="Panel inicial para revisar acciones academicas y administrativas registradas por el backend del LMS."
    >
      <SectionCard
        title="Eventos recientes"
        description="La auditoria sera clave para soporte, seguimiento y operacion institucional."
      >
        <SimpleTable
          columns={[
            {
              key: "action",
              header: "Accion",
              render: (item) => item.action,
            },
            {
              key: "entityType",
              header: "Entidad",
              render: (item) => item.entityType,
            },
            {
              key: "user",
              header: "Usuario",
              render: (item) => item.user?.email ?? "Sistema",
            },
            {
              key: "createdAt",
              header: "Fecha",
              render: (item) => new Date(item.createdAt).toLocaleString("es-CO"),
            },
          ]}
          rows={auditRows}
          emptyLabel="Todavia no hay eventos visibles o la API requiere autenticacion."
        />
      </SectionCard>
    </AdminShell>
  );
}
