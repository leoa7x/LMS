"use client";

import { FormEvent, useEffect, useState } from "react";
import { DataPanel } from "../../../components/data-panel";
import { MetricCard } from "../../../components/metric-card";
import { PortalShell } from "../../../components/portal-shell";
import { RoleGuard } from "../../../components/role-guard";
import { SimpleTable } from "../../../components/simple-table";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest } from "../../../lib/client-api";

type InstitutionOption = { id: string; name: string };
type CampusOption = { id: string; name: string; institutionId: string };
type LaboratoryOption = { id: string; name: string; campusId: string };
type UserRow = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  preferredLang: string;
  status?: string;
  isActive?: boolean;
  roles?: Array<{ role?: { name?: string } | null }>;
  institutions?: Array<{
    institution?: { name?: string } | null;
    campus?: { name?: string } | null;
    laboratory?: { name?: string } | null;
    membershipStatus?: string;
  }>;
};

const initialForm = {
  email: "",
  firstName: "",
  lastName: "",
  password: "",
  preferredLang: "es",
  role: "STUDENT",
  institutionId: "",
  campusId: "",
  laboratoryId: "",
  currentLevel: "Nivel 1",
};

export default function UsersAdminPage() {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionOption[]>([]);
  const [campuses, setCampuses] = useState<CampusOption[]>([]);
  const [laboratories, setLaboratories] = useState<LaboratoryOption[]>([]);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    Promise.all([
      apiRequest<UserRow[]>("/users", accessToken),
      apiRequest<InstitutionOption[]>("/institutions", accessToken),
      apiRequest<CampusOption[]>("/institutions/campuses/all", accessToken),
      apiRequest<LaboratoryOption[]>("/institutions/laboratories/all", accessToken),
    ])
      .then(([usersData, institutionsData, campusesData, laboratoriesData]) => {
        setUsers(usersData);
        setInstitutions(institutionsData);
        setCampuses(campusesData);
        setLaboratories(laboratoriesData);

        if (institutionsData[0]) {
          setForm((prev) => ({
            ...prev,
            institutionId: prev.institutionId || institutionsData[0].id,
          }));
        }
      })
      .catch(() => undefined);
  }, [accessToken]);

  const filteredCampuses = campuses.filter(
    (campus) => campus.institutionId === form.institutionId,
  );
  const filteredLaboratories = laboratories.filter(
    (laboratory) =>
      !form.campusId || laboratory.campusId === form.campusId,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessToken || !form.institutionId) {
      return;
    }

    await apiRequest("/users", accessToken, {
      method: "POST",
      body: JSON.stringify({
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        password: form.password,
        preferredLang: form.preferredLang,
        membership: {
          institutionId: form.institutionId,
          campusId: form.campusId || undefined,
          laboratoryId: form.laboratoryId || undefined,
        },
        roleAssignments: [
          {
            role: form.role,
            scopeType: "INSTITUTION",
          },
        ],
        studentProfile:
          form.role === "STUDENT"
            ? {
                currentLevel: form.currentLevel,
              }
            : undefined,
        teacherScopes:
          form.role === "TEACHER"
            ? [
                {
                  scopeType: "INSTITUTION",
                  institutionId: form.institutionId,
                },
              ]
            : undefined,
      }),
    });

    setUsers(await apiRequest<UserRow[]>("/users", accessToken));
    setForm((prev) => ({
      ...initialForm,
      institutionId: prev.institutionId,
    }));
  }

  return (
    <PortalShell
      eyebrow="Usuarios"
      title="Usuarios y acceso institucional"
      description="Registra usuarios, define su perfil y asigna su vinculacion institucional."
    >
      <RoleGuard roles={["ADMIN"]}>
        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard
            label="Usuarios visibles"
            value={users.length}
            hint="Cuentas pertenecientes a la institucion activa."
          />
          <MetricCard
            label="Sedes"
            value={filteredCampuses.length}
            hint="Sedes operativas que pueden asignarse a membresias."
          />
          <MetricCard
            label="Laboratorios"
            value={filteredLaboratories.length}
            hint="Laboratorios disponibles para ubicacion del usuario."
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <DataPanel
            title="Crear usuario"
            description="Completa los datos principales para habilitar el acceso del usuario."
          >
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="Correo"
                value={form.email}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, firstName: event.target.value }))
                  }
                  placeholder="Nombre"
                  value={form.firstName}
                />
                <input
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, lastName: event.target.value }))
                  }
                  placeholder="Apellido"
                  value={form.lastName}
                />
              </div>
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, password: event.target.value }))
                }
                placeholder="Clave"
                type="password"
                value={form.password}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <select
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
                  value={form.role}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="TEACHER">TEACHER</option>
                  <option value="STUDENT">STUDENT</option>
                  <option value="SUPPORT">SUPPORT</option>
                </select>
                <select
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, preferredLang: event.target.value }))
                  }
                  value={form.preferredLang}
                >
                  <option value="es">Espanol</option>
                  <option value="en">English</option>
                </select>
              </div>
              <select
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    institutionId: event.target.value,
                    campusId: "",
                    laboratoryId: "",
                  }))
                }
                value={form.institutionId}
              >
                <option value="">Selecciona una institucion</option>
                {institutions.map((institution) => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name}
                  </option>
                ))}
              </select>
              <div className="grid gap-4 md:grid-cols-2">
                <select
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      campusId: event.target.value,
                      laboratoryId: "",
                    }))
                  }
                  value={form.campusId}
                >
                  <option value="">Sin sede asignada</option>
                  {filteredCampuses.map((campus) => (
                    <option key={campus.id} value={campus.id}>
                      {campus.name}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, laboratoryId: event.target.value }))
                  }
                  value={form.laboratoryId}
                >
                  <option value="">Sin laboratorio asignado</option>
                  {filteredLaboratories.map((laboratory) => (
                    <option key={laboratory.id} value={laboratory.id}>
                      {laboratory.name}
                    </option>
                  ))}
                </select>
              </div>

              {form.role === "STUDENT" ? (
                <input
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, currentLevel: event.target.value }))
                  }
                  placeholder="Nivel academico"
                  value={form.currentLevel}
                />
              ) : null}

              <button
                className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white"
                type="submit"
              >
                Crear usuario
              </button>
            </form>
          </DataPanel>

          <DataPanel
            title="Usuarios registrados"
            description="Consulta los usuarios activos y su ubicacion dentro de la institucion."
          >
            <SimpleTable
              columns={[
                {
                  key: "name",
                  header: "Nombre",
                  render: (item) => `${item.firstName} ${item.lastName}`,
                },
                {
                  key: "email",
                  header: "Correo",
                  render: (item) => item.email,
                },
                {
                  key: "roles",
                  header: "Roles",
                  render: (item) =>
                    item.roles?.map((assignment) => assignment.role?.name).filter(Boolean).join(", ") ??
                    "-",
                },
                {
                  key: "lang",
                  header: "Idioma",
                  render: (item) => item.preferredLang,
                },
                {
                  key: "membership",
                  header: "Ubicacion",
                  render: (item) =>
                    item.institutions?.[0]?.laboratory?.name ??
                    item.institutions?.[0]?.campus?.name ??
                    item.institutions?.[0]?.institution?.name ??
                    "-",
                },
                {
                  key: "status",
                  header: "Estado",
                  render: (item) =>
                    item.status ?? (item.isActive ? "ACTIVE" : "INACTIVE"),
                },
              ]}
              emptyLabel="No hay usuarios visibles."
              rows={users}
            />
          </DataPanel>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
