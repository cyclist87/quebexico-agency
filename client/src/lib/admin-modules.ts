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
  },
  {
    id: "content",
    nameFr: "Contenu",
    nameEn: "Content",
    nameEs: "Contenido",
    icon: FileText,
    route: "/admin/content",
    requiredFeature: "content",
    templates: ["agency"],
    order: 3,
    category: "main",
  },
  {
    id: "analytics",
    nameFr: "Statistiques",
    nameEn: "Analytics",
    nameEs: "Estadísticas",
    icon: BarChart3,
    route: "/admin/analytics",
    requiredFeature: "analytics",
    templates: "all",
    order: 1,
    category: "analytics",
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
    order: 1,
    category: "settings",
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
