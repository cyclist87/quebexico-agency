import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { useProfileLocalization } from "@/hooks/use-profile-localization";
import type { PortfolioItem, SectionConfig } from "@shared/demo-profiles";

interface PortfolioSectionProps {
  items: PortfolioItem[];
  section: SectionConfig;
}

export function PortfolioSection({ items, section }: PortfolioSectionProps) {
  const { getText } = useProfileLocalization();

  return (
    <section className="py-16 px-4" data-testid="section-portfolio">
      <div className="max-w-6xl mx-auto">
        {section.title && (
          <div className="flex items-center gap-2 mb-8">
            <Trophy className="h-6 w-6" />
            <h2 className="text-3xl font-bold" data-testid="heading-portfolio">
              {getText(section.title)}
            </h2>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="hover-elevate" data-testid={`card-portfolio-${item.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">{getText(item.title)}</CardTitle>
                    {item.date && (
                      <p className="text-sm text-muted-foreground mt-1">{item.date}</p>
                    )}
                  </div>
                  <Badge variant="outline">{getText(item.category)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{getText(item.description)}</p>
                {item.stats && (
                  <div className="flex flex-wrap gap-4">
                    {Object.entries(item.stats).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <p className="text-2xl font-bold text-primary">{value}</p>
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
  );
}
