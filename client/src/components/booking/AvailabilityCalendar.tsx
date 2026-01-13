import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
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
    // end is exclusive (iCal convention): blocked period is [start, end)
    return date >= start && date < end;
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
      // end is exclusive (iCal convention): iterate [start, end)
      while (current < end) {
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
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div data-testid="card-availability-calendar">
      <Calendar
        mode="range"
        selected={range}
        onSelect={handleSelect}
        disabled={[{ before: new Date() }, ...disabledDays]}
        numberOfMonths={1}
        locale={fr}
        className="rounded-md w-full [&_.rdp-months]:justify-center"
        data-testid="calendar-availability"
      />
      {range?.from && range?.to && (
        <p className="mt-3 text-sm text-muted-foreground text-center" data-testid="text-selected-dates">
          Du {format(range.from, "d MMMM yyyy", { locale: fr })} au{" "}
          {format(range.to, "d MMMM yyyy", { locale: fr })}
        </p>
      )}
    </div>
  );
}
