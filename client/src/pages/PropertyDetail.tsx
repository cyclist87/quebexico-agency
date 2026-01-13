import { useRoute } from "wouter";
import { useProperty } from "@/hooks/use-properties";
import { BookingFlowLocal } from "@/components/booking/BookingFlowLocal";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Users, 
  Bed, 
  Bath, 
  Wifi, 
  Car, 
  Coffee,
  TreePine,
  ChevronLeft,
  ChevronRight,
  Star,
  Check
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import type { Property } from "@shared/schema";

type Language = "fr" | "en" | "es";

function getPropertyName(property: Property, lang: Language): string {
  if (lang === "en") return property.nameEn || property.nameFr;
  if (lang === "es") return property.nameEs || property.nameFr;
  return property.nameFr;
}

function getPropertyDescription(property: Property, lang: Language): string {
  if (lang === "en") return property.descriptionEn || property.descriptionFr || "";
  if (lang === "es") return property.descriptionEs || property.descriptionFr || "";
  return property.descriptionFr || "";
}

function getPropertyAddress(property: Property, lang: Language): string {
  if (lang === "en") return property.addressEn || property.addressFr || "";
  if (lang === "es") return property.addressEs || property.addressFr || "";
  return property.addressFr || "";
}

function getPropertyAmenities(property: Property, lang: Language): string[] {
  let amenities: string[] | null = null;
  if (lang === "en") {
    amenities = property.amenitiesEn || property.amenitiesFr;
  } else if (lang === "es") {
    amenities = property.amenitiesEs || property.amenitiesFr;
  } else {
    amenities = property.amenitiesFr;
  }
  if (!amenities) return [];
  if (!Array.isArray(amenities)) return [];
  return amenities.filter((item): item is string => typeof item === "string");
}

function getPropertyHouseRules(property: Property, lang: Language): string {
  if (lang === "en") return property.houseRulesEn || property.houseRulesFr || "";
  if (lang === "es") return property.houseRulesEs || property.houseRulesFr || "";
  return property.houseRulesFr || "";
}

const translations = {
  fr: {
    backToProperties: "Retour aux propriétés",
    notFound: "Propriété non trouvée",
    notFoundDesc: "La propriété que vous cherchez n'existe pas ou a été retirée.",
    perNight: "/ nuit",
    guests: "Invités",
    bedrooms: "Chambres",
    bathrooms: "Salles de bain",
    description: "Description",
    amenities: "Équipements",
    houseRules: "Règles de la maison",
    book: "Réserver",
    error: "Erreur de chargement",
    reviews: "avis",
    verified: "Vérifié",
  },
  en: {
    backToProperties: "Back to properties",
    notFound: "Property not found",
    notFoundDesc: "The property you're looking for doesn't exist or has been removed.",
    perNight: "/ night",
    guests: "Guests",
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    description: "Description",
    amenities: "Amenities",
    houseRules: "House rules",
    book: "Book",
    error: "Loading error",
    reviews: "reviews",
    verified: "Verified",
  },
  es: {
    backToProperties: "Volver a propiedades",
    notFound: "Propiedad no encontrada",
    notFoundDesc: "La propiedad que buscas no existe o ha sido eliminada.",
    perNight: "/ noche",
    guests: "Huéspedes",
    bedrooms: "Habitaciones",
    bathrooms: "Baños",
    description: "Descripción",
    amenities: "Comodidades",
    houseRules: "Reglas de la casa",
    book: "Reservar",
    error: "Error de carga",
    reviews: "reseñas",
    verified: "Verificado",
  },
};

const amenityIcons: Record<string, typeof Wifi> = {
  wifi: Wifi,
  parking: Car,
  coffee: Coffee,
  garden: TreePine,
};

