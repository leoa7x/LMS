"use client";

import { useEffect, useState } from "react";
import { DataPanel } from "../../../components/data-panel";
import { PortalShell } from "../../../components/portal-shell";
import { RoleGuard } from "../../../components/role-guard";
import { SimpleTable } from "../../../components/simple-table";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest } from "../../../lib/client-api";

type AuditRow = {
  action: string;
  entityType: string;
  entityId?: string | null;
  createdAt: string;
  user?: { email?: string | null } | null;
};

type AccessEventRow = {
  eventType: string;
  createdAt: string;
  user?: { email?: string | null } | null;
  sessionId?: string | null;
  ipAddress?: string | null;
};

export default function AdminAuditPage() {
  const { accessToken } = useAuth();
  const [auditRows, setAuditRows] = useState<AuditRow[]>([]);
  const [accessEvents, setAccessEvents] = useState<AccessEventRow[]>([]);

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([
      apiRequest<AuditRow[]>("/audit", accessToken),
      apiRequest<AccessEventRow[]>("/audit/access-events", accessToken),
    ])
      .then(([auditData, accessData]) => {
        setAuditRows(auditData);
        setAccessEvents(accessData);
      })
      .catch(() => {
        setAuditRows([]);
        setAccessEvents([]);
      });
  }, [accessToken]);

  return (
    <PortalShell
      eyebrow="Auditoria"
      title="Trazabilidad operativa"
      description="Vista consolidada para acciones academicas, administrativas y eventos de acceso del LMS."
    >
      <RoleGuard roles={["ADMIN", "SUPPORT"]}>
        <section className="grid gap-6 xl:grid-cols-2">
          <DataPanel title="Acciones del sistema">
            <SimpleTable
              columns={[
                { key: "action", header: "Accion", render: (item) => item.action },
                { key: "entityType", header: "Entidad", render: (item) => item.entityType },
                { key: "user", header: "Usuario", render: (item) => item.user?.email ?? "Sistema" },
                {
                  key: "createdAt",
                  header: "Fecha",
                  render: (item) => new Date(item.createdAt).toLocaleString("es-CO"),
                },
              ]}
              rows={auditRows}
              emptyLabel="No hay eventos de auditoria visibles."
            />
          </DataPanel>

          <DataPanel title="Eventos de acceso">
            <SimpleTable
              columns={[
                { key: "eventType", header: "Evento", render: (item) => item.eventType },
                { key: "user", header: "Usuario", render: (item) => item.user?.email ?? "Sistema" },
                { key: "sessionId", header: "Sesion", render: (item) => item.sessionId ?? "-" },
                { key: "ipAddress", header: "IP", render: (item) => item.ipAddress ?? "-" },
                {
                  key: "createdAt",
                  header: "Fecha",
                  render: (item) => new Date(item.createdAt).toLocaleString("es-CO"),
                },
              ]}
              rows={accessEvents}
              emptyLabel="No hay eventos de acceso visibles."
            />
          </DataPanel>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
