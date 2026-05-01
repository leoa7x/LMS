"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DataPanel } from "../../../components/data-panel";
import { PortalShell } from "../../../components/portal-shell";
import { RoleGuard } from "../../../components/role-guard";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest } from "../../../lib/client-api";

type LessonOption = { id: string; localizedTitle?: string; titleEs: string };
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
  sourceKind: string;
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

export default function ContentAdminPage() {
  const { accessToken } = useAuth();
  const [lang, setLang] = useState("es");
  const [search, setSearch] = useState("");
  const [resourceType, setResourceType] = useState("ALL");
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [glossary, setGlossary] = useState<GlossaryRow[]>([]);
  const [voiceovers, setVoiceovers] = useState<VoiceoverRow[]>([]);
  const [interactiveConfigs, setInteractiveConfigs] = useState<InteractiveConfigRow[]>(
    [],
  );
  const [resourceForm, setResourceForm] = useState({
    lessonId: "",
    type: "RICH_TEXT",
    titleEs: "",
    titleEn: "",
    bodyEs: "",
    bodyEn: "",
    uri: "",
  });
  const [glossaryForm, setGlossaryForm] = useState({
    slug: "",
    termEs: "",
    termEn: "",
    definitionEs: "",
    definitionEn: "",
  });
  const [voiceoverForm, setVoiceoverForm] = useState({
    contentResourceId: "",
    language: "es",
    sourceKind: "MANUAL_RECORDING",
    status: "READY",
    title: "",
    transcriptEs: "",
    transcriptEn: "",
    audioUri: "",
  });
  const [interactiveForm, setInteractiveForm] = useState({
    contentResourceId: "",
    kind: "EMBEDDED_WIDGET",
    titleEs: "",
    titleEn: "",
    embedUri: "",
    configJsonText: "{\"displayMode\":\"inline\"}",
  });
  const [formMessage, setFormMessage] = useState<string | null>(null);

  async function loadContent() {
    if (!accessToken) {
      return;
    }

    const [lessonsData, resourcesData, glossaryData, voiceoversData, interactiveData] =
      await Promise.all([
        apiRequest<LessonOption[]>("/lessons", accessToken),
        apiRequest<ResourceRow[]>(`/content-resources?lang=${lang}`, accessToken),
        apiRequest<GlossaryRow[]>(`/glossary?lang=${lang}`, accessToken),
        apiRequest<VoiceoverRow[]>(`/content-resources/voiceovers?lang=${lang}`, accessToken),
        apiRequest<InteractiveConfigRow[]>(
          `/content-resources/interactive-configs?lang=${lang}`,
          accessToken,
        ),
      ]);

    setLessons(lessonsData);
    setResources(resourcesData);
    setGlossary(glossaryData);
    setVoiceovers(voiceoversData);
    setInteractiveConfigs(interactiveData);
  }

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    loadContent().catch(() => {
      setLessons([]);
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

  async function createResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;

    await apiRequest("/content-resources", accessToken, {
      method: "POST",
      body: JSON.stringify({
        ...resourceForm,
        voiceoverEnabled: false,
      }),
    });

    setFormMessage("Recurso registrado correctamente.");
    setResourceForm({
      lessonId: "",
      type: "RICH_TEXT",
      titleEs: "",
      titleEn: "",
      bodyEs: "",
      bodyEn: "",
      uri: "",
    });
    await loadContent();
  }

  async function createGlossary(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;

    await apiRequest("/glossary", accessToken, {
      method: "POST",
      body: JSON.stringify(glossaryForm),
    });

    setFormMessage("Termino de glosario registrado correctamente.");
    setGlossaryForm({
      slug: "",
      termEs: "",
      termEn: "",
      definitionEs: "",
      definitionEn: "",
    });
    await loadContent();
  }

  async function createVoiceover(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;

    await apiRequest("/content-resources/voiceovers", accessToken, {
      method: "POST",
      body: JSON.stringify(voiceoverForm),
    });

    setFormMessage("Pista de voz registrada correctamente.");
    setVoiceoverForm({
      contentResourceId: "",
      language: "es",
      sourceKind: "MANUAL_RECORDING",
      status: "READY",
      title: "",
      transcriptEs: "",
      transcriptEn: "",
      audioUri: "",
    });
    await loadContent();
  }

  async function createInteractive(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;

    const parsedConfig = JSON.parse(interactiveForm.configJsonText) as Record<
      string,
      unknown
    >;

    await apiRequest("/content-resources/interactive-configs", accessToken, {
      method: "POST",
      body: JSON.stringify({
        contentResourceId: interactiveForm.contentResourceId,
        kind: interactiveForm.kind,
        titleEs: interactiveForm.titleEs,
        titleEn: interactiveForm.titleEn,
        embedUri: interactiveForm.embedUri,
        configJson: parsedConfig,
      }),
    });

    setFormMessage("Apoyo interactivo registrado correctamente.");
    setInteractiveForm({
      contentResourceId: "",
      kind: "EMBEDDED_WIDGET",
      titleEs: "",
      titleEn: "",
      embedUri: "",
      configJsonText: "{\"displayMode\":\"inline\"}",
    });
    await loadContent();
  }

  return (
    <PortalShell
      eyebrow="Administrador"
      title="Contenidos, glosario y apoyos"
      description="Administra los recursos visibles del portal, el glosario tecnico y los apoyos de vocalizacion o interaccion."
    >
      <RoleGuard roles={["ADMIN"]}>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Recursos publicados"
            value={resources.length}
            helper="Materiales disponibles para los cursos visibles."
          />
          <StatCard
            label="Terminos tecnicos"
            value={glossary.length}
            helper="Conceptos gestionados dentro del glosario institucional."
          />
          <StatCard
            label="Pistas de voz"
            value={voiceovers.length}
            helper="Apoyos de vocalizacion registrados."
          />
          <StatCard
            label="Apoyos interactivos"
            value={interactiveConfigs.length}
            helper="Configuraciones activas para aprendizaje interactivo."
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

        {formMessage ? (
          <section className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
            {formMessage}
          </section>
        ) : null}

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <DataPanel title="Nuevo recurso" description="Registra contenido bilingue y vinculalo a una leccion existente.">
            <form className="grid gap-4" onSubmit={createResource}>
              <select
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                value={resourceForm.lessonId}
                onChange={(event) =>
                  setResourceForm((prev) => ({ ...prev, lessonId: event.target.value }))
                }
                required
              >
                <option value="">Selecciona una leccion</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.localizedTitle ?? lesson.titleEs}
                  </option>
                ))}
              </select>
              <select
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                value={resourceForm.type}
                onChange={(event) =>
                  setResourceForm((prev) => ({ ...prev, type: event.target.value }))
                }
              >
                {Object.entries(resourceTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Titulo en espanol"
                value={resourceForm.titleEs}
                onChange={(event) =>
                  setResourceForm((prev) => ({ ...prev, titleEs: event.target.value }))
                }
                required
              />
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Titulo en ingles"
                value={resourceForm.titleEn}
                onChange={(event) =>
                  setResourceForm((prev) => ({ ...prev, titleEn: event.target.value }))
                }
              />
              <textarea
                className="min-h-24 rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Contenido en espanol"
                value={resourceForm.bodyEs}
                onChange={(event) =>
                  setResourceForm((prev) => ({ ...prev, bodyEs: event.target.value }))
                }
              />
              <textarea
                className="min-h-24 rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Contenido en ingles"
                value={resourceForm.bodyEn}
                onChange={(event) =>
                  setResourceForm((prev) => ({ ...prev, bodyEn: event.target.value }))
                }
              />
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="URI o enlace del recurso"
                value={resourceForm.uri}
                onChange={(event) =>
                  setResourceForm((prev) => ({ ...prev, uri: event.target.value }))
                }
              />
              <button className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white" type="submit">
                Guardar recurso
              </button>
            </form>
          </DataPanel>

          <DataPanel title="Nuevo termino de glosario" description="Registra terminos tecnicos bilingues para consulta dentro del portal.">
            <form className="grid gap-4" onSubmit={createGlossary}>
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Identificador interno"
                value={glossaryForm.slug}
                onChange={(event) =>
                  setGlossaryForm((prev) => ({ ...prev, slug: event.target.value }))
                }
                required
              />
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Termino en espanol"
                value={glossaryForm.termEs}
                onChange={(event) =>
                  setGlossaryForm((prev) => ({ ...prev, termEs: event.target.value }))
                }
                required
              />
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Termino en ingles"
                value={glossaryForm.termEn}
                onChange={(event) =>
                  setGlossaryForm((prev) => ({ ...prev, termEn: event.target.value }))
                }
              />
              <textarea
                className="min-h-24 rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Definicion en espanol"
                value={glossaryForm.definitionEs}
                onChange={(event) =>
                  setGlossaryForm((prev) => ({
                    ...prev,
                    definitionEs: event.target.value,
                  }))
                }
                required
              />
              <textarea
                className="min-h-24 rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Definicion en ingles"
                value={glossaryForm.definitionEn}
                onChange={(event) =>
                  setGlossaryForm((prev) => ({
                    ...prev,
                    definitionEn: event.target.value,
                  }))
                }
              />
              <button className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white" type="submit">
                Guardar termino
              </button>
            </form>
          </DataPanel>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <DataPanel title="Nueva pista de voz" description="Registra apoyos de vocalizacion vinculados a un recurso ya publicado.">
            <form className="grid gap-4" onSubmit={createVoiceover}>
              <select
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                value={voiceoverForm.contentResourceId}
                onChange={(event) =>
                  setVoiceoverForm((prev) => ({
                    ...prev,
                    contentResourceId: event.target.value,
                  }))
                }
                required
              >
                <option value="">Selecciona un recurso</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.localizedTitle ?? resource.titleEs}
                  </option>
                ))}
              </select>
              <div className="grid gap-4 md:grid-cols-3">
                <select
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  value={voiceoverForm.language}
                  onChange={(event) =>
                    setVoiceoverForm((prev) => ({ ...prev, language: event.target.value }))
                  }
                >
                  <option value="es">ES</option>
                  <option value="en">EN</option>
                </select>
                <select
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  value={voiceoverForm.sourceKind}
                  onChange={(event) =>
                    setVoiceoverForm((prev) => ({
                      ...prev,
                      sourceKind: event.target.value,
                    }))
                  }
                >
                    <option value="MANUAL_RECORDING">Narracion manual</option>
                    <option value="TTS_REFERENCE">Referencia TTS</option>
                    <option value="UPLOADED">Audio cargado</option>
                </select>
                <select
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  value={voiceoverForm.status}
                  onChange={(event) =>
                    setVoiceoverForm((prev) => ({ ...prev, status: event.target.value }))
                  }
                >
                  <option value="DRAFT">Borrador</option>
                  <option value="READY">Disponible</option>
                  <option value="FAILED">Pendiente de ajuste</option>
                  <option value="DISABLED">Deshabilitado</option>
                </select>
              </div>
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Titulo de la pista"
                value={voiceoverForm.title}
                onChange={(event) =>
                  setVoiceoverForm((prev) => ({ ...prev, title: event.target.value }))
                }
              />
              <textarea
                className="min-h-24 rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Transcripcion en espanol"
                value={voiceoverForm.transcriptEs}
                onChange={(event) =>
                  setVoiceoverForm((prev) => ({
                    ...prev,
                    transcriptEs: event.target.value,
                  }))
                }
              />
              <textarea
                className="min-h-24 rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Transcripcion en ingles"
                value={voiceoverForm.transcriptEn}
                onChange={(event) =>
                  setVoiceoverForm((prev) => ({
                    ...prev,
                    transcriptEn: event.target.value,
                  }))
                }
              />
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="URI del audio"
                value={voiceoverForm.audioUri}
                onChange={(event) =>
                  setVoiceoverForm((prev) => ({ ...prev, audioUri: event.target.value }))
                }
              />
              <button className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white" type="submit">
                Guardar pista de voz
              </button>
            </form>
          </DataPanel>

          <DataPanel title="Nuevo apoyo interactivo" description="Registra configuraciones activas de interaccion ligadas a un recurso existente.">
            <form className="grid gap-4" onSubmit={createInteractive}>
              <select
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                value={interactiveForm.contentResourceId}
                onChange={(event) =>
                  setInteractiveForm((prev) => ({
                    ...prev,
                    contentResourceId: event.target.value,
                  }))
                }
                required
              >
                <option value="">Selecciona un recurso</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.localizedTitle ?? resource.titleEs}
                  </option>
                ))}
              </select>
              <select
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                value={interactiveForm.kind}
                onChange={(event) =>
                  setInteractiveForm((prev) => ({ ...prev, kind: event.target.value }))
                }
              >
                {Object.entries(interactiveKindLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Titulo en espanol"
                value={interactiveForm.titleEs}
                onChange={(event) =>
                  setInteractiveForm((prev) => ({ ...prev, titleEs: event.target.value }))
                }
                required
              />
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Titulo en ingles"
                value={interactiveForm.titleEn}
                onChange={(event) =>
                  setInteractiveForm((prev) => ({ ...prev, titleEn: event.target.value }))
                }
              />
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="URI embebida"
                value={interactiveForm.embedUri}
                onChange={(event) =>
                  setInteractiveForm((prev) => ({ ...prev, embedUri: event.target.value }))
                }
              />
              <textarea
                className="min-h-28 rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm"
                placeholder='{"displayMode":"inline"}'
                value={interactiveForm.configJsonText}
                onChange={(event) =>
                  setInteractiveForm((prev) => ({
                    ...prev,
                    configJsonText: event.target.value,
                  }))
                }
              />
              <button className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white" type="submit">
                Guardar apoyo interactivo
              </button>
            </form>
          </DataPanel>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <DataPanel title="Recursos publicados" description="Revisa el material disponible y confirma su vinculacion con vocalizacion o interaccion.">
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

          <DataPanel title="Glosario tecnico" description="Consulta el glosario y verifica cuantas relaciones de contenido tiene cada termino.">
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

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <DataPanel title="Pistas de voz registradas" description="Resumen de los apoyos de vocalizacion disponibles sobre recursos del portal.">
            <div className="grid gap-4">
              {voiceovers.length ? (
                voiceovers.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-3xl border border-cloud bg-white px-5 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-slate-950">
                          {item.title ??
                            item.contentResource?.localizedTitle ??
                            "Pista de voz"}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Idioma: {item.language.toUpperCase()}
                        </p>
                      </div>
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                        {voiceStatusLabels[item.status] ?? item.status}
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
                  No hay pistas de voz registradas.
                </div>
              )}
            </div>
          </DataPanel>

          <DataPanel title="Apoyos interactivos activos" description="Resumen de configuraciones registradas para recursos interactivos dentro del portal.">
            <div className="grid gap-4">
              {interactiveConfigs.length ? (
                interactiveConfigs.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-3xl border border-cloud bg-white px-5 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-slate-950">
                          {item.localizedTitle ?? "Apoyo interactivo"}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.contentResource?.localizedTitle ??
                            "Vinculado a un recurso del portal"}
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
                    <p className="mt-3 text-sm text-slate-700">
                      {interactiveKindLabels[item.kind] ?? item.kind}
                    </p>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
                  No hay apoyos interactivos registrados.
                </div>
              )}
            </div>
          </DataPanel>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
