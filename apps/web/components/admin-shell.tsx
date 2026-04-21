import Link from "next/link";
import { ReactNode } from "react";

const navigation = [
  { href: "/admin", label: "Panel principal" },
  { href: "/admin/academic", label: "Oferta academica" },
  { href: "/admin/content", label: "Recursos de aprendizaje" },
  { href: "/admin/enrollments", label: "Inscripciones" },
  { href: "/admin/users", label: "Usuarios" },
  { href: "/admin/simulators", label: "Simuladores" },
  { href: "/admin/audit", label: "Actividad y accesos" },
];

type AdminShellProps = {
  title: string;
  eyebrow: string;
  description: string;
  children: ReactNode;
};

export function AdminShell({
  title,
  eyebrow,
  description,
  children,
}: AdminShellProps) {
  return (
    <main className="min-h-screen bg-[#f3efe8] text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-slate-200 bg-[#fcfbf8] px-6 py-8">
          <div className="mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-amber-700">
              Instituto Profesional y Tecnico de Veraguas
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              Gestion institucional
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Administra usuarios, oferta academica, inscripciones y seguimiento
              desde un solo lugar.
            </p>
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl border border-transparent px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-200 hover:bg-white hover:text-slate-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Vista general
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Aqui puedes supervisar el acceso a la plataforma, la actividad academica
              y la operacion institucional.
            </p>
          </div>
        </aside>

        <section className="px-6 py-8 lg:px-10">
          <header className="mb-8 rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
              {eyebrow}
            </p>
            <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
                  {title}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </div>
              <div className="flex gap-3 text-sm">
                <Link
                  href="/"
                  className="rounded-full border border-slate-300 px-4 py-2 font-medium text-slate-700"
                >
                  Ir al inicio
                </Link>
                <Link
                  href="/login"
                  className="rounded-full bg-slate-950 px-4 py-2 font-medium text-white"
                >
                  Ingresar
                </Link>
              </div>
            </div>
          </header>
          {children}
        </section>
      </div>
    </main>
  );
}
