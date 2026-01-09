import { z } from "zod";

export const ProfileTypeSchema = z.enum(["athlete", "freelancer", "rental-host"]);
export type ProfileType = z.infer<typeof ProfileTypeSchema>;

export const ProfileConfigSchema = z.object({
  type: ProfileTypeSchema,
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  primaryColor: z.string(),
  features: z.object({
    portfolio: z.boolean(),
    services: z.boolean(),
    testimonials: z.boolean(),
    booking: z.boolean(),
    properties: z.boolean(),
    blog: z.boolean(),
    contact: z.boolean(),
    newsletter: z.boolean(),
  }),
});

export type ProfileConfig = z.infer<typeof ProfileConfigSchema>;

export const PortfolioItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  imageUrl: z.string().optional(),
  date: z.string().optional(),
  stats: z.record(z.string()).optional(),
});

export type PortfolioItem = z.infer<typeof PortfolioItemSchema>;

export const ServiceSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.string().optional(),
  features: z.array(z.string()),
});

export type Service = z.infer<typeof ServiceSchema>;

export const TestimonialSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  content: z.string(),
  avatarUrl: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

export type Testimonial = z.infer<typeof TestimonialSchema>;

export const DemoPropertySchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string(),
  description: z.string(),
  pricePerNight: z.number(),
  maxGuests: z.number(),
  bedrooms: z.number(),
  bathrooms: z.number(),
  amenities: z.array(z.string()),
  imageUrl: z.string().optional(),
});

export type DemoProperty = z.infer<typeof DemoPropertySchema>;

export interface DemoProfileData {
  config: ProfileConfig;
  portfolio?: PortfolioItem[];
  services?: Service[];
  testimonials?: Testimonial[];
  properties?: DemoProperty[];
}

export const athleteProfile: DemoProfileData = {
  config: {
    type: "athlete",
    name: "Mathieu Gagnon",
    tagline: "Cycliste professionnel sur route",
    description: "Champion canadien avec plus de 10 ans d'expérience sur le circuit international UCI.",
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
    },
  },
  portfolio: [
    {
      id: "1",
      title: "Tour de Beauce 2024",
      description: "Victoire au classement général",
      category: "Compétition",
      date: "2024-06",
      stats: { position: "1er", étapes: "2 victoires" },
    },
    {
      id: "2",
      title: "Championnats canadiens sur route",
      description: "Médaille d'or en contre-la-montre",
      category: "Compétition",
      date: "2024-06",
      stats: { position: "1er", temps: "47:23" },
    },
    {
      id: "3",
      title: "Grand Prix Cycliste de Québec",
      description: "Top 10 face aux meilleurs mondiaux",
      category: "UCI WorldTour",
      date: "2023-09",
      stats: { position: "8e", peloton: "150 coureurs" },
    },
    {
      id: "4",
      title: "Camp altitude - Colorado",
      description: "Préparation pour la saison 2025",
      category: "Entraînement",
      date: "2024-08",
    },
  ],
  testimonials: [
    {
      id: "1",
      name: "Louis Barbeau",
      role: "Directeur sportif, Équipe Québec",
      content: "Mathieu est un leader naturel. Sa capacité à performer sous pression inspire toute l'équipe.",
      rating: 5,
    },
    {
      id: "2",
      name: "Véronique Cloutier",
      role: "Présidente, Cyclisme Canada",
      content: "Un ambassadeur passionné qui redonne à la communauté cycliste québécoise.",
      rating: 5,
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

export const demoProfiles: Record<ProfileType, DemoProfileData> = {
  athlete: athleteProfile,
  freelancer: freelancerProfile,
  "rental-host": rentalHostProfile,
};
