import { freelancerProfile } from "@shared/demo-profiles";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, Calendar, Star, Phone, ArrowRight, CheckCircle, Hammer } from "lucide-react";

export default function DemoFreelancer() {
  const { config, portfolio, services, testimonials } = freelancerProfile;

  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-gradient-to-br from-orange-500 to-orange-700 text-white py-24 px-4">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4" data-testid="badge-profile-type">
            <Hammer className="h-3 w-3 mr-1" />
            Travailleur Autonome
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-4" data-testid="text-freelancer-name">
            {config.name}
          </h1>
          <p className="text-xl md:text-2xl text-orange-100 mb-6" data-testid="text-freelancer-tagline">
            {config.tagline}
          </p>
          <p className="text-lg text-orange-200 max-w-2xl mx-auto mb-8">
            {config.description}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" data-testid="button-call">
              <Phone className="mr-2 h-4 w-4" />
              Appeler maintenant
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white" data-testid="button-quote">
              <Calendar className="mr-2 h-4 w-4" />
              Demander une soumission
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Wrench className="h-6 w-6 text-orange-600" />
            <h2 className="text-3xl font-bold" data-testid="heading-services">Services</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {services?.map((service) => (
              <Card key={service.id} className="flex flex-col" data-testid={`card-service-${service.id}`}>
                <CardHeader>
                  <CardTitle>{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-2xl font-bold text-orange-600 mb-4">{service.price}</p>
                  <ul className="space-y-2 flex-1">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6" variant="outline" data-testid={`button-service-${service.id}`}>
                    En savoir plus
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Hammer className="h-6 w-6 text-orange-600" />
            <h2 className="text-3xl font-bold" data-testid="heading-portfolio">Réalisations</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {portfolio?.map((item) => (
              <Card key={item.id} className="hover-elevate" data-testid={`card-project-${item.id}`}>
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <Wrench className="h-12 w-12 text-muted-foreground/30" />
                </div>
                <CardContent className="pt-4">
                  <Badge variant="outline" className="mb-2">{item.category}</Badge>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Star className="h-6 w-6 text-orange-600" />
            <h2 className="text-3xl font-bold" data-testid="heading-testimonials">Ce que disent mes clients</h2>
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

      <section className="py-16 px-4 bg-orange-600 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Besoin d'un coup de main?</h2>
          <p className="text-orange-100 mb-8">
            Appelez-moi pour une estimation gratuite. Disponible 7 jours sur 7.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" data-testid="button-contact-cta">
              <Phone className="mr-2 h-4 w-4" />
              (418) 555-0123
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white" data-testid="button-subscribe">
              Recevoir des conseils
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
