"use client";

import { FormEvent, useEffect, useState } from "react";
import { DataPanel } from "../../../components/data-panel";
import { PortalShell } from "../../../components/portal-shell";
import { RoleGuard } from "../../../components/role-guard";
import { SimpleTable } from "../../../components/simple-table";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest } from "../../../lib/client-api";

type TechnicalArea = { id: string; nameEs: string; nameEn?: string | null };
type Course = {
  id: string;
  titleEs: string;
  titleEn?: string | null;
  courseKind?: string;
  isPublished?: boolean;
  technicalArea?: { nameEs?: string | null } | null;
};
type LearningPath = {
  id: string;
  titleEs: string;
  titleEn?: string | null;
  levelCode?: string | null;
  courses?: Array<{ course?: { titleEs?: string | null } | null; sortOrder: number }>;
};

export default function AcademicAdminPage() {
  const { accessToken } = useAuth();
  const [technicalAreas, setTechnicalAreas] = useState<TechnicalArea[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [areaForm, setAreaForm] = useState({
    slug: "",
    nameEs: "",
    nameEn: "",
    description: "",
  });
  const [courseForm, setCourseForm] = useState({
    technicalAreaId: "",
    slug: "",
    titleEs: "",
    titleEn: "",
    courseKind: "STANDARD",
    isPublished: true,
  });
  const [pathForm, setPathForm] = useState({
    slug: "",
    titleEs: "",
    titleEn: "",
    levelCode: "",
    description: "",
  });
  const [pathCourseForm, setPathCourseForm] = useState({
    learningPathId: "",
    courseId: "",
    sortOrder: 0,
    isRequired: true,
  });

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    Promise.all([
      apiRequest<TechnicalArea[]>("/technical-areas", accessToken),
      apiRequest<Course[]>("/courses", accessToken),
      apiRequest<LearningPath[]>("/learning-paths", accessToken),
    ])
      .then(([areasData, coursesData, learningPathsData]) => {
        setTechnicalAreas(areasData);
        setCourses(coursesData);
        setLearningPaths(learningPathsData);

        if (areasData[0]) {
          setCourseForm((prev) => ({
            ...prev,
            technicalAreaId: prev.technicalAreaId || areasData[0].id,
          }));
        }
      })
      .catch(() => undefined);
  }, [accessToken]);

  async function refresh() {
    if (!accessToken) return;
    setTechnicalAreas(await apiRequest<TechnicalArea[]>("/technical-areas", accessToken));
    setCourses(await apiRequest<Course[]>("/courses", accessToken));
    setLearningPaths(await apiRequest<LearningPath[]>("/learning-paths", accessToken));
  }

  async function createArea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;
    await apiRequest("/technical-areas", accessToken, {
      method: "POST",
      body: JSON.stringify(areaForm),
    });
    setAreaForm({ slug: "", nameEs: "", nameEn: "", description: "" });
    await refresh();
  }

  async function createCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;
    await apiRequest("/courses", accessToken, {
      method: "POST",
      body: JSON.stringify(courseForm),
    });
    setCourseForm((prev) => ({
      technicalAreaId: prev.technicalAreaId,
      slug: "",
      titleEs: "",
      titleEn: "",
      courseKind: "STANDARD",
      isPublished: true,
    }));
    await refresh();
  }

  async function createPath(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;
    await apiRequest("/learning-paths", accessToken, {
      method: "POST",
      body: JSON.stringify(pathForm),
    });
    setPathForm({ slug: "", titleEs: "", titleEn: "", levelCode: "", description: "" });
    await refresh();
  }

  async function addCourseToPath(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;
    await apiRequest("/learning-paths/courses", accessToken, {
      method: "POST",
      body: JSON.stringify(pathCourseForm),
    });
    setPathCourseForm((prev) => ({ ...prev, courseId: "", sortOrder: prev.sortOrder + 1 }));
    await refresh();
  }

  return (
    <PortalShell
      eyebrow="Gestion academica"
      title="Cursos y rutas formativas"
      description="Operacion del catalogo tecnico por areas, cursos publicados y rutas preconfiguradas del LMS."
    >
      <RoleGuard roles={["ADMIN"]}>
        <section className="grid gap-6">
          <div className="grid gap-6 xl:grid-cols-4">
            <DataPanel title="Area tecnica">
              <form className="grid gap-4" onSubmit={createArea}>
                <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="slug" value={areaForm.slug} onChange={(event)=>setAreaForm((prev)=>({...prev,slug:event.target.value}))}/>
                <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Nombre ES" value={areaForm.nameEs} onChange={(event)=>setAreaForm((prev)=>({...prev,nameEs:event.target.value}))}/>
                <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Name EN" value={areaForm.nameEn} onChange={(event)=>setAreaForm((prev)=>({...prev,nameEn:event.target.value}))}/>
                <button className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white" type="submit">Crear area</button>
              </form>
            </DataPanel>

            <DataPanel title="Curso">
              <form className="grid gap-4" onSubmit={createCourse}>
                <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" value={courseForm.technicalAreaId} onChange={(event)=>setCourseForm((prev)=>({...prev,technicalAreaId:event.target.value}))}>
                  <option value="">Selecciona area</option>
                  {technicalAreas.map((area)=>(
                    <option key={area.id} value={area.id}>{area.nameEs}</option>
                  ))}
                </select>
                <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="slug" value={courseForm.slug} onChange={(event)=>setCourseForm((prev)=>({...prev,slug:event.target.value}))}/>
                <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Titulo ES" value={courseForm.titleEs} onChange={(event)=>setCourseForm((prev)=>({...prev,titleEs:event.target.value}))}/>
                <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Title EN" value={courseForm.titleEn} onChange={(event)=>setCourseForm((prev)=>({...prev,titleEn:event.target.value}))}/>
                <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" value={courseForm.courseKind} onChange={(event)=>setCourseForm((prev)=>({...prev,courseKind:event.target.value}))}>
                  <option value="STANDARD">STANDARD</option>
                  <option value="PRECONFIGURED">PRECONFIGURED</option>
                </select>
                <label className="flex items-center gap-3 text-sm text-slate-700">
                  <input checked={courseForm.isPublished} onChange={(event)=>setCourseForm((prev)=>({...prev,isPublished:event.target.checked}))} type="checkbox"/>
                  Publicado
                </label>
                <button className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white" type="submit">Crear curso</button>
              </form>
            </DataPanel>

            <DataPanel title="Ruta formativa">
              <form className="grid gap-4" onSubmit={createPath}>
                <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="slug" value={pathForm.slug} onChange={(event)=>setPathForm((prev)=>({...prev,slug:event.target.value}))}/>
                <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Titulo ES" value={pathForm.titleEs} onChange={(event)=>setPathForm((prev)=>({...prev,titleEs:event.target.value}))}/>
                <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Title EN" value={pathForm.titleEn} onChange={(event)=>setPathForm((prev)=>({...prev,titleEn:event.target.value}))}/>
                <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Codigo de nivel" value={pathForm.levelCode} onChange={(event)=>setPathForm((prev)=>({...prev,levelCode:event.target.value}))}/>
                <button className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white" type="submit">Crear ruta</button>
              </form>
            </DataPanel>

            <DataPanel title="Mapear curso a ruta">
              <form className="grid gap-4" onSubmit={addCourseToPath}>
                <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" value={pathCourseForm.learningPathId} onChange={(event)=>setPathCourseForm((prev)=>({...prev,learningPathId:event.target.value}))}>
                  <option value="">Selecciona ruta</option>
                  {learningPaths.map((path)=>(
                    <option key={path.id} value={path.id}>{path.titleEs}</option>
                  ))}
                </select>
                <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" value={pathCourseForm.courseId} onChange={(event)=>setPathCourseForm((prev)=>({...prev,courseId:event.target.value}))}>
                  <option value="">Selecciona curso</option>
                  {courses.map((course)=>(
                    <option key={course.id} value={course.id}>{course.titleEs}</option>
                  ))}
                </select>
                <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" type="number" placeholder="Orden" value={pathCourseForm.sortOrder} onChange={(event)=>setPathCourseForm((prev)=>({...prev,sortOrder:Number(event.target.value)}))}/>
                <label className="flex items-center gap-3 text-sm text-slate-700">
                  <input checked={pathCourseForm.isRequired} onChange={(event)=>setPathCourseForm((prev)=>({...prev,isRequired:event.target.checked}))} type="checkbox"/>
                  Curso requerido
                </label>
                <button className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white" type="submit">Agregar a ruta</button>
              </form>
            </DataPanel>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <DataPanel title="Cursos tecnicos">
              <SimpleTable
                columns={[
                  { key: "titleEs", header: "Curso", render: (item) => item.titleEs },
                  { key: "area", header: "Area", render: (item) => item.technicalArea?.nameEs ?? "-" },
                  { key: "kind", header: "Tipo", render: (item) => item.courseKind ?? "-" },
                  { key: "published", header: "Publicacion", render: (item) => (item.isPublished ? "Publicado" : "Borrador") },
                ]}
                rows={courses}
                emptyLabel="No hay cursos cargados."
              />
            </DataPanel>

            <DataPanel title="Rutas preconfiguradas">
              <SimpleTable
                columns={[
                  { key: "titleEs", header: "Ruta", render: (item) => item.titleEs },
                  { key: "levelCode", header: "Nivel", render: (item) => item.levelCode ?? "-" },
                  {
                    key: "courses",
                    header: "Cursos",
                    render: (item) =>
                      item.courses?.map((course) => `${course.sortOrder}. ${course.course?.titleEs ?? "-"}`).join(" | ") ?? "-",
                  },
                ]}
                rows={learningPaths}
                emptyLabel="No hay rutas formativas creadas."
              />
            </DataPanel>
          </div>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
