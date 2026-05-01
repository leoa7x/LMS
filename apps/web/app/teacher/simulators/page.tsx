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
  isTrackable?: boolean;
  mappings?: Array<{
    id: string;
    practice?: {
      titleEs?: string | null;
      lesson?: {
        titleEs?: string | null;
        module?: { course?: { titleEs?: string | null } | null } | null;
      } | null;
    } | null;
  }> | null;
};

type SimulatorSessionRow = {
  id: string;
  status: string;
  score?: number | null;
  simulator?: { name?: string | null } | null;
  student?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
  enrollment?: { course?: { titleEs?: string | null } | null } | null;
  startedAt: string;
  finishedAt?: string | null;
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

export default function TeacherSimulatorsPage() {
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [simulators, setSimulators] = useState<SimulatorRow[]>([]);
  const [sessions, setSessions] = useState<SimulatorSessionRow[]>([]);

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([
      apiRequest<SimulatorRow[]>("/simulators", accessToken),
      apiRequest<SimulatorSessionRow[]>("/simulators/sessions", accessToken),
    ])
      .then(([simulatorsData, sessionsData]) => {
        setSimulators(simulatorsData);
        setSessions(sessionsData);
      })
      .catch(() => {
        setSimulators([]);
        setSessions([]);
      });
  }, [accessToken]);

  const filteredSimulators = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return simulators.filter((simulator) => {
      const courseNames = Array.from(
        new Set(
          (simulator.mappings ?? [])
            .map((mapping) => mapping.practice?.lesson?.module?.course?.titleEs ?? "")
            .filter(Boolean),
        ),
      );
      const content = [simulator.name, ...courseNames].join(" ").toLowerCase();
      return !normalized || content.includes(normalized);
    });
  }, [search, simulators]);

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

  const coveredCourses = useMemo(
    () =>
      new Set(
        simulators.flatMap((simulator) =>
          (simulator.mappings ?? [])
            .map((mapping) => mapping.practice?.lesson?.module?.course?.titleEs)
            .filter(Boolean),
        ),
      ).size,
    [simulators],
  );

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
      eyebrow="Docente"
      title="Simuladores"
      description="Consulta los simuladores visibles en tus cursos y revisa la actividad del grupo con trazabilidad institucional."
    >
      <RoleGuard roles={["TEACHER", "ADMIN"]}>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Simuladores visibles"
            value={simulators.length}
            helper="Recursos de simulacion habilitados para tus cursos."
          />
          <StatCard
            label="Cursos cubiertos"
            value={coveredCourses}
            helper="Cursos con practica vinculada a un simulador."
          />
          <StatCard
            label="Sesiones completadas"
            value={sessions.filter((session) => session.status === "COMPLETED").length}
            helper="Registros cerrados satisfactoriamente dentro del grupo."
          />
          <StatCard
            label="Promedio de puntaje"
            value={`${avgScore.toFixed(1)} pts`}
            helper="Promedio de las sesiones con puntaje registrado."
          />
        </section>

        <section className="mt-6 rounded-3xl border border-cloud bg-white px-5 py-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por simulador, curso o estudiante"
              className="w-full rounded-2xl border border-cloud px-4 py-3 text-sm outline-none transition focus:border-navy"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border border-cloud bg-white px-4 py-3 text-sm"
            >
              <option value="ALL">Todas las sesiones</option>
              <option value="STARTED">En curso</option>
              <option value="COMPLETED">Completadas</option>
              <option value="FAILED">No completadas</option>
              <option value="ABANDONED">Abandonadas</option>
            </select>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <DataPanel
            title="Simuladores disponibles"
            description="Ubica rapidamente que practicas y cursos se apoyan en simuladores dentro de tu alcance docente."
          >
            <div className="grid gap-4">
              {filteredSimulators.length ? (
                filteredSimulators.map((simulator) => {
                  const courses = Array.from(
                    new Set(
                      (simulator.mappings ?? [])
                        .map(
                          (mapping) =>
                            mapping.practice?.lesson?.module?.course?.titleEs ?? "",
                        )
                        .filter(Boolean),
                    ),
                  );

                  return (
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
                            Cursos relacionados
                          </p>
                          <p className="mt-2 text-sm font-medium text-slate-950">
                            {courses.join(", ") || "Sin cursos asociados"}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
                  No hay simuladores que coincidan con los filtros actuales.
                </div>
              )}
            </div>
          </DataPanel>

          <DataPanel
            title="Sesiones recientes del grupo"
            description="Revisa el estado, curso y puntaje de las sesiones registradas por tus estudiantes."
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
                        <p>{formatDate(session.startedAt)}</p>
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
