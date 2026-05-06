import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Sparkles, Target, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageHero } from "@/components/ui/SectionHeader";
import { useI18n } from "@/lib/i18n";
import { fetchTeamMembers, fetchPartners } from "@/services/content";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "À propos — AMRMP" },
      {
        name: "description",
        content:
          "L'Association Marocaine de Recherche en Management Public fédère chercheurs et praticiens.",
      },
      { property: "og:title", content: "À propos de l'AMRMP" },
      {
        property: "og:description",
        content: "Mission, valeurs et engagement de l'association.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t, lang, dir } = useI18n();

  const { data: teamMembers, isLoading: teamLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: fetchTeamMembers,
  });

  const { data: partners, isLoading: partnersLoading } = useQuery({
    queryKey: ["partners"],
    queryFn: fetchPartners,
  });

  const values = [
    { icon: Sparkles, key: "about.values.rigor" },
    { icon: Users, key: "about.values.openness" },
    { icon: Target, key: "about.values.impact" },
  ];

  return (
    <PublicLayout>
      <PageHero
        eyebrow={t("nav.about")}
        title={t("about.title")}
        subtitle={t("brand.full")}
      />

      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16" dir={dir}>
        <div className="prose prose-neutral max-w-none">
          <h2 className="font-serif text-3xl font-semibold text-foreground">
            {t("about.mission.title")}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
            {t("about.mission.body")}
          </p>
        </div>

        <div className="mt-16">
          <h2 className="font-serif text-3xl font-semibold text-foreground mb-8">
            {t("about.values.title")}
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {values.map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="rounded-xl border border-border bg-card p-6 shadow-soft hover:shadow-elevation transition-shadow"
              >
                <div className="h-12 w-12 rounded-lg gradient-primary text-primary-foreground flex items-center justify-center">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="mt-4 font-serif text-lg font-semibold leading-snug">{t(key)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Members Section */}
        <div className="mt-16">
          <h2 className="font-serif text-3xl font-semibold text-foreground mb-8">
            Our Team
          </h2>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
            {teamLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-xl bg-muted overflow-hidden">
                  <Skeleton className="w-full h-full" />
                </div>
              ))
            ) : teamMembers?.length ? (
              teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="group relative aspect-[3/4] rounded-xl overflow-hidden shadow-soft hover:shadow-elevation transition-all"
                >
                  {member.image_url ? (
                    <img
                      src={member.image_url}
                      alt={member.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <h3 className="font-serif text-lg font-bold text-white">{member.name}</h3>
                    <p className="text-sm text-white/80 font-medium">{member.role}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Team members will be displayed here</p>
              </div>
            )}
          </div>
        </div>

        {/* Partners Section */}
        <div className="mt-16">
          <h2 className="font-serif text-3xl font-semibold text-foreground mb-8">
            Our Partners
          </h2>
          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {partnersLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-muted/50 p-6">
                  <Skeleton className="w-full h-20" />
                </div>
              ))
            ) : partners?.length ? (
              partners.map((partner) => (
                <div
                  key={partner.id}
                  className="rounded-xl bg-muted/30 p-6 hover:bg-muted/50 transition-colors"
                >
                  {partner.logo_url && (
                    <img
                      src={partner.logo_url}
                      alt={partner.name}
                      className="w-full h-20 object-contain mb-3"
                    />
                  )}
                  <h3 className="font-serif text-sm font-semibold text-center">{partner.name}</h3>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Partner organizations will be displayed here</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 rounded-2xl bg-primary text-primary-foreground p-8 sm:p-10 shadow-elegant relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary-glow/30 blur-3xl"
          />
          <div className="relative">
            <BookOpen className="h-8 w-8 text-accent mb-4" />
            <p className="font-serif text-xl sm:text-2xl leading-relaxed text-balance">
              {lang === "ar"
                ? "نؤمن أن البحث الأكاديمي الصارم هو الرافعة الأساسية لتجديد الفعل العمومي."
                : "Nous croyons que la recherche académique rigoureuse est le levier essentiel du renouvellement de l'action publique."}
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
