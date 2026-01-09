import { Button } from "@/components/ui/button";
import { Mail, Calendar, ArrowRight } from "lucide-react";
import type { ProfileConfig, SectionConfig } from "@shared/demo-profiles";

interface CTASectionProps {
  config: ProfileConfig;
  section: SectionConfig;
}

export function CTASection({ config, section }: CTASectionProps) {
  const ctaText = config.type === "athlete" 
    ? "Travaillons ensemble"
    : config.type === "freelancer"
    ? "Demander une soumission"
    : "R\u00e9server votre s\u00e9jour";

  const ctaDescription = config.type === "athlete"
    ? "Int\u00e9ress\u00e9 par un partenariat? Contactez-moi pour discuter de vos objectifs."
    : config.type === "freelancer"
    ? "Besoin d'un coup de main? Demandez une soumission gratuite pour votre projet."
    : "R\u00e9servez d\u00e8s maintenant pour vivre l'exp\u00e9rience authentique du Qu\u00e9bec.";

  return (
    <section className="py-16 px-4 bg-primary text-primary-foreground" data-testid="section-cta">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">
          {section.title || ctaText}
        </h2>
        <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
          {section.subtitle || ctaDescription}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" variant="secondary" data-testid="button-cta-contact">
            <Mail className="mr-2 h-4 w-4" />
            Me contacter
          </Button>
          {config.features.booking && (
            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground" data-testid="button-cta-book">
              <Calendar className="mr-2 h-4 w-4" />
              {config.type === "rental-host" ? "V\u00e9rifier les disponibilit\u00e9s" : "Prendre rendez-vous"}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
