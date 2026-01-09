import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Check } from "lucide-react";
import { useProfileLocalization } from "@/hooks/use-profile-localization";
import type { Service, SectionConfig } from "@shared/demo-profiles";

interface ServicesSectionProps {
  services: Service[];
  section: SectionConfig;
}

export function ServicesSection({ services, section }: ServicesSectionProps) {
  const { getText, getArray } = useProfileLocalization();

  return (
    <section className="py-16 px-4 bg-muted/30" data-testid="section-services">
      <div className="max-w-6xl mx-auto">
        {section.title && (
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Briefcase className="h-6 w-6" />
              <h2 className="text-3xl font-bold" data-testid="heading-services">
                {getText(section.title)}
              </h2>
            </div>
            {section.subtitle && (
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {getText(section.subtitle)}
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const features = getArray(service.features);
            return (
              <Card key={service.id} className="hover-elevate flex flex-col" data-testid={`card-service-${service.id}`}>
                <CardHeader>
                  <CardTitle className="text-xl">{getText(service.title)}</CardTitle>
                  {service.price && (
                    <Badge variant="secondary" className="w-fit">
                      {service.price}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-muted-foreground mb-4">{getText(service.description)}</p>
                  {features.length > 0 && (
                    <ul className="space-y-2 mt-auto">
                      {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
