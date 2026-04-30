"use client";

import { FormEvent, useEffect, useState } from "react";
import { DataPanel } from "../../../components/data-panel";
import { PortalShell } from "../../../components/portal-shell";
import { RoleGuard } from "../../../components/role-guard";
import { SimpleTable } from "../../../components/simple-table";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest } from "../../../lib/client-api";

type TicketRow = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  category?: string | null;
  requester?: { email?: string | null } | null;
  campus?: { name?: string | null } | null;
  laboratory?: { name?: string | null } | null;
  sla?: {
    responseBreached: boolean;
    resolutionBreached: boolean;
    responseHoursRemaining?: number | null;
    resolutionHoursRemaining?: number | null;
  } | null;
  comments?: Array<{
    id: string;
    body: string;
    isInternal?: boolean;
    authorUser?: { email?: string | null } | null;
  }> | null;
};

type OperationsSummary = {
  openTickets: number;
  inProgressTickets: number;
  responseBreached: number;
  resolutionBreached: number;
  responseDueSoon: number;
  resolutionDueSoon: number;
};

type SlaPolicy = {
  id: string;
  name: string;
  responseHours: number;
  resolutionHours?: number | null;
  isActive: boolean;
};

type CampusRow = { id: string; name: string };
type LaboratoryRow = { id: string; name: string };

const defaultSummary: OperationsSummary = {
  openTickets: 0,
  inProgressTickets: 0,
  responseBreached: 0,
  resolutionBreached: 0,
  responseDueSoon: 0,
  resolutionDueSoon: 0,
};

const priorityLabels: Record<string, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  CRITICAL: "Critica",
};

const statusLabels: Record<string, string> = {
  OPEN: "Abierta",
  IN_PROGRESS: "En atencion",
  RESOLVED: "Resuelta",
  CLOSED: "Cerrada",
};

