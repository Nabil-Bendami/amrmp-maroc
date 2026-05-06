import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "fr" | "ar";

type Dict = Record<string, { fr: string; ar: string }>;

const dict: Dict = {
  // Nav
  "nav.home": { fr: "Accueil", ar: "الرئيسية" },
  "nav.events": { fr: "Événements", ar: "الفعاليات" },
  "nav.publications": { fr: "Publications", ar: "المنشورات" },
  "nav.gallery": { fr: "Galerie", ar: "المعرض" },
  "nav.about": { fr: "À propos", ar: "من نحن" },
  "nav.contact": { fr: "Contact", ar: "اتصل بنا" },
  "nav.admin": { fr: "Administration", ar: "الإدارة" },

  // Brand
  "brand.short": { fr: "AMRMP", ar: "AMRMP" },
  "brand.full": {
    fr: "Association Marocaine de Recherche en Management Public",
    ar: "الجمعية المغربية لأبحاث الإدارة العمومية",
  },

  // Hero
  "hero.eyebrow": { fr: "Recherche · Réflexion · Réforme", ar: "بحث · تفكير · إصلاح" },
  "hero.title": {
    fr: "Penser le management public marocain",
    ar: "نحو فكر متجدد في الإدارة العمومية المغربية",
  },
  "hero.subtitle": {
    fr: "Plateforme académique dédiée à la recherche, au dialogue et à la diffusion des savoirs sur la gouvernance et le management public.",
    ar: "منصة أكاديمية مكرسة للبحث والحوار ونشر المعرفة في مجال الحوكمة والإدارة العمومية.",
  },
  "hero.cta.events": { fr: "Découvrir nos événements", ar: "اكتشف فعالياتنا" },
  "hero.cta.publications": { fr: "Lire les publications", ar: "تصفح المنشورات" },

  // Sections
  "home.events.title": { fr: "Événements & Rencontres", ar: "الفعاليات واللقاءات" },
  "home.events.sub": {
    fr: "Colloques, séminaires et conférences animés par les chercheurs de l'AMRMP.",
    ar: "ندوات ومؤتمرات يقودها باحثو الجمعية.",
  },
  "home.publications.title": { fr: "Publications récentes", ar: "أحدث المنشورات" },
  "home.publications.sub": {
    fr: "Travaux de recherche, articles et ouvrages collectifs.",
    ar: "أبحاث ومقالات ومؤلفات جماعية.",
  },
  "home.about.title": { fr: "Une association au service du savoir", ar: "جمعية في خدمة المعرفة" },
  "home.about.body": {
    fr: "L'AMRMP fédère chercheurs, praticiens et institutions autour d'une ambition commune : éclairer les politiques publiques par la recherche académique rigoureuse.",
    ar: "تجمع الجمعية الباحثين والممارسين والمؤسسات حول طموح مشترك: إنارة السياسات العمومية بأبحاث أكاديمية صارمة.",
  },
  "home.about.cta": { fr: "En savoir plus", ar: "اعرف المزيد" },

  // Common
  "common.viewAll": { fr: "Voir tout", ar: "عرض الكل" },
  "common.readMore": { fr: "Lire la suite", ar: "اقرأ المزيد" },
  "common.download": { fr: "Télécharger", ar: "تنزيل" },
  "common.view": { fr: "Consulter", ar: "اطلع" },
  "common.loading": { fr: "Chargement…", ar: "جار التحميل…" },
  "common.empty.events": { fr: "Aucun événement publié pour le moment.", ar: "لا توجد فعاليات منشورة حاليا." },
  "common.empty.publications": { fr: "Aucune publication disponible.", ar: "لا توجد منشورات متاحة." },
  "common.empty.albums": { fr: "Aucun album disponible.", ar: "لا توجد ألبومات متاحة." },

  // Pages
  "events.title": { fr: "Centre du savoir", ar: "مركز المعرفة" },
  "events.sub": {
    fr: "Parcourez nos événements présentés en livre numérique animé.",
    ar: "تصفح فعالياتنا في صيغة كتاب رقمي متحرك.",
  },
  "publications.title": { fr: "Publications académiques", ar: "المنشورات الأكاديمية" },
  "publications.sub": {
    fr: "Recherches, articles évalués par les pairs et ouvrages collectifs.",
    ar: "أبحاث ومقالات محكمة ومؤلفات جماعية.",
  },
  "publications.abstract": { fr: "Résumé", ar: "ملخص" },
  "gallery.title": { fr: "Galerie photo", ar: "معرض الصور" },
  "gallery.sub": { fr: "Retour en images sur nos rencontres.", ar: "صور من أبرز لقاءاتنا." },
  "about.title": { fr: "À propos de l'AMRMP", ar: "حول AMRMP" },
  "about.mission.title": { fr: "Notre mission", ar: "مهمتنا" },
  "about.mission.body": {
    fr: "Promouvoir la recherche scientifique en management public, créer des espaces de dialogue interdisciplinaire et accompagner la transformation de l'action publique au Maroc.",
    ar: "تعزيز البحث العلمي في الإدارة العمومية، وخلق فضاءات للحوار متعدد التخصصات، ومواكبة تحول العمل العمومي بالمغرب.",
  },
  "about.values.title": { fr: "Nos valeurs", ar: "قيمنا" },
  "about.values.rigor": { fr: "Rigueur scientifique", ar: "الصرامة العلمية" },
  "about.values.openness": { fr: "Ouverture interdisciplinaire", ar: "الانفتاح متعدد التخصصات" },
  "about.values.impact": { fr: "Impact sur les politiques publiques", ar: "التأثير في السياسات العمومية" },

  "contact.title": { fr: "Nous contacter", ar: "اتصل بنا" },
  "contact.sub": { fr: "Une question, une proposition de collaboration ?", ar: "سؤال أو اقتراح تعاون؟" },
  "contact.name": { fr: "Nom complet", ar: "الاسم الكامل" },
  "contact.email": { fr: "Adresse e-mail", ar: "البريد الإلكتروني" },
  "contact.subject": { fr: "Sujet", ar: "الموضوع" },
  "contact.message": { fr: "Message", ar: "الرسالة" },
  "contact.send": { fr: "Envoyer", ar: "إرسال" },
  "contact.sent": { fr: "Message envoyé. Merci !", ar: "تم إرسال الرسالة. شكرًا!" },

  // Footer
  "footer.rights": { fr: "Tous droits réservés.", ar: "جميع الحقوق محفوظة." },
  "footer.tagline": {
    fr: "Recherche académique au service du management public.",
    ar: "بحث أكاديمي في خدمة الإدارة العمومية.",
  },

  // Admin
  "admin.signin.title": { fr: "Espace administrateur", ar: "فضاء المدير" },
  "admin.signin.sub": { fr: "Connectez-vous pour gérer le contenu.", ar: "سجّل الدخول لإدارة المحتوى." },
  "admin.signin.email": { fr: "E-mail", ar: "البريد الإلكتروني" },
  "admin.signin.password": { fr: "Mot de passe", ar: "كلمة المرور" },
  "admin.signin.submit": { fr: "Se connecter", ar: "تسجيل الدخول" },
  "admin.signin.create": { fr: "Créer un compte administrateur", ar: "إنشاء حساب مدير" },
  "admin.signin.have": { fr: "Déjà un compte ? Se connecter", ar: "لديك حساب؟ سجّل الدخول" },
  "admin.signin.signup": { fr: "Créer un compte", ar: "إنشاء حساب" },
  "admin.dashboard.title": { fr: "Tableau de bord", ar: "لوحة التحكم" },
  "admin.dashboard.welcome": { fr: "Bienvenue", ar: "مرحبا" },
  "admin.signout": { fr: "Déconnexion", ar: "تسجيل الخروج" },
  "admin.section.events": { fr: "Événements", ar: "الفعاليات" },
  "admin.section.publications": { fr: "Publications", ar: "المنشورات" },
  "admin.section.albums": { fr: "Albums photo", ar: "ألبومات الصور" },
  "admin.coming.soon": { fr: "Module CRUD en préparation. Contenus actuellement gérés via mock data.", ar: "وحدة الإدارة قيد الإعداد." },
};

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof dict | string) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "fr";
    return (localStorage.getItem("amrmp.lang") as Lang) || "fr";
  });

  const dir: "ltr" | "rtl" = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("amrmp.lang", l);
  };

  const t = (key: string) => {
    const entry = dict[key as keyof typeof dict];
    if (!entry) return key;
    return entry[lang] || entry.fr;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
