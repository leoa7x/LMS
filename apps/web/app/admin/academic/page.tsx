import { AdminShell } from "../../../components/admin-shell";
import { SectionCard } from "../../../components/section-card";
import { SimpleTable } from "../../../components/simple-table";
import { fetchJson } from "../../../lib/api";

type CourseRow = {
  titleEs: string;
  technicalArea?: { nameEs: string } | null;
  modules?: Array<{ id: string }>;
};

export default async function AcademicAdminPage() {
  const courses = (await fetchJson<CourseRow[]>("/courses")) ?? [];

  return (
    <AdminShell
      eyebrow="Gestion academica"
      title="Catalogo formativo"
      description="Vista base para controlar areas tecnicas, cursos, modulos y lecciones sobre la API del LMS."
    >
      <SectionCard
        title="Cursos tecnicos"
        description="La tabla usa el catalogo ya expuesto por backend como base del panel administrativo."
      >
        <SimpleTable
          columns={[
            {
              key: "titleEs",
              header: "Curso",
              render: (item) => item.titleEs,
            },
            {
              key: "area",
              header: "Area tecnica",
              render: (item) => item.technicalArea?.nameEs ?? "-",
            },
            {
              key: "modules",
              header: "Modulos",
              render: (item) => item.modules?.length ?? 0,
            },
          ]}
          rows={courses}
          emptyLabel="Todavia no hay cursos cargados o la API no esta respondiendo."
        />
      </SectionCard>
    </AdminShell>
  );
}
