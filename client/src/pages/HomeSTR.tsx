import { motion } from "framer-motion";
import { ArrowRight, MapPin, Calendar, Users, Star, Home } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { useProperties } from "@/hooks/use-properties";
import { useSEO } from "@/hooks/use-seo";
import type { SiteConfigType, ContentSection, Property } from "@shared/schema";

type Language = "fr" | "en" | "es";

const translations = {
  fr: {
    heroTitle: "Votre séjour parfait vous attend",
    heroSubtitle: "Découvrez nos hébergements uniques et réservez en toute simplicité",
    searchCta: "Voir nos propriétés",
    featuredTitle: "Propriétés en vedette",
    featuredSubtitle: "Nos hébergements les plus populaires",
    perNight: "/ nuit",
    guests: "invités",
    viewAll: "Voir toutes les propriétés",
    aboutTitle: "Pourquoi nous choisir",
    aboutSubtitle: "Une expérience de réservation simple et transparente",
    feature1Title: "Réservation instantanée",
    feature1Desc: "Confirmez votre séjour en quelques clics, sans attente",
    feature2Title: "Prix transparents",
    feature2Desc: "Tous les frais inclus, pas de surprises à l'arrivée",
    feature3Title: "Support 24/7",
    feature3Desc: "Une équipe disponible pour vous accompagner",
    ctaTitle: "Prêt à réserver?",
    ctaSubtitle: "Trouvez l'hébergement idéal pour votre prochain séjour",
    ctaButton: "Explorer maintenant",
  },
  en: {
    heroTitle: "Your perfect stay awaits",
    heroSubtitle: "Discover our unique accommodations and book with ease",
    searchCta: "View properties",
    featuredTitle: "Featured Properties",
    featuredSubtitle: "Our most popular accommodations",
    perNight: "/ night",
    guests: "guests",
    viewAll: "View all properties",
    aboutTitle: "Why choose us",
    aboutSubtitle: "A simple and transparent booking experience",
    feature1Title: "Instant booking",
    feature1Desc: "Confirm your stay in just a few clicks, no waiting",
    feature2Title: "Transparent pricing",
    feature2Desc: "All fees included, no surprises on arrival",
    feature3Title: "24/7 Support",
    feature3Desc: "A team available to assist you",
    ctaTitle: "Ready to book?",
    ctaSubtitle: "Find the perfect accommodation for your next stay",
    ctaButton: "Explore now",
  },
  es: {
    heroTitle: "Tu estancia perfecta te espera",
    heroSubtitle: "Descubre nuestros alojamientos únicos y reserva fácilmente",
    searchCta: "Ver propiedades",
    featuredTitle: "Propiedades destacadas",
    featuredSubtitle: "Nuestros alojamientos más populares",
    perNight: "/ noche",
    guests: "huéspedes",
    viewAll: "Ver todas las propiedades",
    aboutTitle: "Por qué elegirnos",
    aboutSubtitle: "Una experiencia de reserva simple y transparente",
    feature1Title: "Reserva instantánea",
    feature1Desc: "Confirma tu estancia en pocos clics, sin esperas",
    feature2Title: "Precios transparentes",
    feature2Desc: "Todos los gastos incluidos, sin sorpresas",
    feature3Title: "Soporte 24/7",
    feature3Desc: "Un equipo disponible para ayudarte",
    ctaTitle: "¿Listo para reservar?",
    ctaSubtitle: "Encuentra el alojamiento ideal para tu próxima estancia",
    ctaButton: "Explorar ahora",
  },
};

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

function getPropertyName(property: Property, lang: Language): string {
  if (lang === "en") return property.nameEn || property.nameFr;
  if (lang === "es") return property.nameEs || property.nameFr;
  return property.nameFr;
}

function getPropertyAddress(property: Property, lang: Language): string {
  if (lang === "en") return property.addressEn || property.addressFr || "";
  if (lang === "es") return property.addressEs || property.addressFr || "";
  return property.addressFr || "";
}

function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[4/3]" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-24" />
      </CardContent>
    </Card>
  );
}