function PropertyGallery({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <TreePine className="h-12 w-12 text-muted-foreground" />
      </div>
    );
  }

  const goNext = () => setCurrentIndex((i) => (i + 1) % images.length);
  const goPrev = () => setCurrentIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
      <img
        src={images[currentIndex]}
        alt={`Property image ${currentIndex + 1}`}
        className="w-full h-full object-cover"
        data-testid={`img-property-${currentIndex}`}
      />
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
            onClick={goPrev}
            data-testid="button-gallery-prev"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
            onClick={goNext}
            data-testid="button-gallery-next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentIndex ? "bg-white" : "bg-white/50"
                }`}
                onClick={() => setCurrentIndex(idx)}
                data-testid={`button-gallery-dot-${idx}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PropertySkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="aspect-video rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-16 w-24" />
              <Skeleton className="h-16 w-24" />
              <Skeleton className="h-16 w-24" />
            </div>
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PropertyDetail() {
  const [, params] = useRoute("/properties/:slug");
  const slug = params?.slug || null;
  const { language } = useLanguage();
  const lang = language as Language;
  const t = translations[lang] || translations.fr;

  const { data: property, isLoading, error } = useProperty(slug);

  if (isLoading) {
    return <PropertySkeleton />;
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <TreePine className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-xl font-bold mb-2" data-testid="text-error-title">
              {t.notFound}
            </h1>
            <p className="text-muted-foreground mb-4">{t.notFoundDesc}</p>
            <Button asChild>
              <Link href="/properties">{t.backToProperties}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const name = getPropertyName(property, lang);
  const description = getPropertyDescription(property, lang);
  const location = getPropertyAddress(property, lang);
  const amenities = getPropertyAmenities(property, lang);
  const houseRulesText = getPropertyHouseRules(property, lang);
  const houseRules = houseRulesText ? houseRulesText.split("\n").filter(Boolean) : [];
  const photos = property.photos;
  const images = Array.isArray(photos) ? photos.filter((p): p is string => typeof p === "string") : [];

  useSEO({ 
    title: location ? `${name} - ${location}` : name,
    description: description?.substring(0, 160),
    image: images[0],
  });

  return (
    <div className="min-h-screen bg-background pt-24" data-testid="page-property-detail">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link 
          href="/properties" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          data-testid="link-back-properties"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t.backToProperties}
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <PropertyGallery images={images} />

            <div>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-property-name">
                    {name}
                  </h1>
                  {location && (
                    <p className="flex items-center gap-1 text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4" />
                      {location}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary" data-testid="text-price-per-night">
                    ${property.pricePerNight}
                    <span className="text-base font-normal text-muted-foreground">
                      {t.perNight}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t.guests}</p>
                    <p className="font-medium">{property.maxGuests}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
                  <Bed className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t.bedrooms}</p>
                    <p className="font-medium">{property.bedrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
                  <Bath className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t.bathrooms}</p>
                    <p className="font-medium">{property.bathrooms}</p>
                  </div>
                </div>
              </div>

              {property.isFeatured && (
                <Badge className="mt-4" variant="secondary">
                  <Check className="h-3 w-3 mr-1" />
                  {t.verified}
                </Badge>
              )}
            </div>

            <Separator />

            {description && (
              <section>
                <h2 className="text-lg font-semibold mb-3">{t.description}</h2>
                <p className="text-muted-foreground whitespace-pre-line" data-testid="text-description">
                  {description}
                </p>
              </section>
            )}

            {amenities.length > 0 && (
              <>
                <Separator />
                <section>
                  <h2 className="text-lg font-semibold mb-3">{t.amenities}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenities.map((amenity, idx) => {
                      const IconComponent = amenityIcons[amenity.toLowerCase()] || Check;
                      return (
                        <div 
                          key={idx} 
                          className="flex items-center gap-2 text-sm"
                          data-testid={`amenity-${idx}`}
                        >
                          <IconComponent className="h-4 w-4 text-primary" />
                          {amenity}
                        </div>
                      );
                    })}
                  </div>
                </section>
              </>
            )}

            {houseRules.length > 0 && (
              <>
                <Separator />
                <section>
                  <h2 className="text-lg font-semibold mb-3">{t.houseRules}</h2>
                  <ul className="space-y-2">
                    {houseRules.map((rule, idx) => (
                      <li 
                        key={idx} 
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                        data-testid={`house-rule-${idx}`}
                      >
                        <Check className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}
          </div>

          <div className="lg:sticky lg:top-24 h-fit space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">{t.book}</h2>
                <BookingFlowLocal
                  propertySlug={property.slug}
                  propertyName={name}
                  maxGuests={property.maxGuests || 6}
                  enableInstantBooking={true}
                  pricePerNight={property.pricePerNight || 100}
                  cleaningFee={property.cleaningFee || 0}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
