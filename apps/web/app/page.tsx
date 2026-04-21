import Link from "next/link";
import { Shell } from "../components/shell";

const pillars = [
  "Cursos, lecciones y practicas por area tecnica",
  "Seguimiento individual del avance de cada estudiante",
  "Simuladores integrados dentro del portal",
  "Evaluaciones, actividades y resultados por curso",
];

export default function HomePage() {
  return (
    <Shell>
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-copper">
            Acceso institucional
          </p>
          <h2 className="mb-4 text-4xl font-semibold leading-tight text-ink">
            Bienvenido al portal de formacion tecnica.
          </h2>
          <p className="mb-6 max-w-2xl text-base leading-7 text-slate-600">
            Accede a cursos, contenidos, evaluaciones, progreso y practicas de
            simulacion desde una sola plataforma institucional.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
            >
              Ingresar al portal
            </Link>
            <Link
              href="/admin"
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-ink"
            >
              Ir a administracion
            </Link>
          </div>
        </article>
        <aside className="rounded-3xl border border-slate-200 bg-slate-950 p-8 text-slate-100 shadow-sm">
          <h3 className="mb-5 text-lg font-semibold">Servicios disponibles</h3>
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
