import { z } from "zod";
import { LocalizedStringSchema, LocalizedArraySchema, type LocalizedString, type LocalizedArray } from "./localization";

export const ProfileTypeSchema = z.enum(["athlete", "freelancer", "rental-host", "cleaning", "sports-club", "professional"]);
export type ProfileType = z.infer<typeof ProfileTypeSchema>;

export const SectionTypeSchema = z.enum([
  "hero",
  "portfolio",
  "services",
  "testimonials",
  "properties",
  "sponsors",
  "calendar",
  "gallery",
  "cta",
  "contact",
  "richText",
]);
export type SectionType = z.infer<typeof SectionTypeSchema>;

export const SectionConfigSchema = z.object({
  id: z.string(),
  type: SectionTypeSchema,
  title: LocalizedStringSchema.optional(),
  subtitle: LocalizedStringSchema.optional(),
  background: z.enum(["default", "muted", "primary", "dark"]).optional(),
});
export type SectionConfig = z.infer<typeof SectionConfigSchema>;

export const NavigationItemSchema = z.object({
  id: z.string(),
  label: LocalizedStringSchema,
  slug: z.string(),
  icon: z.string().optional(),
});
export type NavigationItem = z.infer<typeof NavigationItemSchema>;

export const PageConfigSchema = z.object({
  slug: z.string(),
  title: LocalizedStringSchema,
  sections: z.array(SectionConfigSchema),
});
export type PageConfig = z.infer<typeof PageConfigSchema>;

export const SponsorSchema = z.object({
  id: z.string(),
  name: z.string(),
  logoUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
  category: z.enum(["title", "technical", "support", "media"]),
  description: z.string().optional(),
});
export type Sponsor = z.infer<typeof SponsorSchema>;

export const CalendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(),
  location: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(["competition", "training", "appearance", "other"]),
});
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;

export const GalleryImageSchema = z.object({
  id: z.string(),
  url: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
});
export type GalleryImage = z.infer<typeof GalleryImageSchema>;

export const ProfileConfigSchema = z.object({
  type: ProfileTypeSchema,
  name: LocalizedStringSchema,
  tagline: LocalizedStringSchema,
  description: LocalizedStringSchema,
  primaryColor: z.string(),
  heroImageUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  features: z.object({
    portfolio: z.boolean(),
    services: z.boolean(),
    testimonials: z.boolean(),
    booking: z.boolean(),
    properties: z.boolean(),
    blog: z.boolean(),
    contact: z.boolean(),
    newsletter: z.boolean(),
    sponsors: z.boolean().optional(),
    calendar: z.boolean().optional(),
    gallery: z.boolean().optional(),
  }),
  navigation: z.array(NavigationItemSchema).optional(),
  pages: z.array(PageConfigSchema).optional(),
});

export type ProfileConfig = z.infer<typeof ProfileConfigSchema>;

export const PortfolioItemSchema = z.object({
  id: z.string(),
  title: LocalizedStringSchema,
  description: LocalizedStringSchema,
  category: LocalizedStringSchema,
  imageUrl: z.string().optional(),
  date: z.string().optional(),
  stats: z.record(z.string()).optional(),
});

export type PortfolioItem = z.infer<typeof PortfolioItemSchema>;

export const ServiceSchema = z.object({
  id: z.string(),
  title: LocalizedStringSchema,
  description: LocalizedStringSchema,
  price: z.string().optional(),
  features: LocalizedArraySchema,
});

export type Service = z.infer<typeof ServiceSchema>;

export const TestimonialSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: LocalizedStringSchema,
  content: LocalizedStringSchema,
  avatarUrl: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

export type Testimonial = z.infer<typeof TestimonialSchema>;

export const DemoPropertySchema = z.object({
  id: z.string(),
  name: LocalizedStringSchema,
  location: z.string(),
  description: LocalizedStringSchema,
  pricePerNight: z.number(),
  maxGuests: z.number(),
  bedrooms: z.number(),
  bathrooms: z.number(),
  amenities: LocalizedArraySchema,
  imageUrl: z.string().optional(),
});

export type DemoProperty = z.infer<typeof DemoPropertySchema>;

export interface DemoProfileData {
  config: ProfileConfig;
  portfolio?: PortfolioItem[];
  services?: Service[];
  testimonials?: Testimonial[];
  properties?: DemoProperty[];
  sponsors?: Sponsor[];
  calendar?: CalendarEvent[];
  gallery?: GalleryImage[];
}

