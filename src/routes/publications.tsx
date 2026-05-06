import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageHero } from "@/components/ui/SectionHeader";
import { PublicationCard } from "@/components/publications/PublicationCard";
import { useI18n } from "@/lib/i18n";
import { fetchPublications } from "@/services/content";
import { mockPublications } from "@/data/mock";

export const Route = createFileRoute("/publications")({
  head: () => ({
    meta: [
      { title: "Publications — AMRMP" },
      {
        name: "description",
        content:
          "Articles académiques, ouvrages collectifs et travaux de recherche en management public.",
      },
      { property: "og:title", content: "Publications AMRMP" },
      { property: "og:description", content: "Recherche académique en management public." },
    ],
  }),
  component: PublicationsPage,
});

function PublicationsPage() {
  const { t } = useI18n();
  const q = useQuery({ queryKey: ["publications"], queryFn: fetchPublications });
  const pubs = q.data && q.data.length > 0 ? q.data : mockPublications;

  return (
    <PublicLayout>
      <PageHero
        eyebrow={t("nav.publications")}
        title={t("publications.title")}
        subtitle={t("publications.sub")}
      />
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pubs.map((p) => (
            <PublicationCard key={p.id} pub={p} />
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
