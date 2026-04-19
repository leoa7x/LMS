import { Shell } from "../../components/shell";

export default function LoginPage() {
  return (
    <Shell>
      <section className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-2 text-2xl font-semibold text-ink">Acceso al portal</h2>
        <p className="mb-8 text-sm leading-6 text-slate-600">
          Punto de entrada del LMS tecnico. El backend ya expone autenticacion JWT y
          refresh token.
        </p>

        <form className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Correo</span>
            <input
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-copper"
              placeholder="admin@lms.local"
              type="email"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Clave</span>
            <input
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-copper"
              placeholder="********"
              type="password"
            />
          </label>

          <button
            className="rounded-full bg-copper px-5 py-3 text-sm font-semibold text-white"
            type="submit"
          >
            Iniciar sesion
          </button>
        </form>
      </section>
    </Shell>
  );
}
