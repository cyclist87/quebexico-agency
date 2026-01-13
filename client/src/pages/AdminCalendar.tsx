import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminProperties, useAdminReservations, useAdminBlockedDates } from "@/hooks/use-properties";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  ChevronLeft, 
  ChevronRight, 
  CalendarDays, 
  DollarSign,
  Ban,
  Users,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, isWithinInterval, parseISO } from "date-fns";
import { fr, enUS, es } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import type { Property, Reservation, BlockedDate, PricingRule } from "@shared/schema";

const translations = {
  fr: {
    title: "Calendrier",
    properties: "Propriétés",
    allProperties: "Toutes les propriétés",
    available: "Disponible",
    reserved: "Réservé",
    blocked: "Bloqué",
    legend: "Légende",
    pricing: "Tarification dynamique",
    noPricingRules: "Aucune règle de tarification",
    addRule: "Ajouter une règle",
    ruleName: "Nom de la règle",
    ruleType: "Type",
    seasonal: "Saisonnier",
    dayOfWeek: "Jour de la semaine",
    specialDate: "Date spéciale",
    lastMinute: "Dernière minute",
    longStay: "Long séjour",
    adjustment: "Ajustement",
    percentage: "Pourcentage",
    fixed: "Montant fixe",
    startDate: "Date début",
    endDate: "Date fin",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    active: "Actif",
    inactive: "Inactif",
    sunday: "Dimanche",
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    minNights: "Nuits min.",
    nights: "nuits",
    guest: "voyageur(s)",
    basePrice: "Prix de base",
  },
  en: {
    title: "Calendar",
    properties: "Properties",
    allProperties: "All properties",
    available: "Available",
    reserved: "Reserved",
    blocked: "Blocked",
    legend: "Legend",
    pricing: "Dynamic pricing",
    noPricingRules: "No pricing rules",
    addRule: "Add rule",
    ruleName: "Rule name",
    ruleType: "Type",
    seasonal: "Seasonal",
    dayOfWeek: "Day of week",
    specialDate: "Special date",
    lastMinute: "Last minute",
    longStay: "Long stay",
    adjustment: "Adjustment",
    percentage: "Percentage",
    fixed: "Fixed amount",
    startDate: "Start date",
    endDate: "End date",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    active: "Active",
    inactive: "Inactive",
    sunday: "Sunday",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    minNights: "Min. nights",
    nights: "nights",
    guest: "guest(s)",
    basePrice: "Base price",
  },
  es: {
    title: "Calendario",
    properties: "Propiedades",
    allProperties: "Todas las propiedades",
    available: "Disponible",
    reserved: "Reservado",
    blocked: "Bloqueado",
    legend: "Leyenda",
    pricing: "Precios dinámicos",
    noPricingRules: "Sin reglas de precios",
    addRule: "Agregar regla",
    ruleName: "Nombre de regla",
    ruleType: "Tipo",
    seasonal: "Estacional",
    dayOfWeek: "Día de la semana",
    specialDate: "Fecha especial",
    lastMinute: "Último minuto",
    longStay: "Estadía larga",
    adjustment: "Ajuste",
    percentage: "Porcentaje",
    fixed: "Monto fijo",
    startDate: "Fecha inicio",
    endDate: "Fecha fin",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    active: "Activo",
    inactive: "Inactivo",
    sunday: "Domingo",
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    minNights: "Noches min.",
    nights: "noches",
    guest: "huésped(es)",
    basePrice: "Precio base",
  },
};

function usePricingRules(propertyId?: number) {
  return useQuery<PricingRule[]>({
    queryKey: ['/api/admin/pricing-rules', propertyId],
    queryFn: async () => {
      const url = propertyId 
        ? `/api/admin/pricing-rules?propertyId=${propertyId}`
        : '/api/admin/pricing-rules';
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch pricing rules');
      return res.json();
    },
  });
}

