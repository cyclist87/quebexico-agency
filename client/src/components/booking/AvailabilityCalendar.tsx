import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { addDays, isWithinInterval, parseISO, format } from "date-fns";
import { fr } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import type { HostProAvailability, BlockedDate } from "@shared/hostpro";

interface AvailabilityCalendarProps {
  availability: HostProAvailability | null;
  isLoading?: boolean;
  onDateRangeChange?: (range: { checkIn: string; checkOut: string } | null) => void;
  selectedRange?: DateRange;
  setSelectedRange?: (range: DateRange | undefined) => void;
}

function isDateBlocked(date: Date, blockedDates: BlockedDate[]): boolean {
  return blockedDates.some((blocked) => {
    const start = parseISO(blocked.start);
    const end = parseISO(blocked.end);
    return isWithinInterval(date, { start, end });
  });
}

export function AvailabilityCalendar({
  availability,
  isLoading,
  onDateRangeChange,
  selectedRange,
  setSelectedRange,
}: AvailabilityCalendarProps) {
  const [internalRange, setInternalRange] = useState<DateRange | undefined>();

  const range = selectedRange ?? internalRange;
  const setRange = setSelectedRange ?? setInternalRange;

  const blockedDates = availability?.blockedDates ?? [];

  const disabledDays = useMemo(() => {
    const disabled: Date[] = [];
    blockedDates.forEach((blocked) => {
      const start = parseISO(blocked.start);
      const end = parseISO(blocked.end);
      let current = start;
      while (current <= end) {
        disabled.push(new Date(current));
        current = addDays(current, 1);
      }
    });
    return disabled;
  }, [blockedDates]);

  const handleSelect = (newRange: DateRange | undefined) => {
    setRange(newRange);

    if (newRange?.from && newRange?.to) {
      onDateRangeChange?.({
        checkIn: format(newRange.from, "yyyy-MM-dd"),
        checkOut: format(newRange.to, "yyyy-MM-dd"),
      });
    } else {
      onDateRangeChange?.(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-availability-calendar">
      <CardHeader>
        <CardTitle className="text-lg">Sélectionnez vos dates</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <Calendar
          mode="range"
          selected={range}
          onSelect={handleSelect}
          disabled={[{ before: new Date() }, ...disabledDays]}
          numberOfMonths={1}
          locale={fr}
          className="rounded-md w-full"
          data-testid="calendar-availability"
        />
        {range?.from && range?.to && (
          <p className="mt-4 text-sm text-muted-foreground" data-testid="text-selected-dates">
            Du {format(range.from, "d MMMM yyyy", { locale: fr })} au{" "}
            {format(range.to, "d MMMM yyyy", { locale: fr })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
