type MetricCardProps = {
  label: string;
  value: string | number;
  hint: string;
};

export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <article className="rounded-3xl border border-cloud bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-steel">
        {label}
      </p>
      <p className="mt-4 font-display text-4xl font-semibold tracking-tight text-navy">
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{hint}</p>
    </article>
  );
}
