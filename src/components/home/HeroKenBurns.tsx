import { useEffect, useState } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import { cn } from "@/lib/utils";

const slides = [hero1, hero2, hero3];

export function HeroKenBurns() {
  const { t, dir } = useI18n();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % slides.length), 5500);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative h-[92vh] min-h-[560px] w-full overflow-hidden">
      {slides.map((src, i) => (
        <div
          key={src}
          className={cn(
            "absolute inset-0 transition-opacity duration-[1400ms] ease-in-out",
            i === idx ? "opacity-100" : "opacity-0",
          )}
          aria-hidden={i !== idx}
        >
          <img
            src={src}
            alt=""
            width={1920}
            height={1080}
            className={cn(
              "h-full w-full object-cover",
              i === idx && "ken-burns",
            )}
            // first slide is LCP — eager load
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : undefined}
          />
        </div>
      ))}

      <div className="absolute inset-0 gradient-hero-overlay" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-end pb-20 sm:pb-28">
        <div className="max-w-3xl text-primary-foreground" dir={dir}>
          <p className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-accent mb-6 animate-fade-in">
            <span className="h-px w-8 bg-accent inline-block" />
            {t("hero.eyebrow")}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] text-balance animate-fade-up">
            {t("hero.title")}
          </h1>
          <p className="mt-6 text-base sm:text-lg text-primary-foreground/85 max-w-2xl text-pretty animate-fade-up [animation-delay:120ms]">
            {t("hero.subtitle")}
          </p>
          <div className="mt-9 flex flex-wrap gap-3 animate-fade-up [animation-delay:220ms]">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-elegant hover:scale-[1.02] transition-transform"
            >
              <BookOpen className="h-4 w-4" />
              {t("hero.cta.events")}
            </Link>
            <Link
              to="/publications"
              className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/5 backdrop-blur px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/15 transition-colors"
            >
              {t("hero.cta.publications")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>

          <div className="mt-12 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Slide ${i + 1}`}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  i === idx ? "w-10 bg-accent" : "w-5 bg-primary-foreground/40 hover:bg-primary-foreground/70",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
