"use client";

import { FormEvent, useEffect, useState } from "react";
import { DataPanel } from "../../../components/data-panel";
import { PortalShell } from "../../../components/portal-shell";
import { RoleGuard } from "../../../components/role-guard";
import { SimpleTable } from "../../../components/simple-table";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest } from "../../../lib/client-api";

type SimulatorRow = {
  id: string;
  name: string;
  kind: string;
  mappings?: Array<{
    id: string;
    practice?: {
      titleEs?: string | null;
      lesson?: {
        titleEs?: string | null;
        module?: { titleEs?: string | null; course?: { titleEs?: string | null } | null } | null;
      } | null;
    } | null;
  }> | null;
};

type StudentDashboard = {
  currentCourses: Array<{
    enrollmentId: string;
    titleEs: string;
  }>;
};

type SimulatorSessionRow = {
  id: string;
  status: string;
  score?: number | null;
  simulator?: { name?: string | null } | null;
  enrollment?: { course?: { titleEs?: string | null } | null } | null;
  startedAt: string;
};

type SessionContext = {
  sessionId: string;
  simulator: { id: string; name: string; kind: string; launchUrl?: string | null };
  enrollment?: { id: string; courseTitleEs?: string | null } | null;
  mappings: Array<{
    practiceId: string;
    practiceTitleEs?: string | null;
    lessonTitleEs?: string | null;
    moduleTitleEs?: string | null;
  }>;
};

const simulatorEventLabels: Record<string, string> = {
  STEP_COMPLETED: "Paso completado",
  COMPONENT_INTERACTION: "Interaccion con componente",
  FAULT_TRIGGERED: "Registro de falla",
};

const simulatorSessionStatusLabels: Record<string, string> = {
  COMPLETED: "Completada",
  FAILED: "No completada",
  ABANDONED: "Abandonada",
};

