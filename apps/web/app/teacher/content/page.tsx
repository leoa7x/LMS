"use client";

import { useEffect, useMemo, useState } from "react";
import { DataPanel } from "../../../components/data-panel";
import { PortalShell } from "../../../components/portal-shell";
import { RoleGuard } from "../../../components/role-guard";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest } from "../../../lib/client-api";

type ResourceRow = {
  id: string;
  type: string;
  localizedTitle?: string;
  localizedBody?: string | null;
  titleEs: string;
  lesson: {
    localizedTitle?: string;
    module: {
      localizedTitle?: string;
      course: {
        localizedTitle?: string;
      };
    };
  };
  versions?: Array<{ id: string }>;
  voiceoverTracks?: Array<{ id: string }>;
  interactiveConfigs?: Array<{ id: string }>;
};

type GlossaryRow = {
  id: string;
  localizedTerm?: string;
  localizedDefinition?: string;
  termEs: string;
  relations?: Array<{ id: string }>;
};

type VoiceoverRow = {
  id: string;
  title?: string | null;
  language: string;
  status: string;
  contentResource?: {
    localizedTitle?: string;
  } | null;
};

type InteractiveConfigRow = {
  id: string;
  kind: string;
  localizedTitle?: string;
  isActive: boolean;
  contentResource?: {
    localizedTitle?: string;
  } | null;
};

const resourceTypeLabels: Record<string, string> = {
  RICH_TEXT: "Lectura guiada",
  PDF: "Documento PDF",
  VIDEO: "Video",
  EBOOK: "E-book",
  IMAGE: "Imagen",
  AUDIO: "Audio",
  INTERACTIVE: "Material interactivo",
  EXTERNAL_LINK: "Enlace externo",
};

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div className="rounded-3xl border border-cloud bg-white px-5 py-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-steel">
        {label}
      </p>
      <p className="mt-3 font-display text-3xl font-semibold text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{helper}</p>
    </div>
  );
}

