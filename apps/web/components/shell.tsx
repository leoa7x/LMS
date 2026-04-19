import Link from "next/link";
import { ReactNode } from "react";

type ShellProps = {
  children: ReactNode;
};

export function Shell({ children }: ShellProps) {
  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-copper">
                Instituto Profesional y Tecnico de Veraguas
              </p>
              <h1 className="text-3xl font-semibold text-ink">LMS Tecnico</h1>
            </div>
            <nav className="flex gap-3 text-sm text-steel">
              <Link href="/">Inicio</Link>
              <Link href="/login">Login</Link>
              <Link href="/admin">Admin</Link>
              <Link href="/teacher">Docente</Link>
              <Link href="/student">Estudiante</Link>
            </nav>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            Plataforma academica tecnica con contenidos especializados, evaluaciones y
            estructura de simuladores integrados.
          </p>
        </header>
        {children}
      </div>
    </main>
  );
}
