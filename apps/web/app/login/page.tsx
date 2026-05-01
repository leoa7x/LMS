"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/auth-provider";
import { BrandMark } from "../../components/brand-mark";
import { defaultRouteByRole, getPrimaryRole } from "../../lib/role-navigation";
import {
  AUTH_REASON_STORAGE_KEY,
  LOGIN_LANG_STORAGE_KEY,
  SessionUser,
} from "../../lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

const loginCopy = {
  es: {
    eyebrow: "Acceso institucional",
    title: "Ingreso seguro al portal tecnico",
    description:
      "Accede con tu cuenta institucional para consultar tus cursos, actividades, progreso y servicios disponibles.",
    helperOne: "Consulta tus recursos, actividades y servicios desde un solo acceso institucional.",
    helperTwo: "Ingresa con el perfil asignado a tus funciones dentro de la plataforma.",
    helperThree: "Mantén continuidad en tu trabajo académico y técnico desde un entorno unificado.",
    formEyebrow: "Inicio de sesion",
    formTitle: "Ingresar al portal",
    formDescription:
      "Completa tus datos para acceder a tus funciones dentro de NOVOMEDIAlms.",
    emailLabel: "Correo institucional",
    emailPlaceholder: "correo@institucion.edu",
    passwordLabel: "Clave de acceso",
    passwordPlaceholder: "Ingresa tu clave",
    showPassword: "Mostrar",
    hidePassword: "Ocultar",
    signIn: "Ingresar",
    loading: "Verificando acceso...",
    invalidEmail: "Ingresa un correo valido.",
    passwordRequired: "Ingresa tu clave de acceso.",
    expired:
      "Tu sesion anterior vencio. Ingresa nuevamente para continuar.",
    invalidCredentials:
      "No fue posible iniciar sesion con los datos proporcionados.",
    inactiveUser:
      "Tu cuenta no se encuentra habilitada en este momento. Consulta con tu institucion.",
    inactiveMembership:
      "Tu acceso institucional no esta disponible en este momento por vigencia o estado de habilitacion.",
    concurrencyLimit:
      "El limite de accesos simultaneos ya fue alcanzado. Intenta nuevamente en unos minutos.",
    licenseLimit:
      "El cupo de acceso disponible ya fue alcanzado. Consulta con tu institucion o con soporte.",
    missingRole:
      "Tu cuenta no tiene un perfil activo para ingresar al portal.",
    genericError:
      "No fue posible iniciar sesion en este momento. Intenta nuevamente.",
  },
  en: {
    eyebrow: "Institutional access",
    title: "Secure access to the technical portal",
    description:
      "Sign in with your institutional account to review your courses, activities, progress, and available services.",
    helperOne:
      "Review your learning resources, activities, and services from a single institutional portal.",
    helperTwo:
      "Enter with the profile assigned to your responsibilities inside the platform.",
    helperThree:
      "Keep your academic and technical work moving from one unified environment.",
    formEyebrow: "Sign in",
    formTitle: "Access the portal",
    formDescription:
      "Enter your information to continue to your assigned workspace in NOVOMEDIAlms.",
    emailLabel: "Institutional email",
    emailPlaceholder: "email@institution.edu",
    passwordLabel: "Access password",
    passwordPlaceholder: "Enter your password",
    showPassword: "Show",
    hidePassword: "Hide",
    signIn: "Sign in",
    loading: "Checking access...",
    invalidEmail: "Enter a valid email address.",
    passwordRequired: "Enter your access password.",
    expired: "Your previous session expired. Sign in again to continue.",
    invalidCredentials:
      "Sign-in was not possible with the information provided.",
    inactiveUser:
      "Your account is not enabled at the moment. Contact your institution.",
    inactiveMembership:
      "Your institutional access is not available at the moment because of status or validity.",
    concurrencyLimit:
      "The concurrent access limit has already been reached. Try again in a few minutes.",
    licenseLimit:
      "The available access capacity has already been reached. Contact your institution or support.",
    missingRole:
      "Your account does not have an active profile to enter the portal.",
    genericError: "Sign-in is not available right now. Please try again.",
  },
} as const;

type LoginLanguage = keyof typeof loginCopy;

