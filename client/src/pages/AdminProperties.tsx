import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  useAdminProperties, 
  useAdminBlockedDates, 
  useCreateProperty,
  useUpdateProperty,
  useDeleteProperty,
  useCreateBlockedDate,
  useDeleteBlockedDate,
} from "@/hooks/use-properties";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Calendar, 
  Home, 
  Settings, 
  ImagePlus,
  Ban,
  Loader2,
  X,
  ChevronLeft,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "wouter";
import type { Property, BlockedDate } from "@shared/schema";

const propertyFormSchema = z.object({
  slug: z.string().min(1, "Le slug est requis").regex(/^[a-z0-9-]+$/, "Slug invalide"),
  nameFr: z.string().min(1, "Le nom en français est requis"),
  nameEn: z.string().min(1, "Le nom en anglais est requis"),
  nameEs: z.string().optional(),
  descriptionFr: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionEs: z.string().optional(),
  addressFr: z.string().optional(),
  addressEn: z.string().optional(),
  addressEs: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  latitude: z.string().optional().refine(
    (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= -90 && parseFloat(val) <= 90),
    { message: "Latitude invalide (doit être entre -90 et 90)" }
  ),
  longitude: z.string().optional().refine(
    (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= -180 && parseFloat(val) <= 180),
    { message: "Longitude invalide (doit être entre -180 et 180)" }
  ),
  pricePerNight: z.coerce.number().min(1, "Prix requis"),
  cleaningFee: z.coerce.number().min(0).optional(),
  maxGuests: z.coerce.number().min(1).optional(),
  bedrooms: z.coerce.number().min(1).optional(),
  bathrooms: z.coerce.number().min(1).optional(),
  minNights: z.coerce.number().min(1).optional(),
  maxNights: z.coerce.number().min(1).optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  houseRulesFr: z.string().optional(),
  houseRulesEn: z.string().optional(),
  houseRulesEs: z.string().optional(),
  wifiName: z.string().optional(),
  wifiPassword: z.string().optional(),
  icalUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
}).refine(
  (data) => {
    const hasLat = data.latitude && data.latitude.trim() !== "";
    const hasLng = data.longitude && data.longitude.trim() !== "";
    return (hasLat && hasLng) || (!hasLat && !hasLng);
  },
  {
    message: "Les deux coordonnées (latitude et longitude) doivent être fournies ensemble",
    path: ["latitude"],
  }
);

type PropertyFormData = z.infer<typeof propertyFormSchema>;

const blockedDateSchema = z.object({
  startDate: z.string().min(1, "Date de début requise"),
  endDate: z.string().min(1, "Date de fin requise"),
  reason: z.string().optional(),
});

type BlockedDateFormData = z.infer<typeof blockedDateSchema>;

function PropertyListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 flex items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-9 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PropertyForm({ 
  property, 
  onClose 
}: { 
  property?: Property | null;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const createMutation = useCreateProperty();
  const updateMutation = useUpdateProperty();
  const isEditing = !!property;

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      slug: property?.slug || "",
      nameFr: property?.nameFr || "",
      nameEn: property?.nameEn || "",
      nameEs: property?.nameEs || "",
      descriptionFr: property?.descriptionFr || "",
      descriptionEn: property?.descriptionEn || "",
      descriptionEs: property?.descriptionEs || "",
      addressFr: property?.addressFr || "",
      addressEn: property?.addressEn || "",
      addressEs: property?.addressEs || "",
      city: property?.city || "",
      region: property?.region || "",
      latitude: property?.latitude || "",
      longitude: property?.longitude || "",
      pricePerNight: property?.pricePerNight || 100,
      cleaningFee: property?.cleaningFee || 0,
      maxGuests: property?.maxGuests || 4,
      bedrooms: property?.bedrooms || 1,
      bathrooms: property?.bathrooms || 1,
      minNights: property?.minNights || 1,
      maxNights: property?.maxNights || 30,
      checkInTime: property?.checkInTime || "15:00",
      checkOutTime: property?.checkOutTime || "11:00",
      houseRulesFr: property?.houseRulesFr || "",
      houseRulesEn: property?.houseRulesEn || "",
      houseRulesEs: property?.houseRulesEs || "",
      wifiName: property?.wifiName || "",
      wifiPassword: property?.wifiPassword || "",
      icalUrl: property?.icalUrl || "",
      isActive: property?.isActive ?? true,
      isFeatured: property?.isFeatured ?? false,
    },
  });

  const onSubmit = async (data: PropertyFormData) => {
    try {
      if (isEditing && property) {
        await updateMutation.mutateAsync({ id: property.id, data });
        toast({ title: "Propriété mise à jour" });
      } else {
        await createMutation.mutateAsync(data);
        toast({ title: "Propriété créée" });
      }
      onClose();
    } catch (error) {
      toast({ 
        title: "Erreur", 
        description: "Impossible de sauvegarder la propriété",
        variant: "destructive" 
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="location">Adresse</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="rules">Règles</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (URL)</FormLabel>
                  <FormControl>
                    <Input placeholder="chalet-lac-memphremagog" {...field} disabled={isEditing} />
                  </FormControl>
                  <FormDescription>Identifiant unique pour l'URL</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="nameFr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom (FR)</FormLabel>
                    <FormControl>
                      <Input placeholder="Chalet du Lac" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nameEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom (EN)</FormLabel>
                    <FormControl>
                      <Input placeholder="Lake Cottage" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nameEs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom (ES)</FormLabel>
                    <FormControl>
                      <Input placeholder="Cabaña del Lago" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="descriptionFr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (FR)</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descriptionEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (EN)</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-6">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Active</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">En vedette</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="location" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="addressFr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse (FR)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="addressEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse (EN)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="addressEs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse (ES)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Région</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-4" />
            
            <div className="space-y-2">
              <Label className="text-base font-medium">Coordonnées GPS</Label>
              <p className="text-sm text-muted-foreground">
                Pour afficher la propriété sur la carte. Vous pouvez trouver les coordonnées sur Google Maps.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input placeholder="45.5017" {...field} />
                    </FormControl>
                    <FormDescription>Ex: 45.5017</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input placeholder="-73.5673" {...field} />
                    </FormControl>
                    <FormDescription>Ex: -73.5673</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pricePerNight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix par nuit ($)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cleaningFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frais de ménage ($)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="maxGuests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invités max</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chambres</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bathrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salles de bain</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minNights"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nuits min</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxNights"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nuits max</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="checkInTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure d'arrivée</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="checkOutTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure de départ</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="wifiName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom WiFi</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="wifiPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe WiFi</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <FormField
              control={form.control}
              name="icalUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL iCal externe (optionnel)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://www.airbnb.com/calendar/ical/..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Collez l'URL iCal d'Airbnb, Booking.com ou autre plateforme pour synchroniser les disponibilités
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="rules" className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="houseRulesFr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Règles de la maison (FR)</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="Une règle par ligne..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="houseRulesEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Règles de la maison (EN)</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="One rule per line..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="houseRulesEs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Règles de la maison (ES)</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="Una regla por línea..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function BlockedDatesManager({ property }: { property: Property }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { data: blockedDates, isLoading, refetch } = useAdminBlockedDates(property.id);
  const createMutation = useCreateBlockedDate();
  const deleteMutation = useDeleteBlockedDate();
  
  const icalExportUrl = `${window.location.origin}/api/properties/${property.slug}/calendar.ics`;
  
  const copyIcalUrl = async () => {
    try {
      await navigator.clipboard.writeText(icalExportUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Lien copié" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de copier", variant: "destructive" });
    }
  };
  
  const syncIcal = async () => {
    if (!property.icalUrl) {
      toast({ title: "Aucune URL iCal configurée", variant: "destructive" });
      return;
    }
    
    setIsSyncing(true);
    try {
      const adminKey = localStorage.getItem("quebexico_admin_key") || "";
      const res = await fetch(`/api/admin/properties/${property.id}/sync-ical`, {
        method: "POST",
        headers: { "x-admin-key": adminKey },
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Sync failed");
      
      const result = await res.json();
      toast({ 
        title: "Calendrier synchronisé", 
        description: `${result.importedCount} dates importées` 
      });
      refetch();
    } catch {
      toast({ title: "Erreur de synchronisation", variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  };

  const form = useForm<BlockedDateFormData>({
    resolver: zodResolver(blockedDateSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
      reason: "",
    },
  });

  const onSubmit = async (data: BlockedDateFormData) => {
    try {
      await createMutation.mutateAsync({
        propertyId: property.id,
        ...data,
      });
      toast({ title: "Dates bloquées ajoutées" });
      setIsAdding(false);
      form.reset();
    } catch (error) {
      toast({ 
        title: "Erreur", 
        description: "Impossible d'ajouter les dates bloquées",
        variant: "destructive" 
      });
    }
  };

  const handleDelete = async (blockedDate: BlockedDate) => {
    try {
      await deleteMutation.mutateAsync({ 
        id: blockedDate.id, 
        propertyId: property.id 
      });
      toast({ title: "Dates bloquées supprimées" });
    } catch (error) {
      toast({ 
        title: "Erreur", 
        description: "Impossible de supprimer les dates bloquées",
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Synchronisation iCal</CardTitle>
          <CardDescription>Partagez ou importez des calendriers externes (Airbnb, Booking.com, etc.)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Exporter votre calendrier</Label>
            <p className="text-xs text-muted-foreground mb-2">Copiez ce lien dans Airbnb, Booking.com ou autre plateforme</p>
            <div className="flex gap-2">
              <Input 
                readOnly 
                value={icalExportUrl} 
                className="text-xs font-mono"
                data-testid="input-ical-export-url"
              />
              <Button 
                size="sm" 
                variant="outline" 
                onClick={copyIcalUrl}
                data-testid="button-copy-ical"
              >
                {copied ? "Copié!" : "Copier"}
              </Button>
            </div>
          </div>
          
          {property.icalUrl && (
            <div>
              <Label className="text-sm font-medium">Importer un calendrier externe</Label>
              <p className="text-xs text-muted-foreground mb-2">URL configurée: {property.icalUrl.substring(0, 50)}...</p>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={syncIcal}
                disabled={isSyncing}
                data-testid="button-sync-ical"
              >
                {isSyncing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Synchroniser maintenant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="font-medium">Dates bloquées</h3>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => setIsAdding(!isAdding)}
          data-testid="button-add-blocked-dates"
        >
          {isAdding ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          {isAdding ? "Annuler" : "Ajouter"}
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardContent className="pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de début</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de fin</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Raison (optionnel)</FormLabel>
                      <FormControl>
                        <Input placeholder="Travaux, réservation externe..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Bloquer ces dates
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : blockedDates && blockedDates.length > 0 ? (
        <div className="space-y-2">
          {blockedDates.map((blocked) => (
            <div 
              key={blocked.id}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
              data-testid={`blocked-date-${blocked.id}`}
            >
              <div className="flex items-center gap-3">
                <Ban className="h-4 w-4 text-destructive" />
                <div>
                  <p className="text-sm font-medium">
                    {format(new Date(blocked.startDate), "d MMM yyyy", { locale: fr })} - {format(new Date(blocked.endDate), "d MMM yyyy", { locale: fr })}
                  </p>
                  {blocked.reason && (
                    <p className="text-xs text-muted-foreground">{blocked.reason}</p>
                  )}
                </div>
              </div>
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => handleDelete(blocked)}
                disabled={deleteMutation.isPending}
                data-testid={`button-delete-blocked-${blocked.id}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Aucune date bloquée
        </p>
      )}
    </div>
  );
}

function PropertyListItem({ 
  property, 
  onManageCalendar,
}: { 
  property: Property;
  onManageCalendar: () => void;
}) {
  const { toast } = useToast();
  const deleteMutation = useDeleteProperty();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(property.id);
      toast({ title: "Propriété supprimée" });
    } catch (error) {
      toast({ 
        title: "Erreur", 
        description: "Impossible de supprimer la propriété",
        variant: "destructive" 
      });
    }
  };

  const photos = property.photos;
  const photoArray = Array.isArray(photos) ? photos.filter((p): p is string => typeof p === "string") : [];
  const mainPhoto = photoArray[0];

  return (
    <Card data-testid={`property-item-${property.id}`}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="w-20 h-20 rounded-md overflow-hidden bg-muted shrink-0">
          {mainPhoto ? (
            <img src={mainPhoto} alt={property.nameFr} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">{property.nameFr}</h3>
            {property.isFeatured && <Badge variant="secondary">Vedette</Badge>}
            {!property.isActive && <Badge variant="outline">Inactive</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{property.city}, {property.region}</p>
          <p className="text-sm font-medium text-primary">${property.pricePerNight}/nuit</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={onManageCalendar}
            data-testid={`button-calendar-${property.id}`}
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            asChild
            data-testid={`button-edit-${property.id}`}
          >
            <Link href={`/admin/properties/${property.id}/edit`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          
          <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
            <DialogTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost"
                data-testid={`button-delete-${property.id}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Supprimer la propriété?</DialogTitle>
                <DialogDescription>
                  Cette action est irréversible. Toutes les réservations associées seront également supprimées.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                  Annuler
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Supprimer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminProperties() {
  const { data: properties, isLoading } = useAdminProperties();
  const [managingCalendar, setManagingCalendar] = useState<Property | null>(null);

  return (
    <div className="min-h-screen bg-background pt-24" data-testid="page-admin-properties">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-page-title">
                Gestion des propriétés
              </h1>
              <p className="text-muted-foreground">
                {properties?.length || 0} propriété{(properties?.length || 0) !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <Button asChild data-testid="button-create-property">
            <Link href="/admin/properties/new/edit">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle propriété
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <PropertyListSkeleton />
        ) : properties && properties.length > 0 ? (
          <div className="space-y-4">
            {properties.map((property) => (
              <PropertyListItem
                key={property.id}
                property={property}
                onManageCalendar={() => setManagingCalendar(property)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Home className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">Aucune propriété</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Commencez par ajouter votre première propriété
              </p>
              <Button asChild>
                <Link href="/admin/properties/new/edit">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une propriété
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Dialog open={!!managingCalendar} onOpenChange={(open) => !open && setManagingCalendar(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendrier - {managingCalendar?.nameFr}
              </DialogTitle>
            </DialogHeader>
            {managingCalendar && <BlockedDatesManager property={managingCalendar} />}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
