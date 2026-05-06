import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookText, Calendar, Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { HeroKenBurns } from "@/components/home/HeroKenBurns";
import { EventBook } from "@/components/events/EventBook";
import { PublicationCard } from "@/components/publications/PublicationCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useI18n } from "@/lib/i18n";
import { fetchEvents, fetchPublications } from "@/services/content";
import { mockEvents, mockPublications } from "@/data/mock";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { t, dir } = useI18n();

  const eventsQ = useQuery({ queryKey: ["events"], queryFn: fetchEvents });
  const pubsQ = useQuery({ queryKey: ["publications"], queryFn: fetchPublications });

  const events = (eventsQ.data && eventsQ.data.length > 0 ? eventsQ.data : mockEvents).slice(0, 5);
  const pubs = (pubsQ.data && pubsQ.data.length > 0 ? pubsQ.data : mockPublications).slice(0, 4);

  return (
    <PublicLayout>
      <HeroKenBurns />

      {/* About teaser */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24" dir={dir}>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeader
              eyebrow={t("nav.about")}
              title={t("home.about.title")}
              subtitle={t("home.about.body")}
            />
            <Link
              to="/about"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-glow group"
            >
              {t("home.about.cta")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Sparkles, key: "about.values.rigor" },
              { icon: BookText, key: "about.values.openness" },
              { icon: Calendar, key: "about.values.impact" },
            ].map(({ icon: Icon, key }, i) => (
              <div
                key={key}
                className="rounded-xl border border-border bg-card p-5 shadow-soft hover:shadow-elevation transition-shadow"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="h-10 w-10 rounded-md gradient-primary flex items-center justify-center text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 font-serif text-base font-semibold">{t(key)}</p>
              </div>
            ))}
            <div className="rounded-xl bg-primary text-primary-foreground p-5 shadow-elegant flex flex-col justify-between">
              <p className="font-serif text-2xl font-semibold leading-tight">2024+</p>
              <p className="text-xs uppercase tracking-wider opacity-80 mt-2">
                {t("nav.events")} & {t("nav.publications")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Events — book flip */}
      <section className="bg-gradient-to-b from-secondary/40 to-background py-20 sm:py-24 border-y border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10" dir={dir}>
            <SectionHeader
              eyebrow={t("nav.events")}
              title={t("home.events.title")}
              subtitle={t("home.events.sub")}
            />
            <Link
              to="/events"
              className="text-sm font-semibold text-primary story-link inline-flex items-center gap-1.5"
            >
              {t("common.viewAll")} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </Link>
          </div>
          <EventBook events={events} />
        </div>
      </section>

      {/* Publications */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24" dir={dir}>
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <SectionHeader
            eyebrow={t("nav.publications")}
            title={t("home.publications.title")}
            subtitle={t("home.publications.sub")}
          />
          <Link
            to="/publications"
            className="text-sm font-semibold text-primary story-link inline-flex items-center gap-1.5"
          >
            {t("common.viewAll")} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pubs.map((p) => (
            <PublicationCard key={p.id} pub={p} />
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