export const athleteProfile: DemoProfileData = {
  config: {
    type: "athlete",
    name: "Mathieu Gagnon",
    tagline: {
      fr: "Cycliste professionnel sur route",
      en: "Professional Road Cyclist",
      es: "Ciclista profesional de ruta",
    },
    description: {
      fr: "Champion canadien avec plus de 10 ans d'expérience sur le circuit international UCI.",
      en: "Canadian champion with over 10 years of experience on the international UCI circuit.",
      es: "Campeón canadiense con más de 10 años de experiencia en el circuito internacional UCI.",
    },
    primaryColor: "blue",
    features: {
      portfolio: true,
      services: false,
      testimonials: true,
      booking: true,
      properties: false,
      blog: true,
      contact: true,
      newsletter: true,
      sponsors: true,
      calendar: true,
      gallery: true,
    },
    navigation: [
      { id: "home", label: { fr: "Accueil", en: "Home", es: "Inicio" }, slug: "" },
      { id: "results", label: { fr: "Palmarès", en: "Results", es: "Resultados" }, slug: "resultats" },
      { id: "sponsors", label: { fr: "Partenaires", en: "Partners", es: "Patrocinadores" }, slug: "partenaires" },
      { id: "calendar", label: { fr: "Calendrier", en: "Calendar", es: "Calendario" }, slug: "calendrier" },
      { id: "contact", label: "Contact", slug: "contact" },
    ],
    pages: [
      {
        slug: "",
        title: { fr: "Accueil", en: "Home", es: "Inicio" },
        sections: [
          { id: "hero", type: "hero" },
          { id: "portfolio", type: "portfolio", title: { fr: "Palmarès récent", en: "Recent Results", es: "Resultados recientes" } },
          { id: "sponsors-preview", type: "sponsors", title: { fr: "Partenaires", en: "Partners", es: "Patrocinadores" } },
          { id: "cta", type: "cta" },
        ],
      },
      {
        slug: "resultats",
        title: { fr: "Palmarès", en: "Results", es: "Resultados" },
        sections: [
          { id: "hero", type: "hero" },
          { id: "portfolio-full", type: "portfolio", title: { fr: "Résultats & Performances", en: "Results & Performances", es: "Resultados y Rendimiento" } },
        ],
      },
      {
        slug: "partenaires",
        title: { fr: "Partenaires", en: "Partners", es: "Patrocinadores" },
        sections: [
          { id: "hero", type: "hero" },
          { id: "sponsors-full", type: "sponsors", title: { fr: "Mes partenaires", en: "My Partners", es: "Mis patrocinadores" } },
          { id: "cta", type: "cta" },
        ],
      },
      {
        slug: "calendrier",
        title: { fr: "Calendrier", en: "Calendar", es: "Calendario" },
        sections: [
          { id: "hero", type: "hero" },
          { id: "calendar", type: "calendar", title: { fr: "Saison 2025", en: "2025 Season", es: "Temporada 2025" } },
        ],
      },
      {
        slug: "contact",
        title: "Contact",
        sections: [
          { id: "hero", type: "hero" },
          { id: "contact", type: "contact" },
        ],
      },
    ],
  },
  portfolio: [
    {
      id: "1",
      title: "Tour de Beauce 2024",
      description: {
        fr: "Victoire au classement général",
        en: "Overall classification victory",
        es: "Victoria en la clasificación general",
      },
      category: { fr: "Compétition", en: "Competition", es: "Competición" },
      date: "2024-06",
      stats: { position: "1er", étapes: "2 victoires" },
    },
    {
      id: "2",
      title: {
        fr: "Championnats canadiens sur route",
        en: "Canadian Road Championships",
        es: "Campeonatos canadienses de ruta",
      },
      description: {
        fr: "Médaille d'or en contre-la-montre",
        en: "Gold medal in time trial",
        es: "Medalla de oro en contrarreloj",
      },
      category: { fr: "Compétition", en: "Competition", es: "Competición" },
      date: "2024-06",
      stats: { position: "1er", temps: "47:23" },
    },
    {
      id: "3",
      title: "Grand Prix Cycliste de Québec",
      description: {
        fr: "Top 10 face aux meilleurs mondiaux",
        en: "Top 10 against the world's best",
        es: "Top 10 frente a los mejores del mundo",
      },
      category: "UCI WorldTour",
      date: "2023-09",
      stats: { position: "8e", peloton: "150 coureurs" },
    },
    {
      id: "4",
      title: {
        fr: "Camp altitude - Colorado",
        en: "Altitude Camp - Colorado",
        es: "Campamento de altitud - Colorado",
      },
      description: {
        fr: "Préparation pour la saison 2025",
        en: "Preparation for the 2025 season",
        es: "Preparación para la temporada 2025",
      },
      category: { fr: "Entraînement", en: "Training", es: "Entrenamiento" },
      date: "2024-08",
    },
  ],
  testimonials: [
    {
      id: "1",
      name: "Louis Barbeau",
      role: {
        fr: "Directeur sportif, Équipe Québec",
        en: "Sports Director, Team Quebec",
        es: "Director deportivo, Equipo Quebec",
      },
      content: {
        fr: "Mathieu est un leader naturel. Sa capacité à performer sous pression inspire toute l'équipe.",
        en: "Mathieu is a natural leader. His ability to perform under pressure inspires the whole team.",
        es: "Mathieu es un líder natural. Su capacidad para rendir bajo presión inspira a todo el equipo.",
      },
      rating: 5,
    },
    {
      id: "2",
      name: "Véronique Cloutier",
      role: {
        fr: "Présidente, Cyclisme Canada",
        en: "President, Cycling Canada",
        es: "Presidenta, Ciclismo Canadá",
      },
      content: {
        fr: "Un ambassadeur passionné qui redonne à la communauté cycliste québécoise.",
        en: "A passionate ambassador who gives back to the Quebec cycling community.",
        es: "Un embajador apasionado que devuelve a la comunidad ciclista de Quebec.",
      },
      rating: 5,
    },
  ],
  sponsors: [
    {
      id: "1",
      name: "Vélo Québec",
      category: "title",
      description: "Partenaire titre depuis 2022",
      websiteUrl: "https://www.velo.qc.ca",
    },
    {
      id: "2",
      name: "Cycles Marinoni",
      category: "technical",
      description: "Cadres sur mesure fabriqués au Québec",
      websiteUrl: "https://www.marinoni.qc.ca",
    },
    {
      id: "3",
      name: "Louis Garneau",
      category: "technical",
      description: "Équipement et vêtements de performance",
      websiteUrl: "https://www.garneau.com",
    },
    {
      id: "4",
      name: "Desjardins",
      category: "support",
      description: "Fier partenaire du sport québécois",
      websiteUrl: "https://www.desjardins.com",
    },
    {
      id: "5",
      name: "IGA",
      category: "support",
      description: "Nutrition et alimentation santé",
      websiteUrl: "https://www.iga.net",
    },
  ],
  calendar: [
    {
      id: "1",
      title: "Tour de Beauce",
      date: "2025-06-15",
      location: "Beauce, Québec",
      type: "competition",
      description: "Course par étapes UCI - Défense du titre",
    },
    {
      id: "2",
      title: "Championnats canadiens sur route",
      date: "2025-06-28",
      location: "Ottawa, Ontario",
      type: "competition",
    },
    {
      id: "3",
      title: "Camp altitude",
      date: "2025-07-10",
      location: "Flagstaff, Arizona",
      type: "training",
      description: "Préparation pour les Grands Prix québécois",
    },
    {
      id: "4",
      title: "Grand Prix Cycliste de Québec",
      date: "2025-09-12",
      location: "Québec, Québec",
      type: "competition",
      description: "UCI WorldTour",
    },
    {
      id: "5",
      title: "Grand Prix Cycliste de Montréal",
      date: "2025-09-14",
      location: "Montréal, Québec",
      type: "competition",
      description: "UCI WorldTour",
    },
    {
      id: "6",
      title: "Soirée bénéfice - Fondation Vélo Jeunesse",
      date: "2025-10-05",
      location: "Québec, Québec",
      type: "appearance",
    },
  ],
};

