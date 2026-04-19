import { Shell } from "../../components/shell";

export default function StudentPage() {
  return (
    <Shell>
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-4 text-2xl font-semibold text-ink">Dashboard estudiante</h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Vista inicial del estudiante para consumo de cursos, practicas, quizzes,
          glosario y sesiones de simulador integradas.
        </p>
      </section>
    </Shell>
  );
}
