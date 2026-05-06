import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageHero } from "@/components/ui/SectionHeader";
import { useI18n } from "@/lib/i18n";
import { fetchAlbums } from "@/services/content";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Galerie — AMRMP" },
      { name: "description", content: "Galerie photo des événements AMRMP." },
      { property: "og:title", content: "Galerie AMRMP" },
      { property: "og:description", content: "Retour en images." },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const { t, lang, dir } = useI18n();
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const q = useQuery({ queryKey: ["albums"], queryFn: fetchAlbums });
  const albums = q.data ?? [];

  const closeLightbox = () => setLightbox(null);

  return (
    <PublicLayout>
      <PageHero
        eyebrow={t("nav.gallery")}
        title={t("gallery.title")}
        subtitle={t("gallery.sub")}
      />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-20" dir={dir}>
        {q.isLoading ? (
          <div className="space-y-8">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="rounded-3xl border border-border/40 bg-card p-8 shadow-soft">
                <div className="h-10 w-48 rounded-full bg-muted/80 mb-6 animate-pulse" />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="h-56 rounded-3xl bg-muted/80 animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : albums.length === 0 ? (
          <div className="rounded-3xl border border-border/40 bg-card p-12 text-center shadow-soft">
            <h2 className="font-serif text-2xl font-semibold text-foreground">Aucune photo disponible</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Nous n’avons pas encore d’albums publiés. Revenez bientôt.
            </p>
          </div>
        ) : (
          albums.map((album) => {
            const title = (lang === "ar" && album.title_ar) || album.title_fr;
            const desc = (lang === "ar" && album.description_ar) || album.description_fr;
            const visibleImages = (album.images ?? []).sort((a, b) => a.sort_order - b.sort_order);

            return (
              <div key={album.id} className="rounded-3xl border border-border/40 bg-card p-8 shadow-soft">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground">
                      {title}
                    </h2>
                    {desc && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{desc}</p>}
                  </div>
                  {album.album_date && (
                    <span className="rounded-full border border-border/70 bg-background px-4 py-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                      {new Date(album.album_date).toLocaleDateString(
                        lang === "ar" ? "ar-MA" : "fr-FR",
                        { year: "numeric", month: "long" },
                      )}
                    </span>
                  )}
                </div>

                {visibleImages.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-muted p-12 text-center text-sm text-muted-foreground">
                    Aucune photo disponible pour cet album.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {visibleImages.map((img, index) => (
                      <motion.button
                        key={img.id}
                        type="button"
                        onClick={() => {
                          const fullUrl = `https://mopuxulrzctwgestdfvl.supabase.co/storage/v1/object/public/albums/${img.image_url}`;
                          console.log('Opening lightbox with URL:', fullUrl);
                          setLightbox({ src: fullUrl, alt: img.caption || title });
                        }}
                        whileHover={{ scale: 1.01 }}
                        className="group overflow-hidden rounded-[2rem] border border-border/70 bg-muted shadow-soft text-left"
                      >
                        <div className="relative h-72 overflow-hidden rounded-[2rem] bg-slate-950">
                          <img
                            src={`https://mopuxulrzctwgestdfvl.supabase.co/storage/v1/object/public/albums/${img.image_url}`}
                            alt={img.caption || title}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0VjE2QzE0IDE3LjEgMTMuMSAxOCA5IDE4QzYuOSAxOCA2IDE3LjEgNiAxNlY0QzYgMi45IDYuOSAyIDggMkgxNkMxNy4xIDIgMTggMi45IDE4IDRWMTJDMTggMTMuMSAxNy4xIDE0IDE2IDE0SDEyQzEwLjkgMTQgMTAgMTMuMSAxMCAxMloiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0VjE2QzE0IDE3LjEgMTMuMSAxOCA5IDE4QzYuOSAxOCA2IDE3LjEgNiAxNlY0QzYgMi45IDYuOSAyIDggMkgxNkMxNy4xIDIgMTggMi45IDE4IDRWMTJDMTggMTMuMSAxNy4xIDE0IDE2IDE0SDEyQzEwLjkgMTQgMTAgMTMuMSAxMCAxMloiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0VjE2QzE0IDE3LjEgMTMuMSAxOCA5IDE4QzYuOSAxOCA2IDE3LjEgNiAxNlY0QzYgMi45IDYuOSAyIDggMkgxNkMxNy4xIDIgMTggMi45IDE4IDRWMTJDMTggMTMuMSAxNy4xIDE0IDE2IDE0SDEyQzEwLjkgMTQgMTAgMTMuMSAxMCAxMloiIGZpbGw9IiM5Q0E0QUYiLz4KPC9zdmc+'; // Placeholder SVG
                            }}
                            onLoad={() => console.log('Image loaded:', `https://mopuxulrzctwgestdfvl.supabase.co/storage/v1/object/public/albums/${img.image_url}`)}
                            className="h-full w-full object-cover transition duration-1000 ease-out group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="px-4 py-4">
                          <p className="text-sm font-semibold text-foreground line-clamp-2">{img.caption || title}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      {lightbox ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-6 top-6 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-white transition hover:bg-white/20"
          >
            Fermer
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            className="max-h-[90vh] max-w-full rounded-3xl object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0VjE2QzE0IDE3LjEgMTMuMSAxOCA5IDE4QzYuOSAxOCA2IDE3LjEgNiAxNlY0QzYgMi45IDYuOSAyIDggMkgxNkMxNy4xIDIgMTggMi45IDE4IDRWMTJDMTggMTMuMSAxNy4xIDE0IDE2IDE0SDEyQzEwLjkgMTQgMTAgMTMuMSAxMCAxMloiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0VjE2QzE0IDE3LjEgMTMuMSAxOCA5IDE4QzYuOSAxOCA2IDE3LjEgNiAxNlY0QzYgMi45IDYuOSAyIDggMkgxNkMxNy4xIDIgMTggMi45IDE4IDRWMTJDMTggMTMuMSAxNy4xIDE0IDE2IDE0SDEyQzEwLjkgMTQgMTAgMTMuMSAxMCAxMloiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0VjE2QzE0IDE3LjEgMTMuMSAxOCA5IDE4QzYuOSAxOCA2IDE3LjEgNiAxNlY0QzYgMi45IDYuOSAyIDggMkgxNkMxNy4xIDIgMTggMi45IDE4IDRWMTJDMTggMTMuMSAxNy4xIDE0IDE2IDE0SDEyQzEwLjkgMTQgMTAgMTMuMSAxMCAxMloiIGZpbGw9IiM5Q0E0QUYiLz4KPC9zdmc+'; // Placeholder SVG
            }}
            onLoad={() => console.log('Lightbox image loaded:', lightbox.src)}
          />
        </div>
      ) : null}
    </PublicLayout>
  );
}
