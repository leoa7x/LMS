"use client";

import { useEffect, useState } from "react";
import { DataPanel } from "../../../components/data-panel";
import { PortalShell } from "../../../components/portal-shell";
import { RoleGuard } from "../../../components/role-guard";
import { SimpleTable } from "../../../components/simple-table";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest } from "../../../lib/client-api";

type CourseRow = {
  titleEs: string;
  localizedTitle?: string;
  courseKind?: string;
  technicalArea?: { nameEs?: string | null } | null;
  isPublished?: boolean;
};

type LearningPath = {
  titleEs: string;
  levelCode?: string | null;
  courses?: Array<{ course?: { titleEs?: string | null } | null; sortOrder: number }>;
};

export default function TeacherCoursesPage() {
  const { accessToken } = useAuth();
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([
      apiRequest<CourseRow[]>("/courses", accessToken),
      apiRequest<LearningPath[]>("/learning-paths", accessToken),
    ])
      .then(([coursesData, pathsData]) => {
        setCourses(coursesData);
        setPaths(pathsData);
      })
      .catch(() => undefined);
  }, [accessToken]);

  return (
    <PortalShell
      eyebrow="Docente"
      title="Cursos y rutas visibles"
      description="Lectura academica filtrada por alcance docente sobre cursos y rutas del LMS."
    >
      <RoleGuard roles={["TEACHER", "ADMIN"]}>
        <section className="grid gap-6 xl:grid-cols-2">
          <DataPanel title="Cursos">
            <SimpleTable
              columns={[
                { key: "title", header: "Curso", render: (item) => item.localizedTitle ?? item.titleEs },
                { key: "area", header: "Area", render: (item) => item.technicalArea?.nameEs ?? "-" },
                { key: "kind", header: "Tipo", render: (item) => item.courseKind ?? "-" },
                { key: "published", header: "Publicacion", render: (item) => (item.isPublished ? "Publicado" : "Borrador") },
              ]}
              rows={courses}
              emptyLabel="No hay cursos visibles."
            />
          </DataPanel>
          <DataPanel title="Rutas">
            <SimpleTable
              columns={[
                { key: "titleEs", header: "Ruta", render: (item) => item.titleEs },
                { key: "level", header: "Nivel", render: (item) => item.levelCode ?? "-" },
                { key: "courses", header: "Cursos", render: (item) => item.courses?.length ?? 0 },
              ]}
              rows={paths}
              emptyLabel="No hay rutas visibles."
            />
          </DataPanel>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
