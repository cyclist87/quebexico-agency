import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bike, Hammer, TreePine, ArrowRight, CheckCircle,
  Globe, Calendar, Mail, FileText, Image, Users, MessageSquare
} from "lucide-react";
import { demoProfiles } from "@shared/demo-profiles";

import athletePreview from "@assets/stock_images/professional_road_cy_e42ef465.jpg";
import freelancerPreview from "@assets/stock_images/professional_handyma_07e33c7f.jpg";
import chaletPreview from "@assets/stock_images/cozy_winter_cabin_ch_cd99d6d4.jpg";

const profileMeta = {
  athlete: {
    icon: Bike,
    color: "blue",
    route: "/demo/athlete",
    preview: athletePreview,
    featureLabels: {
      portfolio: { label: "Palmarès", icon: FileText },
      services: { label: "Services", icon: Users },
      testimonials: { label: "Témoignages", icon: MessageSquare },
      booking: { label: "Réservation", icon: Calendar },
      blog: { label: "Blog", icon: FileText },
      contact: { label: "Contact", icon: Mail },
      newsletter: { label: "Infolettre", icon: Mail },
    },
  },
  freelancer: {
    icon: Hammer,
    color: "orange",
    route: "/demo/freelancer",
    preview: freelancerPreview,
    featureLabels: {
      portfolio: { label: "Projets", icon: Image },
      services: { label: "Services", icon: Users },
      testimonials: { label: "Témoignages", icon: MessageSquare },
      booking: { label: "Soumission", icon: Calendar },
      blog: { label: "Conseils", icon: FileText },
      contact: { label: "Contact", icon: Mail },
      newsletter: { label: "Infolettre", icon: Mail },
    },
  },
  "rental-host": {
    icon: TreePine,
    color: "green",
    route: "/demo/chalet",
    preview: chaletPreview,
    featureLabels: {
      properties: { label: "Propriétés", icon: TreePine },
      testimonials: { label: "Avis clients", icon: MessageSquare },
      booking: { label: "Réservation", icon: Calendar },
      blog: { label: "Blogue", icon: FileText },
      contact: { label: "Contact", icon: Mail },
      newsletter: { label: "Infolettre", icon: Mail },
    },
  },
};

export default function DemoIndex() {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Globe className="h-3 w-3 mr-1" />
            Démonstrations
          </Badge>
          <h1 className="text-4xl font-bold mb-4" data-testid="heading-demo-index">
            Templates de sites web
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez nos modèles de sites clés en main adaptés à chaque type d'activité.
            Multilingue, moderne et optimisé pour la conversion.
          </p>
        </div>

        <div className="space-y-8">
          {(Object.entries(demoProfiles) as [keyof typeof demoProfiles, typeof demoProfiles[keyof typeof demoProfiles]][]).map(([type, profile]) => {
            const meta = profileMeta[type];
            const Icon = meta.icon;
            const enabledFeatures = Object.entries(profile.config.features)
              .filter(([_, enabled]) => enabled)
              .map(([key]) => key);

            return (
              <Card key={type} className="overflow-visible" data-testid={`card-demo-${type}`}>
                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-1/2 relative">
                    <div className="aspect-video lg:aspect-auto lg:h-full relative overflow-hidden rounded-t-lg lg:rounded-l-lg lg:rounded-tr-none">
                      <img
                        src={meta.preview}
                        alt={`Aperçu ${profile.config.name}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge className={`bg-${meta.color}-600 text-white mb-2`}>
                          <Icon className="h-3 w-3 mr-1" />
                          {type === "athlete" ? "Athlète" : type === "freelancer" ? "Travailleur autonome" : "Location"}
                        </Badge>
                        <h2 className="text-2xl font-bold text-white">{profile.config.name}</h2>
                        <p className="text-white/80 text-sm">{profile.config.tagline}</p>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="lg:w-1/2 p-6 flex flex-col">
                    <p className="text-muted-foreground mb-6">
                      {profile.config.description}
                    </p>
                    
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Fonctionnalités incluses
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {enabledFeatures.map((feature) => {
                          const featureInfo = (meta.featureLabels as Record<string, { label: string; icon: typeof CheckCircle }>)[feature];
                          if (!featureInfo) return null;
                          const FeatureIcon = featureInfo.icon;
                          return (
                            <div key={feature} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                              <span>{featureInfo.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-auto">
                      <Button className="w-full" size="lg" asChild data-testid={`button-view-${type}`}>
                        <Link href={meta.route}>
                          Voir la démo
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Card className="inline-block">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                Ces pages de démonstration sont des aperçus privés.
                Chaque template est entièrement personnalisable selon vos besoins.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
