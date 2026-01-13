import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminReservations } from "@/hooks/use-properties";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Search, Users, DollarSign, Ticket } from "lucide-react";
import { format } from "date-fns";
import { fr, enUS, es } from "date-fns/locale";

const translations = {
  fr: {
    title: "Réservations",
    searchPlaceholder: "Rechercher par nom ou code...",
    filterStatus: "Statut",
    all: "Tous",
    pending: "En attente",
    confirmed: "Confirmée",
    cancelled: "Annulée",
    completed: "Terminée",
    noReservations: "Aucune réservation",
    guest: "Client",
    property: "Propriété",
    dates: "Dates",
    nights: "nuits",
    guests: "voyageurs",
    total: "Total",
    status: "Statut",
    code: "Code",
    discount: "Rabais",
  },
  en: {
    title: "Reservations",
    searchPlaceholder: "Search by name or code...",
    filterStatus: "Status",
    all: "All",
    pending: "Pending",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    completed: "Completed",
    noReservations: "No reservations",
    guest: "Guest",
    property: "Property",
    dates: "Dates",
    nights: "nights",
    guests: "guests",
    total: "Total",
    status: "Status",
    code: "Code",
    discount: "Discount",
  },
  es: {
    title: "Reservas",
    searchPlaceholder: "Buscar por nombre o código...",
    filterStatus: "Estado",
    all: "Todos",
    pending: "Pendiente",
    confirmed: "Confirmada",
    cancelled: "Cancelada",
    completed: "Completada",
    noReservations: "Sin reservas",
    guest: "Huésped",
    property: "Propiedad",
    dates: "Fechas",
    nights: "noches",
    guests: "huéspedes",
    total: "Total",
    status: "Estado",
    code: "Código",
    discount: "Descuento",
  },
};

export default function AdminReservations() {
  const { language } = useLanguage();
  const lang = (language === "en" || language === "es" ? language : "fr") as "fr" | "en" | "es";
  const t = translations[lang];
  const dateLocale = lang === "en" ? enUS : lang === "es" ? es : fr;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: reservations = [], isLoading } = useAdminReservations();

  const filteredReservations = reservations.filter((res) => {
    const matchesSearch =
      search === "" ||
      res.guestFirstName?.toLowerCase().includes(search.toLowerCase()) ||
      res.guestLastName?.toLowerCase().includes(search.toLowerCase()) ||
      res.confirmationCode?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      confirmed: "default",
      cancelled: "destructive",
      completed: "outline",
    };
    const labels: Record<string, string> = {
      pending: t.pending,
      confirmed: t.confirmed,
      cancelled: t.cancelled,
      completed: t.completed,
    };
    return <Badge variant={variants[status] || "secondary"}>{labels[status] || status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-admin-reservations-title">{t.title}</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t.title} ({filteredReservations.length})
            </CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t.searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                  data-testid="input-search-reservations"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40" data-testid="select-status-filter">
                  <SelectValue placeholder={t.filterStatus} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all}</SelectItem>
                  <SelectItem value="pending">{t.pending}</SelectItem>
                  <SelectItem value="confirmed">{t.confirmed}</SelectItem>
                  <SelectItem value="cancelled">{t.cancelled}</SelectItem>
                  <SelectItem value="completed">{t.completed}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t.noReservations}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.code}</TableHead>
                    <TableHead>{t.guest}</TableHead>
                    <TableHead>{t.dates}</TableHead>
                    <TableHead className="text-center">{t.guests}</TableHead>
                    <TableHead className="text-right">{t.total}</TableHead>
                    <TableHead>{t.status}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.map((res) => (
                    <TableRow key={res.id} data-testid={`row-reservation-${res.id}`}>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {res.confirmationCode}
                        </code>
                        {res.couponCode && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                            <Ticket className="h-3 w-3" />
                            {res.couponCode}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {res.guestFirstName} {res.guestLastName}
                        </div>
                        <div className="text-xs text-muted-foreground">{res.guestEmail}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {res.checkIn && format(new Date(res.checkIn), "d MMM", { locale: dateLocale })}
                          {" → "}
                          {res.checkOut && format(new Date(res.checkOut), "d MMM yyyy", { locale: dateLocale })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {res.nights} {t.nights}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {res.guests}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 font-medium">
                          <DollarSign className="h-4 w-4" />
                          {res.total}
                        </div>
                        {res.discountAmount && res.discountAmount > 0 && (
                          <div className="text-xs text-green-600">
                            -{res.discountAmount}$ {t.discount}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(res.status || "pending")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