export const freelancerProfile: DemoProfileData = {
  config: {
    type: "freelancer",
    name: "Jean-Marc Bouchard",
    tagline: "Homme à tout faire - Rénovations & Réparations",
    description: "Plus de 20 ans d'expérience en rénovation résidentielle. Travail soigné, prix honnêtes, service fiable.",
    primaryColor: "orange",
    features: {
      portfolio: true,
      services: true,
      testimonials: true,
      booking: true,
      properties: false,
      blog: true,
      contact: true,
      newsletter: true,
    },
    navigation: [
      { id: "home", label: "Accueil", slug: "" },
      { id: "services", label: "Services", slug: "services" },
      { id: "portfolio", label: "Réalisations", slug: "realisations" },
      { id: "testimonials", label: "Témoignages", slug: "temoignages" },
      { id: "contact", label: "Contact", slug: "contact" },
    ],
    pages: [
      {
        slug: "",
        title: "Accueil",
        sections: [
          { id: "hero", type: "hero" },
          { id: "services-preview", type: "services", title: "Mes services" },
          { id: "portfolio-preview", type: "portfolio", title: "Réalisations récentes" },
          { id: "testimonials-preview", type: "testimonials", title: "Ce que mes clients disent" },
          { id: "cta", type: "cta" },
        ],
      },
      {
        slug: "services",
        title: "Services",
        sections: [
          { id: "hero", type: "hero" },
          { id: "services-full", type: "services", title: "Tous mes services", subtitle: "Du petit dépannage à la rénovation complète" },
        ],
      },
      {
        slug: "realisations",
        title: "Réalisations",
        sections: [
          { id: "hero", type: "hero" },
          { id: "portfolio-full", type: "portfolio", title: "Mes réalisations" },
        ],
      },
      {
        slug: "temoignages",
        title: "Témoignages",
        sections: [
          { id: "hero", type: "hero" },
          { id: "testimonials-full", type: "testimonials", title: "Témoignages clients" },
          { id: "cta", type: "cta" },
        ],
      },
      {
        slug: "contact",
        title: "Contact",
        sections: [
          { id: "hero", type: "hero" },
          { id: "contact", type: "contact" },
        ],
      },
    ],
  },
  portfolio: [
    {
      id: "1",
      title: "Rénovation cuisine complète",
      description: "Transformation d'une cuisine des années 80 en espace moderne et fonctionnel",
      category: "Rénovation",
    },
    {
      id: "2",
      title: "Terrasse en cèdre",
      description: "Construction d'une terrasse 16x20 avec pergola intégrée",
      category: "Construction",
    },
    {
      id: "3",
      title: "Finition de sous-sol",
      description: "Aménagement complet incluant salle familiale, chambre et salle de bain",
      category: "Rénovation",
    },
    {
      id: "4",
      title: "Remplacement de fenêtres",
      description: "Installation de 12 fenêtres écoénergétiques avec finition intérieure",
      category: "Installation",
    },
  ],
  services: [
    {
      id: "1",
      title: "Petites réparations",
      description: "Robinetterie, prises électriques, portes, fenêtres, trous dans les murs",
      price: "75 $/heure",
      features: ["Déplacement inclus", "Matériaux de base inclus", "Travail garanti", "Disponible rapidement"],
    },
    {
      id: "2",
      title: "Rénovation intérieure",
      description: "Cuisine, salle de bain, sous-sol, planchers, peinture",
      price: "Sur devis",
      features: ["Estimation gratuite", "Plans et conseils", "Gestion des sous-traitants", "Permis si requis"],
    },
    {
      id: "3",
      title: "Travaux extérieurs",
      description: "Terrasses, clôtures, cabanons, pavé-uni, toiture mineure",
      price: "Sur devis",
      features: ["Travail saisonnier", "Matériaux de qualité", "Nettoyage complet", "Photos avant/après"],
    },
  ],
  testimonials: [
    {
      id: "1",
      name: "Sylvie Côté",
      role: "Propriétaire, Lévis",
      content: "Jean-Marc a refait notre salle de bain en une semaine. Propre, ponctuel et le résultat est magnifique!",
      rating: 5,
    },
    {
      id: "2",
      name: "Michel Tremblay",
      role: "Propriétaire, Québec",
      content: "Enfin un homme à tout faire fiable! Il répond au téléphone et arrive à l'heure. Travail impeccable.",
      rating: 5,
    },
    {
      id: "3",
      name: "Famille Lapointe",
      role: "Propriétaires, Beauport",
      content: "Notre terrasse est superbe. Jean-Marc nous a bien conseillés et le prix était très raisonnable.",
      rating: 5,
    },
  ],
};

