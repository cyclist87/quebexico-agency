import { useState } from "react";
import { format, addMonths } from "date-fns";
import { fr, enUS, es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Calendar, ArrowLeft, Home } from "lucide-react";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { PricingBreakdown } from "./PricingBreakdown";
import { BookingForm } from "./BookingForm";
import { 
  usePropertyAvailability, 
  usePropertyPricing, 
  useCreateReservation, 
  useCreateInquiry,
  type CreateReservationResponse,
  type CreateInquiryResponse
} from "@/hooks/use-properties";
import { useLanguage } from "@/contexts/LanguageContext";
import type { DateRange } from "react-day-picker";

interface BookingFlowLocalProps {
  propertySlug: string;
  propertyName: string;
  maxGuests?: number;
  enableInstantBooking?: boolean;
  pricePerNight?: number;
  cleaningFee?: number;
  onComplete?: (result: CreateReservationResponse | CreateInquiryResponse) => void;
}

type BookingStep = "dates" | "info" | "confirmation";

const dateLocales = { fr, en: enUS, es };

export function BookingFlowLocal({
  propertySlug,
  propertyName,
  maxGuests = 6,
  enableInstantBooking = true,
  pricePerNight = 250,
  cleaningFee = 0,
  onComplete,
}: BookingFlowLocalProps) {
  const { language } = useLanguage();
  const locale = dateLocales[language as keyof typeof dateLocales] || fr;
  
  const [step, setStep] = useState<BookingStep>("dates");
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [confirmationData, setConfirmationData] = useState<CreateReservationResponse | CreateInquiryResponse | null>(null);

  const today = format(new Date(), "yyyy-MM-dd");
  const threeMonthsLater = format(addMonths(new Date(), 3), "yyyy-MM-dd");

  const { data: availability, isLoading: availabilityLoading } = usePropertyAvailability(
    propertySlug,
    today,
    threeMonthsLater
  );

  const { data: pricing, isLoading: pricingLoading } = usePropertyPricing(
    propertySlug,
    checkIn,
    checkOut,
    guests
  );

  const reservationMutation = useCreateReservation();
  const inquiryMutation = useCreateInquiry();

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

  const handleSubmit = async (guestInfo: { 
    firstName: string; 
    lastName: string; 
    email: string; 
    phone: string; 
    guests: number; 
    message?: string 
  }) => {
    setGuests(guestInfo.guests);

    try {
      let result: CreateReservationResponse | CreateInquiryResponse;

      if (enableInstantBooking && checkIn && checkOut) {
        result = await reservationMutation.mutateAsync({
          propertySlug,
          checkIn,
          checkOut,
          guests: guestInfo.guests,
          guestFirstName: guestInfo.firstName,
          guestLastName: guestInfo.lastName,
          guestEmail: guestInfo.email,
          guestPhone: guestInfo.phone,
          guestMessage: guestInfo.message,
          language,
        });
      } else {
        result = await inquiryMutation.mutateAsync({
          propertySlug,
          checkIn: checkIn || undefined,
          checkOut: checkOut || undefined,
          guests: guestInfo.guests,
          guestFirstName: guestInfo.firstName,
          guestLastName: guestInfo.lastName,
          guestEmail: guestInfo.email,
          guestPhone: guestInfo.phone,
          message: guestInfo.message || "Demande d'information",
          language,
        });
      }

      setConfirmationData(result);
      setStep("confirmation");
      onComplete?.(result);
    } catch (error) {
      console.error("Booking error:", error);
    }
  };

  const translations = {
    fr: {
      reservationConfirmed: "Réservation confirmée!",
      requestSent: "Demande envoyée!",
      emailConfirmation: "Vous recevrez un courriel de confirmation sous peu.",
      weWillReply: "Nous vous répondrons dans les plus brefs délais.",
      referenceNumber: "Numéro de référence",
      property: "Propriété",
      arrival: "Arrivée",
      departure: "Départ",
      modifyDates: "Modifier les dates",
      nights: "nuits",
      selectDates: "Sélectionnez vos dates pour voir les tarifs",
      continueBooking: "Continuer la réservation",
      makeRequest: "Faire une demande",
      errorOccurred: "Une erreur est survenue. Veuillez réessayer.",
    },
    en: {
      reservationConfirmed: "Reservation confirmed!",
      requestSent: "Request sent!",
      emailConfirmation: "You will receive a confirmation email shortly.",
      weWillReply: "We will respond as soon as possible.",
      referenceNumber: "Reference number",
      property: "Property",
      arrival: "Check-in",
      departure: "Check-out",
      modifyDates: "Modify dates",
      nights: "nights",
      selectDates: "Select your dates to see rates",
      continueBooking: "Continue booking",
      makeRequest: "Make a request",
      errorOccurred: "An error occurred. Please try again.",
    },
    es: {
      reservationConfirmed: "¡Reservación confirmada!",
      requestSent: "¡Solicitud enviada!",
      emailConfirmation: "Recibirás un correo de confirmación pronto.",
      weWillReply: "Te responderemos lo antes posible.",
      referenceNumber: "Número de referencia",
      property: "Propiedad",
      arrival: "Llegada",
      departure: "Salida",
      modifyDates: "Modificar fechas",
      nights: "noches",
      selectDates: "Selecciona tus fechas para ver tarifas",
      continueBooking: "Continuar reservación",
      makeRequest: "Hacer solicitud",
      errorOccurred: "Ocurrió un error. Intenta de nuevo.",
    },
  };

  const t = translations[language as keyof typeof translations] || translations.fr;

  if (step === "confirmation" && confirmationData) {
    const isReservation = "confirmationCode" in confirmationData;

    return (
      <Card data-testid="card-booking-confirmation">
        <CardContent className="py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2" data-testid="text-confirmation-title">
            {isReservation ? t.reservationConfirmed : t.requestSent}
          </h2>
          <p className="text-muted-foreground mb-6">
            {isReservation ? t.emailConfirmation : t.weWillReply}
          </p>
          
          <div className="bg-muted/50 rounded-lg p-4 inline-block mb-6">
            <p className="text-sm text-muted-foreground">{t.referenceNumber}</p>
            <p className="text-lg font-mono font-bold" data-testid="text-confirmation-id">
              {isReservation ? (confirmationData as CreateReservationResponse).confirmationCode : confirmationData.id}
            </p>
          </div>

          {isReservation && checkIn && checkOut && (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">{t.property}:</span> {propertyName}
              </p>
              <p>
                <span className="text-muted-foreground">{t.arrival}:</span>{" "}
                {format(new Date(checkIn), "d MMMM yyyy", { locale })}
              </p>
              <p>
                <span className="text-muted-foreground">{t.departure}:</span>{" "}
                {format(new Date(checkOut), "d MMMM yyyy", { locale })}
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
          {t.modifyDates}
        </Button>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{propertyName}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {checkIn && format(new Date(checkIn), "d MMM", { locale })} -{" "}
                {checkOut && format(new Date(checkOut), "d MMM yyyy", { locale })}
              </span>
              {pricing && (
                <Badge variant="secondary" className="ml-auto">
                  {pricing.nights} {t.nights}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <BookingForm
            onSubmit={handleSubmit}
            isLoading={reservationMutation.isPending || inquiryMutation.isPending}
            isInstantBooking={enableInstantBooking}
            maxGuests={maxGuests}
          />

          {pricing && <PricingBreakdown pricing={pricing} />}
        </div>

        {(reservationMutation.isError || inquiryMutation.isError) && (
          <Card className="border-destructive">
            <CardContent className="py-4 text-destructive text-sm">
              {t.errorOccurred}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const availabilityForCalendar = availability ? {
    propertyId: String(availability.propertyId),
    blockedDates: availability.blockedDates,
    availableDates: [],
  } : null;

  return (
    <div className="space-y-4">
      <AvailabilityCalendar
        availability={availabilityForCalendar}
        isLoading={availabilityLoading}
        onDateRangeChange={handleDateRangeChange}
        selectedRange={selectedRange}
        setSelectedRange={setSelectedRange}
      />

      {pricing ? (
        <PricingBreakdown pricing={pricing} isLoading={pricingLoading} />
      ) : (
        <div className="py-4 text-center text-muted-foreground text-sm">
          <Calendar className="h-6 w-6 mx-auto mb-2 opacity-50" />
          <p>{t.selectDates}</p>
        </div>
      )}

      <Button
        className="w-full"
        size="lg"
        disabled={!checkIn || !checkOut}
        onClick={handleContinueToInfo}
        data-testid="button-continue-to-info"
      >
        {enableInstantBooking ? t.continueBooking : t.makeRequest}
      </Button>
    </div>
  );
}
