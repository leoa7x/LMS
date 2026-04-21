"use client";

import { FormEvent, useEffect, useState } from "react";
import { DataPanel } from "../../../components/data-panel";
import { PortalShell } from "../../../components/portal-shell";
import { RoleGuard } from "../../../components/role-guard";
import { SimpleTable } from "../../../components/simple-table";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest } from "../../../lib/client-api";

type Institution = { id: string; name: string; slug: string; status: string };
type Campus = { id: string; name: string; code?: string | null; status: string; institutionId: string };
type TechnicalArea = { id: string; nameEs: string };
type Laboratory = {
  id: string;
  name: string;
  status: string;
  campus?: { name?: string | null } | null;
  technicalArea?: { nameEs?: string | null } | null;
};

export default function InstitutionsAdminPage() {
  const { accessToken } = useAuth();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [technicalAreas, setTechnicalAreas] = useState<TechnicalArea[]>([]);
  const [campusForm, setCampusForm] = useState({
    institutionId: "",
    name: "",
    code: "",
    address: "",
  });
  const [laboratoryForm, setLaboratoryForm] = useState({
    campusId: "",
    technicalAreaId: "",
    name: "",
    description: "",
  });

  useEffect(() => {
    if (!accessToken) return;

    Promise.all([
      apiRequest<Institution[]>("/institutions", accessToken),
      apiRequest<Campus[]>("/institutions/campuses/all", accessToken),
      apiRequest<Laboratory[]>("/institutions/laboratories/all", accessToken),
      apiRequest<TechnicalArea[]>("/technical-areas", accessToken),
    ])
      .then(([institutionsData, campusesData, laboratoriesData, technicalAreasData]) => {
        setInstitutions(institutionsData);
        setCampuses(campusesData);
        setLaboratories(laboratoriesData);
        setTechnicalAreas(technicalAreasData);

        if (institutionsData[0]) {
          setCampusForm((prev) => ({
            ...prev,
            institutionId: prev.institutionId || institutionsData[0].id,
          }));
        }
      })
      .catch(() => undefined);
  }, [accessToken]);

  async function refresh() {
    if (!accessToken) return;
    setCampuses(await apiRequest<Campus[]>("/institutions/campuses/all", accessToken));
    setLaboratories(
      await apiRequest<Laboratory[]>("/institutions/laboratories/all", accessToken),
    );
  }

  async function createCampus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;
    await apiRequest("/institutions/campuses", accessToken, {
      method: "POST",
      body: JSON.stringify(campusForm),
    });
    setCampusForm((prev) => ({ ...prev, name: "", code: "", address: "" }));
    await refresh();
  }

  async function createLaboratory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;
    await apiRequest("/institutions/laboratories", accessToken, {
      method: "POST",
      body: JSON.stringify(laboratoryForm),
    });
    setLaboratoryForm({ campusId: "", technicalAreaId: "", name: "", description: "" });
    await refresh();
  }

  return (
    <PortalShell
      eyebrow="Institucion"
      title="Institucion, sedes y laboratorios"
      description="Administra las sedes y laboratorios disponibles para la operacion academica."
    >
      <RoleGuard roles={["ADMIN", "SUPPORT"]}>
        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="grid gap-6">
            <DataPanel title="Nueva sede">
              <form className="grid gap-4" onSubmit={createCampus}>
                <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" value={campusForm.institutionId} onChange={(event)=>setCampusForm((prev)=>({...prev,institutionId:event.target.value}))}>
                  <option value="">Selecciona institucion</option>
                  {institutions.map((institution)=>(
                    <option key={institution.id} value={institution.id}>{institution.name}</option>
                  ))}
                </select>
                <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Nombre de sede" value={campusForm.name} onChange={(event)=>setCampusForm((prev)=>({...prev,name:event.target.value}))}/>
                <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Codigo" value={campusForm.code} onChange={(event)=>setCampusForm((prev)=>({...prev,code:event.target.value}))}/>
                <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Direccion" value={campusForm.address} onChange={(event)=>setCampusForm((prev)=>({...prev,address:event.target.value}))}/>
                <button className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white" type="submit">Crear sede</button>
              </form>
            </DataPanel>

            <DataPanel title="Nuevo laboratorio">
              <form className="grid gap-4" onSubmit={createLaboratory}>
                <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" value={laboratoryForm.campusId} onChange={(event)=>setLaboratoryForm((prev)=>({...prev,campusId:event.target.value}))}>
                  <option value="">Selecciona sede</option>
                  {campuses.map((campus)=>(
                    <option key={campus.id} value={campus.id}>{campus.name}</option>
                  ))}
                </select>
                <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" value={laboratoryForm.technicalAreaId} onChange={(event)=>setLaboratoryForm((prev)=>({...prev,technicalAreaId:event.target.value}))}>
                  <option value="">Area tecnica opcional</option>
                  {technicalAreas.map((area)=>(
                    <option key={area.id} value={area.id}>{area.nameEs}</option>
                  ))}
                </select>
                <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Nombre de laboratorio" value={laboratoryForm.name} onChange={(event)=>setLaboratoryForm((prev)=>({...prev,name:event.target.value}))}/>
                <textarea className="min-h-28 rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Descripcion" value={laboratoryForm.description} onChange={(event)=>setLaboratoryForm((prev)=>({...prev,description:event.target.value}))}/>
                <button className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white" type="submit">Crear laboratorio</button>
              </form>
            </DataPanel>
          </div>

          <div className="grid gap-6">
            <DataPanel title="Institucion activa">
              <SimpleTable
                columns={[
                  { key: "name", header: "Institucion", render: (item) => item.name },
                  { key: "slug", header: "Slug", render: (item) => item.slug },
                  { key: "status", header: "Estado", render: (item) => item.status },
                ]}
                rows={institutions}
                emptyLabel="No hay institucion visible."
              />
            </DataPanel>

            <DataPanel title="Sedes">
              <SimpleTable
                columns={[
                  { key: "name", header: "Sede", render: (item) => item.name },
                  { key: "code", header: "Codigo", render: (item) => item.code ?? "-" },
                  { key: "status", header: "Estado", render: (item) => item.status },
                ]}
                rows={campuses}
                emptyLabel="No hay sedes registradas."
              />
            </DataPanel>

            <DataPanel title="Laboratorios">
              <SimpleTable
                columns={[
                  { key: "name", header: "Laboratorio", render: (item) => item.name },
                  { key: "campus", header: "Sede", render: (item) => item.campus?.name ?? "-" },
                  { key: "area", header: "Area tecnica", render: (item) => item.technicalArea?.nameEs ?? "-" },
                  { key: "status", header: "Estado", render: (item) => item.status },
                ]}
                rows={laboratories}
                emptyLabel="No hay laboratorios registrados."
              />
            </DataPanel>
          </div>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
