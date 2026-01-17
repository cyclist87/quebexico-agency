import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Mountain, 
  Calendar, 
  Users, 
  Utensils, 
  Tent, 
  Heart, 
  MapPin, 
  ArrowRight,
  Check,
  Bike,
  Star,
  Clock,
  ChefHat,
  Sparkles
} from "lucide-react";
import heroImage from "@assets/IMG_0209_1768680687467.JPG";
import routeImage from "@assets/IMG_5452_1768680687458.jpg";
import campImage1 from "@assets/IMG_5547_1768680687466.JPG";
import campImage2 from "@assets/IMG_6035_1768680687466.JPG";
import campImage3 from "@assets/IMG_2247_1768680687465.JPG";
import campImage4 from "@assets/IMG_2025_1768680687468.JPG";
import sveinImage from "@assets/path-less-paved-svein-tuft_6_1768680597680.jpg";
import jmImage from "@assets/IMG_2496_1768680687465.JPG";

const translations = {
  fr: {
    nav: {
      experience: "L'Expérience",
      guides: "Vos Guides",
      program: "Programme",
      register: "S'inscrire"
    },
    hero: {
      badge: "Édition Québec 2025",
      title: "Charlevoix Cycling Tour",
      subtitle: "Une expérience cycliste d'exception dans les paysages majestueux de Charlevoix",
      description: "7 jours de gravel, de gastronomie et de connexion avec la nature. Guidé par Svein Tuft et Jean-Michel Lachance.",
      cta: "Rejoindre la liste d'attente",
      dates: "30 juillet - 5 août 2025"
    },
    experience: {
      title: "Plus qu'un camp cycliste",
      subtitle: "Une immersion complète",
      description: "Notre vision est de créer un voyage inoubliable qui transcende le camp cycliste typique. En combinant l'exploration de paysages époustouflants, les défis physiques et la quête du bien-être mental, nous visons à créer des souvenirs durables.",
      features: [
        {
          icon: "mountain",
          title: "Itinéraires exclusifs",
          description: "Routes gravel soigneusement sélectionnées à travers la beauté naturelle de Charlevoix"
        },
        {
          icon: "chef",
          title: "Chef privé",
          description: "Tous les repas préparés avec des ingrédients locaux frais par notre chef personnel"
        },
        {
          icon: "tent",
          title: "Hébergement premium",
          description: "Un mélange d'hôtel haut de gamme et de camping rustique de luxe"
        },
        {
          icon: "heart",
          title: "Massothérapie",
          description: "Récupération quotidienne avec séances de massage et yoga/étirements"
        },
        {
          icon: "users",
          title: "Communauté",
          description: "Connexion avec des cyclistes partageant les mêmes valeurs"
        },
        {
          icon: "sparkles",
          title: "Mindfulness",
          description: "Déconnexion digitale et présence dans l'instant"
        }
      ]
    },
    guides: {
      title: "Vos Guides",
      subtitle: "Guidés par des légendes du cyclisme canadien",
      svein: {
        name: "Svein Tuft",
        role: "Cycliste professionnel légendaire",
        bio: "L'un des cyclistes canadiens les plus célébrés, Svein apporte son prestige et sa profonde conviction dans le pouvoir transformateur du cyclisme. Son rôle de guide et mentor incarne son engagement à redonner à la communauté cycliste."
      },
      jm: {
        name: "Jean-Michel Lachance",
        role: "Athlète paralympique & Entrepreneur",
        bio: "Cycliste de haut niveau avec une expertise en logistique et entrepreneuriat. Participant aux Jeux paralympiques de Rio 2016, Jean-Michel unit sa passion pour le cyclisme et le développement personnel pour créer une expérience inégalée."
      }
    },
    program: {
      title: "Le Programme",
      subtitle: "7 jours d'aventure et de transformation",
      daily: {
        morning: {
          title: "Matin",
          description: "Petit-déjeuner gourmet préparé par notre chef, briefing sur la route du jour"
        },
        day: {
          title: "Journée",
          description: "Randonnées gravel guidées avec arrêts nutrition stratégiques"
        },
        evening: {
          title: "Soirée",
          description: "Récupération, yoga, massothérapie, festin culinaire sous les étoiles"
        }
      },
      highlights: [
        "Routes point-à-point à travers Charlevoix",
        "Ateliers informels sur le mindset et la nutrition",
        "Anecdotes du monde du cyclisme professionnel",
        "Techniques de cyclisme avancées",
        "Déconnexion complète (zone sans réseau)"
      ]
    },
    pricing: {
      title: "Réservez votre place",
      subtitle: "Places limitées pour une expérience exclusive",
      includes: "Ce qui est inclus",
      items: [
        "7 jours / 6 nuits d'hébergement",
        "Tous les repas par chef privé",
        "Support véhicule sur toutes les routes",
        "Massothérapie quotidienne",
        "Ateliers et coaching",
        "Transferts depuis Québec"
      ],
      note: "Vélo gravel non inclus. Location disponible sur demande.",
      waitlist: "Liste d'attente"
    },
    form: {
      title: "Rejoignez la liste d'attente",
      description: "Soyez parmi les premiers informés de l'ouverture des inscriptions",
      name: "Nom complet",
      email: "Courriel",
      experience: "Niveau d'expérience",
      experienceOptions: {
        intermediate: "Intermédiaire",
        advanced: "Avancé",
        expert: "Expert"
      },
      submit: "S'inscrire à la liste d'attente",
      success: "Merci! Vous êtes sur la liste d'attente.",
      successDesc: "Nous vous contacterons dès l'ouverture des inscriptions."
    },
    footer: {
      organized: "Organisé par",
      contact: "Contact"
    }
  },
  en: {
    nav: {
      experience: "The Experience",
      guides: "Your Guides",
      program: "Program",
      register: "Register"
    },
    hero: {
      badge: "Quebec Edition 2025",
      title: "Charlevoix Cycling Tour",
      subtitle: "An exceptional cycling experience in the majestic landscapes of Charlevoix",
      description: "7 days of gravel, gastronomy, and connection with nature. Guided by Svein Tuft and Jean-Michel Lachance.",
      cta: "Join the waitlist",
      dates: "July 30 - August 5, 2025"
    },
    experience: {
      title: "More than a cycling camp",
      subtitle: "A complete immersion",
      description: "Our vision is to craft an unforgettable journey that transcends the typical cycling camp. By combining the thrill of scenic exploration, physical challenges and the pursuit of mental well-being, we aim to create lasting memories.",
      features: [
        {
          icon: "mountain",
          title: "Exclusive Routes",
          description: "Carefully selected gravel routes through Charlevoix's natural beauty"
        },
        {
          icon: "chef",
          title: "Private Chef",
          description: "All meals prepared with fresh local ingredients by our personal chef"
        },
        {
          icon: "tent",
          title: "Premium Accommodation",
          description: "A blend of high-end hotel and luxury rustic camping"
        },
        {
          icon: "heart",
          title: "Massage Therapy",
          description: "Daily recovery with massage sessions and yoga/stretching"
        },
        {
          icon: "users",
          title: "Community",
          description: "Connect with like-minded cyclists"
        },
        {
          icon: "sparkles",
          title: "Mindfulness",
          description: "Digital disconnection and presence in the moment"
        }
      ]
    },
    guides: {
      title: "Your Guides",
      subtitle: "Led by Canadian cycling legends",
      svein: {
        name: "Svein Tuft",
        role: "Legendary Professional Cyclist",
        bio: "One of Canada's most celebrated cyclists, Svein brings his prestige and deep belief in the transformative power of cycling. His role as guide and mentor embodies his commitment to giving back to the cycling community."
      },
      jm: {
        name: "Jean-Michel Lachance",
        role: "Paralympic Athlete & Entrepreneur",
        bio: "Elite cyclist with expertise in logistics and entrepreneurship. Participant in the Rio 2016 Paralympic Games, Jean-Michel unites his passion for cycling and personal development to create an unparalleled experience."
      }
    },
    program: {
      title: "The Program",
      subtitle: "7 days of adventure and transformation",
      daily: {
        morning: {
          title: "Morning",
          description: "Gourmet breakfast prepared by our chef, briefing on the day's route"
        },
        day: {
          title: "Daytime",
          description: "Guided gravel rides with strategic nutrition stops"
        },
        evening: {
          title: "Evening",
          description: "Recovery, yoga, massage therapy, culinary feast under the stars"
        }
      },
      highlights: [
        "Point-to-point routes through Charlevoix",
        "Informal workshops on mindset and nutrition",
        "Stories from the professional cycling world",
        "Advanced cycling techniques",
        "Complete disconnection (no cell coverage zone)"
      ]
    },
    pricing: {
      title: "Reserve Your Spot",
      subtitle: "Limited spots for an exclusive experience",
      includes: "What's included",
      items: [
        "7 days / 6 nights accommodation",
        "All meals by private chef",
        "Vehicle support on all routes",
        "Daily massage therapy",
        "Workshops and coaching",
        "Transfers from Quebec City"
      ],
      note: "Gravel bike not included. Rental available on request.",
      waitlist: "Waitlist"
    },
    form: {
      title: "Join the Waitlist",
      description: "Be among the first to know when registration opens",
      name: "Full name",
      email: "Email",
      experience: "Experience level",
      experienceOptions: {
        intermediate: "Intermediate",
        advanced: "Advanced",
        expert: "Expert"
      },
      submit: "Join the waitlist",
      success: "Thank you! You're on the waitlist.",
      successDesc: "We'll contact you as soon as registration opens."
    },
    footer: {
      organized: "Organized by",
      contact: "Contact"
    }
  },
  es: {
    nav: {
      experience: "La Experiencia",
      guides: "Tus Guías",
      program: "Programa",
      register: "Registrarse"
    },
    hero: {
      badge: "Edición Quebec 2025",
      title: "Charlevoix Cycling Tour",
      subtitle: "Una experiencia ciclista excepcional en los majestuosos paisajes de Charlevoix",
      description: "7 días de gravel, gastronomía y conexión con la naturaleza. Guiado por Svein Tuft y Jean-Michel Lachance.",
      cta: "Unirse a la lista de espera",
      dates: "30 julio - 5 agosto 2025"
    },
    experience: {
      title: "Más que un campamento ciclista",
      subtitle: "Una inmersión completa",
      description: "Nuestra visión es crear un viaje inolvidable que trascienda el típico campamento ciclista. Combinando la emoción de la exploración paisajística, los desafíos físicos y la búsqueda del bienestar mental, buscamos crear recuerdos duraderos.",
      features: [
        {
          icon: "mountain",
          title: "Rutas Exclusivas",
          description: "Rutas gravel cuidadosamente seleccionadas a través de la belleza natural de Charlevoix"
        },
        {
          icon: "chef",
          title: "Chef Privado",
          description: "Todas las comidas preparadas con ingredientes locales frescos por nuestro chef personal"
        },
        {
          icon: "tent",
          title: "Alojamiento Premium",
          description: "Una mezcla de hotel de alta gama y camping rústico de lujo"
        },
        {
          icon: "heart",
          title: "Masoterapia",
          description: "Recuperación diaria con sesiones de masaje y yoga/estiramientos"
        },
        {
          icon: "users",
          title: "Comunidad",
          description: "Conexión con ciclistas que comparten los mismos valores"
        },
        {
          icon: "sparkles",
          title: "Mindfulness",
          description: "Desconexión digital y presencia en el momento"
        }
      ]
    },
    guides: {
      title: "Tus Guías",
      subtitle: "Guiados por leyendas del ciclismo canadiense",
      svein: {
        name: "Svein Tuft",
        role: "Ciclista Profesional Legendario",
        bio: "Uno de los ciclistas canadienses más celebrados, Svein aporta su prestigio y profunda creencia en el poder transformador del ciclismo. Su rol como guía y mentor encarna su compromiso de devolver a la comunidad ciclista."
      },
      jm: {
        name: "Jean-Michel Lachance",
        role: "Atleta Paralímpico & Emprendedor",
        bio: "Ciclista de élite con experiencia en logística y emprendimiento. Participante en los Juegos Paralímpicos de Río 2016, Jean-Michel une su pasión por el ciclismo y el desarrollo personal para crear una experiencia inigualable."
      }
    },
    program: {
      title: "El Programa",
      subtitle: "7 días de aventura y transformación",
      daily: {
        morning: {
          title: "Mañana",
          description: "Desayuno gourmet preparado por nuestro chef, briefing sobre la ruta del día"
        },
        day: {
          title: "Día",
          description: "Recorridos gravel guiados con paradas de nutrición estratégicas"
        },
        evening: {
          title: "Noche",
          description: "Recuperación, yoga, masoterapia, festín culinario bajo las estrellas"
        }
      },
      highlights: [
        "Rutas punto a punto a través de Charlevoix",
        "Talleres informales sobre mentalidad y nutrición",
        "Historias del mundo del ciclismo profesional",
        "Técnicas avanzadas de ciclismo",
        "Desconexión completa (zona sin cobertura)"
      ]
    },
    pricing: {
      title: "Reserva tu lugar",
      subtitle: "Plazas limitadas para una experiencia exclusiva",
      includes: "Qué está incluido",
      items: [
        "7 días / 6 noches de alojamiento",
        "Todas las comidas por chef privado",
        "Soporte de vehículo en todas las rutas",
        "Masoterapia diaria",
        "Talleres y coaching",
        "Traslados desde la ciudad de Quebec"
      ],
      note: "Bicicleta gravel no incluida. Alquiler disponible bajo petición.",
      waitlist: "Lista de espera"
    },
    form: {
      title: "Únete a la lista de espera",
      description: "Sé de los primeros en saber cuando se abra el registro",
      name: "Nombre completo",
      email: "Correo electrónico",
      experience: "Nivel de experiencia",
      experienceOptions: {
        intermediate: "Intermedio",
        advanced: "Avanzado",
        expert: "Experto"
      },
      submit: "Unirse a la lista de espera",
      success: "¡Gracias! Estás en la lista de espera.",
      successDesc: "Te contactaremos en cuanto se abra el registro."
    },
    footer: {
      organized: "Organizado por",
      contact: "Contacto"
    }
  }
};