export const rentalHostProfile: DemoProfileData = {
  config: {
    type: "rental-host",
    name: "Chalets Lac-Sergent",
    tagline: "L'authenticité québécoise au bord de l'eau",
    description: "Nos chalets en bois rond vous offrent une expérience typiquement québécoise. Poêle à bois, quai privé et nature à perte de vue.",
    primaryColor: "green",
    features: {
      portfolio: false,
      services: false,
      testimonials: true,
      booking: true,
      properties: true,
      blog: true,
      contact: true,
      newsletter: true,
    },
    navigation: [
      { id: "home", label: "Accueil", slug: "" },
      { id: "chalets", label: "Nos chalets", slug: "chalets" },
      { id: "testimonials", label: "Témoignages", slug: "temoignages" },
      { id: "contact", label: "Contact", slug: "contact" },
    ],
    pages: [
      {
        slug: "",
        title: "Accueil",
        sections: [
          { id: "hero", type: "hero" },
          { id: "properties-preview", type: "properties", title: "Nos chalets", subtitle: "Choisissez votre havre de paix" },
          { id: "testimonials-preview", type: "testimonials", title: "Ce que nos invités disent" },
          { id: "cta", type: "cta" },
        ],
      },
      {
        slug: "chalets",
        title: "Nos chalets",
        sections: [
          { id: "hero", type: "hero" },
          { id: "properties-full", type: "properties", title: "Tous nos chalets", subtitle: "Trouvez le chalet parfait pour votre séjour" },
        ],
      },
      {
        slug: "temoignages",
        title: "Témoignages",
        sections: [
          { id: "hero", type: "hero" },
          { id: "testimonials-full", type: "testimonials", title: "Témoignages de nos invités" },
          { id: "cta", type: "cta" },
        ],
      },
      {
        slug: "contact",
        title: "Contact",
        sections: [
          { id: "hero", type: "hero" },
          { id: "contact", type: "contact" },
        ],
      },
    ],
  },
  properties: [
    {
      id: "1",
      name: "Le Coureur des Bois",
      location: "Lac-Sergent, Portneuf",
      description: "Chalet en bois rond authentique avec poêle à combustion lente et vue imprenable sur le lac. Quai privé avec chaloupe incluse.",
      pricePerNight: 275,
      maxGuests: 6,
      bedrooms: 3,
      bathrooms: 1,
      amenities: ["Poêle à bois", "Quai privé", "Chaloupe", "BBQ au charbon", "Raquettes", "Pas de WiFi"],
    },
    {
      id: "2",
      name: "La Cabane à Sucre",
      location: "Lac-Sergent, Portneuf",
      description: "Petit chalet rustique au coeur de l'érablière. Parfait pour se déconnecter et profiter du silence.",
      pricePerNight: 165,
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 1,
      amenities: ["Poêle à bois", "Sentiers pédestres", "Feu de camp", "Eau de source"],
    },
    {
      id: "3",
      name: "Le Grand Camp",
      location: "Lac-Sergent, Portneuf",
      description: "Notre plus grand chalet, idéal pour les grandes familles. Deux poêles à bois, immense galerie et accès direct au lac.",
      pricePerNight: 425,
      maxGuests: 12,
      bedrooms: 5,
      bathrooms: 2,
      amenities: ["2 poêles à bois", "Grande galerie", "Quai avec pédalo", "Canot", "Sauna finlandais", "Salle de jeux"],
    },
  ],
  testimonials: [
    {
      id: "1",
      name: "Famille Gagnon",
      role: "Trois-Rivières",
      content: "On cherchait un vrai chalet québécois, pas un condo déguisé. Le Coureur des Bois, c'est exactement ça. Les enfants ont adoré la chaloupe!",
      rating: 5,
    },
    {
      id: "2",
      name: "Marie-Ève et François",
      role: "Montréal",
      content: "La Cabane à Sucre nous a permis de vraiment décrocher. Pas de WiFi, juste le silence et le crépitement du feu. On revient cet hiver!",
      rating: 5,
    },
    {
      id: "3",
      name: "Les cousins Bélanger",
      role: "Réunion familiale annuelle",
      content: "Ça fait 3 ans qu'on loue Le Grand Camp pour nos retrouvailles. L'espace, le sauna, le lac... c'est devenu notre tradition.",
      rating: 5,
    },
  ],
};

