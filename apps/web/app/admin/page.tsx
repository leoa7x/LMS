import { Shell } from "../../components/shell";

const items = [
  "Gestion de usuarios y roles",
  "Instituciones y vigencias",
  "Catalogo academico",
  "Supervision de simuladores e integraciones",
];

export default function AdminPage() {
  return (
    <Shell>
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-semibold text-ink">Dashboard administrador</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <article key={item} className="rounded-2xl border border-slate-200 p-5">
              <p className="text-sm font-medium text-slate-800">{item}</p>
            </article>
          ))}
        </div>
      </section>
    </Shell>
  );
}
