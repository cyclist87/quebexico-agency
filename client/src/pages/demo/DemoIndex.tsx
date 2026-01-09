import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bike, Hammer, TreePine, ArrowRight } from "lucide-react";
import { demoProfiles } from "@shared/demo-profiles";

const profileIcons = {
  athlete: Bike,
  freelancer: Hammer,
  "rental-host": TreePine,
};

const profileColors = {
  athlete: "bg-blue-600",
  freelancer: "bg-orange-600",
  "rental-host": "bg-green-700",
};

const profileRoutes = {
  athlete: "/demo/athlete",
  freelancer: "/demo/freelancer",
  "rental-host": "/demo/chalet",
};

export default function DemoIndex() {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">Démonstrations</Badge>
          <h1 className="text-4xl font-bold mb-4" data-testid="heading-demo-index">
            Templates de sites web
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez nos différents modèles de sites adaptés à chaque type d'activité.
            Ces pages sont des exemples privés pour démonstration interne.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {(Object.entries(demoProfiles) as [keyof typeof demoProfiles, typeof demoProfiles[keyof typeof demoProfiles]][]).map(([type, profile]) => {
            const Icon = profileIcons[type];
            const color = profileColors[type];
            const route = profileRoutes[type];

            return (
              <Card key={type} className="flex flex-col hover-elevate" data-testid={`card-demo-${type}`}>
                <div className={`aspect-video ${color} flex items-center justify-center rounded-t-lg`}>
                  <Icon className="h-16 w-16 text-white/80" />
                </div>
                <CardHeader>
                  <CardTitle>{profile.config.name}</CardTitle>
                  <CardDescription>{profile.config.tagline}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground mb-4 flex-1">
                    {profile.config.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {Object.entries(profile.config.features)
                      .filter(([_, enabled]) => enabled)
                      .slice(0, 4)
                      .map(([feature]) => (
                        <Badge key={feature} variant="outline" className="text-xs capitalize">
                          {feature}
                        </Badge>
                      ))}
                  </div>
                  <Link href={route}>
                    <Button className="w-full" data-testid={`button-view-${type}`}>
                      Voir la démo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Ces pages de démonstration ne sont pas liées à la navigation principale.</p>
          <p>Accès direct uniquement via URL.</p>
        </div>
      </div>
    </div>
  );
}
