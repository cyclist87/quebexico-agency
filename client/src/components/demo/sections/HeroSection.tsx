import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Calendar } from "lucide-react";
import { useProfileLocalization } from "@/hooks/use-profile-localization";
import type { ProfileConfig } from "@shared/demo-profiles";

interface HeroSectionProps {
  config: ProfileConfig;
  heroImage?: string;
}

export function HeroSection({ config, heroImage }: HeroSectionProps) {
  const { getText } = useProfileLocalization();

  return (
    <section className="relative text-white py-24 px-4 min-h-[500px] flex items-center">
      {heroImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      <div className="relative max-w-4xl mx-auto text-center w-full">
        <Badge variant="secondary" className="mb-4" data-testid="badge-profile-type">
          {config.type === "athlete" && "Athlète Professionnel"}
          {config.type === "freelancer" && "Travailleur Autonome"}
          {config.type === "rental-host" && "Location de chalets"}
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold mb-4" data-testid="text-name">
          {getText(config.name)}
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-6" data-testid="text-tagline">
          {getText(config.tagline)}
        </p>
        <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
          {getText(config.description)}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" variant="secondary" data-testid="button-contact">
            <Mail className="mr-2 h-4 w-4" />
            Contact
          </Button>
          {config.features.booking && (
            <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white" data-testid="button-book">
              <Calendar className="mr-2 h-4 w-4" />
              Réserver
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