export default function TeacherContentPage() {
  const { accessToken } = useAuth();
  const [lang, setLang] = useState("es");
  const [search, setSearch] = useState("");
  const [resourceType, setResourceType] = useState("ALL");
  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [glossary, setGlossary] = useState<GlossaryRow[]>([]);
  const [voiceovers, setVoiceovers] = useState<VoiceoverRow[]>([]);
  const [interactiveConfigs, setInteractiveConfigs] = useState<InteractiveConfigRow[]>(
    [],
  );

  useEffect(() => {
    if (!accessToken) return;

    Promise.all([
      apiRequest<ResourceRow[]>(`/content-resources?lang=${lang}`, accessToken),
      apiRequest<GlossaryRow[]>(`/glossary?lang=${lang}`, accessToken),
      apiRequest<VoiceoverRow[]>(`/content-resources/voiceovers?lang=${lang}`, accessToken),
      apiRequest<InteractiveConfigRow[]>(
        `/content-resources/interactive-configs?lang=${lang}`,
        accessToken,
      ),
    ])
      .then(([resourcesData, glossaryData, voiceoversData, interactiveData]) => {
        setResources(resourcesData);
        setGlossary(glossaryData);
        setVoiceovers(voiceoversData);
        setInteractiveConfigs(interactiveData);
      })
      .catch(() => {
        setResources([]);
        setGlossary([]);
        setVoiceovers([]);
        setInteractiveConfigs([]);
      });
  }, [accessToken, lang]);

  const filteredResources = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesType = resourceType === "ALL" || resource.type === resourceType;
      const content = [
        resource.localizedTitle ?? resource.titleEs,
        resource.lesson.module.course.localizedTitle ?? "",
        resource.lesson.module.localizedTitle ?? "",
        resource.lesson.localizedTitle ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return matchesType && (!normalized || content.includes(normalized));
    });
  }, [resourceType, resources, search]);

  const filteredGlossary = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return glossary.filter((term) => {
      const content = [
        term.localizedTerm ?? term.termEs,
        term.localizedDefinition ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return !normalized || content.includes(normalized);
    });
  }, [glossary, search]);

  return (
    <PortalShell
      eyebrow="Docente"
      title="Contenidos y glosario"
      description="Consulta, organiza y revisa los apoyos de estudio disponibles para tus cursos y para el seguimiento del grupo."
    >
      <RoleGuard roles={["TEACHER", "ADMIN"]}>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Recursos visibles"
            value={resources.length}
            helper="Material disponible dentro de los cursos a tu alcance."
          />
          <StatCard
            label="Terminos tecnicos"
            value={glossary.length}
            helper="Conceptos integrados dentro del mismo portal."
          />
          <StatCard
            label="Pistas de voz"
            value={voiceovers.length}
            helper="Apoyos de lectura y vocalizacion disponibles."
          />
          <StatCard
            label="Apoyos interactivos"
            value={interactiveConfigs.filter((item) => item.isActive).length}
            helper="Recursos activos listos para acompanar el proceso formativo."
          />
        </section>

        <section className="mt-6 rounded-3xl border border-cloud bg-white px-5 py-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por curso, recurso o termino"
              className="w-full rounded-2xl border border-cloud px-4 py-3 text-sm outline-none transition focus:border-navy"
            />
            <select
              value={resourceType}
              onChange={(event) => setResourceType(event.target.value)}
              className="rounded-2xl border border-cloud bg-white px-4 py-3 text-sm"
            >
              <option value="ALL">Todos los recursos</option>
              {Object.entries(resourceTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={lang}
              onChange={(event) => setLang(event.target.value)}
              className="rounded-2xl border border-cloud bg-white px-4 py-3 text-sm"
            >
              <option value="es">ES</option>
              <option value="en">EN</option>
            </select>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <DataPanel
            title="Recursos disponibles"
            description="Ubica rapidamente lecturas, videos, materiales interactivos y otros apoyos por curso y leccion."
          >
            <div className="grid gap-4">
              {filteredResources.length ? (
                filteredResources.map((resource) => (
                  <article
                    key={resource.id}
                    className="rounded-3xl border border-cloud bg-white px-5 py-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-steel">
                          {resourceTypeLabels[resource.type] ?? resource.type}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-slate-950">
                          {resource.localizedTitle ?? resource.titleEs}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                          {resource.lesson.module.course.localizedTitle} /{" "}
                          {resource.lesson.module.localizedTitle} /{" "}
                          {resource.lesson.localizedTitle}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        <p>Versiones: {resource.versions?.length ?? 0}</p>
                        <p>Vocalizacion: {resource.voiceoverTracks?.length ?? 0}</p>
                        <p>Interactivos: {resource.interactiveConfigs?.length ?? 0}</p>
                      </div>
                    </div>

                    {resource.localizedBody ? (
                      <p className="mt-4 text-sm leading-6 text-slate-700">
                        {resource.localizedBody.slice(0, 220)}
                        {resource.localizedBody.length > 220 ? "..." : ""}
                      </p>
                    ) : null}
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
                  No hay recursos que coincidan con los filtros actuales.
                </div>
              )}
            </div>
          </DataPanel>

          <DataPanel
            title="Glosario tecnico"
            description="Consulta definiciones tecnicas y confirma la cantidad de relaciones registradas por termino."
          >
            <div className="grid gap-4">
              {filteredGlossary.length ? (
                filteredGlossary.map((term) => (
                  <article
                    key={term.id}
                    className="rounded-3xl border border-cloud bg-white px-5 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-slate-950">
                          {term.localizedTerm ?? term.termEs}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {term.localizedDefinition ?? "Definicion no disponible."}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {term.relations?.length ?? 0} relaciones
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
                  No hay terminos que coincidan con la busqueda actual.
                </div>
              )}
            </div>
          </DataPanel>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
