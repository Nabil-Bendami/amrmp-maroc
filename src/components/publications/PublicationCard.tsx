import { Download, ExternalLink, FileText } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { PublicationRow } from "@/services/content";

export function PublicationCard({ pub }: { pub: PublicationRow }) {
  const { t, lang, dir } = useI18n();
  const title = (lang === "ar" && pub.title_ar) || pub.title_fr;
  const abstract = (lang === "ar" && pub.abstract_ar) || pub.abstract_fr;

  return (
    <article
      className="group relative flex flex-col rounded-xl border border-border bg-card p-6 shadow-soft hover:shadow-elegant hover:-translate-y-1 transition-all duration-300 overflow-hidden"
      dir={dir}
    >
      {/* Decorative corner */}
      <div
        aria-hidden
        className="absolute -top-12 -right-12 h-32 w-32 rounded-full gradient-radial-spot opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />
      <div className="flex items-start justify-between gap-3">
        <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
          <FileText className="h-5 w-5" />
        </div>
        {pub.publication_year && (
          <span className="text-xs font-semibold text-muted-foreground tabular-nums">
            {pub.publication_year}
          </span>
        )}
      </div>

      <h3 className="mt-4 font-serif text-lg font-semibold text-foreground leading-snug text-balance group-hover:text-primary transition-colors">
        {title}
      </h3>
      {pub.authors && (
        <p className="mt-1.5 text-xs text-muted-foreground italic">{pub.authors}</p>
      )}

      {abstract && (
        <div className="mt-4 relative">
          <p className="text-xs uppercase tracking-wider text-accent font-semibold mb-1.5">
            {t("publications.abstract")}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
            {abstract}
          </p>
        </div>
      )}

      <div className="mt-5 flex items-center gap-2 pt-4 border-t border-border/60">
        {pub.pdf_url && (
          <a
            href={pub.pdf_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-glow transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            {t("common.download")}
          </a>
        )}
        {pub.external_url && (
          <a
            href={pub.external_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground/80 hover:bg-secondary transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {t("common.view")}
          </a>
        )}
      </div>
    </article>
  );
}
