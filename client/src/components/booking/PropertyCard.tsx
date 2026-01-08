import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Home } from "lucide-react";
import type { HostProProperty } from "@shared/hostpro";

interface PropertyCardProps {
  property: HostProProperty;
  onSelect?: (property: HostProProperty) => void;
  isSelected?: boolean;
}

export function PropertyCard({ property, onSelect, isSelected }: PropertyCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary" : ""}`}
      onClick={() => onSelect?.(property)}
      data-testid={`card-property-${property.id}`}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Home className="h-5 w-5 text-muted-foreground" />
          {property.name}
        </CardTitle>
        <Badge variant="secondary">{property.platform}</Badge>
      </CardHeader>
      <CardContent>
        {property.address && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {property.address}
          </p>
        )}
        {onSelect && (
          <Button
            variant={isSelected ? "default" : "outline"}
            className="mt-4 w-full"
            data-testid={`button-select-property-${property.id}`}
          >
            {isSelected ? "Sélectionné" : "Sélectionner"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