// Cleaning service profile - entretien ménager
export const cleaningProfile: DemoProfileData = {
  config: {
    type: "cleaning",
    name: {
      fr: "Nettoyage Brillance",
      en: "Brilliance Cleaning",
      es: "Limpieza Brillantez",
    },
    tagline: {
      fr: "Services d'entretien ménager professionnel",
      en: "Professional Housekeeping Services",
      es: "Servicios profesionales de limpieza",
    },
    description: {
      fr: "Service de ménage résidentiel et commercial de qualité. Produits écologiques, équipe fiable et satisfaction garantie.",
      en: "Quality residential and commercial cleaning service. Eco-friendly products, reliable team, and guaranteed satisfaction.",
      es: "Servicio de limpieza residencial y comercial de calidad. Productos ecológicos, equipo confiable y satisfacción garantizada.",
    },
    primaryColor: "teal",
    features: {
      portfolio: true,
      services: true,
      testimonials: true,
      booking: true,
      properties: false,
      blog: false,
      contact: true,
      newsletter: true,
    },
    navigation: [
      { id: "home", label: { fr: "Accueil", en: "Home", es: "Inicio" }, slug: "" },
      { id: "services", label: { fr: "Services", en: "Services", es: "Servicios" }, slug: "services" },
      { id: "gallery", label: { fr: "Réalisations", en: "Gallery", es: "Galería" }, slug: "realisations" },
      { id: "testimonials", label: { fr: "Témoignages", en: "Testimonials", es: "Testimonios" }, slug: "temoignages" },
      { id: "contact", label: "Contact", slug: "contact" },
    ],
    pages: [
      {
        slug: "",
        title: { fr: "Accueil", en: "Home", es: "Inicio" },
        sections: [
          { id: "hero", type: "hero" },
          { id: "services-preview", type: "services", title: { fr: "Nos services", en: "Our Services", es: "Nuestros servicios" } },
          { id: "testimonials-preview", type: "testimonials", title: { fr: "Clients satisfaits", en: "Satisfied Clients", es: "Clientes satisfechos" } },
          { id: "cta", type: "cta" },
        ],
      },
      {
        slug: "services",
        title: { fr: "Services", en: "Services", es: "Servicios" },
        sections: [
          { id: "hero", type: "hero" },
          { id: "services-full", type: "services", title: { fr: "Tous nos services", en: "All Our Services", es: "Todos nuestros servicios" } },
          { id: "cta", type: "cta" },
        ],
      },
      {
        slug: "realisations",
        title: { fr: "Réalisations", en: "Gallery", es: "Galería" },
        sections: [
          { id: "hero", type: "hero" },
          { id: "portfolio-full", type: "portfolio", title: { fr: "Nos réalisations", en: "Our Work", es: "Nuestro trabajo" } },
        ],
      },
      {
        slug: "temoignages",
        title: { fr: "Témoignages", en: "Testimonials", es: "Testimonios" },
        sections: [
          { id: "hero", type: "hero" },
          { id: "testimonials-full", type: "testimonials", title: { fr: "Ce que nos clients disent", en: "What Our Clients Say", es: "Lo que dicen nuestros clientes" } },
        ],
      },
      {
        slug: "contact",
        title: "Contact",
        sections: [
          { id: "hero", type: "hero" },
          { id: "contact", type: "contact" },
        ],
      },
    ],
  },
  services: [
    {
      id: "1",
      title: { fr: "Ménage résidentiel", en: "Residential Cleaning", es: "Limpieza residencial" },
      description: { fr: "Nettoyage complet de votre maison ou appartement. Cuisine, salles de bain, chambres et espaces de vie.", en: "Complete cleaning of your house or apartment. Kitchen, bathrooms, bedrooms, and living areas.", es: "Limpieza completa de su casa o apartamento. Cocina, baños, dormitorios y áreas de estar." },
      price: { fr: "À partir de 120 $", en: "From $120", es: "Desde $120" },
      features: { fr: ["Produits écologiques", "Personnel vérifié", "Service flexible", "Satisfaction garantie"], en: ["Eco-friendly products", "Verified staff", "Flexible service", "Satisfaction guaranteed"], es: ["Productos ecológicos", "Personal verificado", "Servicio flexible", "Satisfacción garantizada"] },
    },
    {
      id: "2",
      title: { fr: "Grand ménage", en: "Deep Cleaning", es: "Limpieza profunda" },
      description: { fr: "Nettoyage en profondeur pour un résultat impeccable. Idéal pour le printemps ou avant/après déménagement.", en: "Thorough deep cleaning for impeccable results. Ideal for spring or before/after moving.", es: "Limpieza profunda para resultados impecables. Ideal para primavera o antes/después de mudanzas." },
      price: { fr: "Sur devis", en: "Quote on request", es: "Presupuesto a solicitud" },
      features: { fr: ["Électroménagers inclus", "Intérieur des armoires", "Fenêtres intérieures", "Désinfection complète"], en: ["Appliances included", "Inside cabinets", "Interior windows", "Complete disinfection"], es: ["Electrodomésticos incluidos", "Interior de armarios", "Ventanas interiores", "Desinfección completa"] },
    },
    {
      id: "3",
      title: { fr: "Entretien commercial", en: "Commercial Cleaning", es: "Limpieza comercial" },
      description: { fr: "Services d'entretien pour bureaux, commerces et espaces professionnels.", en: "Maintenance services for offices, shops, and professional spaces.", es: "Servicios de mantenimiento para oficinas, tiendas y espacios profesionales." },
      price: { fr: "Contrat mensuel", en: "Monthly contract", es: "Contrato mensual" },
      features: { fr: ["Service de soir disponible", "Équipe dédiée", "Fournitures incluses", "Rapport mensuel"], en: ["Evening service available", "Dedicated team", "Supplies included", "Monthly report"], es: ["Servicio nocturno disponible", "Equipo dedicado", "Suministros incluidos", "Informe mensual"] },
    },
  ],
  portfolio: [
    {
      id: "1",
      title: { fr: "Appartement Montcalm", en: "Montcalm Apartment", es: "Apartamento Montcalm" },
      description: { fr: "Grand ménage avant emménagement", en: "Deep cleaning before move-in", es: "Limpieza profunda antes de mudanza" },
      category: { fr: "Résidentiel", en: "Residential", es: "Residencial" },
    },
    {
      id: "2",
      title: { fr: "Bureaux centre-ville", en: "Downtown Offices", es: "Oficinas centro" },
      description: { fr: "Contrat d'entretien hebdomadaire", en: "Weekly maintenance contract", es: "Contrato de mantenimiento semanal" },
      category: { fr: "Commercial", en: "Commercial", es: "Comercial" },
    },
    {
      id: "3",
      title: { fr: "Maison unifamiliale", en: "Single-family Home", es: "Casa unifamiliar" },
      description: { fr: "Entretien régulier aux 2 semaines", en: "Regular bi-weekly maintenance", es: "Mantenimiento regular quincenal" },
      category: { fr: "Résidentiel", en: "Residential", es: "Residencial" },
    },
  ],
  testimonials: [
    {
      id: "1",
      name: "Caroline Dubois",
      role: { fr: "Cliente régulière, Sainte-Foy", en: "Regular client, Sainte-Foy", es: "Cliente regular, Sainte-Foy" },
      content: { fr: "Ça fait 2 ans que l'équipe vient aux 2 semaines. Toujours ponctuels, toujours impeccables. Je recommande sans hésiter!", en: "The team has been coming every 2 weeks for 2 years. Always punctual, always impeccable. I recommend without hesitation!", es: "El equipo ha venido cada 2 semanas durante 2 años. Siempre puntuales, siempre impecables. ¡Lo recomiendo sin dudarlo!" },
      rating: 5,
    },
    {
      id: "2",
      name: "Martin Pelletier",
      role: { fr: "Gestionnaire d'immeuble, Québec", en: "Building Manager, Quebec", es: "Administrador de edificios, Quebec" },
      content: { fr: "Nous faisons appel à Nettoyage Brillance pour les aires communes de notre immeuble. Service professionnel et fiable.", en: "We use Brilliance Cleaning for the common areas of our building. Professional and reliable service.", es: "Utilizamos Limpieza Brillantez para las áreas comunes de nuestro edificio. Servicio profesional y confiable." },
      rating: 5,
    },
  ],
};

