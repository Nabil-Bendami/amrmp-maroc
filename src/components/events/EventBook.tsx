import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Calendar } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { EventRow } from "@/services/content";
import { cn } from "@/lib/utils";

interface Props {
  events: EventRow[];
  autoFlipMs?: number;
}

/**
 * 3D book-flip component. Shows one event "spread" at a time.
 * Auto-advances every `autoFlipMs` (default 5000) with a CSS preserve-3d page-turn animation.
 */
export function EventBook({ events, autoFlipMs = 5000 }: Props) {
  const { t, lang, dir } = useI18n();
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || events.length <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % events.length), autoFlipMs);
    return () => clearInterval(id);
  }, [paused, events.length, autoFlipMs]);

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
        {t("common.empty.events")}
      </div>
    );
  }

  const ev = events[idx];
  const title = (lang === "ar" && ev.title_ar) || ev.title_fr;
  const summary = (lang === "ar" && ev.summary_ar) || ev.summary_fr;
  const date = ev.event_date
    ? new Date(ev.event_date).toLocaleDateString(lang === "ar" ? "ar-MA" : "fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const next = () => setIdx((i) => (i + 1) % events.length);
  const prev = () => setIdx((i) => (i - 1 + events.length) % events.length);

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      dir={dir}
    >
      {/* Book stage */}
      <div className="perspective-1200 mx-auto max-w-5xl">
        <div className="relative rounded-2xl shadow-elegant bg-card overflow-hidden aspect-[16/10] sm:aspect-[16/9]">
          {/* Spine highlight */}
          <div
            aria-hidden
            className="hidden md:block absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-foreground/10 to-transparent z-20 pointer-events-none"
          />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={ev.id}
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
              className="absolute inset-0 preserve-3d origin-left"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="grid h-full grid-cols-1 md:grid-cols-2">
                {/* Left page — image */}
                <div className="relative bg-muted overflow-hidden">
                  {ev.image_url && (
                    <img
                      src={ev.image_url}
                      alt={title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
                </div>
                {/* Right page — text */}
                <div className="relative p-6 sm:p-10 flex flex-col justify-between bg-card">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-accent font-semibold">
                      {t("admin.section.events")}
                    </p>
                    <h3 className="mt-3 font-serif text-2xl sm:text-3xl font-semibold text-foreground leading-tight text-balance">
                      {title}
                    </h3>
                    {summary && (
                      <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed text-pretty line-clamp-6">
                        {summary}
                      </p>
                    )}
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                    {date && (
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        {date}
                      </span>
                    )}
                    {ev.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {ev.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          onClick={prev}
          className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-border bg-background hover:bg-secondary shadow-soft transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
        </button>
        <div className="flex items-center gap-2">
          {events.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === idx ? "w-8 bg-primary" : "w-3 bg-border hover:bg-muted-foreground/40",
              )}
              aria-label={`Go to ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-border bg-background hover:bg-secondary shadow-soft transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}
