import { athleteProfile } from "@shared/demo-profiles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Star, Mail, ArrowRight, Bike } from "lucide-react";

export default function DemoAthlete() {
  const { config, portfolio, testimonials } = athleteProfile;

  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white py-24 px-4">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4" data-testid="badge-profile-type">
            <Bike className="h-3 w-3 mr-1" />
            Cycliste Professionnel
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-4" data-testid="text-athlete-name">
            {config.name}
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-6" data-testid="text-athlete-tagline">
            {config.tagline}
          </p>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto mb-8">
            {config.description}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" data-testid="button-contact-athlete">
              <Mail className="mr-2 h-4 w-4" />
              Contact
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white" data-testid="button-calendar">
              <Calendar className="mr-2 h-4 w-4" />
              Réserver une rencontre
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Trophy className="h-6 w-6 text-blue-600" />
            <h2 className="text-3xl font-bold" data-testid="heading-performances">Palmarès</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {portfolio?.map((item) => (
              <Card key={item.id} className="hover-elevate" data-testid={`card-performance-${item.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{item.date}</p>
                    </div>
                    <Badge variant="outline">{item.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{item.description}</p>
                  {item.stats && (
                    <div className="flex flex-wrap gap-4">
                      {Object.entries(item.stats).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{value}</p>
                          <p className="text-xs text-muted-foreground capitalize">{key}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Star className="h-6 w-6 text-blue-600" />
            <h2 className="text-3xl font-bold" data-testid="heading-testimonials">Témoignages</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
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

      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Suivez mes courses</h2>
          <p className="text-muted-foreground mb-8">
            Inscrivez-vous pour recevoir les résultats de mes compétitions et mon calendrier de courses.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" data-testid="button-subscribe">
              S'inscrire à l'infolettre
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
