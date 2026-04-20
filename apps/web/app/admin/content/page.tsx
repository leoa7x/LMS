"use client";

import { FormEvent, useEffect, useState } from "react";
import { DataPanel } from "../../../components/data-panel";
import { PortalShell } from "../../../components/portal-shell";
import { RoleGuard } from "../../../components/role-guard";
import { SimpleTable } from "../../../components/simple-table";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest } from "../../../lib/client-api";

type LessonOption = { id: string; titleEs: string; localizedTitle?: string };
type PracticeRow = {
  titleEs: string;
  titleEn?: string | null;
  localizedTitle?: string;
  requiresSimulator: boolean;
};
type ContentResourceRow = {
  titleEs: string;
  type: string;
  localizedTitle?: string;
  locale?: string;
};
type GlossaryRow = {
  termEs: string;
  localizedTerm?: string;
  localizedDefinition?: string;
};

export default function ContentAdminPage() {
  const { accessToken } = useAuth();
  const [lang, setLang] = useState("es");
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [practices, setPractices] = useState<PracticeRow[]>([]);
  const [resources, setResources] = useState<ContentResourceRow[]>([]);
  const [glossary, setGlossary] = useState<GlossaryRow[]>([]);
  const [practiceForm, setPracticeForm] = useState({
    lessonId: "",
    titleEs: "",
    titleEn: "",
    instructions: "",
    requiresSimulator: false,
  });
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

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    Promise.all([
      apiRequest<LessonOption[]>("/lessons", accessToken),
      apiRequest<PracticeRow[]>(`/practices?lang=${lang}`, accessToken),
      apiRequest<ContentResourceRow[]>(`/content-resources?lang=${lang}`, accessToken),
      apiRequest<GlossaryRow[]>(`/glossary?lang=${lang}`, accessToken),
    ])
      .then(([lessonsData, practicesData, resourcesData, glossaryData]) => {
        setLessons(lessonsData);
        setPractices(practicesData);
        setResources(resourcesData);
        setGlossary(glossaryData);
      })
      .catch(() => undefined);
  }, [accessToken, lang]);

  async function createPractice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;
    await apiRequest("/practices", accessToken, {
      method: "POST",
      body: JSON.stringify(practiceForm),
    });
    setPractices(await apiRequest<PracticeRow[]>(`/practices?lang=${lang}`, accessToken));
  }

  async function createResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;
    await apiRequest("/content-resources", accessToken, {
      method: "POST",
      body: JSON.stringify(resourceForm),
    });
    setResources(await apiRequest<ContentResourceRow[]>(`/content-resources?lang=${lang}`, accessToken));
  }

  async function createGlossary(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;
    await apiRequest("/glossary", accessToken, {
      method: "POST",
      body: JSON.stringify(glossaryForm),
    });
    setGlossary(await apiRequest<GlossaryRow[]>(`/glossary?lang=${lang}`, accessToken));
  }

  return (
    <PortalShell
      description="Gestion de recursos, practicas y glosario tecnico con bilinguismo visible desde la misma vista operativa."
      eyebrow="Contenidos"
      title="Contenido tecnico y glosario"
    >
      <RoleGuard roles={["ADMIN", "TEACHER"]}>
        <section className="mb-6 flex items-center justify-end">
          <select
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm"
            onChange={(event) => setLang(event.target.value)}
            value={lang}
          >
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
        </section>

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
                      {lesson.localizedTitle ?? lesson.titleEs}
                    </option>
                  ))}
                </select>
                <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Titulo ES" value={practiceForm.titleEs} onChange={(event)=>setPracticeForm((prev)=>({...prev,titleEs:event.target.value}))}/>
                <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Title EN" value={practiceForm.titleEn} onChange={(event)=>setPracticeForm((prev)=>({...prev,titleEn:event.target.value}))}/>
                <textarea className="min-h-28 rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Instrucciones" value={practiceForm.instructions} onChange={(event)=>setPracticeForm((prev)=>({...prev,instructions:event.target.value}))}/>
                <label className="flex items-center gap-3 text-sm text-slate-700">
                  <input checked={practiceForm.requiresSimulator} onChange={(event)=>setPracticeForm((prev)=>({...prev,requiresSimulator:event.target.checked}))} type="checkbox"/>
                  Requiere simulador
                </label>
                <button className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white" type="submit">Crear practica</button>
              </form>
            </DataPanel>

            <DataPanel title="Crear recurso">
              <form className="grid gap-4" onSubmit={createResource}>
                <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" onChange={(event)=>setResourceForm((prev)=>({...prev,lessonId:event.target.value}))} value={resourceForm.lessonId}>
                  <option value="">Selecciona leccion</option>
                  {lessons.map((lesson)=>(
                    <option key={lesson.id} value={lesson.id}>{lesson.localizedTitle ?? lesson.titleEs}</option>
                  ))}
                </select>
                <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" onChange={(event)=>setResourceForm((prev)=>({...prev,type:event.target.value}))} value={resourceForm.type}>
                  <option value="RICH_TEXT">RICH_TEXT</option>
                  <option value="PDF">PDF</option>
                  <option value="VIDEO">VIDEO</option>
                  <option value="IMAGE">IMAGE</option>
                  <option value="EBOOK">EBOOK</option>
                </select>
                <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Titulo ES" value={resourceForm.titleEs} onChange={(event)=>setResourceForm((prev)=>({...prev,titleEs:event.target.value}))}/>
                <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Title EN" value={resourceForm.titleEn} onChange={(event)=>setResourceForm((prev)=>({...prev,titleEn:event.target.value}))}/>
                <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="URL o ruta" value={resourceForm.uri} onChange={(event)=>setResourceForm((prev)=>({...prev,uri:event.target.value}))}/>
                <textarea className="min-h-24 rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Contenido ES" value={resourceForm.bodyEs} onChange={(event)=>setResourceForm((prev)=>({...prev,bodyEs:event.target.value}))}/>
                <textarea className="min-h-24 rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Content EN" value={resourceForm.bodyEn} onChange={(event)=>setResourceForm((prev)=>({...prev,bodyEn:event.target.value}))}/>
                <button className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white" type="submit">Crear recurso</button>
              </form>
            </DataPanel>

            <DataPanel title="Crear termino de glosario">
              <form className="grid gap-4" onSubmit={createGlossary}>
                <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="slug" value={glossaryForm.slug} onChange={(event)=>setGlossaryForm((prev)=>({...prev,slug:event.target.value}))}/>
                <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Termino ES" value={glossaryForm.termEs} onChange={(event)=>setGlossaryForm((prev)=>({...prev,termEs:event.target.value}))}/>
                <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Term EN" value={glossaryForm.termEn} onChange={(event)=>setGlossaryForm((prev)=>({...prev,termEn:event.target.value}))}/>
                <textarea className="min-h-24 rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Definicion ES" value={glossaryForm.definitionEs} onChange={(event)=>setGlossaryForm((prev)=>({...prev,definitionEs:event.target.value}))}/>
                <textarea className="min-h-24 rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Definition EN" value={glossaryForm.definitionEn} onChange={(event)=>setGlossaryForm((prev)=>({...prev,definitionEn:event.target.value}))}/>
                <button className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white" type="submit">Crear termino</button>
              </form>
            </DataPanel>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <DataPanel title="Practicas">
              <SimpleTable
                columns={[
                  { key: "title", header: "Practica", render: (item) => item.localizedTitle ?? item.titleEs },
                  { key: "sim", header: "Simulador", render: (item) => (item.requiresSimulator ? "Si" : "No") },
                ]}
                rows={practices}
                emptyLabel="No hay practicas visibles."
              />
            </DataPanel>
            <DataPanel title="Recursos">
              <SimpleTable
                columns={[
                  { key: "title", header: "Recurso", render: (item) => item.localizedTitle ?? item.titleEs },
                  { key: "type", header: "Tipo", render: (item) => item.type },
                ]}
                rows={resources}
                emptyLabel="No hay recursos visibles."
              />
            </DataPanel>
            <DataPanel title="Glosario">
              <SimpleTable
                columns={[
                  { key: "term", header: "Termino", render: (item) => item.localizedTerm ?? item.termEs },
                  { key: "definition", header: "Definicion", render: (item) => item.localizedDefinition ?? "-" },
                ]}
                rows={glossary}
                emptyLabel="No hay terminos visibles."
              />
            </DataPanel>
          </div>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
