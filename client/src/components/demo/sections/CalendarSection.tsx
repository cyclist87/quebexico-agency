import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Trophy, Dumbbell, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { CalendarEvent, SectionConfig } from "@shared/demo-profiles";

interface CalendarSectionProps {
  events: CalendarEvent[];
  section: SectionConfig;
}

const eventTypeConfig: Record<string, { label: string; icon: typeof Trophy; variant: "default" | "secondary" | "outline" }> = {
  competition: { label: "Comp\u00e9tition", icon: Trophy, variant: "default" },
  training: { label: "Entra\u00eenement", icon: Dumbbell, variant: "secondary" },
  appearance: { label: "Apparition", icon: Users, variant: "outline" },
  other: { label: "\u00c9v\u00e9nement", icon: Calendar, variant: "outline" },
};

export function CalendarSection({ events, section }: CalendarSectionProps) {
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
              {section.title}
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
                      {format(eventDate, "MMM", { locale: fr })}
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