// Sports club profile - club de vélo
export const sportsClubProfile: DemoProfileData = {
  config: {
    type: "sports-club",
    name: {
      fr: "Vélo Club Portneuf",
      en: "Portneuf Cycling Club",
      es: "Club Ciclista Portneuf",
    },
    tagline: {
      fr: "Passion du vélo depuis 1985",
      en: "Cycling passion since 1985",
      es: "Pasión por el ciclismo desde 1985",
    },
    description: {
      fr: "Club de cyclisme pour tous les niveaux. Sorties de groupe, formations, événements et communauté passionnée.",
      en: "Cycling club for all levels. Group rides, training, events, and a passionate community.",
      es: "Club de ciclismo para todos los niveles. Salidas en grupo, formación, eventos y comunidad apasionada.",
    },
    primaryColor: "red",
    features: {
      portfolio: true,
      services: true,
      testimonials: true,
      booking: true,
      properties: false,
      blog: true,
      contact: true,
      newsletter: true,
      sponsors: true,
      calendar: true,
    },
    navigation: [
      { id: "home", label: { fr: "Accueil", en: "Home", es: "Inicio" }, slug: "" },
      { id: "about", label: { fr: "Le club", en: "About", es: "El club" }, slug: "club" },
      { id: "calendar", label: { fr: "Calendrier", en: "Calendar", es: "Calendario" }, slug: "calendrier" },
      { id: "membership", label: { fr: "Adhésion", en: "Membership", es: "Membresía" }, slug: "adhesion" },
      { id: "contact", label: "Contact", slug: "contact" },
    ],
    pages: [
      {
        slug: "",
        title: { fr: "Accueil", en: "Home", es: "Inicio" },
        sections: [
          { id: "hero", type: "hero" },
          { id: "services-preview", type: "services", title: { fr: "Nos activités", en: "Our Activities", es: "Nuestras actividades" } },
          { id: "calendar-preview", type: "calendar", title: { fr: "Prochaines sorties", en: "Upcoming Rides", es: "Próximas salidas" } },
          { id: "sponsors", type: "sponsors", title: { fr: "Nos partenaires", en: "Our Partners", es: "Nuestros socios" } },
          { id: "cta", type: "cta" },
        ],
      },
      {
        slug: "club",
        title: { fr: "Le club", en: "About", es: "El club" },
        sections: [
          { id: "hero", type: "hero" },
          { id: "portfolio", type: "portfolio", title: { fr: "Nos moments forts", en: "Our Highlights", es: "Nuestros momentos destacados" } },
          { id: "testimonials", type: "testimonials", title: { fr: "Témoignages de membres", en: "Member Testimonials", es: "Testimonios de miembros" } },
        ],
      },
      {
        slug: "calendrier",
        title: { fr: "Calendrier", en: "Calendar", es: "Calendario" },
        sections: [
          { id: "hero", type: "hero" },
          { id: "calendar-full", type: "calendar", title: { fr: "Calendrier 2025", en: "2025 Calendar", es: "Calendario 2025" } },
        ],
      },
      {
        slug: "adhesion",
        title: { fr: "Adhésion", en: "Membership", es: "Membresía" },
        sections: [
          { id: "hero", type: "hero" },
          { id: "services-full", type: "services", title: { fr: "Formules d'adhésion", en: "Membership Options", es: "Opciones de membresía" } },
          { id: "cta", type: "cta" },
        ],
      },
      {
        slug: "contact",
        title: "Contact",
        sections: [
          { id: "hero", type: "hero" },
          { id: "contact", type: "contact" },
        ],
      },
    ],
  },
  services: [
    {
      id: "1",
      title: { fr: "Membre individuel", en: "Individual Member", es: "Miembro individual" },
      description: { fr: "Accès à toutes les sorties de groupe et événements du club.", en: "Access to all group rides and club events.", es: "Acceso a todas las salidas en grupo y eventos del club." },
      price: { fr: "75 $/an", en: "$75/year", es: "$75/año" },
      features: { fr: ["Sorties de groupe", "Événements sociaux", "Rabais partenaires", "Jersey du club"], en: ["Group rides", "Social events", "Partner discounts", "Club jersey"], es: ["Salidas en grupo", "Eventos sociales", "Descuentos de socios", "Jersey del club"] },
    },
    {
      id: "2",
      title: { fr: "Membre famille", en: "Family Member", es: "Miembro familiar" },
      description: { fr: "Adhésion pour toute la famille (même adresse).", en: "Membership for the whole family (same address).", es: "Membresía para toda la familia (misma dirección)." },
      price: { fr: "125 $/an", en: "$125/year", es: "$125/año" },
      features: { fr: ["Jusqu'à 4 membres", "Sorties familiales", "Camp de jour vélo", "Équipement jeunesse"], en: ["Up to 4 members", "Family rides", "Cycling day camp", "Youth equipment"], es: ["Hasta 4 miembros", "Salidas familiares", "Campamento de día", "Equipo juvenil"] },
    },
    {
      id: "3",
      title: { fr: "Membre compétition", en: "Competition Member", es: "Miembro competición" },
      description: { fr: "Pour les cyclistes qui souhaitent participer aux courses.", en: "For cyclists who want to participate in races.", es: "Para ciclistas que desean participar en carreras." },
      price: { fr: "150 $/an", en: "$150/year", es: "$150/año" },
      features: { fr: ["Licence FQSC incluse", "Entraînements structurés", "Coach certifié", "Support mécanique"], en: ["FQSC license included", "Structured training", "Certified coach", "Mechanical support"], es: ["Licencia FQSC incluida", "Entrenamientos estructurados", "Entrenador certificado", "Soporte mecánico"] },
    },
  ],
  portfolio: [
    {
      id: "1",
      title: { fr: "Tour de Portneuf 2024", en: "2024 Portneuf Tour", es: "Tour de Portneuf 2024" },
      description: { fr: "Notre événement annuel avec 300 participants", en: "Our annual event with 300 participants", es: "Nuestro evento anual con 300 participantes" },
      category: { fr: "Événement", en: "Event", es: "Evento" },
      date: "2024-08",
    },
    {
      id: "2",
      title: { fr: "Camp d'entraînement Charlevoix", en: "Charlevoix Training Camp", es: "Campamento Charlevoix" },
      description: { fr: "Fin de semaine intensive dans les montagnes", en: "Intensive weekend in the mountains", es: "Fin de semana intensivo en las montañas" },
      category: { fr: "Entraînement", en: "Training", es: "Entrenamiento" },
      date: "2024-05",
    },
    {
      id: "3",
      title: { fr: "Fête des 40 ans", en: "40th Anniversary", es: "40 aniversario" },
      description: { fr: "Célébration avec anciens et nouveaux membres", en: "Celebration with past and present members", es: "Celebración con miembros antiguos y nuevos" },
      category: { fr: "Social", en: "Social", es: "Social" },
      date: "2025-06",
    },
  ],
  testimonials: [
    {
      id: "1",
      name: "Pierre Lavoie",
      role: { fr: "Membre depuis 15 ans", en: "Member for 15 years", es: "Miembro desde hace 15 años" },
      content: { fr: "Le club m'a permis de découvrir ma passion pour le vélo et de me faire des amis pour la vie.", en: "The club helped me discover my passion for cycling and make lifelong friends.", es: "El club me ayudó a descubrir mi pasión por el ciclismo y hacer amigos para toda la vida." },
      rating: 5,
    },
    {
      id: "2",
      name: "Sophie Morin",
      role: { fr: "Nouvelle membre 2024", en: "New member 2024", es: "Nueva miembro 2024" },
      content: { fr: "Je cherchais un groupe accueillant pour débuter. L'ambiance est super et tout le monde m'a mise à l'aise!", en: "I was looking for a welcoming group to start. The atmosphere is great and everyone made me feel comfortable!", es: "Buscaba un grupo acogedor para empezar. ¡El ambiente es genial y todos me hicieron sentir cómoda!" },
      rating: 5,
    },
  ],
  sponsors: [
    {
      id: "1",
      name: "Cycles ABC",
      category: "technical",
      description: "Boutique vélo partenaire officielle",
      websiteUrl: "https://www.cyclesabc.ca",
    },
    {
      id: "2",
      name: "Caisse Desjardins Portneuf",
      category: "title",
      description: "Partenaire principal depuis 2010",
      websiteUrl: "https://www.desjardins.com",
    },
    {
      id: "3",
      name: "Ville de Pont-Rouge",
      category: "support",
      description: "Soutien aux événements locaux",
    },
  ],
  calendar: [
    {
      id: "1",
      title: "Sortie hebdomadaire - Niveau 1",
      date: "2025-05-15",
      location: "Pont-Rouge",
      type: "training",
      description: "40 km, rythme modéré",
    },
    {
      id: "2",
      title: "Sortie hebdomadaire - Niveau 2-3",
      date: "2025-05-15",
      location: "Pont-Rouge",
      type: "training",
      description: "70 km, rythme soutenu",
    },
    {
      id: "3",
      title: "Tour de Portneuf",
      date: "2025-08-17",
      location: "Pont-Rouge",
      type: "competition",
      description: "Événement annuel - 50/100/150 km",
    },
    {
      id: "4",
      title: "Souper de fin de saison",
      date: "2025-10-18",
      location: "Salle communautaire Pont-Rouge",
      type: "appearance",
      description: "Remise des prix et célébrations",
    },
  ],
};

