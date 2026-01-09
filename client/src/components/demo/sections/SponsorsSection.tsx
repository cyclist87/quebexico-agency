import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Building2 } from "lucide-react";
import { useProfileLocalization } from "@/hooks/use-profile-localization";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Sponsor, SectionConfig } from "@shared/demo-profiles";

interface SponsorsSectionProps {
  sponsors: Sponsor[];
  section: SectionConfig;
}

export function SponsorsSection({ sponsors, section }: SponsorsSectionProps) {
  const { getText } = useProfileLocalization();
  const { t } = useLanguage();

  const categoryLabels: Record<string, string> = {
    title: t.demo.sponsors.title,
    technical: t.demo.sponsors.technical,
    support: t.demo.sponsors.support,
    media: t.demo.sponsors.media,
  };

  const groupedSponsors = sponsors.reduce((acc, sponsor) => {
    if (!acc[sponsor.category]) {
      acc[sponsor.category] = [];
    }
    acc[sponsor.category].push(sponsor);
    return acc;
  }, {} as Record<string, Sponsor[]>);

  const categoryOrder = ["title", "technical", "support", "media"];

  return (
    <section className="py-16 px-4" data-testid="section-sponsors">
      <div className="max-w-6xl mx-auto">
        {section.title && (
          <h2 className="text-3xl font-bold mb-8 text-center" data-testid="heading-sponsors">
            {getText(section.title)}
          </h2>
        )}
        {section.subtitle && (
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {getText(section.subtitle)}
          </p>
        )}

        {categoryOrder.map((category) => {
          const categorySponsors = groupedSponsors[category];
          if (!categorySponsors || categorySponsors.length === 0) return null;

          return (
            <div key={category} className="mb-12">
              <h3 className="text-lg font-semibold text-muted-foreground mb-6 text-center">
                {categoryLabels[category]}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categorySponsors.map((sponsor) => (
                  <Card 
                    key={sponsor.id} 
                    className="hover-elevate group"
                    data-testid={`card-sponsor-${sponsor.id}`}
                  >
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Building2 className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <h4 className="font-semibold mb-2">{sponsor.name}</h4>
                      {sponsor.description && (
                        <p className="text-sm text-muted-foreground mb-4">{sponsor.description}</p>
                      )}
                      {sponsor.websiteUrl && (
                        <Button variant="ghost" size="sm" asChild>
                          <a 
                            href={sponsor.websiteUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            data-testid={`link-sponsor-${sponsor.id}`}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            {t.demo.buttons.visit}
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
