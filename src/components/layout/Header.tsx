import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X, Globe, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", key: "nav.home" },
  { to: "/events", key: "nav.events" },
  { to: "/publications", key: "nav.publications" },
  { to: "/gallery", key: "nav.gallery" },
  { to: "/about", key: "nav.about" },
  { to: "/contact", key: "nav.contact" },
] as const;

export function Header() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        "glass border-b border-border/50",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="AMRMP logo"
              className="h-14 w-auto rounded-md border border-border/50 bg-background p-1 shadow-soft"
              suppressHydrationWarning
            />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-serif text-base font-semibold text-foreground">
                {t("brand.short")}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {isHome ? t("brand.full") : "Management Public"}
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors story-link"
                activeProps={{ className: "text-primary" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {t(l.key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <a
              href="https://facebook.com/amrmp"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full hover:bg-secondary transition-colors"
            >
              <Facebook className="h-4 w-4 text-foreground/70 hover:text-primary" />
            </a>
            <a
              href="https://instagram.com/amrmp"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full hover:bg-secondary transition-colors"
            >
              <Instagram className="h-4 w-4 text-foreground/70 hover:text-primary" />
            </a>
            <a
              href="https://www.linkedin.com/company/association-marocaine-de-recherche-en-management-public-amrmp"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full hover:bg-secondary transition-colors"
            >
              <Linkedin className="h-4 w-4 text-foreground/70 hover:text-primary" />
            </a>
            <a
              href="https://twitter.com/amrmp"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full hover:bg-secondary transition-colors"
            >
              <Twitter className="h-4 w-4 text-foreground/70 hover:text-primary" />
            </a>
            <button
              onClick={() => setLang(lang === "fr" ? "ar" : "fr")}
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-semibold text-foreground/80 hover:bg-secondary hover:text-foreground transition-colors"
              aria-label="Toggle language"
            >
              <Globe className="h-3.5 w-3.5" />
              {lang === "fr" ? "العربية" : "Français"}
            </button>
            <button
              className="lg:hidden p-2 rounded-md hover:bg-secondary"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden py-4 border-t border-border/40 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2.5 rounded-md text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-primary"
                  activeProps={{ className: "bg-secondary text-primary" }}
                  activeOptions={{ exact: l.to === "/" }}
                >
                  {t(l.key)}
                </Link>
              ))}
              <button
                onClick={() => {
                  setLang(lang === "fr" ? "ar" : "fr");
                  setOpen(false);
                }}
                className="mt-2 mx-3 inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-secondary"
              >
                <Globe className="h-4 w-4" />
                {lang === "fr" ? "العربية" : "Français"}
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
