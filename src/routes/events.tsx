import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageHero } from "@/components/ui/SectionHeader";
import { EventBook } from "@/components/events/EventBook";
import { useI18n } from "@/lib/i18n";
import { fetchEvents } from "@/services/content";
import { mockEvents } from "@/data/mock";
import { Calendar, MapPin } from "lucide-react";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Événements — AMRMP" },
      {
        name: "description",
        content:
          "Colloques, séminaires, conférences et tables rondes organisés par l'AMRMP autour du management public.",
      },
      { property: "og:title", content: "Événements AMRMP" },
      { property: "og:description", content: "Le centre du savoir de l'AMRMP." },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const { t, lang, dir } = useI18n();
  const eventsQ = useQuery({ queryKey: ["events"], queryFn: fetchEvents });
  const events = eventsQ.data && eventsQ.data.length > 0 ? eventsQ.data : mockEvents;

  return (
    <PublicLayout>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("events.title")}
        subtitle={t("events.sub")}
      />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <EventBook events={events} />
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24" dir={dir}>
        <h2 className="font-serif text-2xl font-semibold mb-8">
          {lang === "ar" ? "كل الفعاليات" : "Tous les événements"}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((ev) => {
            const title = (lang === "ar" && ev.title_ar) || ev.title_fr;
            const summary = (lang === "ar" && ev.summary_ar) || ev.summary_fr;
            const date = ev.event_date
              ? new Date(ev.event_date).toLocaleDateString(lang === "ar" ? "ar-MA" : "fr-FR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : null;
            return (
              <article
                key={ev.id}
                className="group overflow-hidden rounded-xl bg-card border border-border shadow-soft hover:shadow-elegant hover:-translate-y-1 transition-all"
              >
                {ev.image_url && (
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={ev.image_url}
                      alt={title}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-serif text-lg font-semibold leading-snug text-balance group-hover:text-primary transition-colors">
                    {title}
                  </h3>
                  {summary && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{summary}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                    {date && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-primary" />
                        {date}
                      </span>
                    )}
                    {ev.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-primary" />
                        {ev.location}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </PublicLayout>
  );
}
