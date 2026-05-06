import event1 from "@/assets/event-1.jpg";
import event2 from "@/assets/event-2.jpg";
import event3 from "@/assets/event-3.jpg";
import type { EventRow, PublicationRow, AlbumRow, AlbumImageRow } from "@/services/content";

const now = new Date().toISOString();

export const mockEvents: EventRow[] = [
  {
    id: "m1",
    title_fr: "Colloque international : Gouvernance et performance publique",
    title_ar: "ندوة دولية: الحوكمة والأداء العمومي",
    summary_fr:
      "Une rencontre annuelle réunissant chercheurs et décideurs autour des nouveaux paradigmes de la gestion publique au Maroc et en Afrique.",
    summary_ar:
      "لقاء سنوي يجمع الباحثين وصناع القرار حول النماذج الجديدة للإدارة العمومية بالمغرب وإفريقيا.",
    description_fr: null,
    description_ar: null,
    image_url: event1,
    event_date: "2025-03-12",
    location: "Rabat, Maroc",
    is_published: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "m2",
    title_fr: "Séminaire doctoral : Méthodologies de recherche",
    title_ar: "ندوة الدكتوراه: منهجيات البحث",
    summary_fr:
      "Atelier intensif destiné aux doctorants en sciences de gestion et administration publique.",
    summary_ar: "ورشة مكثفة موجهة لطلبة الدكتوراه في علوم التدبير والإدارة العمومية.",
    description_fr: null,
    description_ar: null,
    image_url: event2,
    event_date: "2025-05-22",
    location: "Casablanca",
    is_published: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "m3",
    title_fr: "Table ronde : Transformation digitale de l'administration",
    title_ar: "مائدة مستديرة: التحول الرقمي للإدارة",
    summary_fr:
      "Échanges sur les enjeux de la dématérialisation et de la gouvernance des données publiques.",
    summary_ar: "نقاش حول رهانات الرقمنة وحوكمة البيانات العمومية.",
    description_fr: null,
    description_ar: null,
    image_url: event3,
    event_date: "2024-11-08",
    location: "Marrakech",
    is_published: true,
    created_at: now,
    updated_at: now,
  },
];

export const mockPublications: PublicationRow[] = [
  {
    id: "p1",
    title_fr: "Réforme de l'administration territoriale au Maroc",
    title_ar: "إصلاح الإدارة الترابية بالمغرب",
    authors: "M. Benkirane, S. El Yaagoubi",
    abstract_fr:
      "Cet article analyse les dynamiques de la régionalisation avancée et son impact sur la performance des services publics locaux.",
    abstract_ar:
      "تحلل هذه المقالة ديناميات الجهوية المتقدمة وأثرها على أداء الخدمات العمومية المحلية.",
    pdf_url: null,
    external_url: "#",
    cover_url: null,
    publication_year: 2024,
    is_published: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "p2",
    title_fr: "Management public et innovation organisationnelle",
    title_ar: "الإدارة العمومية والابتكار التنظيمي",
    authors: "L. Bennani, R. Tazi",
    abstract_fr:
      "Une étude empirique sur l'adoption des pratiques managériales innovantes dans les établissements publics marocains.",
    abstract_ar: "دراسة ميدانية حول تبني الممارسات الإدارية المبتكرة في المؤسسات العمومية المغربية.",
    pdf_url: null,
    external_url: "#",
    cover_url: null,
    publication_year: 2024,
    is_published: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "p3",
    title_fr: "Évaluation des politiques publiques : approches et méthodes",
    title_ar: "تقييم السياسات العمومية: مقاربات ومناهج",
    authors: "Collectif AMRMP",
    abstract_fr:
      "Ouvrage collectif présentant les principales approches méthodologiques pour l'évaluation des politiques publiques.",
    abstract_ar: "مؤلف جماعي يعرض أهم المقاربات المنهجية لتقييم السياسات العمومية.",
    pdf_url: null,
    external_url: "#",
    cover_url: null,
    publication_year: 2023,
    is_published: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "p4",
    title_fr: "Gouvernance financière des collectivités",
    title_ar: "الحوكمة المالية للجماعات",
    authors: "K. Amrani",
    abstract_fr:
      "Analyse comparative des modèles de gestion budgétaire des collectivités territoriales marocaines.",
    abstract_ar: "تحليل مقارن لنماذج التدبير الميزانياتي للجماعات الترابية المغربية.",
    pdf_url: null,
    external_url: "#",
    cover_url: null,
    publication_year: 2023,
    is_published: true,
    created_at: now,
    updated_at: now,
  },
];

export const mockAlbums: (AlbumRow & { images: AlbumImageRow[] })[] = [
  {
    id: "a1",
    title_fr: "Colloque 2024",
    title_ar: "ندوة 2024",
    description_fr: "Photos officielles du colloque international.",
    description_ar: "صور رسمية من الندوة الدولية.",
    cover_url: event1,
    album_date: "2024-03-15",
    is_published: true,
    created_at: now,
    updated_at: now,
    images: [
      { id: "i1", album_id: "a1", image_url: event1, caption: null, sort_order: 0, created_at: now },
      { id: "i2", album_id: "a1", image_url: event2, caption: null, sort_order: 1, created_at: now },
      { id: "i3", album_id: "a1", image_url: event3, caption: null, sort_order: 2, created_at: now },
    ],
  },
  {
    id: "a2",
    title_fr: "Séminaires doctoraux",
    title_ar: "ندوات الدكتوراه",
    description_fr: "Cycle de séminaires 2024.",
    description_ar: "سلسلة ندوات 2024.",
    cover_url: event2,
    album_date: "2024-05-20",
    is_published: true,
    created_at: now,
    updated_at: now,
    images: [
      { id: "i4", album_id: "a2", image_url: event2, caption: null, sort_order: 0, created_at: now },
      { id: "i5", album_id: "a2", image_url: event3, caption: null, sort_order: 1, created_at: now },
    ],
  },
];
