"use client";

import { useEffect, useMemo, useState } from "react";
import { DataPanel } from "../../../components/data-panel";
import { PortalShell } from "../../../components/portal-shell";
import { RoleGuard } from "../../../components/role-guard";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest } from "../../../lib/client-api";

type SimulatorRow = {
  id: string;
  name: string;
  kind: string;
  isTrackable: boolean;
  mappings?: Array<{
    id: string;
    practice?: { titleEs?: string | null } | null;
  }> | null;
  sessions?: Array<{ id: string }> | null;
};

type SimulatorMappingRow = {
  id: string;
  simulator?: { name?: string | null } | null;
  practice?: {
    titleEs?: string | null;
    lesson?: {
      titleEs?: string | null;
      module?: {
        titleEs?: string | null;
        course?: { titleEs?: string | null } | null;
      } | null;
    } | null;
  } | null;
};

type SimulatorSessionRow = {
  id: string;
  status: string;
  score?: number | null;
  startedAt: string;
  finishedAt?: string | null;
  simulator?: { name?: string | null; kind?: string | null } | null;
  student?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
  enrollment?: { course?: { titleEs?: string | null } | null } | null;
};

const simulatorKindLabels: Record<string, string> = {
  EMBEDDABLE_EXISTING: "Integrado existente",
  THIRD_PARTY_ADAPTER: "Adaptacion externa",
  NATIVE_BASIC: "Propio basico",
  NATIVE_ADVANCED: "Propio avanzado",
};

const simulatorSessionStatusLabels: Record<string, string> = {
  STARTED: "En curso",
  COMPLETED: "Completada",
  FAILED: "No completada",
  ABANDONED: "Abandonada",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div className="rounded-3xl border border-cloud bg-white px-5 py-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-steel">
        {label}
      </p>
      <p className="mt-3 font-display text-3xl font-semibold text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{helper}</p>
    </div>
  );
}

