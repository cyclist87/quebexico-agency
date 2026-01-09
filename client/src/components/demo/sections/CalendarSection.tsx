import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Trophy, Dumbbell, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr, enUS, es } from "date-fns/locale";
import { useProfileLocalization } from "@/hooks/use-profile-localization";
import { useLanguage } from "@/contexts/LanguageContext";
import type { CalendarEvent, SectionConfig } from "@shared/demo-profiles";

interface CalendarSectionProps {
  events: CalendarEvent[];
  section: SectionConfig;
}

export function CalendarSection({ events, section }: CalendarSectionProps) {
  const { getText } = useProfileLocalization();
  const { t, language } = useLanguage();

  const dateLocales = { fr, en: enUS, es };
  const dateLocale = dateLocales[language] || fr;

  const eventTypeConfig: Record<string, { label: string; icon: typeof Trophy; variant: "default" | "secondary" | "outline" }> = {
    competition: { label: t.demo.calendar.competition, icon: Trophy, variant: "default" },
    training: { label: t.demo.calendar.training, icon: Dumbbell, variant: "secondary" },
    appearance: { label: t.demo.calendar.appearance, icon: Users, variant: "outline" },
    other: { label: t.demo.calendar.other, icon: Calendar, variant: "outline" },
  };

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <section className="py-16 px-4 bg-muted/50" data-testid="section-calendar">
      <div className="max-w-4xl mx-auto">
        {section.title && (
          <div className="flex items-center gap-2 mb-8 justify-center">
            <Calendar className="h-6 w-6" />
            <h2 className="text-3xl font-bold" data-testid="heading-calendar">
              {getText(section.title)}
            </h2>
          </div>
        )}

        <div className="space-y-4">
          {sortedEvents.map((event) => {
            const typeConfig = eventTypeConfig[event.type] || eventTypeConfig.other;
            const Icon = typeConfig.icon;
            const eventDate = parseISO(event.date);

            return (
              <Card key={event.id} className="hover-elevate" data-testid={`card-event-${event.id}`}>
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="shrink-0 w-16 h-16 bg-primary/10 rounded-md flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-muted-foreground uppercase">
                      {format(eventDate, "MMM", { locale: dateLocale })}
                    </span>
                    <span className="text-2xl font-bold">
                      {format(eventDate, "d")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <h3 className="font-semibold">{event.title}</h3>
                      <Badge variant={typeConfig.variant}>
                        <Icon className="h-3 w-3 mr-1" />
                        {typeConfig.label}
                      </Badge>
                    </div>
                    {event.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </p>
                    )}
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
