import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

export const SOCIAL_LINKS = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/profile.php?id=61575284116922",
    icon: Facebook,
    ariaLabel: "Follow us on Facebook",
  },
  {
    name: "Instagram",
    url: "https://instagram.com/amrmp",
    icon: Instagram,
    ariaLabel: "Follow us on Instagram",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/company/association-marocaine-de-recherche-en-management-public-amrmp/",
    icon: Linkedin,
    ariaLabel: "Follow us on LinkedIn",
  },
  {
    name: "X",
    url: "https://twitter.com/amrmp",
    icon: Twitter,
    ariaLabel: "Follow us on X (Twitter)",
  },
] as const;