export default function AdminSupportPage() {
  const { accessToken } = useAuth();
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [summary, setSummary] = useState<OperationsSummary>(defaultSummary);
  const [policies, setPolicies] = useState<SlaPolicy[]>([]);
  const [campuses, setCampuses] = useState<CampusRow[]>([]);
  const [laboratories, setLaboratories] = useState<LaboratoryRow[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    description: "",
    category: "",
    priority: "MEDIUM",
    campusId: "",
    laboratoryId: "",
  });
  const [updateForm, setUpdateForm] = useState({ status: "IN_PROGRESS", priority: "MEDIUM" });
  const [commentBody, setCommentBody] = useState("");
  const [slaForm, setSlaForm] = useState({
    name: "",
    responseHours: "48",
    resolutionHours: "72",
  });

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) ?? null;

  async function loadData() {
    if (!accessToken) return;
    const [ticketsData, summaryData, policiesData, campusesData, laboratoriesData] =
      await Promise.all([
        apiRequest<TicketRow[]>("/support/tickets", accessToken),
        apiRequest<OperationsSummary>("/support/operations/summary", accessToken),
        apiRequest<SlaPolicy[]>("/support/sla-policies", accessToken),
        apiRequest<CampusRow[]>("/institutions/campuses/all", accessToken),
        apiRequest<LaboratoryRow[]>("/institutions/laboratories/all", accessToken),
      ]);
    setTickets(ticketsData);
    setSummary(summaryData);
    setPolicies(policiesData);
    setCampuses(campusesData);
    setLaboratories(laboratoriesData);
  }

  useEffect(() => {
    if (!accessToken) return;
    loadData().catch(() => {
      setTickets([]);
      setSummary(defaultSummary);
      setPolicies([]);
      setCampuses([]);
      setLaboratories([]);
    });
  }, [accessToken]);

  async function createTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;
    await apiRequest("/support/tickets", accessToken, {
      method: "POST",
      body: JSON.stringify({
        ...ticketForm,
        category: ticketForm.category || undefined,
        campusId: ticketForm.campusId || undefined,
        laboratoryId: ticketForm.laboratoryId || undefined,
      }),
    });
    setTicketForm({
      subject: "",
      description: "",
      category: "",
      priority: "MEDIUM",
      campusId: "",
      laboratoryId: "",
    });
    await loadData();
  }

  async function updateTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !selectedTicketId) return;
    await apiRequest(`/support/tickets/${selectedTicketId}`, accessToken, {
      method: "PATCH",
      body: JSON.stringify(updateForm),
    });
    await loadData();
  }

  async function addComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !selectedTicketId || !commentBody.trim()) return;
    await apiRequest(`/support/tickets/${selectedTicketId}/comments`, accessToken, {
      method: "POST",
      body: JSON.stringify({
        body: commentBody,
        isInternal: true,
      }),
    });
    setCommentBody("");
    await loadData();
  }

  async function createPolicy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;
    await apiRequest("/support/sla-policies", accessToken, {
      method: "POST",
      body: JSON.stringify({
        name: slaForm.name,
        responseHours: Number(slaForm.responseHours),
        resolutionHours: Number(slaForm.resolutionHours),
        isActive: true,
      }),
    });
    setSlaForm({ name: "", responseHours: "48", resolutionHours: "72" });
    await loadData();
  }

  return (
    <PortalShell
      eyebrow="Soporte"
      title="Soporte y tiempos de atencion"
      description="Gestiona solicitudes, revisa tiempos de respuesta y da seguimiento a la atencion institucional."
    >
      <RoleGuard roles={["ADMIN", "SUPPORT"]}>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <DataPanel title="Solicitudes abiertas">
            <p className="text-3xl font-semibold text-slate-950">{summary.openTickets}</p>
          </DataPanel>
          <DataPanel title="Fuera de tiempo">
            <p className="text-3xl font-semibold text-slate-950">
              {summary.responseBreached + summary.resolutionBreached}
            </p>
          </DataPanel>
          <DataPanel title="Por vencer">
            <p className="text-3xl font-semibold text-slate-950">
              {summary.responseDueSoon + summary.resolutionDueSoon}
            </p>
          </DataPanel>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <DataPanel title="Solicitudes registradas">
            <SimpleTable
              columns={[
                { key: "subject", header: "Asunto", render: (item) => item.subject },
                { key: "requester", header: "Solicitante", render: (item) => item.requester?.email ?? "-" },
                {
                  key: "status",
                  header: "Estado",
                  render: (item) => statusLabels[item.status] ?? item.status,
                },
                {
                  key: "priority",
                  header: "Prioridad",
                  render: (item) => priorityLabels[item.priority] ?? item.priority,
                },
                {
                  key: "sla",
                  header: "SLA",
                  render: (item) =>
                    item.sla?.responseBreached || item.sla?.resolutionBreached
                      ? "Vencido"
                      : "En tiempo",
                },
              ]}
              rows={tickets}
              emptyLabel="No hay solicitudes visibles."
            />
            <select
              className="mt-4 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              value={selectedTicketId}
              onChange={(event) => setSelectedTicketId(event.target.value)}
            >
              <option value="">Selecciona una solicitud</option>
              {tickets.map((ticket) => (
                <option key={ticket.id} value={ticket.id}>
                  {ticket.subject} · {statusLabels[ticket.status] ?? ticket.status}
                </option>
              ))}
            </select>
          </DataPanel>

          <DataPanel title="Registrar solicitud">
            <form className="grid gap-4" onSubmit={createTicket}>
              <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Asunto" value={ticketForm.subject} onChange={(event)=>setTicketForm((prev)=>({...prev,subject:event.target.value}))} />
              <textarea className="min-h-28 rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Descripcion" value={ticketForm.description} onChange={(event)=>setTicketForm((prev)=>({...prev,description:event.target.value}))} />
              <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Categoria o tipo de solicitud" value={ticketForm.category} onChange={(event)=>setTicketForm((prev)=>({...prev,category:event.target.value}))} />
              <div className="grid gap-3 md:grid-cols-3">
                <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" value={ticketForm.priority} onChange={(event)=>setTicketForm((prev)=>({...prev,priority:event.target.value}))}>
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                  <option value="CRITICAL">Critica</option>
                </select>
                <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" value={ticketForm.campusId} onChange={(event)=>setTicketForm((prev)=>({...prev,campusId:event.target.value}))}>
                  <option value="">Sede</option>
                  {campuses.map((campus)=>(
                    <option key={campus.id} value={campus.id}>{campus.name}</option>
                  ))}
                </select>
                <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" value={ticketForm.laboratoryId} onChange={(event)=>setTicketForm((prev)=>({...prev,laboratoryId:event.target.value}))}>
                  <option value="">Laboratorio</option>
                  {laboratories.map((laboratory)=>(
                    <option key={laboratory.id} value={laboratory.id}>{laboratory.name}</option>
                  ))}
                </select>
              </div>
              <button className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white" type="submit">
                Registrar solicitud
              </button>
            </form>
          </DataPanel>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <DataPanel title="Gestion del caso">
            {selectedTicket ? (
              <div className="grid gap-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  {selectedTicket.subject} · {selectedTicket.campus?.name ?? "Sin sede"} · {selectedTicket.laboratory?.name ?? "Sin laboratorio"}
                </div>
                <form className="grid gap-4" onSubmit={updateTicket}>
                  <div className="grid gap-3 md:grid-cols-2">
                    <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" value={updateForm.status} onChange={(event)=>setUpdateForm((prev)=>({...prev,status:event.target.value}))}>
                      <option value="OPEN">Abierta</option>
                      <option value="IN_PROGRESS">En atencion</option>
                      <option value="RESOLVED">Resuelta</option>
                      <option value="CLOSED">Cerrada</option>
                    </select>
                    <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" value={updateForm.priority} onChange={(event)=>setUpdateForm((prev)=>({...prev,priority:event.target.value}))}>
                      <option value="LOW">Baja</option>
                      <option value="MEDIUM">Media</option>
                      <option value="HIGH">Alta</option>
                      <option value="CRITICAL">Critica</option>
                    </select>
                  </div>
                  <button className="rounded-full border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700" type="submit">
                    Actualizar solicitud
                  </button>
                </form>
                <form className="grid gap-4" onSubmit={addComment}>
                  <textarea className="min-h-28 rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Agregar comentario" value={commentBody} onChange={(event)=>setCommentBody(event.target.value)} />
                  <button className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white" type="submit">
                    Agregar comentario
                  </button>
                </form>
                <SimpleTable
                  columns={[
                    { key: "author", header: "Autor", render: (item) => item.authorUser?.email ?? "-" },
                    { key: "body", header: "Comentario", render: (item) => item.body },
                    { key: "internal", header: "Visibilidad", render: (item) => (item.isInternal ? "Interna" : "Compartida") },
                  ]}
                  rows={selectedTicket.comments ?? []}
                  emptyLabel="No hay comentarios."
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
                Selecciona una solicitud para revisar su detalle.
              </div>
            )}
          </DataPanel>

          <DataPanel title="Politicas de atencion">
            <form className="mb-5 grid gap-4" onSubmit={createPolicy}>
              <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Nombre de la politica" value={slaForm.name} onChange={(event)=>setSlaForm((prev)=>({...prev,name:event.target.value}))} />
              <div className="grid gap-3 md:grid-cols-2">
                <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" type="number" min={1} placeholder="Horas para primera respuesta" value={slaForm.responseHours} onChange={(event)=>setSlaForm((prev)=>({...prev,responseHours:event.target.value}))} />
                <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" type="number" min={1} placeholder="Horas para resolucion" value={slaForm.resolutionHours} onChange={(event)=>setSlaForm((prev)=>({...prev,resolutionHours:event.target.value}))} />
              </div>
              <button className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white" type="submit">
                Crear politica
              </button>
            </form>
            <SimpleTable
              columns={[
                { key: "name", header: "Politica", render: (item) => item.name },
                { key: "responseHours", header: "Respuesta", render: (item) => `${item.responseHours}h` },
                { key: "resolutionHours", header: "Resolucion", render: (item) => (item.resolutionHours ? `${item.resolutionHours}h` : "-") },
                { key: "isActive", header: "Activa", render: (item) => (item.isActive ? "Si" : "No") },
              ]}
              rows={policies}
              emptyLabel="No hay politicas registradas."
            />
          </DataPanel>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
