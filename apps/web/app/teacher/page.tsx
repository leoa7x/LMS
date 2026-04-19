import { Shell } from "../../components/shell";

export default function TeacherPage() {
  return (
    <Shell>
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-4 text-2xl font-semibold text-ink">Dashboard docente</h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Vista inicial para administracion de cursos, asignacion de contenido por
          nivel, autorizacion de reintentos y seguimiento por estudiante.
        </p>
      </section>
    </Shell>
  );
}
