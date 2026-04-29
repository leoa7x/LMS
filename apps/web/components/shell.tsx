import Link from "next/link";
import { ReactNode } from "react";
import { BrandMark } from "./brand-mark";

type ShellProps = {
  children: ReactNode;
};

export function Shell({ children }: ShellProps) {
  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-4 rounded-3xl border border-cloud bg-white/95 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-navy">
                Plataforma institucional de formacion tecnica y simulacion
              </p>
              <BrandMark compact subtitle="Portal institucional" />
            </div>
            <nav className="flex gap-3 text-sm text-steel">
              <Link href="/">Inicio</Link>
              <Link href="/login">Ingresar</Link>
              <Link href="/admin">Administracion</Link>
              <Link href="/teacher">Docente</Link>
              <Link href="/student">Estudiante</Link>
            </nav>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            Gestiona cursos, evaluaciones, practicas, simuladores y seguimiento
            academico desde una experiencia unificada para administradores, docentes
            y estudiantes.
          </p>
        </header>
        {children}
      </div>
    </main>
  );
}
