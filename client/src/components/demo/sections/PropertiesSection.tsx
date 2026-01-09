import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TreePine, Users, Bed, Bath, MapPin } from "lucide-react";
import { BookingFlow } from "@/components/booking";
import { useProfileLocalization } from "@/hooks/use-profile-localization";
import type { DemoProperty, SectionConfig, ProfileConfig } from "@shared/demo-profiles";

interface PropertiesSectionProps {
  properties: DemoProperty[];
  section: SectionConfig;
  config: ProfileConfig;
}

export function PropertiesSection({ properties, section, config }: PropertiesSectionProps) {
  const [selectedProperty, setSelectedProperty] = useState<DemoProperty | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const { getText } = useProfileLocalization();

  const handleBookProperty = (property: DemoProperty) => {
    setSelectedProperty(property);
    setBookingOpen(true);
  };

  const handleBookingComplete = () => {
    setBookingOpen(false);
    setSelectedProperty(null);
  };

  return (
    <section id="chalets" className="py-16 px-4" data-testid="section-properties">
      <div className="max-w-6xl mx-auto">
        {section.title && (
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TreePine className="h-6 w-6 text-green-600" />
              <h2 className="text-3xl font-bold" data-testid="heading-properties">
                {getText(section.title)}
              </h2>
            </div>
            {section.subtitle && (
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {getText(section.subtitle)}
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="hover-elevate overflow-hidden" data-testid={`card-property-${property.id}`}>
              {property.imageUrl && (
                <div className="aspect-video bg-muted overflow-hidden">
                  <img
                    src={property.imageUrl}
                    alt={getText(property.name)}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{getText(property.name)}</CardTitle>
                  <Badge variant="secondary" className="shrink-0">
                    {property.pricePerNight}$/nuit
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {property.location}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {getText(property.description)}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {property.maxGuests}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bed className="h-4 w-4" />
                    {property.bedrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="h-4 w-4" />
                    {property.bathrooms}
                  </span>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => handleBookProperty(property)}
                  data-testid={`button-book-${property.id}`}
                >
                  Réserver
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-booking">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" data-testid="dialog-booking-title">
              <TreePine className="h-5 w-5 text-green-600" />
              {selectedProperty && getText(selectedProperty.name)}
            </DialogTitle>
          </DialogHeader>
          {selectedProperty && (
            <BookingFlow
              propertyId={selectedProperty.id}
              propertyName={getText(selectedProperty.name)}
              maxGuests={selectedProperty.maxGuests}
              enableInstantBooking={config.features.booking}
              demoMode={true}
              pricePerNight={selectedProperty.pricePerNight}
              onComplete={handleBookingComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
