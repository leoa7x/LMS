"use client";

import { FormEvent, useEffect, useState } from "react";
import { DataPanel } from "../../../components/data-panel";
import { PortalShell } from "../../../components/portal-shell";
import { RoleGuard } from "../../../components/role-guard";
import { SimpleTable } from "../../../components/simple-table";
import { useAuth } from "../../../components/auth-provider";
import { apiRequest } from "../../../lib/client-api";

type QuizRow = { id: string; localizedTitle?: string; titleEs: string; kind: string };
type RetakeGrantRow = { quiz?: { titleEs?: string | null } | null; student?: { email?: string | null } | null; reason: string; maxExtraAttempts: number };

const quizKindLabels: Record<string, string> = {
  PRE_COURSE: "Prueba de entrada",
  PRE_MODULE: "Antes de iniciar el modulo",
  POST_COURSE: "Cierre del curso",
  PRACTICE_CHECK: "Comprobacion de practica",
};

export default function TeacherEvaluationsPage() {
  const { accessToken, user } = useAuth();
  const [lang, setLang] = useState("es");
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [retakeGrants, setRetakeGrants] = useState<RetakeGrantRow[]>([]);
  const [students, setStudents] = useState<Array<{ id: string; email: string }>>([]);
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
      apiRequest<RetakeGrantRow[]>("/quizzes/retake-grants", accessToken),
      apiRequest<Array<{ id: string; email: string }>>("/users", accessToken),
    ])
      .then(([quizzesData, retakeData, usersData]) => {
        setQuizzes(quizzesData);
        setRetakeGrants(retakeData);
        setStudents(usersData);
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
  }

  return (
    <PortalShell
      eyebrow="Docente"
      title="Evaluaciones y oportunidades adicionales"
      description="Consulta las evaluaciones de tus cursos y habilita nuevas oportunidades cuando sea necesario."
    >
      <RoleGuard roles={["TEACHER", "ADMIN"]}>
        <section className="mb-6 flex items-center justify-end">
          <select className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm" value={lang} onChange={(event)=>setLang(event.target.value)}>
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
        </section>
        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
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
              ]}
              rows={quizzes}
              emptyLabel="No hay evaluaciones disponibles."
            />
          </DataPanel>
          <DataPanel title="Habilitar una nueva oportunidad">
            <form className="grid gap-4" onSubmit={createRetakeGrant}>
              <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" value={grantForm.quizId} onChange={(event)=>setGrantForm((prev)=>({...prev,quizId:event.target.value}))}>
                <option value="">Selecciona una evaluacion</option>
                {quizzes.map((quiz)=>(
                  <option key={quiz.id} value={quiz.id}>{quiz.localizedTitle ?? quiz.titleEs}</option>
                ))}
              </select>
              <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" value={grantForm.studentId} onChange={(event)=>setGrantForm((prev)=>({...prev,studentId:event.target.value}))}>
                <option value="">Selecciona estudiante</option>
                {students.map((item)=>(
                  <option key={item.id} value={item.id}>{item.email}</option>
                ))}
              </select>
              <textarea className="min-h-28 rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Indica el motivo de esta habilitacion" value={grantForm.reason} onChange={(event)=>setGrantForm((prev)=>({...prev,reason:event.target.value}))}/>
              <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" type="number" min={1} value={grantForm.maxExtraAttempts} onChange={(event)=>setGrantForm((prev)=>({...prev,maxExtraAttempts:Number(event.target.value)}))}/>
              <button className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white" type="submit">Guardar habilitacion</button>
            </form>
          </DataPanel>
        </section>
        <section className="mt-6">
          <DataPanel title="Habilitaciones activas">
            <SimpleTable
              columns={[
                { key: "quiz", header: "Evaluacion", render: (item) => item.quiz?.titleEs ?? "-" },
                { key: "student", header: "Estudiante", render: (item) => item.student?.email ?? "-" },
                { key: "maxExtraAttempts", header: "Intentos extra", render: (item) => item.maxExtraAttempts },
                { key: "reason", header: "Motivo", render: (item) => item.reason },
              ]}
              rows={retakeGrants}
              emptyLabel="No hay habilitaciones activas."
            />
          </DataPanel>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
