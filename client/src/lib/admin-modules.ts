import type { TemplateType } from "@/contexts/TemplateContext";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  Calendar,
  CalendarX,
  MessageSquare,
  Ticket,
  Briefcase,
  Users,
  Trophy,
  Sparkles,
  Palette,
  Settings,
  BarChart3,
  FileText,
  Clock,
  MapPin,
  DollarSign,
  Image,
  UserCircle,
  Plug,
  Wrench,
  Shield,
} from "lucide-react";

export interface AdminModule {
  id: string;
  nameFr: string;
  nameEn: string;
  nameEs: string;
  icon: LucideIcon;
  route: string;
  requiredFeature: string;
  templates: TemplateType[] | "all";
  order: number;
  category: "main" | "settings" | "analytics";
  implemented: boolean;
}

export const ADMIN_MODULES: AdminModule[] = [
  {
    id: "properties",
    nameFr: "Propriétés",
    nameEn: "Properties",
    nameEs: "Propiedades",
    icon: Home,
    route: "/admin/properties",
    requiredFeature: "properties",
    templates: ["str"],
    order: 1,
    category: "main",
    implemented: true,
  },
  {
    id: "reservations",
    nameFr: "Réservations",
    nameEn: "Reservations",
    nameEs: "Reservas",
    icon: Calendar,
    route: "/admin/reservations",
    requiredFeature: "reservations",
    templates: ["str"],
    order: 2,
    category: "main",
    implemented: true,
  },
  {
    id: "coupons",
    nameFr: "Coupons",
    nameEn: "Coupons",
    nameEs: "Cupones",
    icon: Ticket,
    route: "/admin/coupons",
    requiredFeature: "coupons",
    templates: "all",
    order: 10,
    category: "main",
    implemented: true,
  },
  {
    id: "services",
    nameFr: "Services",
    nameEn: "Services",
    nameEs: "Servicios",
    icon: Briefcase,
    route: "/admin/services",
    requiredFeature: "services",
    templates: ["freelancer", "cleaning"],
    order: 1,
    category: "main",
    implemented: false,
  },
  {
    id: "appointments",
    nameFr: "Rendez-vous",
    nameEn: "Appointments",
    nameEs: "Citas",
    icon: Clock,
    route: "/admin/appointments",
    requiredFeature: "appointments",
    templates: ["freelancer"],
    order: 2,
    category: "main",
    implemented: false,
  },
  {
    id: "portfolio",
    nameFr: "Portfolio",
    nameEn: "Portfolio",
    nameEs: "Portafolio",
    icon: Image,
    route: "/admin/portfolio",
    requiredFeature: "portfolio",
    templates: ["freelancer", "agency"],
    order: 3,
    category: "main",
    implemented: false,
  },
  {
    id: "members",
    nameFr: "Membres",
    nameEn: "Members",
    nameEs: "Miembros",
    icon: Users,
    route: "/admin/members",
    requiredFeature: "members",
    templates: ["sports_club"],
    order: 1,
    category: "main",
    implemented: false,
  },
  {
    id: "events",
    nameFr: "Événements",
    nameEn: "Events",
    nameEs: "Eventos",
    icon: Trophy,
    route: "/admin/events",
    requiredFeature: "events",
    templates: ["sports_club"],
    order: 2,
    category: "main",
    implemented: false,
  },
  {
    id: "registrations",
    nameFr: "Inscriptions",
    nameEn: "Registrations",
    nameEs: "Inscripciones",
    icon: FileText,
    route: "/admin/registrations",
    requiredFeature: "registrations",
    templates: ["sports_club"],
    order: 3,
    category: "main",
    implemented: false,
  },
  {
    id: "bookings",
    nameFr: "Réservations",
    nameEn: "Bookings",
    nameEs: "Reservas",
    icon: Calendar,
    route: "/admin/bookings",
    requiredFeature: "bookings",
    templates: ["cleaning"],
    order: 2,
    category: "main",
    implemented: false,
  },
  {
    id: "service_areas",
    nameFr: "Zones de service",
    nameEn: "Service areas",
    nameEs: "Áreas de servicio",
    icon: MapPin,
    route: "/admin/service-areas",
    requiredFeature: "service_areas",
    templates: ["cleaning"],
    order: 3,
    category: "main",
    implemented: false,
  },
  {
    id: "pricing",
    nameFr: "Tarification",
    nameEn: "Pricing",
    nameEs: "Precios",
    icon: DollarSign,
    route: "/admin/pricing",
    requiredFeature: "pricing",
    templates: ["cleaning", "freelancer"],
    order: 4,
    category: "main",
    implemented: false,
  },
  {
    id: "projects",
    nameFr: "Projets",
    nameEn: "Projects",
    nameEs: "Proyectos",
    icon: Palette,
    route: "/admin/projects",
    requiredFeature: "projects",
    templates: ["agency"],
    order: 1,
    category: "main",
    implemented: false,
  },
  {
    id: "team",
    nameFr: "Équipe",
    nameEn: "Team",
    nameEs: "Equipo",
    icon: UserCircle,
    route: "/admin/team",
    requiredFeature: "team",
    templates: ["agency"],
    order: 2,
    category: "main",
    implemented: false,
  },
  {
    id: "content",
    nameFr: "Contenu",
    nameEn: "Content",
    nameEs: "Contenido",
    icon: FileText,
    route: "/admin/content",
    requiredFeature: "content",
    templates: "all",
    order: 18,
    category: "settings",
    implemented: true,
  },
  {
    id: "appearance",
    nameFr: "Apparence",
    nameEn: "Appearance",
    nameEs: "Apariencia",
    icon: Palette,
    route: "/admin/appearance",
    requiredFeature: "appearance",
    templates: "all",
    order: 19,
    category: "settings",
    implemented: true,
  },
  {
    id: "integrations",
    nameFr: "Intégrations",
    nameEn: "Integrations",
    nameEs: "Integraciones",
    icon: Plug,
    route: "/admin/integrations",
    requiredFeature: "integrations",
    templates: "all",
    order: 20,
    category: "settings",
    implemented: true,
  },
  {
    id: "tools",
    nameFr: "Outils",
    nameEn: "Tools",
    nameEs: "Herramientas",
    icon: Wrench,
    route: "/admin/tools",
    requiredFeature: "tools",
    templates: "all",
    order: 21,
    category: "settings",
    implemented: true,
  },
  {
    id: "settings",
    nameFr: "Paramètres",
    nameEn: "Settings",
    nameEs: "Configuración",
    icon: Settings,
    route: "/admin/settings",
    requiredFeature: "settings",
    templates: "all",
    order: 22,
    category: "settings",
    implemented: true,
  },
  {
    id: "super_admin",
    nameFr: "Super Admin",
    nameEn: "Super Admin",
    nameEs: "Super Admin",
    icon: Shield,
    route: "/admin/super",
    requiredFeature: "super_admin",
    templates: "all",
    order: 99,
    category: "settings",
    implemented: true,
  },
];

export function getModulesForTemplate(
  templateType: TemplateType,
  templateFeatures: string[]
): AdminModule[] {
  return ADMIN_MODULES.filter((module) => {
    const templateMatch =
      module.templates === "all" || module.templates.includes(templateType);
    const featureMatch = templateFeatures.includes(module.requiredFeature);
    return templateMatch && featureMatch;
  }).sort((a, b) => {
    if (a.category !== b.category) {
      const categoryOrder = { main: 0, analytics: 1, settings: 2 };
      return categoryOrder[a.category] - categoryOrder[b.category];
    }
    return a.order - b.order;
  });
}

export function getModuleName(module: AdminModule, language: "fr" | "en" | "es"): string {
  switch (language) {
    case "en":
      return module.nameEn;
    case "es":
      return module.nameEs;
    default:
      return module.nameFr;
  }
}
