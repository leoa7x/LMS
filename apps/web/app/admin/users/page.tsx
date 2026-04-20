"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminGuard } from "../../../components/admin-guard";
import { AdminShell } from "../../../components/admin-shell";
import { DataPanel } from "../../../components/data-panel";
import { SimpleTable } from "../../../components/simple-table";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest } from "../../../lib/client-api";

type UserRow = {
  email: string;
  firstName: string;
  lastName: string;
  preferredLang: string;
  isActive: boolean;
};

type RoleRow = { id: string; name: string };
type InstitutionRow = { id: string; name: string };

export default function UsersAdminPage() {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionRow[]>([]);
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    preferredLang: "es",
    role: "STUDENT",
    institutionId: "",
  });

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    Promise.all([
      apiRequest<UserRow[]>("/users", accessToken),
      apiRequest<RoleRow[]>("/roles", accessToken),
      apiRequest<InstitutionRow[]>("/institutions", accessToken),
    ])
      .then(([usersData, rolesData, institutionsData]) => {
        setUsers(usersData);
        setRoles(rolesData);
        setInstitutions(institutionsData);
      })
      .catch(() => undefined);
  }, [accessToken]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessToken) {
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
        roles: [form.role],
        institutionId: form.institutionId || undefined,
      }),
    });

    const refreshedUsers = await apiRequest<UserRow[]>("/users", accessToken);
    setUsers(refreshedUsers);
    setForm({
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      preferredLang: "es",
      role: "STUDENT",
      institutionId: "",
    });
  }

  return (
    <AdminShell
      description="Panel base para administrar cuentas, idioma, rol principal y asignacion institucional."
      eyebrow="Gestion de usuarios"
      title="Usuarios y acceso"
    >
      <AdminGuard>
        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <DataPanel
            description="Formulario administrativo inicial para altas de usuarios del LMS."
            title="Crear usuario"
          >
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="Correo"
                value={form.email}
              />
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
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, password: event.target.value }))
                }
                placeholder="Clave"
                type="password"
                value={form.password}
              />
              <select
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
                value={form.role}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name}
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
                <option value="">Sin institucion</option>
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
                Crear usuario
              </button>
            </form>
          </DataPanel>

          <DataPanel description="Listado base conectado a la API protegida." title="Usuarios registrados">
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
                  key: "lang",
                  header: "Idioma",
                  render: (item) => item.preferredLang,
                },
                {
                  key: "status",
                  header: "Estado",
                  render: (item) => (item.isActive ? "Activo" : "Inactivo"),
                },
              ]}
              emptyLabel="No hay usuarios visibles."
              rows={users}
            />
          </DataPanel>
        </section>
      </AdminGuard>
    </AdminShell>
  );
}
