import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  align?: "left" | "center";
}

export function SectionHeader({ eyebrow, title, subtitle, children, align = "left" }: Props) {
  const { dir } = useI18n();
  const alignCls = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`max-w-3xl ${alignCls}`} dir={dir}>
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.22em] text-accent font-semibold mb-3">
          <span className="inline-block h-px w-6 bg-accent align-middle mr-2 rtl:mr-0 rtl:ml-2" />
          {eyebrow}
        </p>
      )}
      <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground leading-tight text-balance">
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-base text-muted-foreground text-pretty">{subtitle}</p>}
      {children}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  const { dir } = useI18n();
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary/60 to-background border-b border-border/40">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--color-foreground) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24" dir={dir}>
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.22em] text-accent font-semibold mb-4">
            <span className="inline-block h-px w-8 bg-accent align-middle mr-2 rtl:mr-0 rtl:ml-2" />
            {eyebrow}
          </p>
        )}
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-[1.05] max-w-4xl text-balance">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl text-pretty">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
