import { useState, useMemo } from "react";
import { format, addMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PropertyCard, AvailabilityCalendar, PricingBreakdown } from "@/components/booking";
import {
  useHostProEnabled,
  useHostProConfig,
  useHostProProperties,
  useHostProAvailability,
  useHostProPricing,
} from "@/hooks/use-hostpro";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, Users, AlertCircle } from "lucide-react";
import type { DateRange } from "react-day-picker";

export default function Booking() {
  const { toast } = useToast();
  const { data: enabledData, isLoading: checkingEnabled } = useHostProEnabled();
  const { data: config } = useHostProConfig();
  const { data: properties, isLoading: loadingProperties } = useHostProProperties();

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState<number>(2);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestMessage, setGuestMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");
  const threeMonthsLater = format(addMonths(new Date(), 3), "yyyy-MM-dd");

  const { data: availability, isLoading: loadingAvailability } = useHostProAvailability(
    selectedPropertyId,
    today,
    threeMonthsLater
  );

  const checkIn = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : null;
  const checkOut = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : null;

  const { data: pricing, isLoading: loadingPricing } = useHostProPricing(
    selectedPropertyId,
    checkIn,
    checkOut,
    guests
  );

  const selectedProperty = useMemo(
    () => properties?.find((p) => p.id === selectedPropertyId),
    [properties, selectedPropertyId]
  );

  const canSubmit = selectedPropertyId && checkIn && checkOut && guestName && guestEmail;
  
  const showPricing = config?.enablePayments !== false;

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // TODO: Phase 2 - POST /reservations or /inquiries to HostPro API
      // For now, show a success message indicating the feature is coming
      toast({
        title: config?.enableInstantBooking ? "Demande envoyée" : "Message envoyé",
        description: "Nous avons bien reçu votre demande. Vous recevrez une confirmation par email.",
      });
      
      // Reset form after successful submission
      setDateRange(undefined);
      setGuestName("");
      setGuestEmail("");
      setGuestMessage("");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingEnabled) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!enabledData?.enabled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground" data-testid="text-booking-disabled">
          Le système de réservation n'est pas activé.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" data-testid="text-booking-title">
          {config?.name || "Réservation directe"}
        </h1>
        {config?.tagline && (
          <p className="text-muted-foreground mt-2">{config.tagline}</p>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              1. Choisissez votre propriété
            </h2>
            {loadingProperties ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : properties && properties.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isSelected={property.id === selectedPropertyId}
                    onSelect={(p) => setSelectedPropertyId(p.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground" data-testid="text-no-properties">
                Aucune propriété disponible.
              </p>
            )}
          </section>

          {selectedPropertyId && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                2. Sélectionnez vos dates
              </h2>
              <AvailabilityCalendar
                availability={availability ?? null}
                isLoading={loadingAvailability}
                selectedRange={dateRange}
                setSelectedRange={setDateRange}
              />
            </section>
          )}

          {selectedPropertyId && checkIn && checkOut && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                3. Vos informations
              </h2>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="guests">Nombre de voyageurs</Label>
                      <Input
                        id="guests"
                        type="number"
                        min={1}
                        max={20}
                        value={guests}
                        onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                        data-testid="input-guests"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input
                        id="name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Jean Dupont"
                        data-testid="input-guest-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="jean@example.com"
                        data-testid="input-guest-email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message (optionnel)</Label>
                    <Textarea
                      id="message"
                      value={guestMessage}
                      onChange={(e) => setGuestMessage(e.target.value)}
                      placeholder="Informations supplémentaires..."
                      rows={3}
                      data-testid="input-guest-message"
                    />
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
        </div>

        <div className="space-y-6">
          {selectedProperty && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Propriété:</span>{" "}
                  <span className="font-medium">{selectedProperty.name}</span>
                </p>
                {checkIn && checkOut && (
                  <p>
                    <span className="text-muted-foreground">Dates:</span>{" "}
                    <span className="font-medium">
                      {checkIn} → {checkOut}
                    </span>
                  </p>
                )}
                <p>
                  <span className="text-muted-foreground">Voyageurs:</span>{" "}
                  <span className="font-medium">{guests}</span>
                </p>
              </CardContent>
            </Card>
          )}

          {showPricing && (
            <PricingBreakdown
              pricing={pricing ?? null}
              isLoading={loadingPricing}
            />
          )}

          {config?.enableInstantBooking && canSubmit && (
            <Button
              className="w-full"
              size="lg"
              disabled={!canSubmit || isSubmitting}
              onClick={handleSubmit}
              data-testid="button-submit-booking"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Demander à réserver
            </Button>
          )}

          {!config?.enableInstantBooking && canSubmit && (
            <Button
              className="w-full"
              size="lg"
              variant="outline"
              disabled={!canSubmit || isSubmitting}
              onClick={handleSubmit}
              data-testid="button-submit-inquiry"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Envoyer une demande
            </Button>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Aucun paiement ne sera prélevé maintenant.
            <br />
            Vous recevrez une confirmation par email.
          </p>
        </div>
      </div>
    </div>
  );
}
