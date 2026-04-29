"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "../../components/shell";
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
    <Shell compactHeader showNavigation={false}>
      <section className="mx-auto max-w-xl rounded-3xl border border-cloud bg-white p-8 shadow-sm">
        <div className="mb-8 border-b border-cloud pb-6">
          <BrandMark subtitle="Ingreso institucional para administradores, docentes, estudiantes y equipos de soporte." />
        </div>
        <h2 className="mb-2 font-display text-2xl font-semibold text-ink">
          Acceso al portal
        </h2>
        <p className="mb-8 text-sm leading-6 text-slate-600">
          Ingresa con tu cuenta institucional para acceder a tus funciones y
          servicios disponibles.
        </p>

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
            className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Ingresando..." : "Iniciar sesion"}
          </button>
        </form>
      </section>
    </Shell>
  );
}