// Professional profile - consultant/avocat/comptable
export const professionalProfile: DemoProfileData = {
  config: {
    type: "professional",
    name: {
      fr: "Me Catherine Bergeron",
      en: "Catherine Bergeron, Esq.",
      es: "Abog. Catherine Bergeron",
    },
    tagline: {
      fr: "Avocate en droit des affaires",
      en: "Business Law Attorney",
      es: "Abogada de derecho empresarial",
    },
    description: {
      fr: "Plus de 15 ans d'expérience en droit commercial et corporatif. Accompagnement personnalisé pour entrepreneurs et PME.",
      en: "Over 15 years of experience in commercial and corporate law. Personalized support for entrepreneurs and SMEs.",
      es: "Más de 15 años de experiencia en derecho comercial y corporativo. Acompañamiento personalizado para emprendedores y PYMES.",
    },
    primaryColor: "slate",
    features: {
      portfolio: true,
      services: true,
      testimonials: true,
      booking: true,
      properties: false,
      blog: true,
      contact: true,
      newsletter: true,
    },
    navigation: [
      { id: "home", label: { fr: "Accueil", en: "Home", es: "Inicio" }, slug: "" },
      { id: "expertise", label: { fr: "Expertise", en: "Expertise", es: "Experiencia" }, slug: "expertise" },
      { id: "about", label: { fr: "À propos", en: "About", es: "Acerca de" }, slug: "a-propos" },
      { id: "contact", label: "Contact", slug: "contact" },
    ],
    pages: [
      {
        slug: "",
        title: { fr: "Accueil", en: "Home", es: "Inicio" },
        sections: [
          { id: "hero", type: "hero" },
          { id: "services-preview", type: "services", title: { fr: "Domaines de pratique", en: "Practice Areas", es: "Áreas de práctica" } },
          { id: "testimonials-preview", type: "testimonials", title: { fr: "Ce que mes clients disent", en: "Client Testimonials", es: "Testimonios de clientes" } },
          { id: "cta", type: "cta" },
        ],
      },
      {
        slug: "expertise",
        title: { fr: "Expertise", en: "Expertise", es: "Experiencia" },
        sections: [
          { id: "hero", type: "hero" },
          { id: "services-full", type: "services", title: { fr: "Mes domaines d'expertise", en: "My Areas of Expertise", es: "Mis áreas de experiencia" } },
          { id: "portfolio", type: "portfolio", title: { fr: "Dossiers représentatifs", en: "Representative Cases", es: "Casos representativos" } },
        ],
      },
      {
        slug: "a-propos",
        title: { fr: "À propos", en: "About", es: "Acerca de" },
        sections: [
          { id: "hero", type: "hero" },
          { id: "richText", type: "richText" },
          { id: "testimonials-full", type: "testimonials", title: { fr: "Témoignages", en: "Testimonials", es: "Testimonios" } },
        ],
      },
      {
        slug: "contact",
        title: "Contact",
        sections: [
          { id: "hero", type: "hero" },
          { id: "contact", type: "contact" },
        ],
      },
    ],
  },
  services: [
    {
      id: "1",
      title: { fr: "Droit corporatif", en: "Corporate Law", es: "Derecho corporativo" },
      description: { fr: "Constitution, réorganisation, fusion et acquisition d'entreprises.", en: "Incorporation, reorganization, merger, and acquisition of businesses.", es: "Constitución, reorganización, fusión y adquisición de empresas." },
      features: { fr: ["Incorporation", "Convention d'actionnaires", "Gouvernance", "Fusion & acquisition"], en: ["Incorporation", "Shareholder agreement", "Governance", "Merger & acquisition"], es: ["Incorporación", "Convenio de accionistas", "Gobernanza", "Fusión y adquisición"] },
    },
    {
      id: "2",
      title: { fr: "Droit commercial", en: "Commercial Law", es: "Derecho comercial" },
      description: { fr: "Contrats commerciaux, distribution, franchises et partenariats.", en: "Commercial contracts, distribution, franchises, and partnerships.", es: "Contratos comerciales, distribución, franquicias y asociaciones." },
      features: { fr: ["Contrats commerciaux", "Ententes de distribution", "Franchises", "Joint ventures"], en: ["Commercial contracts", "Distribution agreements", "Franchises", "Joint ventures"], es: ["Contratos comerciales", "Acuerdos de distribución", "Franquicias", "Joint ventures"] },
    },
    {
      id: "3",
      title: { fr: "Transactions immobilières", en: "Real Estate Transactions", es: "Transacciones inmobiliarias" },
      description: { fr: "Achat, vente et financement de biens immobiliers commerciaux.", en: "Purchase, sale, and financing of commercial real estate.", es: "Compra, venta y financiamiento de bienes raíces comerciales." },
      features: { fr: ["Achat commercial", "Financement", "Baux commerciaux", "Due diligence"], en: ["Commercial purchase", "Financing", "Commercial leases", "Due diligence"], es: ["Compra comercial", "Financiamiento", "Arrendamientos comerciales", "Due diligence"] },
    },
  ],
  portfolio: [
    {
      id: "1",
      title: { fr: "Acquisition majeure", en: "Major Acquisition", es: "Adquisición importante" },
      description: { fr: "Accompagnement d'un groupe alimentaire dans l'acquisition d'un concurrent régional.", en: "Supporting a food group in acquiring a regional competitor.", es: "Acompañamiento de un grupo alimentario en la adquisición de un competidor regional." },
      category: { fr: "Fusion & Acquisition", en: "Merger & Acquisition", es: "Fusión y Adquisición" },
    },
    {
      id: "2",
      title: { fr: "Restructuration", en: "Restructuring", es: "Reestructuración" },
      description: { fr: "Réorganisation corporative d'une entreprise manufacturière familiale.", en: "Corporate reorganization of a family manufacturing business.", es: "Reorganización corporativa de una empresa manufacturera familiar." },
      category: { fr: "Droit corporatif", en: "Corporate Law", es: "Derecho corporativo" },
    },
    {
      id: "3",
      title: { fr: "Expansion internationale", en: "International Expansion", es: "Expansión internacional" },
      description: { fr: "Structuration juridique pour l'expansion d'une techno québécoise aux États-Unis.", en: "Legal structuring for a Quebec tech company's expansion to the United States.", es: "Estructuración legal para la expansión de una tecnológica quebequense a Estados Unidos." },
      category: { fr: "Droit commercial", en: "Commercial Law", es: "Derecho comercial" },
    },
  ],
  testimonials: [
    {
      id: "1",
      name: "François Dupont",
      role: { fr: "PDG, Groupe Alimentaire FD", en: "CEO, FD Food Group", es: "CEO, Grupo Alimentario FD" },
      content: { fr: "Me Bergeron nous accompagne depuis 10 ans. Sa rigueur et son approche pragmatique nous ont permis de conclure des transactions complexes en toute confiance.", en: "Ms. Bergeron has been supporting us for 10 years. Her rigor and pragmatic approach have allowed us to close complex transactions with complete confidence.", es: "La Abog. Bergeron nos acompaña desde hace 10 años. Su rigor y enfoque pragmático nos han permitido cerrar transacciones complejas con total confianza." },
      rating: 5,
    },
    {
      id: "2",
      name: "Isabelle Morin",
      role: { fr: "Fondatrice, TechStart", en: "Founder, TechStart", es: "Fundadora, TechStart" },
      content: { fr: "Excellente avocate qui comprend les réalités des startups. Elle sait adapter ses conseils à notre contexte et notre budget.", en: "Excellent lawyer who understands startup realities. She knows how to adapt her advice to our context and budget.", es: "Excelente abogada que entiende las realidades de las startups. Sabe adaptar sus consejos a nuestro contexto y presupuesto." },
      rating: 5,
    },
  ],
};

export const demoProfiles: Record<ProfileType, DemoProfileData> = {
  athlete: athleteProfile,
  freelancer: freelancerProfile,
  "rental-host": rentalHostProfile,
  cleaning: cleaningProfile,
  "sports-club": sportsClubProfile,
  professional: professionalProfile,
};
