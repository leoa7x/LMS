"use client";

import { FormEvent, useEffect, useState } from "react";
import { DataPanel } from "../../../components/data-panel";
import { PortalShell } from "../../../components/portal-shell";
import { RoleGuard } from "../../../components/role-guard";
import { SimpleTable } from "../../../components/simple-table";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest } from "../../../lib/client-api";

type QuizRow = {
  id: string;
  kind: string;
  localizedTitle?: string;
  titleEs: string;
  maxAttempts: number;
  passingScore: number;
  course?: { localizedTitle?: string; titleEs?: string } | null;
  module?: { localizedTitle?: string; titleEs?: string } | null;
};

type AttemptRow = {
  id: string;
  score?: number | null;
  isPassed?: boolean | null;
  attemptNumber: number;
  attemptSource: string;
  user?: { email?: string | null } | null;
  quiz?: { titleEs?: string | null } | null;
};

type RetakeGrantRow = {
  id: string;
  reason: string;
  maxExtraAttempts: number;
  student?: { email?: string | null } | null;
  quiz?: { titleEs?: string | null } | null;
};

const quizKindLabels: Record<string, string> = {
  PRE_COURSE: "Diagnostico inicial",
  PRE_MODULE: "Preparacion de modulo",
  POST_COURSE: "Cierre de curso",
  PRACTICE_CHECK: "Verificacion de practica",
};

const attemptSourceLabels: Record<string, string> = {
  STANDARD: "Intento regular",
  RETAKE_OVERRIDE: "Intento autorizado",
};

export default function AdminEvaluationsPage() {
  const { accessToken, user } = useAuth();
  const [lang, setLang] = useState("es");
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [retakeGrants, setRetakeGrants] = useState<RetakeGrantRow[]>([]);
  const [users, setUsers] = useState<Array<{ id: string; email: string }>>([]);
  const [grantForm, setGrantForm] = useState({
    quizId: "",
    studentId: "",
    reason: "",
    maxExtraAttempts: 1,
  });

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([
      apiRequest<QuizRow[]>(`/quizzes?lang=${lang}`, accessToken),
      apiRequest<AttemptRow[]>("/quizzes/attempts", accessToken),
      apiRequest<RetakeGrantRow[]>("/quizzes/retake-grants", accessToken),
      apiRequest<Array<{ id: string; email: string }>>("/users", accessToken),
    ])
      .then(([quizzesData, attemptsData, retakeData, usersData]) => {
        setQuizzes(quizzesData);
        setAttempts(attemptsData);
        setRetakeGrants(retakeData);
        setUsers(usersData);
      })
      .catch(() => undefined);
  }, [accessToken, lang]);

  async function createRetakeGrant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !user) return;
    await apiRequest("/quizzes/retake-grants", accessToken, {
      method: "POST",
      body: JSON.stringify({
        ...grantForm,
        grantedByUserId: user.id,
      }),
    });
    setRetakeGrants(await apiRequest<RetakeGrantRow[]>("/quizzes/retake-grants", accessToken));
    setGrantForm({ quizId: "", studentId: "", reason: "", maxExtraAttempts: 1 });
  }

  return (
    <PortalShell
      eyebrow="Evaluaciones"
      title="Evaluaciones e intentos"
      description="Consulta las evaluaciones disponibles, revisa intentos y autoriza nuevas oportunidades cuando corresponda."
    >
      <RoleGuard roles={["ADMIN", "TEACHER"]}>
        <section className="mb-6 flex items-center justify-end">
          <select className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm" value={lang} onChange={(event)=>setLang(event.target.value)}>
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
        </section>
        <section className="grid gap-6">
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <DataPanel title="Evaluaciones disponibles">
              <SimpleTable
                columns={[
                  {
                    key: "title",
                    header: "Evaluacion",
                    render: (item) => item.localizedTitle ?? item.titleEs,
                  },
                  {
                    key: "kind",
                    header: "Tipo",
                    render: (item) => quizKindLabels[item.kind] ?? "Evaluacion academica",
                  },
                  { key: "scope", header: "Contexto", render: (item) => item.course?.localizedTitle ?? item.course?.titleEs ?? item.module?.localizedTitle ?? item.module?.titleEs ?? "-" },
                  { key: "maxAttempts", header: "Intentos", render: (item) => item.maxAttempts },
                  { key: "passingScore", header: "Puntaje minimo", render: (item) => item.passingScore },
                ]}
                rows={quizzes}
                emptyLabel="No hay evaluaciones disponibles."
              />
            </DataPanel>
            <DataPanel title="Autorizar nueva oportunidad">
              <form className="grid gap-4" onSubmit={createRetakeGrant}>
                <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" value={grantForm.quizId} onChange={(event)=>setGrantForm((prev)=>({...prev,quizId:event.target.value}))}>
                  <option value="">Selecciona una evaluacion</option>
                  {quizzes.map((quiz)=>(
                    <option key={quiz.id} value={quiz.id}>{quiz.localizedTitle ?? quiz.titleEs}</option>
                  ))}
                </select>
                <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" value={grantForm.studentId} onChange={(event)=>setGrantForm((prev)=>({...prev,studentId:event.target.value}))}>
                  <option value="">Selecciona estudiante</option>
                  {users.map((item)=>(
                    <option key={item.id} value={item.id}>{item.email}</option>
                  ))}
                </select>
                <textarea className="min-h-28 rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Motivo de la autorizacion" value={grantForm.reason} onChange={(event)=>setGrantForm((prev)=>({...prev,reason:event.target.value}))}/>
                <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" type="number" min={1} value={grantForm.maxExtraAttempts} onChange={(event)=>setGrantForm((prev)=>({...prev,maxExtraAttempts:Number(event.target.value)}))}/>
                <button className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white" type="submit">Crear autorizacion</button>
              </form>
            </DataPanel>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <DataPanel title="Intentos">
              <SimpleTable
                columns={[
                  { key: "quiz", header: "Evaluacion", render: (item) => item.quiz?.titleEs ?? "-" },
                  { key: "user", header: "Usuario", render: (item) => item.user?.email ?? "-" },
                  { key: "attemptNumber", header: "#", render: (item) => item.attemptNumber },
                  { key: "score", header: "Puntaje", render: (item) => item.score ?? "-" },
                  {
                    key: "attemptSource",
                    header: "Origen",
                    render: (item) => attemptSourceLabels[item.attemptSource] ?? item.attemptSource,
                  },
                ]}
                rows={attempts}
                emptyLabel="No hay intentos visibles."
              />
            </DataPanel>
            <DataPanel title="Autorizaciones activas">
              <SimpleTable
                columns={[
                  { key: "quiz", header: "Evaluacion", render: (item) => item.quiz?.titleEs ?? "-" },
                  { key: "student", header: "Estudiante", render: (item) => item.student?.email ?? "-" },
                  { key: "maxExtraAttempts", header: "Extra", render: (item) => item.maxExtraAttempts },
                  { key: "reason", header: "Motivo", render: (item) => item.reason },
                ]}
                rows={retakeGrants}
                emptyLabel="No hay autorizaciones activas."
              />
            </DataPanel>
          </div>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