function FeatureIcon({ icon }: { icon: string }) {
  const iconClass = "h-6 w-6";
  switch (icon) {
    case "mountain": return <Mountain className={iconClass} />;
    case "chef": return <ChefHat className={iconClass} />;
    case "tent": return <Tent className={iconClass} />;
    case "heart": return <Heart className={iconClass} />;
    case "users": return <Users className={iconClass} />;
    case "sparkles": return <Sparkles className={iconClass} />;
    default: return <Star className={iconClass} />;
  }
}

export default function CyclingCamp() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const lang = (language === "en" || language === "es" ? language : "fr") as "fr" | "en" | "es";
  const t = translations[lang];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    experience: "intermediate"
  });

  const waitlistMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; experienceLevel: string }) => {
      const res = await apiRequest("POST", "/api/camp-waitlist", {
        ...data,
        campType: "cycling-charlevoix"
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t.form.success,
        description: t.form.successDesc,
      });
      setFormData({ name: "", email: "", experience: "intermediate" });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    waitlistMutation.mutate({
      name: formData.name,
      email: formData.email,
      experienceLevel: formData.experience
    });
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Bike className="h-6 w-6 text-primary" />
              <span className="font-display font-bold text-lg">CCT</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => scrollToSection("experience")} 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="nav-experience"
              >
                {t.nav.experience}
              </button>
              <button 
                onClick={() => scrollToSection("guides")} 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="nav-guides"
              >
                {t.nav.guides}
              </button>
              <button 
                onClick={() => scrollToSection("program")} 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="nav-program"
              >
                {t.nav.program}
              </button>
              <Button size="sm" onClick={() => scrollToSection("register")} data-testid="nav-register">
                {t.nav.register}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Charlevoix landscape" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
              <Calendar className="h-3 w-3 mr-1" />
              {t.hero.badge}
            </Badge>
            
            <h1 className="font-display font-extrabold text-5xl md:text-7xl lg:text-8xl tracking-tight mb-6">
              {t.hero.title}
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-4 max-w-2xl mx-auto">
              {t.hero.subtitle}
            </p>
            
            <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
              {t.hero.description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button 
                size="lg" 
                onClick={() => scrollToSection("register")}
                className="bg-white text-black hover:bg-white/90"
                data-testid="hero-cta"
              >
                {t.hero.cta}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-white/80">
              <Calendar className="h-5 w-5" />
              <span className="text-lg font-medium">{t.hero.dates}</span>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/70 rounded-full" />
          </div>
        </div>
      </section>

      <section id="experience" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4">{t.experience.subtitle}</Badge>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">{t.experience.title}</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.experience.description}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.experience.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover-elevate">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                      <FeatureIcon icon={feature.icon} />
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="guides" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">{t.guides.title}</h2>
            <p className="text-lg text-muted-foreground">{t.guides.subtitle}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden h-full">
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={sveinImage} 
                    alt="Svein Tuft" 
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-display text-2xl font-bold mb-1">{t.guides.svein.name}</h3>
                  <p className="text-primary font-medium mb-4">{t.guides.svein.role}</p>
                  <p className="text-muted-foreground">{t.guides.svein.bio}</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden h-full">
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={jmImage} 
                    alt="Jean-Michel Lachance" 
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-display text-2xl font-bold mb-1">{t.guides.jm.name}</h3>
                  <p className="text-accent font-medium mb-4">{t.guides.jm.role}</p>
                  <p className="text-muted-foreground">{t.guides.jm.bio}</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="program" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">{t.program.title}</h2>
            <p className="text-lg text-muted-foreground">{t.program.subtitle}</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img 
                src={routeImage} 
                alt="Cycling route" 
                className="rounded-2xl shadow-xl w-full"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-xl mb-1">{t.program.daily.morning.title}</h3>
                  <p className="text-muted-foreground">{t.program.daily.morning.description}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <Bike className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-xl mb-1">{t.program.daily.day.title}</h3>
                  <p className="text-muted-foreground">{t.program.daily.day.description}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <Star className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-xl mb-1">{t.program.daily.evening.title}</h3>
                  <p className="text-muted-foreground">{t.program.daily.evening.description}</p>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {t.program.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <section id="register" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">{t.pricing.title}</h2>
              <p className="text-lg text-muted-foreground mb-8">{t.pricing.subtitle}</p>

              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-4">{t.pricing.includes}</h3>
                <ul className="space-y-3">
                  {t.pricing.items.map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-sm text-muted-foreground italic">{t.pricing.note}</p>

              <div className="mt-12 grid grid-cols-2 gap-3">
                <div className="aspect-square overflow-hidden rounded-xl shadow-lg">
                  <img 
                    src={campImage1} 
                    alt="Vélo sur rails avec vue fleuve" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square overflow-hidden rounded-xl shadow-lg">
                  <img 
                    src={campImage2} 
                    alt="Pont couvert historique" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square overflow-hidden rounded-xl shadow-lg">
                  <img 
                    src={campImage3} 
                    alt="Sculpture caribou avec vélo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square overflow-hidden rounded-xl shadow-lg">
                  <img 
                    src={campImage4} 
                    alt="Route de gravier automnale" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="sticky top-24">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <Badge className="mb-4">{t.pricing.waitlist}</Badge>
                    <h3 className="font-display text-2xl font-bold mb-2">{t.form.title}</h3>
                    <p className="text-muted-foreground">{t.form.description}</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t.form.name}</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        data-testid="input-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">{t.form.email}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        data-testid="input-email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">{t.form.experience}</Label>
                      <Select
                        value={formData.experience}
                        onValueChange={(value) => setFormData({ ...formData, experience: value })}
                      >
                        <SelectTrigger id="experience" data-testid="select-experience">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="intermediate">{t.form.experienceOptions.intermediate}</SelectItem>
                          <SelectItem value="advanced">{t.form.experienceOptions.advanced}</SelectItem>
                          <SelectItem value="expert">{t.form.experienceOptions.expert}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={waitlistMutation.isPending}
                      data-testid="button-submit"
                    >
                      {waitlistMutation.isPending ? "..." : t.form.submit}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-muted/50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Bike className="h-5 w-5 text-primary" />
              <span className="font-display font-bold">Charlevoix Cycling Tour</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>{t.footer.organized} QUEBEXICO</span>
              <span>|</span>
              <a href="mailto:info@quebexico.co" className="hover:text-foreground transition-colors">
                {t.footer.contact}: info@quebexico.co
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
