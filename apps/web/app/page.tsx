import Link from "next/link";
import { BrandMark } from "../components/brand-mark";
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
        <article className="rounded-3xl border border-cloud bg-white p-8 shadow-sm">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-navy">
            Plataforma institucional
          </p>
          <div className="mb-6">
            <BrandMark subtitle="Formacion tecnica, seguimiento academico y simulacion en una sola plataforma." />
          </div>
          <h2 className="mb-4 font-display text-4xl font-semibold leading-tight text-ink">
            Gestion academica y aprendizaje tecnico con identidad institucional.
          </h2>
          <p className="mb-6 max-w-2xl text-base leading-7 text-slate-600">
            Organiza la oferta academica, acompana el progreso del estudiante y
            accede a practicas de simulacion desde un entorno unificado.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-full bg-navy px-5 py-3 text-sm font-medium text-white"
            >
              Ingresar al portal
            </Link>
            <Link
              href="/admin"
              className="rounded-full border border-cloud px-5 py-3 text-sm font-medium text-ink"
            >
              Ir a administracion
            </Link>
          </div>
        </article>
        <aside className="rounded-3xl border border-navy bg-navy p-8 text-slate-100 shadow-sm">
          <h3 className="mb-5 font-display text-lg font-semibold">Servicios disponibles</h3>
          <ul className="space-y-4 text-sm leading-6 text-slate-300">
            {pillars.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </Shell>
  );
}
