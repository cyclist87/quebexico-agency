import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Property } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const translations = {
  fr: {
    noProperties: "Aucune propriété avec coordonnées disponible",
    perNight: "/nuit",
  },
  en: {
    noProperties: "No properties with coordinates available",
    perNight: "/night",
  },
  es: {
    noProperties: "No hay propiedades con coordenadas disponibles",
    perNight: "/noche",
  },
};

type Language = "fr" | "en" | "es";

function isValidCoordinate(lat: number, lng: number): boolean {
  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

interface PropertyMapProps {
  properties: Property[];
  height?: string;
  zoom?: number;
  center?: [number, number];
  onPropertyClick?: (property: Property) => void;
}

export function PropertyMap({ 
  properties, 
  height = "400px",
  zoom = 6,
  center,
  onPropertyClick 
}: PropertyMapProps) {
  const { language } = useLanguage();
  const lang = (language as Language) || "fr";
  const t = translations[lang] || translations.fr;

  const propertiesWithValidCoords = properties.filter(p => {
    if (!p.latitude || !p.longitude) return false;
    const lat = parseFloat(p.latitude);
    const lng = parseFloat(p.longitude);
    return isValidCoordinate(lat, lng);
  });

  if (propertiesWithValidCoords.length === 0) {
    return (
      <div 
        className="bg-muted/50 rounded-lg flex items-center justify-center text-muted-foreground"
        style={{ height }}
        data-testid="map-no-properties"
      >
        <p>{t.noProperties}</p>
      </div>
    );
  }

  const defaultCenter: [number, number] = center || (() => {
    const lat = parseFloat(propertiesWithValidCoords[0].latitude!);
    const lng = parseFloat(propertiesWithValidCoords[0].longitude!);
    return [lat, lng];
  })();

  const getName = (property: Property) => {
    switch (language) {
      case "en": return property.nameEn;
      case "es": return property.nameEs || property.nameFr;
      default: return property.nameFr;
    }
  };

  const getAddress = (property: Property) => {
    switch (language) {
      case "en": return property.addressEn || property.addressFr;
      case "es": return property.addressEs || property.addressFr;
      default: return property.addressFr;
    }
  };

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden" data-testid="property-map">
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {propertiesWithValidCoords.map((property) => {
          const lat = parseFloat(property.latitude!);
          const lng = parseFloat(property.longitude!);
          
          return (
            <Marker 
              key={property.id} 
              position={[lat, lng]}
              eventHandlers={{
                click: () => onPropertyClick?.(property),
              }}
            >
              <Popup>
                <div className="min-w-[150px]">
                  <h3 className="font-semibold text-sm">{getName(property)}</h3>
                  {getAddress(property) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {getAddress(property)}
                    </p>
                  )}
                  <p className="text-sm font-medium text-primary mt-2">
                    ${property.pricePerNight}{t.perNight}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

interface SinglePropertyMapProps {
  property: Property;
  height?: string;
  zoom?: number;
}

export function SinglePropertyMap({ 
  property, 
  height = "300px",
  zoom = 14
}: SinglePropertyMapProps) {
  if (!property.latitude || !property.longitude) {
    return null;
  }

  const lat = parseFloat(property.latitude);
  const lng = parseFloat(property.longitude);

  if (!isValidCoordinate(lat, lng)) {
    return null;
  }

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden" data-testid="single-property-map">
      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} />
      </MapContainer>
    </div>
  );
}
