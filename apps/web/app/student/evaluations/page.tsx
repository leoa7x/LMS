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
  questions?: Array<{
    id: string;
    localizedPrompt?: string;
    promptEs: string;
    options?: Array<{
      id: string;
      localizedLabel?: string;
      labelEs: string;
    }>;
  }>;
};

const quizKindLabels: Record<string, string> = {
  PRE_COURSE: "Prueba de entrada",
  PRE_MODULE: "Antes de iniciar el modulo",
  POST_COURSE: "Cierre del curso",
  MODULE_CHECKPOINT: "Comprobacion del modulo",
  PRACTICE_CHECK: "Comprobacion de practica",
};

export default function StudentEvaluationsPage() {
  const { accessToken, user } = useAuth();
  const [lang, setLang] = useState("es");
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    apiRequest<QuizRow[]>(`/quizzes?lang=${lang}`, accessToken)
      .then(setQuizzes)
      .catch(() => setQuizzes([]));
  }, [accessToken, lang]);

  const selectedQuiz = quizzes.find((quiz) => quiz.id === selectedQuizId) ?? null;

  async function submitQuiz(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !user || !selectedQuiz) return;

    const response = await apiRequest<{ score: number; isPassed: boolean }>(
      "/quizzes/attempts",
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({
          quizId: selectedQuiz.id,
          userId: user.id,
          answers: (selectedQuiz.questions ?? []).map((question) => ({
            questionId: question.id,
            answerOptionId: selectedAnswers[question.id],
          })),
        }),
      },
    );

    setResultMessage(
      `Resultado obtenido: ${response.score} puntos. ${
        response.isPassed ? "Actividad aprobada." : "Actividad no aprobada."
      }`,
    );
  }

  return (
    <PortalShell
      eyebrow="Estudiante"
      title="Evaluaciones activas"
      description="Responde las evaluaciones disponibles en tus cursos y consulta el resultado de cada intento."
    >
      <RoleGuard roles={["STUDENT", "ADMIN"]}>
        <section className="mb-6 flex items-center justify-end">
          <select className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm" value={lang} onChange={(event)=>setLang(event.target.value)}>
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
        </section>
        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
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
            <select className="mt-4 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" value={selectedQuizId} onChange={(event)=>{setSelectedQuizId(event.target.value); setSelectedAnswers({}); setResultMessage(null);}}>
              <option value="">Selecciona una evaluacion</option>
              {quizzes.map((quiz)=>(
                <option key={quiz.id} value={quiz.id}>{quiz.localizedTitle ?? quiz.titleEs}</option>
              ))}
            </select>
          </DataPanel>
          <DataPanel title="Responder evaluacion">
            {selectedQuiz ? (
              <form className="grid gap-5" onSubmit={submitQuiz}>
                {(selectedQuiz.questions ?? []).map((question) => (
                  <div key={question.id} className="rounded-2xl border border-slate-200 p-4">
                    <p className="mb-3 text-sm font-medium text-slate-900">
                      {question.localizedPrompt ?? question.promptEs}
                    </p>
                    <div className="grid gap-2">
                      {(question.options ?? []).map((option) => (
                        <label key={option.id} className="flex items-center gap-3 text-sm text-slate-700">
                          <input
                            checked={selectedAnswers[question.id] === option.id}
                            name={question.id}
                            onChange={() =>
                              setSelectedAnswers((prev) => ({
                                ...prev,
                                [question.id]: option.id,
                              }))
                            }
                            type="radio"
                          />
                          {option.localizedLabel ?? option.labelEs}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                {resultMessage ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    {resultMessage}
                  </div>
                ) : null}
                <button className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white" type="submit">
                  Enviar respuestas
                </button>
              </form>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
                Selecciona una evaluacion disponible para comenzar.
              </div>
            )}
          </DataPanel>
        </section>
      </RoleGuard>
    </PortalShell>
  );
}
