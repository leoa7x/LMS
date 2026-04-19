import Link from "next/link";
import { Shell } from "../components/shell";

const pillars = [
  "Cursos, modulos, lecciones y practicas tecnicas",
  "Seguimiento individual de avance por estudiante",
  "Simuladores embebidos y propios dentro del portal",
  "Quizzes pre-curso, pre-modulo y post-curso",
];

export default function HomePage() {
  return (
    <Shell>
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-copper">
            Fase 1
          </p>
          <h2 className="mb-4 text-4xl font-semibold leading-tight text-ink">
            Base real para un LMS tecnico, no una demo escolar.
          </h2>
          <p className="mb-6 max-w-2xl text-base leading-7 text-slate-600">
            Esta base deja preparado el monorepo, la API, el portal web, Prisma,
            PostgreSQL y la arquitectura de modulos que sostendra cursos, glosario,
            progreso, evaluaciones y simuladores.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
            >
              Ir a login
            </Link>
            <Link
              href="/admin"
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-ink"
            >
              Ver dashboard admin
            </Link>
          </div>
        </article>
        <aside className="rounded-3xl border border-slate-200 bg-slate-950 p-8 text-slate-100 shadow-sm">
          <h3 className="mb-5 text-lg font-semibold">Pilares ya previstos</h3>
          <ul className="space-y-4 text-sm leading-6 text-slate-300">
            {pillars.map((item) => (
              <li key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </Shell>
  );
}
