import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote, Star } from "lucide-react";
import { useProfileLocalization } from "@/hooks/use-profile-localization";
import type { Testimonial, SectionConfig } from "@shared/demo-profiles";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  section: SectionConfig;
}

export function TestimonialsSection({ testimonials, section }: TestimonialsSectionProps) {
  const { getText } = useProfileLocalization();

  return (
    <section className="py-16 px-4" data-testid="section-testimonials">
      <div className="max-w-6xl mx-auto">
        {section.title && (
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Quote className="h-6 w-6" />
              <h2 className="text-3xl font-bold" data-testid="heading-testimonials">
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
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="hover-elevate" data-testid={`card-testimonial-${testimonial.id}`}>
              <CardContent className="pt-6">
                {testimonial.rating && (
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating!
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                )}
                
                <blockquote className="text-muted-foreground mb-6 italic">
                  "{getText(testimonial.content)}"
                </blockquote>
                
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={testimonial.avatarUrl} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium" data-testid={`text-testimonial-name-${testimonial.id}`}>
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{getText(testimonial.role)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