export default function AdminCalendar() {
  const { language } = useLanguage();
  const lang = (language === "en" || language === "es" ? language : "fr") as "fr" | "en" | "es";
  const t = translations[lang];
  const dateLocale = lang === "en" ? enUS : lang === "es" ? es : fr;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("calendar");

  const { data: properties = [], isLoading: propertiesLoading } = useAdminProperties();
  const { data: reservations = [], isLoading: reservationsLoading } = useAdminReservations();
  const { data: pricingRules = [] } = usePricingRules(
    selectedPropertyId !== "all" ? parseInt(selectedPropertyId) : undefined
  );

  const selectedProperty = selectedPropertyId !== "all" 
    ? properties.find(p => p.id.toString() === selectedPropertyId)
    : null;

  const { data: blockedDates = [] } = useQuery<BlockedDate[]>({
    queryKey: ['/api/admin/blocked-dates', selectedPropertyId],
    queryFn: async () => {
      if (selectedPropertyId === "all") {
        const allBlocked: BlockedDate[] = [];
        for (const prop of properties) {
          const res = await fetch(`/api/admin/properties/${prop.id}/blocked-dates`, { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            allBlocked.push(...data);
          }
        }
        return allBlocked;
      }
      const res = await fetch(`/api/admin/properties/${selectedPropertyId}/blocked-dates`, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: properties.length > 0,
  });

  const filteredReservations = useMemo(() => {
    if (selectedPropertyId === "all") return reservations;
    return reservations.filter(r => r.propertyId?.toString() === selectedPropertyId);
  }, [reservations, selectedPropertyId]);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getDayStatus = (day: Date, propertyId?: number) => {
    const targetReservations = propertyId 
      ? filteredReservations.filter(r => r.propertyId === propertyId)
      : filteredReservations;
    const targetBlocked = propertyId
      ? blockedDates.filter(b => b.propertyId === propertyId)
      : blockedDates;

    for (const res of targetReservations) {
      if (res.status === 'cancelled') continue;
      const checkIn = new Date(res.checkIn);
      const checkOut = new Date(res.checkOut);
      if (isWithinInterval(day, { start: checkIn, end: checkOut }) || isSameDay(day, checkIn)) {
        return { status: 'reserved', reservation: res };
      }
    }

    for (const blocked of targetBlocked) {
      const start = new Date(blocked.startDate);
      const end = new Date(blocked.endDate);
      if (isWithinInterval(day, { start, end }) || isSameDay(day, start)) {
        return { status: 'blocked', blocked };
      }
    }

    return { status: 'available' };
  };

  const isLoading = propertiesLoading || reservationsLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <div className="flex items-center gap-4">
          <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
            <SelectTrigger className="w-[280px]" data-testid="select-property">
              <SelectValue placeholder={t.allProperties} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allProperties}</SelectItem>
              {properties.map((prop) => (
                <SelectItem key={prop.id} value={prop.id.toString()}>
                  {lang === "en" ? prop.nameEn : lang === "es" ? prop.nameEs : prop.nameFr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="calendar" className="gap-2" data-testid="tab-calendar">
            <CalendarDays className="h-4 w-4" />
            {t.title}
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-2" data-testid="tab-pricing">
            <DollarSign className="h-4 w-4" />
            {t.pricing}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-4 space-y-0 pb-4">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  data-testid="button-prev-month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold min-w-[200px] text-center">
                  {format(currentMonth, "MMMM yyyy", { locale: dateLocale })}
                </h2>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  data-testid="button-next-month"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
                  <span>{t.available}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300" />
                  <span>{t.reserved}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-200 border border-gray-400" />
                  <span>{t.blocked}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : selectedPropertyId === "all" ? (
                <div className="space-y-4">
                  {properties.map((property) => (
                    <div key={property.id} className="border rounded-lg p-4">
                      <h3 className="font-medium mb-3">
                        {lang === "en" ? property.nameEn : lang === "es" ? property.nameEs : property.nameFr}
                      </h3>
                      <div className="grid grid-cols-7 gap-1">
                        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
                          <div key={i} className="text-center text-xs font-medium text-muted-foreground py-1">
                            {day}
                          </div>
                        ))}
                        {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                          <div key={`empty-${i}`} />
                        ))}
                        {days.map((day) => {
                          const { status, reservation } = getDayStatus(day, property.id);
                          return (
                            <div
                              key={day.toISOString()}
                              className={`
                                p-1 text-center text-sm rounded cursor-default
                                ${status === 'available' ? 'bg-green-50 text-green-700 hover:bg-green-100' : ''}
                                ${status === 'reserved' ? 'bg-blue-100 text-blue-700' : ''}
                                ${status === 'blocked' ? 'bg-gray-200 text-gray-500' : ''}
                              `}
                              title={reservation ? `${reservation.guestFirstName} ${reservation.guestLastName}` : undefined}
                            >
                              {format(day, "d")}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-7 gap-1">
                    {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
                      <div key={i} className="text-center text-sm font-medium text-muted-foreground py-2">
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {days.map((day) => {
                      const { status, reservation, blocked } = getDayStatus(day);
                      return (
                        <div
                          key={day.toISOString()}
                          className={`
                            p-2 min-h-[80px] text-sm rounded border cursor-default
                            ${status === 'available' ? 'bg-green-50 border-green-200 hover:bg-green-100' : ''}
                            ${status === 'reserved' ? 'bg-blue-50 border-blue-200' : ''}
                            ${status === 'blocked' ? 'bg-gray-100 border-gray-300' : ''}
                          `}
                        >
                          <div className="font-medium">{format(day, "d")}</div>
                          {reservation && (
                            <div className="mt-1 text-xs truncate" title={`${reservation.guestFirstName} ${reservation.guestLastName}`}>
                              <Users className="h-3 w-3 inline mr-1" />
                              {reservation.guestFirstName}
                            </div>
                          )}
                          {status === 'blocked' && blocked?.reason && (
                            <div className="mt-1 text-xs text-gray-500 truncate">
                              <Ban className="h-3 w-3 inline mr-1" />
                              {blocked.reason}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="mt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {t.pricing}
              </CardTitle>
              {selectedProperty && (
                <div className="text-sm text-muted-foreground">
                  {t.basePrice}: <span className="font-medium">${selectedProperty.pricePerNight}</span> / {t.nights.slice(0, -1)}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {selectedPropertyId === "all" ? (
                <p className="text-muted-foreground text-center py-8">
                  {lang === "fr" 
                    ? "Sélectionnez une propriété pour gérer ses règles de tarification"
                    : lang === "es"
                    ? "Seleccione una propiedad para gestionar sus reglas de precios"
                    : "Select a property to manage its pricing rules"
                  }
                </p>
              ) : (
                <div className="space-y-4">
                  {pricingRules.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      {t.noPricingRules}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {pricingRules.map((rule) => (
                        <div 
                          key={rule.id} 
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <DollarSign className="h-4 w-4 text-primary" />
                            <div>
                              <p className="font-medium">
                                {lang === "en" ? rule.nameEn : lang === "es" ? rule.nameEs : rule.nameFr}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {rule.adjustmentType === 'percentage' 
                                  ? `${rule.adjustmentValue > 0 ? '+' : ''}${rule.adjustmentValue}%`
                                  : `${rule.adjustmentValue > 0 ? '+' : ''}$${rule.adjustmentValue}`
                                }
                                {rule.startDate && rule.endDate && (
                                  <span className="ml-2">
                                    ({format(new Date(rule.startDate), "dd/MM")} - {format(new Date(rule.endDate), "dd/MM")})
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <Badge variant={rule.isActive ? "default" : "secondary"}>
                            {rule.isActive ? t.active : t.inactive}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  <Separator className="my-4" />
                  <p className="text-sm text-muted-foreground">
                    {lang === "fr" 
                      ? "Les règles de tarification dynamique seront disponibles prochainement. Pour l'instant, gérez le prix de base dans l'éditeur de propriété."
                      : lang === "es"
                      ? "Las reglas de precios dinámicos estarán disponibles próximamente. Por ahora, gestione el precio base en el editor de propiedades."
                      : "Dynamic pricing rules will be available soon. For now, manage base pricing in the property editor."
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
