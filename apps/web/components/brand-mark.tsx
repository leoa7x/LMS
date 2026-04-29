import Image from "next/image";

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
  const wrapperClasses = isDark
    ? "inline-flex rounded-[24px] bg-white px-4 py-3 shadow-sm"
    : "inline-flex";
  const subtitleClasses = isDark ? "text-slate-300" : "text-slate-600";
  const width = compact ? 184 : 264;
  const height = compact ? 68 : 98;

  return (
    <div className="space-y-3">
      <div className={wrapperClasses}>
        <Image
          src="/brand/novomedialms-logo.png"
          alt="NOVOMEDIAlms"
          width={width}
          height={height}
          className="h-auto w-auto"
          priority={!compact}
        />
      </div>
      {!compact ? (
        <p className={`max-w-md text-sm leading-6 ${subtitleClasses}`}>{subtitle}</p>
      ) : null}
    </div>
  );
}
