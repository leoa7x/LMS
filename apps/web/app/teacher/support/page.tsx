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
  comments?: Array<{
    id: string;
    body: string;
    isInternal?: boolean;
    authorUser?: { email?: string | null } | null;
  }> | null;
};

export default function TeacherSupportPage() {
  const { accessToken } = useAuth();
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    description: "",
    category: "",
    priority: "MEDIUM",
  });
  const [commentBody, setCommentBody] = useState("");

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) ?? null;

  async function loadTickets() {
    if (!accessToken) return;
    const data = await apiRequest<TicketRow[]>("/support/tickets", accessToken);
    setTickets(data);
  }

  useEffect(() => {
    if (!accessToken) return;
    loadTickets().catch(() => setTickets([]));
  }, [accessToken]);

  async function createTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;
    await apiRequest("/support/tickets", accessToken, {
      method: "POST",
      body: JSON.stringify(ticketForm),
    });
    setTicketForm({ subject: "", description: "", category: "", priority: "MEDIUM" });
    await loadTickets();
  }

  async function addComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !selectedTicketId || !commentBody.trim()) return;
    await apiRequest(`/support/tickets/${selectedTicketId}/comments`, accessToken, {
      method: "POST",
      body: JSON.stringify({
        body: commentBody,
      }),
    });
    setCommentBody("");
    await loadTickets();
  }

  return (
    <PortalShell
      eyebrow="Docente"
      title="Soporte y tickets"
      description="Vista docente para crear tickets, seguir estado de soporte y comentar incidencias operativas."
    >
      <RoleGuard roles={["TEACHER", "ADMIN"]}>
        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <DataPanel title="Mis tickets">
            <SimpleTable
              columns={[
                { key: "subject", header: "Asunto", render: (item) => item.subject },
                { key: "status", header: "Estado", render: (item) => item.status },
                { key: "priority", header: "Prioridad", render: (item) => item.priority },
              ]}
              rows={tickets}
              emptyLabel="No hay tickets visibles."
            />
            <select className="mt-4 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" value={selectedTicketId} onChange={(event)=>setSelectedTicketId(event.target.value)}>
              <option value="">Selecciona ticket</option>
              {tickets.map((ticket)=>(
                <option key={ticket.id} value={ticket.id}>{ticket.subject}</option>
              ))}
            </select>
          </DataPanel>

          <DataPanel title="Crear ticket">
            <form className="grid gap-4" onSubmit={createTicket}>
              <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Asunto" value={ticketForm.subject} onChange={(event)=>setTicketForm((prev)=>({...prev,subject:event.target.value}))} />
              <textarea className="min-h-28 rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Descripcion" value={ticketForm.description} onChange={(event)=>setTicketForm((prev)=>({...prev,description:event.target.value}))} />
              <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Categoria" value={ticketForm.category} onChange={(event)=>setTicketForm((prev)=>({...prev,category:event.target.value}))} />
              <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" value={ticketForm.priority} onChange={(event)=>setTicketForm((prev)=>({...prev,priority:event.target.value}))}>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
              <button className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white" type="submit">
                Crear ticket
              </button>
            </form>
          </DataPanel>
        </section>

        <section className="mt-6">
          <DataPanel title="Conversacion del ticket">
            {selectedTicket ? (
              <div className="grid gap-4">
                <SimpleTable
                  columns={[
                    { key: "author", header: "Autor", render: (item) => item.authorUser?.email ?? "-" },
                    { key: "body", header: "Comentario", render: (item) => item.body },
                    { key: "internal", header: "Interno", render: (item) => (item.isInternal ? "Si" : "No") },
                  ]}
                  rows={selectedTicket.comments ?? []}
                  emptyLabel="No hay comentarios."
                />
                <form className="grid gap-4" onSubmit={addComment}>
                  <textarea className="min-h-28 rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Agregar comentario" value={commentBody} onChange={(event)=>setCommentBody(event.target.value)} />
                  <button className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white" type="submit">
                    Enviar comentario
                  </button>
                </form>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
                Selecciona un ticket para ver y comentar.
              </div>
            )}
          </DataPanel>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
