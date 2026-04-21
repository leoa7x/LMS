import Link from "next/link";
import { ReactNode } from "react";
import { BrandMark } from "./brand-mark";

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
    <main className="min-h-screen bg-mist text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-white/10 bg-navy px-6 py-8 text-white">
          <div className="mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-sky-200">
              Instituto Profesional y Tecnico de Veraguas
            </p>
            <div className="mt-4">
              <BrandMark compact theme="dark" />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Administra usuarios, oferta academica, inscripciones y seguimiento
              desde un solo lugar.
            </p>
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl border border-transparent px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-white/10 hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-100">
              Vista general
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Aqui puedes supervisar el acceso a la plataforma, la actividad academica
              y la operacion institucional.
            </p>
          </div>
        </aside>

        <section className="px-6 py-8 lg:px-10">
          <header className="mb-8 rounded-3xl border border-cloud bg-white px-6 py-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-navy">
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
                  className="rounded-full border border-cloud px-4 py-2 font-medium text-steel"
                >
                  Ir al inicio
                </Link>
                <Link
                  href="/login"
                  className="rounded-full bg-navy px-4 py-2 font-medium text-white"
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