function FeaturedPropertyCard({ property, lang, t }: { property: Property; lang: Language; t: typeof translations.fr }) {
  const name = getPropertyName(property, lang);
  const address = getPropertyAddress(property, lang);
  const photos = property.photos;
  const photoArray = Array.isArray(photos) ? photos.filter((p): p is string => typeof p === "string") : [];
  const mainPhoto = photoArray[0] || "";

  return (
    <Link href={`/properties/${property.slug}`} data-testid={`link-property-${property.slug}`}>
      <Card 
        className="overflow-hidden cursor-pointer group"
        data-testid={`card-featured-property-${property.slug}`}
      >
        <div className="aspect-[4/3] relative overflow-hidden bg-muted">
          {mainPhoto ? (
            <img
              src={mainPhoto}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <Home className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          {property.isFeatured && (
            <Badge className="absolute top-3 right-3" variant="secondary">
              <Star className="h-3 w-3 mr-1 fill-current" />
            </Badge>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1">{name}</h3>
          {address && (
            <p className="flex items-center gap-1 text-sm text-muted-foreground line-clamp-1">
              <MapPin className="h-3 w-3 shrink-0" />
              {address}
            </p>
          )}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{property.maxGuests} {t.guests}</span>
            </div>
            <div className="text-xl font-bold text-primary">
              ${property.pricePerNight}
              <span className="text-sm font-normal text-muted-foreground">{t.perNight}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: typeof Calendar; title: string; description: string }) {
  return (
    <Card className="text-center p-6">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </Card>
  );
}

export default function HomeSTR() {
  const { language } = useLanguage();
  const lang = (language as Language) || "fr";
  const t = translations[lang] || translations.fr;

  const { data: siteConfig } = useQuery<SiteConfigType | null>({
    queryKey: ["/api/site-config"],
  });

  const { data: contentSections } = useQuery<ContentSection[]>({
    queryKey: ["/api/content-sections"],
  });

  const { data: properties, isLoading: propertiesLoading } = useProperties();

  const featuredProperties = properties?.filter(p => p.isFeatured).slice(0, 3) || [];
  const displayProperties = featuredProperties.length > 0 
    ? featuredProperties 
    : (properties?.slice(0, 3) || []);

  const getSiteText = (frField: string | null | undefined, enField: string | null | undefined, esField: string | null | undefined) => {
    if (lang === "en" && enField) return enField;
    if (lang === "es" && esField) return esField;
    return frField || "";
  };

  const siteName = siteConfig?.siteName || "Location Vacances";
  
  useSEO();

  const heroSection = contentSections?.find(s => s.sectionType === "hero" && s.isEnabled);
  const aboutSection = contentSections?.find(s => s.sectionType === "about" && s.isEnabled);

  const heroTitle = heroSection 
    ? getSiteText(heroSection.titleFr, heroSection.titleEn, heroSection.titleEs) 
    : t.heroTitle;
  const heroSubtitle = heroSection 
    ? getSiteText(heroSection.contentFr, heroSection.contentEn, heroSection.contentEs) 
    : t.heroSubtitle;

  return (
    <div className="min-h-screen bg-background" data-testid="page-home-str">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-16">
        <div 
          className="absolute inset-0 z-0 bg-gradient-to-br from-primary/20 via-background to-background"
          style={siteConfig?.logoUrl ? {} : {}}
        />
        
        <div className="container mx-auto px-4 relative z-10 text-center py-16">
          {siteConfig?.logoUrl && (
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              src={siteConfig.logoUrl}
              alt={siteName}
              className="h-16 md:h-20 object-contain mx-auto mb-8"
            />
          )}
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight mb-6"
            data-testid="text-hero-title"
          >
            {heroTitle}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            {heroSubtitle}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Link href="/properties" data-testid="link-hero-properties">
              <Button 
                size="lg" 
                className="rounded-full text-lg h-14 px-8 shadow-xl shadow-primary/25"
                data-testid="button-view-properties"
              >
                {t.searchCta} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-secondary/30" data-testid="section-featured">
        <div className="container mx-auto px-4">
          <motion.div {...fadeIn} className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">{t.featuredTitle}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{t.featuredSubtitle}</p>
          </motion.div>
          
          {propertiesLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <PropertyCardSkeleton key={i} />)}
            </div>
          ) : displayProperties.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {displayProperties.map((property) => (
                  <motion.div key={property.id} {...fadeIn}>
                    <FeaturedPropertyCard property={property} lang={lang} t={t} />
                  </motion.div>
                ))}
              </div>
              <div className="text-center">
                <Link href="/properties" data-testid="link-view-all-properties">
                  <Button variant="outline" size="lg" data-testid="button-view-all-properties">
                    {t.viewAll} <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune propriété disponible</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeIn} className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {aboutSection ? getSiteText(aboutSection.titleFr, aboutSection.titleEn, aboutSection.titleEs) : t.aboutTitle}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {aboutSection ? getSiteText(aboutSection.contentFr, aboutSection.contentEn, aboutSection.contentEs) : t.aboutSubtitle}
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div {...fadeIn}>
              <FeatureCard icon={Calendar} title={t.feature1Title} description={t.feature1Desc} />
            </motion.div>
            <motion.div {...fadeIn}>
              <FeatureCard icon={Star} title={t.feature2Title} description={t.feature2Desc} />
            </motion.div>
            <motion.div {...fadeIn}>
              <FeatureCard icon={Users} title={t.feature3Title} description={t.feature3Desc} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <motion.div {...fadeIn}>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">{t.ctaTitle}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">{t.ctaSubtitle}</p>
            <Link href="/properties" data-testid="link-cta-properties">
              <Button size="lg" className="rounded-full" data-testid="button-explore-cta">
                {t.ctaButton} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
