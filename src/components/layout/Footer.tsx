import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SOCIAL_LINKS } from "@/lib/social";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="bg-sidebar text-sidebar-foreground mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md gradient-primary flex items-center justify-center text-primary-foreground font-serif font-bold">
                A
              </div>
              <div>
                <p className="font-serif text-lg font-semibold">{t("brand.short")}</p>
                <p className="text-xs text-sidebar-foreground/70">{t("footer.tagline")}</p>
              </div>
            </div>
            <p className="mt-5 text-sm text-sidebar-foreground/75 max-w-xs leading-relaxed">
              {t("brand.full")}
            </p>
          </div>

          <div>
            <h4 className="font-serif text-sm uppercase tracking-wider text-sidebar-foreground/60 mb-4">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/events" className="hover:text-primary-glow story-link">{t("nav.events")}</Link></li>
              <li><Link to="/publications" className="hover:text-primary-glow story-link">{t("nav.publications")}</Link></li>
              <li><Link to="/gallery" className="hover:text-primary-glow story-link">{t("nav.gallery")}</Link></li>
              <li><Link to="/about" className="hover:text-primary-glow story-link">{t("nav.about")}</Link></li>
              <li><Link to="/contact" className="hover:text-primary-glow story-link">{t("nav.contact")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-sm uppercase tracking-wider text-sidebar-foreground/60 mb-4">
              Contact
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-primary-glow shrink-0" />
                <span>Rabat, Maroc</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary-glow shrink-0" />
                <a href="mailto:mehdigharrafi@gmail.com" className="hover:text-primary-glow">mehdigharrafi@gmail.com</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary-glow shrink-0" />
                <span>+212 5XX-XXXXXX</span>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="font-serif text-sm uppercase tracking-wider text-sidebar-foreground/60 mb-4">
                Follow Us
              </h4>
              <div className="flex gap-3">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.ariaLabel}
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-sidebar-border/30 hover:bg-primary hover:scale-110 transition-all duration-200"
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-sidebar-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-sidebar-foreground/60">
          <p>© {new Date().getFullYear()} AMRMP. {t("footer.rights")}</p>
          <Link to="/admin" className="hover:text-primary-glow">{t("nav.admin")}</Link>
        </div>
      </div>
    </footer>
  );
}
