import { Button } from "@/components/ui/button";
import { Mail, Calendar } from "lucide-react";
import { useProfileLocalization } from "@/hooks/use-profile-localization";
import type { ProfileConfig, SectionConfig } from "@shared/demo-profiles";

interface CTASectionProps {
  config: ProfileConfig;
  section: SectionConfig;
}

export function CTASection({ config, section }: CTASectionProps) {
  const { getText } = useProfileLocalization();

  const ctaText = config.type === "athlete" 
    ? "Travaillons ensemble"
    : config.type === "freelancer"
    ? "Demander une soumission"
    : "Réserver votre séjour";

  const ctaDescription = config.type === "athlete"
    ? "Intéressé par un partenariat? Contactez-moi pour discuter de vos objectifs."
    : config.type === "freelancer"
    ? "Besoin d'un coup de main? Demandez une soumission gratuite pour votre projet."
    : "Réservez dès maintenant pour vivre l'expérience authentique du Québec.";

  return (
    <section className="py-16 px-4 bg-primary text-primary-foreground" data-testid="section-cta">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">
          {getText(section.title) || ctaText}
        </h2>
        <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
          {getText(section.subtitle) || ctaDescription}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" variant="secondary" data-testid="button-cta-contact">
            <Mail className="mr-2 h-4 w-4" />
            Me contacter
          </Button>
          {config.features.booking && (
            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground" data-testid="button-cta-book">
              <Calendar className="mr-2 h-4 w-4" />
              {config.type === "rental-host" ? "Vérifier les disponibilités" : "Prendre rendez-vous"}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
