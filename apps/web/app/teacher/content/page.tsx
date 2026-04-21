"use client";

import { useEffect, useState } from "react";
import { DataPanel } from "../../../components/data-panel";
import { PortalShell } from "../../../components/portal-shell";
import { RoleGuard } from "../../../components/role-guard";
import { SimpleTable } from "../../../components/simple-table";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest } from "../../../lib/client-api";

type ResourceRow = { titleEs: string; localizedTitle?: string; type: string };
type GlossaryRow = { termEs: string; localizedTerm?: string; localizedDefinition?: string };

export default function TeacherContentPage() {
  const { accessToken } = useAuth();
  const [lang, setLang] = useState("es");
  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [glossary, setGlossary] = useState<GlossaryRow[]>([]);

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([
      apiRequest<ResourceRow[]>(`/content-resources?lang=${lang}`, accessToken),
      apiRequest<GlossaryRow[]>(`/glossary?lang=${lang}`, accessToken),
    ])
      .then(([resourcesData, glossaryData]) => {
        setResources(resourcesData);
        setGlossary(glossaryData);
      })
      .catch(() => undefined);
  }, [accessToken, lang]);

  return (
    <PortalShell
      eyebrow="Docente"
      title="Contenidos y glosario"
      description="Consulta los recursos y terminos tecnicos disponibles para tus cursos."
    >
      <RoleGuard roles={["TEACHER", "ADMIN"]}>
        <section className="mb-6 flex items-center justify-end">
          <select className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm" value={lang} onChange={(event)=>setLang(event.target.value)}>
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
        </section>
        <section className="grid gap-6 xl:grid-cols-2">
          <DataPanel title="Recursos">
            <SimpleTable
              columns={[
                { key: "title", header: "Recurso", render: (item) => item.localizedTitle ?? item.titleEs },
                { key: "type", header: "Tipo", render: (item) => item.type },
              ]}
              rows={resources}
              emptyLabel="No hay recursos disponibles."
            />
          </DataPanel>
          <DataPanel title="Glosario">
            <SimpleTable
              columns={[
                { key: "term", header: "Termino", render: (item) => item.localizedTerm ?? item.termEs },
                { key: "definition", header: "Definicion", render: (item) => item.localizedDefinition ?? "-" },
              ]}
              rows={glossary}
              emptyLabel="No hay terminos disponibles."
            />
          </DataPanel>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
