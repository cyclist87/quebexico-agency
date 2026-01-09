import { rentalHostProfile } from "@shared/demo-profiles";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TreePine, Calendar, Star, Mail, Users, Bed, Bath, MapPin, Flame } from "lucide-react";

export default function DemoRentalHost() {
  const { config, properties, testimonials } = rentalHostProfile;

  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-gradient-to-br from-green-700 to-green-900 text-white py-24 px-4">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4" data-testid="badge-profile-type">
            <TreePine className="h-3 w-3 mr-1" />
            Location de chalets
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-4" data-testid="text-host-name">
            {config.name}
          </h1>
          <p className="text-xl md:text-2xl text-green-100 mb-6" data-testid="text-host-tagline">
            {config.tagline}
          </p>
          <p className="text-lg text-green-200 max-w-2xl mx-auto mb-8">
            {config.description}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" data-testid="button-see-chalets">
              <TreePine className="mr-2 h-4 w-4" />
              Voir nos chalets
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white" data-testid="button-check-availability">
              <Calendar className="mr-2 h-4 w-4" />
              Vérifier les disponibilités
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <TreePine className="h-6 w-6 text-green-700" />
            <h2 className="text-3xl font-bold" data-testid="heading-chalets">Nos chalets</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {properties?.map((property) => (
              <Card key={property.id} className="overflow-visible hover-elevate" data-testid={`card-property-${property.id}`}>
                <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 flex items-center justify-center rounded-t-lg">
                  <TreePine className="h-16 w-16 text-green-600/30" />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl">{property.name}</CardTitle>
                    <Badge className="bg-green-600 text-white shrink-0">
                      {property.pricePerNight}$/nuit
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {property.location}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{property.description}</p>
                  <div className="flex flex-wrap gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{property.maxGuests} personnes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4 text-muted-foreground" />
                      <span>{property.bedrooms} ch.</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="h-4 w-4 text-muted-foreground" />
                      <span>{property.bathrooms} s.b.</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {property.amenities.slice(0, 4).map((amenity, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {amenity.includes("Poêle") || amenity.includes("bois") ? (
                          <Flame className="h-3 w-3 mr-1" />
                        ) : null}
                        {amenity}
                      </Badge>
                    ))}
                    {property.amenities.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{property.amenities.length - 4}
                      </Badge>
                    )}
                  </div>
                  <Button className="w-full" data-testid={`button-book-${property.id}`}>
                    Réserver
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Star className="h-6 w-6 text-green-700" />
            <h2 className="text-3xl font-bold" data-testid="heading-testimonials">Nos visiteurs témoignent</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials?.map((testimonial) => (
              <Card key={testimonial.id} data-testid={`card-testimonial-${testimonial.id}`}>
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-green-800 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Réservez votre escapade</h2>
          <p className="text-green-200 mb-8">
            Recevez nos offres spéciales et les disponibilités de dernière minute directement dans votre boîte courriel.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" data-testid="button-contact">
              <Mail className="mr-2 h-4 w-4" />
              Nous contacter
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white" data-testid="button-newsletter">
              S'inscrire à l'infolettre
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