export default function StudentSimulatorsPage() {
  const { accessToken, user } = useAuth();
  const [simulators, setSimulators] = useState<SimulatorRow[]>([]);
  const [sessions, setSessions] = useState<SimulatorSessionRow[]>([]);
  const [dashboard, setDashboard] = useState<StudentDashboard>({ currentCourses: [] });
  const [selectedSimulatorId, setSelectedSimulatorId] = useState("");
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState("");
  const [activeContext, setActiveContext] = useState<SessionContext | null>(null);
  const [eventForm, setEventForm] = useState({
    eventType: "STEP_COMPLETED",
    stepKey: "",
    componentKey: "",
    faultCode: "",
  });
  const [completion, setCompletion] = useState({ status: "COMPLETED", score: "100" });
  const [feedback, setFeedback] = useState<string | null>(null);

  async function loadData() {
    if (!accessToken) return;
    const [simulatorsData, sessionsData, dashboardData] = await Promise.all([
      apiRequest<SimulatorRow[]>("/simulators", accessToken),
      apiRequest<SimulatorSessionRow[]>("/simulators/sessions", accessToken),
      apiRequest<StudentDashboard>("/dashboard/student/me", accessToken),
    ]);
    setSimulators(simulatorsData);
    setSessions(sessionsData);
    setDashboard(dashboardData);
  }

  useEffect(() => {
    if (!accessToken) return;
    loadData().catch(() => {
      setSimulators([]);
      setSessions([]);
      setDashboard({ currentCourses: [] });
    });
  }, [accessToken]);

  async function startSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !user || !selectedSimulatorId) return;

    const created = await apiRequest<{ id: string } & Record<string, unknown>>(
      "/simulators/sessions",
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({
          simulatorId: selectedSimulatorId,
          studentId: user.id,
          enrollmentId: selectedEnrollmentId || undefined,
        }),
      },
    );

    const context = await apiRequest<SessionContext>(
      `/simulators/sessions/${created.id}/context`,
      accessToken,
    );

    setActiveContext(context);
    setFeedback("El simulador quedo listo y vinculado a tu actividad academica.");
    await loadData();
  }

  async function logEvent() {
    if (!accessToken || !activeContext) return;
    await apiRequest("/simulators/sessions/events", accessToken, {
      method: "POST",
      body: JSON.stringify({
        sessionId: activeContext.sessionId,
        ...eventForm,
        stepKey: eventForm.stepKey || undefined,
        componentKey: eventForm.componentKey || undefined,
        faultCode: eventForm.faultCode || undefined,
      }),
    });
    setFeedback("La actividad del simulador fue registrada correctamente.");
  }

  async function completeSession() {
    if (!accessToken || !activeContext) return;
    await apiRequest("/simulators/sessions/complete", accessToken, {
      method: "POST",
      body: JSON.stringify({
        sessionId: activeContext.sessionId,
        status: completion.status,
        score: Number(completion.score),
      }),
    });
    setFeedback("La sesion fue finalizada y su avance quedo guardado.");
    setActiveContext(null);
    await loadData();
  }

  return (
    <PortalShell
      eyebrow="Estudiante"
      title="Simuladores integrados"
      description="Accede a tus simuladores, carga la actividad asociada y registra el trabajo realizado."
    >
      <RoleGuard roles={["STUDENT", "ADMIN"]}>
        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <DataPanel title="Iniciar simulador">
            <form className="grid gap-4" onSubmit={startSession}>
              <select
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                value={selectedSimulatorId}
                onChange={(event) => setSelectedSimulatorId(event.target.value)}
              >
                <option value="">Selecciona simulador</option>
                {simulators.map((simulator) => (
                  <option key={simulator.id} value={simulator.id}>
                    {simulator.name}
                  </option>
                ))}
              </select>
              <select
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                value={selectedEnrollmentId}
                onChange={(event) => setSelectedEnrollmentId(event.target.value)}
              >
                  <option value="">Selecciona un curso (opcional)</option>
                {dashboard.currentCourses.map((course) => (
                  <option key={course.enrollmentId} value={course.enrollmentId}>
                    {course.titleEs}
                  </option>
                ))}
              </select>
              <button
                className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white"
                type="submit"
              >
                Iniciar actividad
              </button>
            </form>
            {feedback ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {feedback}
              </div>
            ) : null}
          </DataPanel>

          <DataPanel title="Actividad en curso">
            {activeContext ? (
              <div className="grid gap-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  {activeContext.simulator.name} · {activeContext.enrollment?.courseTitleEs ?? "Sin curso asociado"}
                </div>
                <SimpleTable
                  columns={[
                    { key: "practice", header: "Practica", render: (item) => item.practiceTitleEs ?? "-" },
                    { key: "lesson", header: "Leccion", render: (item) => item.lessonTitleEs ?? "-" },
                    { key: "module", header: "Modulo", render: (item) => item.moduleTitleEs ?? "-" },
                  ]}
                  rows={activeContext.mappings}
                  emptyLabel="No hay practicas asociadas."
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                    placeholder="Paso o actividad"
                    value={eventForm.stepKey}
                    onChange={(event) =>
                      setEventForm((prev) => ({ ...prev, stepKey: event.target.value }))
                    }
                  />
                  <input
                    className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                    placeholder="Componente o equipo"
                    value={eventForm.componentKey}
                    onChange={(event) =>
                      setEventForm((prev) => ({ ...prev, componentKey: event.target.value }))
                    }
                  />
                  <input
                    className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                    placeholder="Codigo de falla"
                    value={eventForm.faultCode}
                    onChange={(event) =>
                      setEventForm((prev) => ({ ...prev, faultCode: event.target.value }))
                    }
                  />
                  <select
                    className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                    value={eventForm.eventType}
                    onChange={(event) =>
                      setEventForm((prev) => ({ ...prev, eventType: event.target.value }))
                    }
                  >
                    <option value="STEP_COMPLETED">{simulatorEventLabels.STEP_COMPLETED}</option>
                    <option value="COMPONENT_INTERACTION">
                      {simulatorEventLabels.COMPONENT_INTERACTION}
                    </option>
                    <option value="FAULT_TRIGGERED">
                      {simulatorEventLabels.FAULT_TRIGGERED}
                    </option>
                  </select>
                </div>
                <button
                  className="rounded-full border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700"
                  type="button"
                  onClick={logEvent}
                >
                  Registrar actividad
                </button>
                <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <select
                    className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                    value={completion.status}
                    onChange={(event) =>
                      setCompletion((prev) => ({ ...prev, status: event.target.value }))
                    }
                  >
                    <option value="COMPLETED">{simulatorSessionStatusLabels.COMPLETED}</option>
                    <option value="FAILED">{simulatorSessionStatusLabels.FAILED}</option>
                    <option value="ABANDONED">{simulatorSessionStatusLabels.ABANDONED}</option>
                  </select>
                  <input
                    className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                    type="number"
                    min={0}
                    max={100}
                    value={completion.score}
                    onChange={(event) =>
                      setCompletion((prev) => ({ ...prev, score: event.target.value }))
                    }
                  />
                  <button
                    className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white"
                    type="button"
                    onClick={completeSession}
                  >
                    Finalizar sesion
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
                Inicia una actividad para ver las practicas y el contenido relacionado.
              </div>
            )}
          </DataPanel>
        </section>

        <section className="mt-6">
          <DataPanel title="Sesiones recientes">
            <SimpleTable
              columns={[
                {
                  key: "simulator",
                  header: "Simulador",
                  render: (item) => item.simulator?.name ?? "-",
                },
                {
                  key: "course",
                  header: "Curso",
                  render: (item) => item.enrollment?.course?.titleEs ?? "-",
                },
                {
                  key: "status",
                  header: "Estado",
                  render: (item) => simulatorSessionStatusLabels[item.status] ?? item.status,
                },
                { key: "score", header: "Puntaje", render: (item) => item.score ?? "-" },
                {
                  key: "startedAt",
                  header: "Inicio",
                  render: (item) => new Date(item.startedAt).toLocaleString("es-CO"),
                },
              ]}
              rows={sessions}
              emptyLabel="No hay sesiones registradas."
            />
          </DataPanel>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
