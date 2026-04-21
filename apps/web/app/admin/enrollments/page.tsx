"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminGuard } from "../../../components/admin-guard";
import { AdminShell } from "../../../components/admin-shell";
import { DataPanel } from "../../../components/data-panel";
import { SimpleTable } from "../../../components/simple-table";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest } from "../../../lib/client-api";

type EnrollmentRow = {
  id: string;
  student?: { firstName?: string; lastName?: string; email?: string } | null;
  course?: { titleEs?: string } | null;
  institution?: { name?: string } | null;
  status: string;
};

type EntityOption = { id: string; email?: string; firstName?: string; lastName?: string; titleEs?: string; name?: string };

export default function EnrollmentsAdminPage() {
  const { accessToken } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [students, setStudents] = useState<EntityOption[]>([]);
  const [courses, setCourses] = useState<EntityOption[]>([]);
  const [institutions, setInstitutions] = useState<EntityOption[]>([]);
  const [form, setForm] = useState({
    studentId: "",
    courseId: "",
    institutionId: "",
  });

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    Promise.all([
      apiRequest<EnrollmentRow[]>("/enrollments", accessToken),
      apiRequest<EntityOption[]>("/users", accessToken),
      apiRequest<EntityOption[]>("/courses", accessToken),
      apiRequest<EntityOption[]>("/institutions", accessToken),
    ])
      .then(([enrollmentsData, usersData, coursesData, institutionsData]) => {
        setEnrollments(enrollmentsData);
        setStudents(usersData);
        setCourses(coursesData);
        setInstitutions(institutionsData);
      })
      .catch(() => undefined);
  }, [accessToken]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessToken) {
      return;
    }

    await apiRequest("/enrollments", accessToken, {
      method: "POST",
      body: JSON.stringify(form),
    });

    const refreshed = await apiRequest<EnrollmentRow[]>("/enrollments", accessToken);
    setEnrollments(refreshed);
  }

  return (
    <AdminShell
      description="Asigna estudiantes a cursos y consulta el estado de sus inscripciones."
      eyebrow="Inscripciones"
      title="Asignacion academica"
    >
      <AdminGuard>
        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <DataPanel title="Nueva inscripcion">
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <select
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, studentId: event.target.value }))
                }
                value={form.studentId}
              >
                <option value="">Selecciona estudiante</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.email ?? `${student.firstName} ${student.lastName}`}
                  </option>
                ))}
              </select>
              <select
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, courseId: event.target.value }))
                }
                value={form.courseId}
              >
                <option value="">Selecciona curso</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.titleEs}
                  </option>
                ))}
              </select>
              <select
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, institutionId: event.target.value }))
                }
                value={form.institutionId}
              >
                <option value="">Selecciona institucion</option>
                {institutions.map((institution) => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name}
                  </option>
                ))}
              </select>
              <button
                className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white"
                type="submit"
              >
                Crear matricula
              </button>
            </form>
          </DataPanel>

          <DataPanel title="Inscripciones registradas">
            <SimpleTable
              columns={[
                {
                  key: "student",
                  header: "Estudiante",
                  render: (item) =>
                    `${item.student?.firstName ?? ""} ${item.student?.lastName ?? ""}`.trim() ||
                    item.student?.email ||
                    "-",
                },
                {
                  key: "course",
                  header: "Curso",
                  render: (item) => item.course?.titleEs ?? "-",
                },
                {
                  key: "institution",
                  header: "Institucion",
                  render: (item) => item.institution?.name ?? "-",
                },
                {
                  key: "status",
                  header: "Estado",
                  render: (item) => item.status,
                },
              ]}
              emptyLabel="No hay inscripciones registradas."
              rows={enrollments}
            />
          </DataPanel>
        </section>
      </AdminGuard>
    </AdminShell>
  );
}
