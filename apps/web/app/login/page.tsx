"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/auth-provider";
import { BrandMark } from "../../components/brand-mark";
import { defaultRouteByRole, getPrimaryRole } from "../../lib/role-navigation";
import { SessionUser } from "../../lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("No fue posible iniciar sesion");
      }

      const data = (await response.json()) as {
        accessToken: string;
        refreshToken: string;
        user: SessionUser;
      };

      login({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      });

      const primaryRole = getPrimaryRole(data.user.roles);
      router.push(defaultRouteByRole[primaryRole]);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Fallo el inicio de sesion",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border border-navy/10 bg-navy px-8 py-10 text-white shadow-xl shadow-navy/10">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan">
            Acceso institucional
          </p>
          <div className="mt-6">
            <BrandMark theme="dark" />
          </div>
          <h1 className="mt-8 font-display text-4xl font-semibold leading-tight">
            Ingreso seguro para la gestion academica y tecnica.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
            Accede a cursos, seguimiento, evaluaciones, simuladores y servicios
            de soporte desde un entorno institucional unificado.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-slate-200">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              Administracion academica y operativa en un solo portal.
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              Acceso por rol para administradores, docentes, estudiantes y soporte.
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              Seguimiento, evaluacion y simulacion dentro de la misma plataforma.
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-xl rounded-[2rem] border border-cloud bg-white p-8 shadow-sm">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-steel">
              Portal de acceso
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold text-ink">
              Iniciar sesion
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Ingresa con tu cuenta institucional para acceder a tus funciones y
              servicios disponibles.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Correo</span>
              <input
                className="w-full rounded-2xl border border-cloud px-4 py-3 outline-none transition focus:border-navy"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="correo@institucion.edu"
                type="email"
                value={email}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Clave</span>
              <input
                className="w-full rounded-2xl border border-cloud px-4 py-3 outline-none transition focus:border-navy"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                type="password"
                value={password}
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <button
              className="w-full rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Ingresando..." : "Iniciar sesion"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
