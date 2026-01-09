import { rentalHostProfile } from "@shared/demo-profiles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TreePine, Calendar, Star, Mail, Users, Bed, Bath, MapPin, Flame } from "lucide-react";
import heroImage from "@assets/stock_images/cozy_winter_cabin_ch_cd99d6d4.jpg";

export default function DemoRentalHost() {
  const { config, properties, testimonials } = rentalHostProfile;

  return (
    <div className="min-h-screen bg-background">
      <section className="relative text-white py-24 px-4 min-h-[500px] flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        <div className="relative max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4" data-testid="badge-profile-type">
            <TreePine className="h-3 w-3 mr-1" />
            Location de chalets
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-4" data-testid="text-host-name">
            {config.name}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-6" data-testid="text-host-tagline">
            {config.tagline}
          </p>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            {config.description}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" data-testid="button-see-chalets">
              <TreePine className="mr-2 h-4 w-4" />
              Voir nos chalets
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white" data-testid="button-check-availability">
              <Calendar className="mr-2 h-4 w-4" />
              V\u00e9rifier les disponibilit\u00e9s
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
                      <span>{property.bathrooms} sdb.</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {property.amenities.slice(0, 3).map((amenity, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {property.amenities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{property.amenities.length - 3}
                      </Badge>
                    )}
                  </div>
                  <Button className="w-full mt-4" data-testid={`button-book-${property.id}`}>
                    R\u00e9server
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <Star className="h-6 w-6 text-green-700" />
            <h2 className="text-3xl font-bold" data-testid="heading-testimonials">Ce que nos invit\u00e9s disent</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials?.map((testimonial) => (
              <Card key={testimonial.id} data-testid={`card-testimonial-${testimonial.id}`}>
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
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

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Flame className="h-6 w-6 text-orange-500" />
            <h2 className="text-3xl font-bold" data-testid="heading-experience">L'exp\u00e9rience Lac-Sergent</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Pourquoi nous choisir?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <TreePine className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <span>Chalets authentiques en bois rond - pas de condos d\u00e9guis\u00e9s</span>
                </li>
                <li className="flex items-start gap-3">
                  <Flame className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                  <span>Po\u00eale \u00e0 bois dans chaque chalet - bois de chauffage inclus</span>
                </li>
                <li className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <span>Accueil personnalis\u00e9 par les propri\u00e9taires</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  <span>\u00c0 45 minutes de Qu\u00e9bec, mais \u00e0 des ann\u00e9es-lumi\u00e8re du stress</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Activit\u00e9s sur place</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-muted-foreground">\u00c9t\u00e9:</span>
                  <span>Baignade, canot, kayak, p\u00eache, randonn\u00e9e</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-muted-foreground">Hiver:</span>
                  <span>Ski de fond, raquette, patinage, p\u00eache sur glace</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-muted-foreground">Toute l'ann\u00e9e:</span>
                  <span>Feu de camp, observation des \u00e9toiles, silence</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-green-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Pr\u00eat pour une vraie \u00e9vasion?</h2>
          <p className="text-xl mb-8 opacity-90">
            R\u00e9servez votre chalet et d\u00e9connectez pour de vrai.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" data-testid="button-cta-reserve">
              <Calendar className="mr-2 h-4 w-4" />
              V\u00e9rifier les disponibilit\u00e9s
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white/30 text-white" data-testid="button-cta-contact">
              <Mail className="mr-2 h-4 w-4" />
              Nous contacter
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
