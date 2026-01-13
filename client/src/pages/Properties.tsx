import { useState } from "react";
import { useProperties } from "@/hooks/use-properties";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Bed, Star, Map, LayoutGrid } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { Property } from "@shared/schema";
import { PropertyMap } from "@/components/booking/PropertyMap";

type Language = "fr" | "en" | "es";

const translations = {
  fr: {
    title: "Nos propriétés",
    subtitle: "Découvrez nos hébergements disponibles",
    noProperties: "Aucune propriété disponible pour le moment",
    perNight: "/ nuit",
    guests: "Invités",
    bedrooms: "Chambres",
    viewDetails: "Voir les détails",
    featured: "En vedette",
    mapView: "Carte",
    gridView: "Grille",
  },
  en: {
    title: "Our Properties",
    subtitle: "Discover our available accommodations",
    noProperties: "No properties available at the moment",
    perNight: "/ night",
    guests: "Guests",
    bedrooms: "Bedrooms",
    viewDetails: "View details",
    featured: "Featured",
    mapView: "Map",
    gridView: "Grid",
  },
  es: {
    title: "Nuestras propiedades",
    subtitle: "Descubre nuestros alojamientos disponibles",
    noProperties: "No hay propiedades disponibles en este momento",
    perNight: "/ noche",
    guests: "Huéspedes",
    bedrooms: "Habitaciones",
    viewDetails: "Ver detalles",
    featured: "Destacado",
    mapView: "Mapa",
    gridView: "Cuadrícula",
  },
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
        <div className="flex gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-6 w-24" />
      </CardContent>
    </Card>
  );
}

function PropertyCard({ property }: { property: Property }) {
  const { language } = useLanguage();
  const lang = language as Language;
  const t = translations[lang] || translations.fr;

  const name = getPropertyName(property, lang);
  const address = getPropertyAddress(property, lang);
  const photos = property.photos;
  const photoArray = Array.isArray(photos) ? photos.filter((p): p is string => typeof p === "string") : [];
  const mainPhoto = photoArray[0] || "";

  return (
    <Link href={`/properties/${property.slug}`}>
      <Card 
        className="overflow-hidden cursor-pointer transition-shadow hover:shadow-lg"
        data-testid={`card-property-${property.slug}`}
      >
        <div className="aspect-[4/3] relative overflow-hidden bg-muted">
          {mainPhoto ? (
            <img
              src={mainPhoto}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Bed className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          {property.isFeatured && (
            <Badge 
              className="absolute top-3 right-3"
              variant="secondary"
            >
              <Star className="h-3 w-3 mr-1 fill-current" />
              {t.featured}
            </Badge>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1" data-testid="text-property-name">
            {name}
          </h3>
          {address && (
            <p className="flex items-center gap-1 text-sm text-muted-foreground line-clamp-1">
              <MapPin className="h-3 w-3 shrink-0" />
              {address}
            </p>
          )}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {property.maxGuests} {t.guests}
            </span>
            <span className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              {property.bedrooms} {t.bedrooms}
            </span>
          </div>
          <div className="text-xl font-bold text-primary pt-2">
            ${property.pricePerNight}
            <span className="text-sm font-normal text-muted-foreground">
              {t.perNight}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Properties() {
  const { language } = useLanguage();
  const lang = language as Language;
  const t = translations[lang] || translations.fr;
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const { data: properties, isLoading, error } = useProperties();

  const handlePropertyClick = (property: Property) => {
    setLocation(`/properties/${property.slug}`);
  };

  return (
    <div className="min-h-screen bg-background pt-24" data-testid="page-properties">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3" data-testid="text-page-title">
            {t.title}
          </h1>
          <p className="text-muted-foreground text-lg">{t.subtitle}</p>
        </div>

        {!isLoading && !error && properties && properties.length > 0 && (
          <div className="flex justify-center gap-2 mb-8">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              data-testid="button-grid-view"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              {t.gridView}
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("map")}
              data-testid="button-map-view"
            >
              <Map className="h-4 w-4 mr-2" />
              {t.mapView}
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>Unable to load properties</p>
            </CardContent>
          </Card>
        ) : properties && properties.length > 0 ? (
          viewMode === "map" ? (
            <div className="space-y-6">
              <PropertyMap 
                properties={properties} 
                height="500px" 
                zoom={6}
                onPropertyClick={handlePropertyClick}
              />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Bed className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t.noProperties}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