function mapLoginError(message: string, lang: LoginLanguage) {
  const copy = loginCopy[lang];

  if (message.includes("Invalid credentials")) {
    return copy.invalidCredentials;
  }

  if (message.includes("User is not active")) {
    return copy.inactiveUser;
  }

  if (message.includes("active institutional membership")) {
    return copy.inactiveMembership;
  }

  if (message.includes("Contract concurrent access limit reached")) {
    return copy.concurrencyLimit;
  }

  if (message.includes("License seat limit reached")) {
    return copy.licenseLimit;
  }

  if (message.includes("active role assignments")) {
    return copy.missingRole;
  }

  return copy.genericError;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<LoginLanguage>("es");
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedLang = window.localStorage.getItem(
      LOGIN_LANG_STORAGE_KEY,
    ) as LoginLanguage | null;

    if (storedLang === "es" || storedLang === "en") {
      setLang(storedLang);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const reason = new URLSearchParams(window.location.search).get("reason");
    const storedReason = window.sessionStorage.getItem(AUTH_REASON_STORAGE_KEY);

    if (reason === "expired" || storedReason === "expired") {
      setInfoMessage(loginCopy[lang].expired);
      window.sessionStorage.removeItem(AUTH_REASON_STORAGE_KEY);
    } else {
      setInfoMessage(null);
    }
  }, [lang]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(LOGIN_LANG_STORAGE_KEY, lang);
  }, [lang]);

  const copy = loginCopy[lang];

  const emailError = useMemo(() => {
    if (!email) {
      return null;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? null
      : copy.invalidEmail;
  }, [copy.invalidEmail, email]);

  const passwordError = useMemo(() => {
    if (!password) {
      return null;
    }

    return password.trim().length > 0 ? null : copy.passwordRequired;
  }, [copy.passwordRequired, password]);

  const isFormValid =
    email.trim().length > 0 &&
    password.trim().length > 0 &&
    !emailError &&
    !passwordError;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isFormValid) {
      setError(emailError ?? passwordError ?? copy.genericError);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setInfoMessage(null);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let errorMessage = "";

        try {
          const payload = (await response.json()) as { message?: string | string[] };
          errorMessage = Array.isArray(payload.message)
            ? payload.message[0] ?? ""
            : payload.message ?? "";
        } catch {
          errorMessage = await response.text();
        }

        throw new Error(mapLoginError(errorMessage, lang));
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
        submitError instanceof Error ? submitError.message : copy.genericError,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-mist px-6 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border border-navy/10 bg-navy px-8 py-10 text-white shadow-xl shadow-navy/10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan">
                {copy.eyebrow}
              </p>
              <div className="mt-6">
                <BrandMark theme="dark" />
              </div>
            </div>

            <div className="inline-flex rounded-full border border-white/15 bg-white/5 p-1">
              {(["es", "en"] as const).map((option) => {
                const isActive = lang === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setLang(option)}
                    className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                      isActive
                        ? "bg-white text-navy"
                        : "text-slate-200 hover:text-white"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <h1 className="mt-8 font-display text-4xl font-semibold leading-tight">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-200">
            {copy.description}
          </p>

          <div className="mt-8 grid gap-4">
            {[copy.helperOne, copy.helperTwo, copy.helperThree].map((text) => (
              <div
                key={text}
                className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm leading-6 text-slate-200"
              >
                {text}
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-xl rounded-[2rem] border border-cloud bg-white p-8 shadow-sm">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-steel">
              {copy.formEyebrow}
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold text-ink">
              {copy.formTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {copy.formDescription}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                {copy.emailLabel}
              </span>
              <input
                className={`w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-navy ${
                  emailError ? "border-rose-300 bg-rose-50/40" : "border-cloud"
                }`}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError(null);
                }}
                placeholder={copy.emailPlaceholder}
                type="email"
                value={email}
                autoComplete="email"
              />
              {emailError ? (
                <p className="mt-2 text-sm text-rose-700">{emailError}</p>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                {copy.passwordLabel}
              </span>
              <div className="relative">
                <input
                  className={`w-full rounded-2xl border px-4 py-3 pr-24 outline-none transition focus:border-navy ${
                    passwordError ? "border-rose-300 bg-rose-50/40" : "border-cloud"
                  }`}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError(null);
                  }}
                  placeholder={copy.passwordPlaceholder}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-2 right-2 rounded-full border border-cloud px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300"
                >
                  {showPassword ? copy.hidePassword : copy.showPassword}
                </button>
              </div>
              {passwordError ? (
                <p className="mt-2 text-sm text-rose-700">{passwordError}</p>
              ) : null}
            </label>

            {infoMessage ? (
              <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                {infoMessage}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <button
              className="w-full rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting || !isFormValid}
              type="submit"
            >
              {isSubmitting ? copy.loading : copy.signIn}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