export default function AdminSimulatorsPage() {
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [simulators, setSimulators] = useState<SimulatorRow[]>([]);
  const [mappings, setMappings] = useState<SimulatorMappingRow[]>([]);
  const [sessions, setSessions] = useState<SimulatorSessionRow[]>([]);

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([
      apiRequest<SimulatorRow[]>("/simulators", accessToken),
      apiRequest<SimulatorMappingRow[]>("/simulators/mappings", accessToken),
      apiRequest<SimulatorSessionRow[]>("/simulators/sessions", accessToken),
    ])
      .then(([simulatorsData, mappingsData, sessionsData]) => {
        setSimulators(simulatorsData);
        setMappings(mappingsData);
        setSessions(sessionsData);
      })
      .catch(() => {
        setSimulators([]);
        setMappings([]);
        setSessions([]);
      });
  }, [accessToken]);

  const filteredSimulators = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return simulators.filter((simulator) => {
      const matchesKind = kindFilter === "ALL" || simulator.kind === kindFilter;
      const content = [simulator.name, simulator.kind].join(" ").toLowerCase();
      return matchesKind && (!normalized || content.includes(normalized));
    });
  }, [kindFilter, search, simulators]);

  const filteredMappings = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return mappings.filter((mapping) => {
      const content = [
        mapping.simulator?.name ?? "",
        mapping.practice?.titleEs ?? "",
        mapping.practice?.lesson?.titleEs ?? "",
        mapping.practice?.lesson?.module?.titleEs ?? "",
        mapping.practice?.lesson?.module?.course?.titleEs ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return !normalized || content.includes(normalized);
    });
  }, [mappings, search]);

  const filteredSessions = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return sessions.filter((session) => {
      const matchesStatus =
        statusFilter === "ALL" || session.status === statusFilter;
      const content = [
        session.simulator?.name ?? "",
        session.enrollment?.course?.titleEs ?? "",
        `${session.student?.firstName ?? ""} ${session.student?.lastName ?? ""}`.trim(),
        session.student?.email ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!normalized || content.includes(normalized));
    });
  }, [search, sessions, statusFilter]);

  const avgScore = useMemo(() => {
    const scored = sessions.filter((session) => typeof session.score === "number");
    if (!scored.length) return 0;
    return (
      scored.reduce((accumulator, session) => accumulator + (session.score ?? 0), 0) /
      scored.length
    );
  }, [sessions]);

  return (
    <PortalShell
      eyebrow="Simuladores"
      title="Catalogo y actividad"
      description="Administra la cobertura de simuladores del portal y revisa su uso dentro de las practicas formativas."
    >
      <RoleGuard roles={["ADMIN", "SUPPORT"]}>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Simuladores registrados"
            value={simulators.length}
            helper="Catalogo visible dentro del portal institucional."
          />
          <StatCard
            label="Mapeos activos"
            value={mappings.length}
            helper="Relaciones entre simulador, practica y curso."
          />
          <StatCard
            label="Sesiones registradas"
            value={sessions.length}
            helper="Actividad acumulada dentro de los simuladores."
          />
          <StatCard
            label="Promedio de puntaje"
            value={`${avgScore.toFixed(1)} pts`}
            helper="Promedio de sesiones con puntaje disponible."
          />
        </section>

        <section className="mt-6 rounded-3xl border border-cloud bg-white px-5 py-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por simulador, practica, curso o estudiante"
              className="w-full rounded-2xl border border-cloud px-4 py-3 text-sm outline-none transition focus:border-navy"
            />
            <select
              value={kindFilter}
              onChange={(event) => setKindFilter(event.target.value)}
              className="rounded-2xl border border-cloud bg-white px-4 py-3 text-sm"
            >
              <option value="ALL">Todas las categorias</option>
              {Object.entries(simulatorKindLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border border-cloud bg-white px-4 py-3 text-sm"
            >
              <option value="ALL">Todos los estados de sesion</option>
              <option value="STARTED">En curso</option>
              <option value="COMPLETED">Completadas</option>
              <option value="FAILED">No completadas</option>
              <option value="ABANDONED">Abandonadas</option>
            </select>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <DataPanel
            title="Catalogo de simuladores"
            description="Consulta la categoria, trazabilidad y alcance practico de cada simulador disponible."
          >
            <div className="grid gap-4">
              {filteredSimulators.length ? (
                filteredSimulators.map((simulator) => (
                  <article
                    key={simulator.id}
                    className="rounded-3xl border border-cloud bg-white px-5 py-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-steel">
                          {simulatorKindLabels[simulator.kind] ?? simulator.kind}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-slate-950">
                          {simulator.name}
                        </h3>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          simulator.isTrackable
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {simulator.isTrackable ? "Con seguimiento" : "Sin seguimiento"}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Practicas vinculadas
                        </p>
                        <p className="mt-2 text-xl font-semibold text-slate-950">
                          {simulator.mappings?.length ?? 0}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Sesiones registradas
                        </p>
                        <p className="mt-2 text-xl font-semibold text-slate-950">
                          {simulator.sessions?.length ?? 0}
                        </p>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
                  No hay simuladores que coincidan con los filtros actuales.
                </div>
              )}
            </div>
          </DataPanel>

          <DataPanel
            title="Relacion con las practicas"
            description="Verifica que cada simulador este vinculado a la practica, leccion, modulo y curso correspondientes."
          >
            <div className="grid gap-4">
              {filteredMappings.length ? (
                filteredMappings.map((mapping) => (
                  <article
                    key={mapping.id}
                    className="rounded-3xl border border-cloud bg-white px-5 py-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-steel">
                      {mapping.simulator?.name ?? "Simulador"}
                    </p>
                    <h3 className="mt-2 text-base font-semibold text-slate-950">
                      {mapping.practice?.titleEs ?? "Practica vinculada"}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                      {mapping.practice?.lesson?.titleEs ?? "Sin leccion"} /{" "}
                      {mapping.practice?.lesson?.module?.titleEs ?? "Sin modulo"} /{" "}
                      {mapping.practice?.lesson?.module?.course?.titleEs ?? "Sin curso"}
                    </p>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
                  No hay relaciones que coincidan con la busqueda actual.
                </div>
              )}
            </div>
          </DataPanel>
        </section>

        <section className="mt-6">
          <DataPanel
            title="Sesiones registradas"
            description="Consulta la actividad reciente de los estudiantes por simulador, curso y estado de finalizacion."
          >
            <div className="grid gap-4">
              {filteredSessions.length ? (
                filteredSessions.map((session) => (
                  <article
                    key={session.id}
                    className="rounded-3xl border border-cloud bg-white px-5 py-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-steel">
                          {simulatorSessionStatusLabels[session.status] ?? session.status}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-slate-950">
                          {session.simulator?.name ?? "Sesion de simulador"}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                          {`${session.student?.firstName ?? ""} ${session.student?.lastName ?? ""}`.trim() ||
                            session.student?.email ||
                            "Estudiante"}
                        </p>
                      </div>
                      <div className="text-right text-sm text-slate-600">
                        <p>{session.enrollment?.course?.titleEs ?? "Sin curso asociado"}</p>
                        <p>Inicio: {formatDate(session.startedAt)}</p>
                        <p>
                          Puntaje: <strong>{session.score ?? "-"}</strong>
                        </p>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
                  No hay sesiones que coincidan con los filtros actuales.
                </div>
              )}
            </div>
          </DataPanel>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
