"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminGuard } from "../../../components/admin-guard";
import { AdminShell } from "../../../components/admin-shell";
import { DataPanel } from "../../../components/data-panel";
import { SimpleTable } from "../../../components/simple-table";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest } from "../../../lib/client-api";

type LessonOption = { id: string; titleEs: string };
type PracticeRow = { titleEs: string; requiresSimulator: boolean };
type ContentResourceRow = { titleEs: string; type: string };
type GlossaryRow = { termEs: string; definitionEs: string };

export default function ContentAdminPage() {
  const { accessToken } = useAuth();
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [practices, setPractices] = useState<PracticeRow[]>([]);
  const [resources, setResources] = useState<ContentResourceRow[]>([]);
  const [glossary, setGlossary] = useState<GlossaryRow[]>([]);
  const [practiceForm, setPracticeForm] = useState({
    lessonId: "",
    titleEs: "",
    instructions: "",
    requiresSimulator: false,
  });
  const [resourceForm, setResourceForm] = useState({
    lessonId: "",
    type: "RICH_TEXT",
    titleEs: "",
    bodyEs: "",
    uri: "",
  });
  const [glossaryForm, setGlossaryForm] = useState({
    slug: "",
    termEs: "",
    definitionEs: "",
  });

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    Promise.all([
      apiRequest<LessonOption[]>("/lessons", accessToken),
      apiRequest<PracticeRow[]>("/practices", accessToken),
      apiRequest<ContentResourceRow[]>("/content-resources", accessToken),
      apiRequest<GlossaryRow[]>("/glossary", accessToken),
    ])
      .then(([lessonsData, practicesData, resourcesData, glossaryData]) => {
        setLessons(lessonsData);
        setPractices(practicesData);
        setResources(resourcesData);
        setGlossary(glossaryData);
      })
      .catch(() => undefined);
  }, [accessToken]);

  async function createPractice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;
    await apiRequest("/practices", accessToken, {
      method: "POST",
      body: JSON.stringify(practiceForm),
    });
    setPractices(await apiRequest<PracticeRow[]>("/practices", accessToken));
  }

  async function createResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;
    await apiRequest("/content-resources", accessToken, {
      method: "POST",
      body: JSON.stringify(resourceForm),
    });
    setResources(await apiRequest<ContentResourceRow[]>("/content-resources", accessToken));
  }

  async function createGlossary(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;
    await apiRequest("/glossary", accessToken, {
      method: "POST",
      body: JSON.stringify(glossaryForm),
    });
    setGlossary(await apiRequest<GlossaryRow[]>("/glossary", accessToken));
  }

  return (
    <AdminShell
      description="Vista operativa para construir contenido asociado a lecciones, incluyendo practicas y glosario tecnico."
      eyebrow="Contenido"
      title="Contenido y recursos"
    >
      <AdminGuard>
        <section className="grid gap-6">
          <div className="grid gap-6 xl:grid-cols-3">
            <DataPanel title="Crear practica">
              <form className="grid gap-4" onSubmit={createPractice}>
                <select
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  onChange={(event) =>
                    setPracticeForm((prev) => ({ ...prev, lessonId: event.target.value }))
                  }
                  value={practiceForm.lessonId}
                >
                  <option value="">Selecciona leccion</option>
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.titleEs}
                    </option>
                  ))}
                </select>
                <input
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  onChange={(event) =>
                    setPracticeForm((prev) => ({ ...prev, titleEs: event.target.value }))
                  }
                  placeholder="Titulo de practica"
                  value={practiceForm.titleEs}
                />
                <textarea
                  className="min-h-28 rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  onChange={(event) =>
                    setPracticeForm((prev) => ({ ...prev, instructions: event.target.value }))
                  }
                  placeholder="Instrucciones"
                  value={practiceForm.instructions}
                />
                <label className="flex items-center gap-3 text-sm text-slate-700">
                  <input
                    checked={practiceForm.requiresSimulator}
                    onChange={(event) =>
                      setPracticeForm((prev) => ({
                        ...prev,
                        requiresSimulator: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  Requiere simulador
                </label>
                <button
                  className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white"
                  type="submit"
                >
                  Crear practica
                </button>
              </form>
            </DataPanel>

            <DataPanel title="Crear recurso">
              <form className="grid gap-4" onSubmit={createResource}>
                <select
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  onChange={(event) =>
                    setResourceForm((prev) => ({ ...prev, lessonId: event.target.value }))
                  }
                  value={resourceForm.lessonId}
                >
                  <option value="">Selecciona leccion</option>
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.titleEs}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  onChange={(event) =>
                    setResourceForm((prev) => ({ ...prev, type: event.target.value }))
                  }
                  value={resourceForm.type}
                >
                  <option value="RICH_TEXT">RICH_TEXT</option>
                  <option value="PDF">PDF</option>
                  <option value="VIDEO">VIDEO</option>
                  <option value="IMAGE">IMAGE</option>
                  <option value="EBOOK">EBOOK</option>
                </select>
                <input
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  onChange={(event) =>
                    setResourceForm((prev) => ({ ...prev, titleEs: event.target.value }))
                  }
                  placeholder="Titulo del recurso"
                  value={resourceForm.titleEs}
                />
                <input
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  onChange={(event) =>
                    setResourceForm((prev) => ({ ...prev, uri: event.target.value }))
                  }
                  placeholder="URL o ruta"
                  value={resourceForm.uri}
                />
                <textarea
                  className="min-h-28 rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  onChange={(event) =>
                    setResourceForm((prev) => ({ ...prev, bodyEs: event.target.value }))
                  }
                  placeholder="Contenido o descripcion"
                  value={resourceForm.bodyEs}
                />
                <button
                  className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white"
                  type="submit"
                >
                  Crear recurso
                </button>
              </form>
            </DataPanel>

            <DataPanel title="Crear termino de glosario">
              <form className="grid gap-4" onSubmit={createGlossary}>
                <input
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  onChange={(event) =>
                    setGlossaryForm((prev) => ({ ...prev, slug: event.target.value }))
                  }
                  placeholder="slug"
                  value={glossaryForm.slug}
                />
                <input
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  onChange={(event) =>
                    setGlossaryForm((prev) => ({ ...prev, termEs: event.target.value }))
                  }
                  placeholder="Termino"
                  value={glossaryForm.termEs}
                />
                <textarea
                  className="min-h-28 rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  onChange={(event) =>
                    setGlossaryForm((prev) => ({ ...prev, definitionEs: event.target.value }))
                  }
                  placeholder="Definicion"
                  value={glossaryForm.definitionEs}
                />
                <button
                  className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white"
                  type="submit"
                >
                  Crear termino
                </button>
              </form>
            </DataPanel>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <DataPanel title="Practicas">
              <SimpleTable
                columns={[
                  { key: "titleEs", header: "Practica", render: (item) => item.titleEs },
                  {
                    key: "requiresSimulator",
                    header: "Simulador",
                    render: (item) => (item.requiresSimulator ? "Si" : "No"),
                  },
                ]}
                emptyLabel="No hay practicas registradas."
                rows={practices}
              />
            </DataPanel>

            <DataPanel title="Recursos">
              <SimpleTable
                columns={[
                  { key: "titleEs", header: "Recurso", render: (item) => item.titleEs },
                  { key: "type", header: "Tipo", render: (item) => item.type },
                ]}
                emptyLabel="No hay recursos registrados."
                rows={resources}
              />
            </DataPanel>

            <DataPanel title="Glosario">
              <SimpleTable
                columns={[
                  { key: "termEs", header: "Termino", render: (item) => item.termEs },
                  {
                    key: "definitionEs",
                    header: "Definicion",
                    render: (item) => item.definitionEs,
                  },
                ]}
                emptyLabel="No hay terminos registrados."
                rows={glossary}
              />
            </DataPanel>
          </div>
        </section>
      </AdminGuard>
    </AdminShell>
  );
}
