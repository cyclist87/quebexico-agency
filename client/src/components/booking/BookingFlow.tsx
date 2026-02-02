import { useState } from "react";
import { format, addMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Calendar, ArrowLeft, TreePine } from "lucide-react";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { PricingBreakdown } from "./PricingBreakdown";
import { BookingForm } from "./BookingForm";
import { useDirectSiteAvailability, useDirectSitePricing, useCreateReservation, useCreateInquiry } from "@/hooks/use-direct-site";
import type { GuestInfo, ReservationResponse, InquiryResponse } from "@shared/direct-sites";
import type { DateRange } from "react-day-picker";

interface BookingFlowProps {
  propertyId: string;
  propertyName: string;
  maxGuests?: number;
  enableInstantBooking?: boolean;
  demoMode?: boolean;
  pricePerNight?: number;
  onComplete?: (result: ReservationResponse | InquiryResponse) => void;
}

type BookingStep = "dates" | "info" | "confirmation";

export function BookingFlow({
  propertyId,
  propertyName,
  maxGuests = 6,
  enableInstantBooking = true,
  demoMode = false,
  pricePerNight = 250,
  onComplete,
}: BookingFlowProps) {
  const [step, setStep] = useState<BookingStep>("dates");
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [confirmationData, setConfirmationData] = useState<ReservationResponse | InquiryResponse | null>(null);

  const today = format(new Date(), "yyyy-MM-dd");
  const threeMonthsLater = format(addMonths(new Date(), 3), "yyyy-MM-dd");

  const { data: availability, isLoading: availabilityLoading } = useDirectSiteAvailability(
    demoMode ? "" : propertyId,
    today,
    threeMonthsLater
  );

  const { data: pricing, isLoading: pricingLoading } = useDirectSitePricing(
    demoMode ? "" : propertyId,
    checkIn,
    checkOut,
    guests
  );

  const reservationMutation = useCreateReservation();
  const inquiryMutation = useCreateInquiry();

  const calculateDemoPricing = () => {
    if (!checkIn || !checkOut) return null;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const subtotal = nights * pricePerNight;
    const cleaningFee = 85;
    const serviceFee = Math.round(subtotal * 0.12);
    const taxes = Math.round((subtotal + cleaningFee + serviceFee) * 0.15);
    return {
      nights,
      pricePerNight,
      subtotal,
      cleaningFee,
      serviceFee,
      taxes,
      total: subtotal + cleaningFee + serviceFee + taxes,
      currency: "CAD" as const,
    };
  };

  const pricingData = demoMode ? calculateDemoPricing() : pricing;

  const handleDateRangeChange = (range: { checkIn: string; checkOut: string } | null) => {
    if (range) {
      setCheckIn(range.checkIn);
      setCheckOut(range.checkOut);
    } else {
      setCheckIn(null);
      setCheckOut(null);
    }
  };

  const handleContinueToInfo = () => {
    if (checkIn && checkOut) {
      setStep("info");
    }
  };

  const handleSubmit = async (guestInfo: GuestInfo) => {
    setGuests(guestInfo.guests);

    if (demoMode) {
      const demoResult: ReservationResponse = {
        id: `DEMO-${Date.now().toString(36).toUpperCase()}`,
        status: "confirmed",
        confirmationCode: `QBX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        total: pricingData?.total || 0,
        currency: "CAD",
      };
      setConfirmationData(demoResult);
      setStep("confirmation");
      onComplete?.(demoResult);
      return;
    }

    try {
      let result: ReservationResponse | InquiryResponse;

      if (enableInstantBooking && checkIn && checkOut) {
        result = await reservationMutation.mutateAsync({
          propertyId,
          checkIn,
          checkOut,
          guest: guestInfo,
          ...(pricingData && "total" in pricingData && {
            nightlyRate: (pricingData as any).pricePerNight,
            cleaningFee: (pricingData as any).cleaningFee,
            totalPrice: (pricingData as any).total,
            currency: (pricingData as any).currency ?? "CAD",
          }),
        });
      } else {
        result = await inquiryMutation.mutateAsync({
          propertyId,
          checkIn: checkIn || undefined,
          checkOut: checkOut || undefined,
          guest: guestInfo,
        });
      }

      setConfirmationData(result);
      setStep("confirmation");
      onComplete?.(result);
    } catch (error) {
      console.error("Booking error:", error);
    }
  };

  if (step === "confirmation" && confirmationData) {
    const isReservation = "confirmationCode" in confirmationData || "total" in confirmationData;

    return (
      <Card data-testid="card-booking-confirmation">
        <CardContent className="py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2" data-testid="text-confirmation-title">
            {isReservation ? "Réservation confirmée!" : "Demande envoyée!"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {isReservation
              ? "Vous recevrez un courriel de confirmation sous peu."
              : "Nous vous répondrons dans les plus brefs délais."}
          </p>
          
          <div className="bg-muted/50 rounded-lg p-4 inline-block mb-6">
            <p className="text-sm text-muted-foreground">Numéro de référence</p>
            <p className="text-lg font-mono font-bold" data-testid="text-confirmation-id">
              {confirmationData.id}
            </p>
          </div>

          {isReservation && checkIn && checkOut && (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Propriété:</span> {propertyName}
              </p>
              <p>
                <span className="text-muted-foreground">Arrivée:</span>{" "}
                {format(new Date(checkIn), "d MMMM yyyy", { locale: fr })}
              </p>
              <p>
                <span className="text-muted-foreground">Départ:</span>{" "}
                {format(new Date(checkOut), "d MMMM yyyy", { locale: fr })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (step === "info") {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => setStep("dates")}
          className="mb-2"
          data-testid="button-back-to-dates"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Modifier les dates
        </Button>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TreePine className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">{propertyName}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {checkIn && format(new Date(checkIn), "d MMM", { locale: fr })} -{" "}
                {checkOut && format(new Date(checkOut), "d MMM yyyy", { locale: fr })}
              </span>
              {pricingData && (
                <Badge variant="secondary" className="ml-auto">
                  {pricingData.nights} nuits
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <BookingForm
            onSubmit={handleSubmit}
            isLoading={reservationMutation.isPending || inquiryMutation.isPending}
            isInstantBooking={enableInstantBooking}
            maxGuests={maxGuests}
          />

          {pricingData && <PricingBreakdown pricing={pricingData} />}
        </div>

        {(reservationMutation.isError || inquiryMutation.isError) && (
          <Card className="border-destructive">
            <CardContent className="py-4 text-destructive text-sm">
              Une erreur est survenue. Veuillez réessayer.
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <AvailabilityCalendar
            availability={availability || null}
            isLoading={availabilityLoading}
            onDateRangeChange={handleDateRangeChange}
            selectedRange={selectedRange}
            setSelectedRange={setSelectedRange}
          />
        </div>

        <div className="xl:w-80 space-y-4 shrink-0">
          {pricingData ? (
            <PricingBreakdown pricing={pricingData} isLoading={pricingLoading} />
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Sélectionnez vos dates pour voir les tarifs</p>
              </CardContent>
            </Card>
          )}

          <Button
            className="w-full"
            size="lg"
            disabled={!checkIn || !checkOut}
            onClick={handleContinueToInfo}
            data-testid="button-continue-to-info"
          >
            {enableInstantBooking ? "Continuer la réservation" : "Faire une demande"}
          </Button>
        </div>
      </div>
    </div>
  );
}
