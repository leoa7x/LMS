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
  voiceoverEnabled?: boolean;
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
  interactiveConfigs?: Array<{ id: string; localizedTitle?: string }>;
  glossaryLinks?: Array<{
    glossaryTerm: {
      id: string;
      localizedTerm?: string;
    };
  }>;
};

type GlossaryRow = {
  id: string;
  localizedTerm?: string;
  localizedDefinition?: string;
  termEs: string;
  relations?: Array<{
    id: string;
    contentResource?: {
      localizedTitle?: string;
      lesson?: {
        localizedTitle?: string;
      };
    };
  }>;
};

type VoiceoverRow = {
  id: string;
  title?: string | null;
  language: string;
  status: string;
  sourceKind: string;
  localizedTranscript?: string | null;
  contentResource?: {
    localizedTitle?: string;
  } | null;
  lessonSegment?: {
    titleEs?: string | null;
  } | null;
};

type InteractiveConfigRow = {
  id: string;
  kind: string;
  localizedTitle?: string;
  isActive: boolean;
  embedUri?: string | null;
  contentResource?: {
    localizedTitle?: string;
  } | null;
  lessonSegment?: {
    titleEs?: string | null;
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

const voiceStatusLabels: Record<string, string> = {
  DRAFT: "En preparacion",
  READY: "Disponible",
  FAILED: "Pendiente de ajuste",
  DISABLED: "Deshabilitado",
};

const interactiveKindLabels: Record<string, string> = {
  EMBEDDED_WIDGET: "Recurso embebido",
  DIAGRAM_COMPONENT_MAP: "Diagrama relacionado",
  STEP_GUIDED_ACTIVITY: "Secuencia guiada",
  THREE_D_SCENE: "Escena 3D",
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

export default function StudentContentPage() {
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

  const filteredVoiceovers = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return voiceovers.filter((item) => {
      const content = [
        item.title ?? "",
        item.contentResource?.localizedTitle ?? "",
        item.lessonSegment?.titleEs ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return !normalized || content.includes(normalized);
    });
  }, [search, voiceovers]);

  const filteredInteractiveConfigs = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return interactiveConfigs.filter((item) => {
      const content = [
        item.localizedTitle ?? "",
        item.contentResource?.localizedTitle ?? "",
        item.lessonSegment?.titleEs ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return !normalized || content.includes(normalized);
    });
  }, [interactiveConfigs, search]);

  return (
    <PortalShell
      eyebrow="Estudiante"
      title="Contenidos y glosario"
      description="Consulta recursos, apoyos de estudio y terminos tecnicos disponibles dentro de tus cursos."
    >
      <RoleGuard roles={["STUDENT", "ADMIN"]}>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Recursos disponibles"
            value={resources.length}
            helper="Materiales publicados para tu recorrido academico."
          />
          <StatCard
            label="Terminos tecnicos"
            value={glossary.length}
            helper="Conceptos disponibles dentro del mismo portal."
          />
          <StatCard
            label="Pistas de voz"
            value={voiceovers.length}
            helper="Apoyos de vocalizacion y acompanamiento."
          />
          <StatCard
            label="Apoyos interactivos"
            value={interactiveConfigs.length}
            helper="Recursos activos con interaccion dentro del portal."
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

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <DataPanel
            title="Recursos de aprendizaje"
            description="Consulta el material disponible por curso, modulo y leccion, con apoyo bilingue cuando este habilitado."
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
                      <div className="flex flex-wrap gap-2">
                        {resource.voiceoverEnabled || resource.voiceoverTracks?.length ? (
                          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                            Vocalizacion
                          </span>
                        ) : null}
                        {resource.interactiveConfigs?.length ? (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Interactivo
                          </span>
                        ) : null}
                        {resource.glossaryLinks?.length ? (
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            Glosario vinculado
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {resource.localizedBody ? (
                      <p className="mt-4 text-sm leading-6 text-slate-700">
                        {resource.localizedBody.slice(0, 220)}
                        {resource.localizedBody.length > 220 ? "..." : ""}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                      <span>
                        Versiones: <strong>{resource.versions?.length ?? 0}</strong>
                      </span>
                      <span>
                        Pistas de voz: <strong>{resource.voiceoverTracks?.length ?? 0}</strong>
                      </span>
                      <span>
                        Apoyos interactivos:{" "}
                        <strong>{resource.interactiveConfigs?.length ?? 0}</strong>
                      </span>
                    </div>
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
            description="Consulta definiciones tecnicas y ubica rapidamente en que recurso aparecen relacionadas."
          >
            <div className="grid gap-4">
              {filteredGlossary.length ? (
                filteredGlossary.map((term) => (
                  <article
                    key={term.id}
                    className="rounded-3xl border border-cloud bg-white px-5 py-4"
                  >
                    <h3 className="text-base font-semibold text-slate-950">
                      {term.localizedTerm ?? term.termEs}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {term.localizedDefinition ?? "Definicion no disponible."}
                    </p>
                    {term.relations?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {term.relations.slice(0, 3).map((relation) => (
                          <span
                            key={relation.id}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                          >
                            {relation.contentResource?.localizedTitle ??
                              relation.contentResource?.lesson?.localizedTitle ??
                              "Relacionado"}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
                  No hay terminos que coincidan con tu busqueda.
                </div>
              )}
            </div>
          </DataPanel>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <DataPanel
            title="Pistas de voz"
            description="Apoyos de lectura y vocalizacion disponibles para recursos o segmentos del curso."
          >
            <div className="grid gap-4">
              {filteredVoiceovers.length ? (
                filteredVoiceovers.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-3xl border border-cloud bg-white px-5 py-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-slate-950">
                          {item.title ??
                            item.contentResource?.localizedTitle ??
                            item.lessonSegment?.titleEs ??
                            "Pista de voz"}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Idioma: {item.language.toUpperCase()} ·{" "}
                          {voiceStatusLabels[item.status] ?? item.status}
                        </p>
                      </div>
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                        {item.sourceKind}
                      </span>
                    </div>
                    {item.localizedTranscript ? (
                      <p className="mt-3 text-sm leading-6 text-slate-700">
                        {item.localizedTranscript.slice(0, 180)}
                        {item.localizedTranscript.length > 180 ? "..." : ""}
                      </p>
                    ) : null}
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
                  No hay pistas de voz disponibles con los filtros actuales.
                </div>
              )}
            </div>
          </DataPanel>

          <DataPanel
            title="Apoyos interactivos"
            description="Recursos activos para profundizar el aprendizaje dentro del mismo portal."
          >
            <div className="grid gap-4">
              {filteredInteractiveConfigs.length ? (
                filteredInteractiveConfigs.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-3xl border border-cloud bg-white px-5 py-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-slate-950">
                          {item.localizedTitle ?? "Apoyo interactivo"}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.contentResource?.localizedTitle ??
                            item.lessonSegment?.titleEs ??
                            "Vinculado al contenido del curso"}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {item.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      {interactiveKindLabels[item.kind] ?? item.kind}
                    </p>
                    {item.embedUri ? (
                      <p className="mt-2 break-all text-xs text-slate-500">
                        {item.embedUri}
                      </p>
                    ) : null}
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
                  No hay apoyos interactivos disponibles con los filtros actuales.
                </div>
              )}
            </div>
          </DataPanel>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
