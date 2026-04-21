type BrandMarkProps = {
  compact?: boolean;
  subtitle?: string;
  theme?: "light" | "dark";
};

export function BrandMark({
  compact = false,
  subtitle = "Plataforma institucional de formacion tecnica",
  theme = "light",
}: BrandMarkProps) {
  const isDark = theme === "dark";
  const symbolClasses = isDark
    ? "border-white/15 bg-white/10 text-white"
    : "border-cloud bg-mist text-navy";
  const titleClasses = isDark ? "text-white" : "text-ink";
  const subtitleClasses = isDark ? "text-slate-300" : "text-slate-600";

  return (
    <div className="flex items-center gap-4">
      <div
        aria-hidden="true"
        className={`grid h-12 w-12 place-items-center rounded-2xl border ${symbolClasses} shadow-sm`}
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 18V6h3.2L15.8 14V6H19v12h-3.2L8.2 10v8H5Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div>
        <p className={`text-xl font-semibold tracking-[0.08em] ${titleClasses}`}>
          NOVOMEDIAlms
        </p>
        {!compact ? (
          <p className={`text-sm leading-6 ${subtitleClasses}`}>{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
