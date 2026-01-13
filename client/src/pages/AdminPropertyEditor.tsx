import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  useAdminProperties,
  useUpdateProperty,
  useCreateProperty,
  useAdminBlockedDates,
  useCreateBlockedDate,
  useDeleteBlockedDate,
} from "@/hooks/use-properties";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  ArrowLeft,
  Check,
  AlertCircle,
  Home,
  MapPin,
  Settings,
  FileText,
  Image,
  Calendar,
  Languages,
  Loader2,
  Copy,
  RefreshCw,
  Trash2,
  Ban,
  Plus,
  Sparkles,
  Eye,
  Upload,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "wouter";
import type { Property, InsertProperty } from "@shared/schema";
import { insertPropertySchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const propertyFormSchema = z.object({
  slug: z.string().min(1, "Le slug est requis").regex(/^[a-z0-9-]+$/, "Slug invalide"),
  primaryLanguage: z.enum(["fr", "en", "es"]).default("fr"),
  nameFr: z.string().min(1, "Le nom en français est requis"),
  nameEn: z.string().optional(),
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
  photos: z.array(z.string()).optional(),
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

interface TabConfig {
  id: string;
  label: string;
  icon: typeof Home;
  requiredFields: (keyof PropertyFormData)[];
}

const TABS: TabConfig[] = [
  { id: "general", label: "Général", icon: Home, requiredFields: ["slug", "nameFr", "pricePerNight"] },
  { id: "languages", label: "Langues", icon: Languages, requiredFields: [] },
  { id: "location", label: "Adresse", icon: MapPin, requiredFields: [] },
  { id: "details", label: "Détails", icon: Settings, requiredFields: [] },
  { id: "photos", label: "Photos", icon: Image, requiredFields: [] },
  { id: "rules", label: "Règles", icon: FileText, requiredFields: [] },
  { id: "calendar", label: "Calendrier", icon: Calendar, requiredFields: [] },
];

function TabCompletionIndicator({ 
  isComplete, 
  hasErrors 
}: { 
  isComplete: boolean; 
  hasErrors: boolean;
}) {
  if (hasErrors) {
    return <AlertCircle className="h-4 w-4 text-destructive" />;
  }
  if (isComplete) {
    return <Check className="h-4 w-4 text-green-500" />;
  }
  return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />;
}

function PropertyPreview({ formData }: { formData: Partial<PropertyFormData> }) {
  const primaryLang = formData.primaryLanguage || "fr";
  const name = primaryLang === "fr" ? formData.nameFr : 
               primaryLang === "en" ? formData.nameEn : 
               formData.nameEs;
  const description = primaryLang === "fr" ? formData.descriptionFr : 
                      primaryLang === "en" ? formData.descriptionEn : 
                      formData.descriptionEs;

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">Aperçu</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          {formData.photos && formData.photos.length > 0 ? (
            <img 
              src={formData.photos[0]} 
              alt="Preview" 
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Aucune photo</p>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="font-semibold text-lg">
            {name || "Nom de la propriété"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {formData.city || "Ville"}{formData.region ? `, ${formData.region}` : ""}
          </p>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3">
          {description || "Description de la propriété..."}
        </p>

        <Separator />

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Prix/nuit</span>
            <p className="font-medium">{formData.pricePerNight || 0} $</p>
          </div>
          <div>
            <span className="text-muted-foreground">Invités max</span>
            <p className="font-medium">{formData.maxGuests || 4}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Chambres</span>
            <p className="font-medium">{formData.bedrooms || 1}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Salles de bain</span>
            <p className="font-medium">{formData.bathrooms || 1}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {formData.isActive && (
            <Badge variant="default" className="text-xs">Active</Badge>
          )}
          {formData.isFeatured && (
            <Badge variant="secondary" className="text-xs">En vedette</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CalendarManager({ property }: { property: Property }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { data: blockedDates, isLoading, refetch } = useAdminBlockedDates(property.id);
  const createMutation = useCreateBlockedDate();
  const deleteMutation = useDeleteBlockedDate();
  
  const icalExportUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/api/properties/${property.slug}/calendar.ics`
    : "";
  
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
      const adminKey = typeof window !== "undefined" ? localStorage.getItem("quebexico_admin_key") || "" : "";
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
    } catch {
      toast({ 
        title: "Erreur", 
        description: "Impossible d'ajouter les dates bloquées",
        variant: "destructive" 
      });
    }
  };

  const handleDelete = async (blocked: { id: number }) => {
    try {
      await deleteMutation.mutateAsync({ id: blocked.id, propertyId: property.id });
      toast({ title: "Dates débloquées" });
    } catch {
      toast({ 
        title: "Erreur", 
        description: "Impossible de supprimer",
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Synchronisation iCal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Partagez ce lien avec Airbnb, Booking.com, etc.
            </p>
            <div className="flex gap-2">
              <Input value={icalExportUrl} readOnly className="text-xs" />
              <Button size="icon" variant="outline" onClick={copyIcalUrl}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {property.icalUrl && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="text-sm">
                <p className="font-medium">Calendrier externe configuré</p>
                <p className="text-xs text-muted-foreground truncate max-w-xs">
                  {property.icalUrl}
                </p>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={syncIcal}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">Sync</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Dates bloquées</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setIsAdding(!isAdding)}>
            {isAdding ? "Annuler" : <><Plus className="h-4 w-4 mr-1" /> Bloquer</>}
          </Button>
        </CardHeader>
        <CardContent>
          {isAdding && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-6 p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-2 gap-4">
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
        </CardContent>
      </Card>
    </div>
  );
}

function PhotosManager({ 
  images, 
  onChange 
}: { 
  images: string[]; 
  onChange: (images: string[]) => void;
}) {
  const [newUrl, setNewUrl] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImageByUrl = () => {
    if (newUrl.trim()) {
      onChange([...images, newUrl.trim()]);
      setNewUrl("");
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    const newImages: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Téléversement ${i + 1}/${files.length}: ${file.name}`);
        
        // Request presigned URL
        const response = await fetch("/api/uploads/request-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            size: file.size,
            contentType: file.type,
          }),
        });
        
        if (!response.ok) throw new Error("Failed to get upload URL");
        
        const { uploadURL, objectPath } = await response.json();
        
        // Upload directly to presigned URL
        const uploadResponse = await fetch(uploadURL, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        
        if (!uploadResponse.ok) throw new Error("Upload failed");
        
        newImages.push(objectPath);
      }
      
      onChange([...images, ...newImages]);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Erreur lors du téléversement. Veuillez réessayer.");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    
    onChange(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDropZone = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* File upload zone */}
      <div 
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover-elevate transition-colors"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropZone}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{uploadProgress}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Cliquez ou glissez des images ici</p>
            <p className="text-xs text-muted-foreground">PNG, JPG, WEBP jusqu'à 10 Mo</p>
          </div>
        )}
      </div>

      {/* URL input as alternative */}
      <div className="flex gap-2">
        <Input
          placeholder="Ou collez une URL d'image..."
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageByUrl())}
        />
        <Button type="button" onClick={addImageByUrl} variant="outline" disabled={!newUrl.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Glissez-déposez pour réorganiser. La première image sera la photo principale.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((url, index) => (
          <div
            key={`${url}-${index}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`relative aspect-video rounded-lg overflow-hidden border-2 cursor-move group ${
              draggedIndex === index ? "border-primary opacity-50" : "border-transparent"
            } ${index === 0 ? "ring-2 ring-primary ring-offset-2" : ""}`}
          >
            <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
            {index === 0 && (
              <Badge className="absolute top-2 left-2 text-xs">Principal</Badge>
            )}
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeImage(index)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
          <Image className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Aucune photo ajoutée</p>
          <p className="text-sm mt-1">Ajoutez des URLs d'images ci-dessus</p>
        </div>
      )}
    </div>
  );
}

export default function AdminPropertyEditor() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isNew = id === "new";
  
  const { data: properties, isLoading: propertiesLoading } = useAdminProperties();
  const updateMutation = useUpdateProperty();
  const createMutation = useCreateProperty();
  
  const property = useMemo(() => {
    if (isNew || !properties) return null;
    return properties.find(p => p.id === parseInt(id)) || null;
  }, [properties, id, isNew]);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      slug: "",
      primaryLanguage: "fr",
      nameFr: "",
      nameEn: "",
      nameEs: "",
      descriptionFr: "",
      descriptionEn: "",
      descriptionEs: "",
      addressFr: "",
      addressEn: "",
      addressEs: "",
      city: "",
      region: "",
      latitude: "",
      longitude: "",
      pricePerNight: 100,
      cleaningFee: 0,
      maxGuests: 4,
      bedrooms: 1,
      bathrooms: 1,
      minNights: 1,
      maxNights: 30,
      checkInTime: "15:00",
      checkOutTime: "11:00",
      houseRulesFr: "",
      houseRulesEn: "",
      houseRulesEs: "",
      wifiName: "",
      wifiPassword: "",
      icalUrl: "",
      isActive: true,
      isFeatured: false,
      photos: [],
    },
  });

  useEffect(() => {
    if (property) {
      form.reset({
        slug: property.slug || "",
        primaryLanguage: "fr",
        nameFr: property.nameFr || "",
        nameEn: property.nameEn || "",
        nameEs: property.nameEs || "",
        descriptionFr: property.descriptionFr || "",
        descriptionEn: property.descriptionEn || "",
        descriptionEs: property.descriptionEs || "",
        addressFr: property.addressFr || "",
        addressEn: property.addressEn || "",
        addressEs: property.addressEs || "",
        city: property.city || "",
        region: property.region || "",
        latitude: property.latitude || "",
        longitude: property.longitude || "",
        pricePerNight: property.pricePerNight || 100,
        cleaningFee: property.cleaningFee || 0,
        maxGuests: property.maxGuests || 4,
        bedrooms: property.bedrooms || 1,
        bathrooms: property.bathrooms || 1,
        minNights: property.minNights || 1,
        maxNights: property.maxNights || 30,
        checkInTime: property.checkInTime || "15:00",
        checkOutTime: property.checkOutTime || "11:00",
        houseRulesFr: property.houseRulesFr || "",
        houseRulesEn: property.houseRulesEn || "",
        houseRulesEs: property.houseRulesEs || "",
        wifiName: property.wifiName || "",
        wifiPassword: property.wifiPassword || "",
        icalUrl: property.icalUrl || "",
        isActive: property.isActive ?? true,
        isFeatured: property.isFeatured ?? false,
        photos: property.photos || [],
      });
    }
  }, [property, form]);

  const formValues = useWatch({ control: form.control });
  const formErrors = form.formState.errors;

  const getTabStatus = (tab: TabConfig) => {
    const hasErrors = tab.requiredFields.some(field => formErrors[field]);
    const isComplete = tab.requiredFields.every(field => {
      const value = formValues[field];
      return value !== undefined && value !== "" && value !== null;
    });
    return { hasErrors, isComplete };
  };

  const onSubmit = async (data: PropertyFormData) => {
    try {
      // Remove primaryLanguage which is only used for UI, not stored
      const { primaryLanguage, ...formData } = data;
      
      // Send the form data directly - backend handles normalization
      // Zod has already coerced numeric fields to numbers via z.coerce.number()
      const propertyData = {
        ...formData,
        // Ensure required fields are set correctly
        nameEn: formData.nameEn || "",
        nameEs: formData.nameEs || "",
        photos: formData.photos || [],
      };
      
      if (isNew) {
        await createMutation.mutateAsync(propertyData);
        toast({ title: "Propriété créée" });
        navigate("/admin/properties");
      } else if (property) {
        await updateMutation.mutateAsync({ id: property.id, data: propertyData });
        toast({ title: "Propriété mise à jour" });
      }
    } catch (err) {
      console.error("Save error:", err);
      toast({ 
        title: "Erreur", 
        description: "Impossible de sauvegarder la propriété",
        variant: "destructive" 
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const [isTranslating, setIsTranslating] = useState(false);
  
  const generateTranslations = async () => {
    const primaryLang = formValues.primaryLanguage || "fr";
    const sourceName = primaryLang === "fr" ? formValues.nameFr : 
                       primaryLang === "en" ? formValues.nameEn : 
                       formValues.nameEs;
    const sourceDesc = primaryLang === "fr" ? formValues.descriptionFr : 
                       primaryLang === "en" ? formValues.descriptionEn : 
                       formValues.descriptionEs;
    const sourceAddress = primaryLang === "fr" ? formValues.addressFr : 
                          primaryLang === "en" ? formValues.addressEn : 
                          formValues.addressEs;

    if (!sourceName) {
      toast({ title: "Entrez d'abord le nom dans la langue principale", variant: "destructive" });
      return;
    }

    setIsTranslating(true);
    toast({ title: "Génération des traductions en cours..." });

    try {
      const targetLanguages = ["fr", "en", "es"].filter(l => l !== primaryLang);
      
      const texts: Record<string, string> = {};
      if (sourceName) texts.name = sourceName;
      if (sourceDesc) texts.description = sourceDesc;
      if (sourceAddress) texts.address = sourceAddress;
      
      const response = await apiRequest("POST", "/api/admin/translate", {
        texts,
        sourceLanguage: primaryLang,
        targetLanguages,
      });
      
      const { translations } = await response.json();
      
      for (const [lang, fields] of Object.entries(translations) as [string, Record<string, string>][]) {
        if (fields.name) {
          if (lang === "fr") form.setValue("nameFr", fields.name);
          if (lang === "en") form.setValue("nameEn", fields.name);
          if (lang === "es") form.setValue("nameEs", fields.name);
        }
        if (fields.description) {
          if (lang === "fr") form.setValue("descriptionFr", fields.description);
          if (lang === "en") form.setValue("descriptionEn", fields.description);
          if (lang === "es") form.setValue("descriptionEs", fields.description);
        }
        if (fields.address) {
          if (lang === "fr") form.setValue("addressFr", fields.address);
          if (lang === "en") form.setValue("addressEn", fields.address);
          if (lang === "es") form.setValue("addressEs", fields.address);
        }
      }
      
      toast({ title: "Traductions générées avec succès !" });
    } catch (error) {
      console.error("Translation error:", error);
      toast({ title: "Erreur lors de la génération des traductions", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  if (propertiesLoading && !isNew) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!isNew && !property && !propertiesLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Propriété non trouvée</p>
            <Button asChild className="mt-4">
              <Link href="/admin/properties">Retour aux propriétés</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/properties">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isNew ? "Nouvelle propriété" : `Modifier: ${property?.nameFr}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isNew ? "Créez une nouvelle propriété" : `Slug: ${property?.slug}`}
            </p>
          </div>
        </div>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isNew ? "Créer" : "Sauvegarder"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="w-full justify-start gap-1 h-auto flex-wrap p-1">
                  {TABS.filter(tab => !(tab.id === "calendar" && isNew)).map(tab => {
                    const status = getTabStatus(tab);
                    const Icon = tab.icon;
                    return (
                      <TabsTrigger 
                        key={tab.id} 
                        value={tab.id}
                        className="flex items-center gap-2 px-4"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                        <TabCompletionIndicator 
                          isComplete={status.isComplete} 
                          hasErrors={status.hasErrors} 
                        />
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                <Card className="mt-4">
                  <CardContent className="pt-6">
                    <TabsContent value="general" className="mt-0 space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slug (URL)</FormLabel>
                              <FormControl>
                                <Input placeholder="chalet-lac-memphremagog" {...field} disabled={!isNew} />
                              </FormControl>
                              <FormDescription>Identifiant unique pour l'URL</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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
                      </div>

                      <Separator />

                      <FormField
                        control={form.control}
                        name="nameFr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom de la propriété (FR)</FormLabel>
                            <FormControl>
                              <Input placeholder="Chalet du Lac Memphrémagog" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="descriptionFr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (FR)</FormLabel>
                            <FormControl>
                              <Textarea rows={4} placeholder="Décrivez votre propriété..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator />

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

                    <TabsContent value="languages" className="mt-0 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Gestion des langues</h3>
                          <p className="text-sm text-muted-foreground">
                            Définissez la langue principale et générez les traductions
                          </p>
                        </div>
                        <Button type="button" variant="outline" onClick={generateTranslations} disabled={isTranslating}>
                          {isTranslating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                          {isTranslating ? "Traduction en cours..." : "Générer traductions"}
                        </Button>
                      </div>

                      <FormField
                        control={form.control}
                        name="primaryLanguage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Langue principale</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                {["fr", "en", "es"].map(lang => (
                                  <Button
                                    key={lang}
                                    type="button"
                                    variant={field.value === lang ? "default" : "outline"}
                                    onClick={() => field.onChange(lang)}
                                  >
                                    {lang === "fr" ? "Français" : lang === "en" ? "English" : "Español"}
                                  </Button>
                                ))}
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <Separator />

                      <div className="grid gap-6">
                        <div className="grid md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="nameFr"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nom (FR)</FormLabel>
                                <FormControl>
                                  <Input {...field} />
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
                                  <Input {...field} />
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
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="descriptionFr"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description (FR)</FormLabel>
                                <FormControl>
                                  <Textarea rows={4} {...field} />
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
                                  <Textarea rows={4} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="descriptionEs"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description (ES)</FormLabel>
                                <FormControl>
                                  <Textarea rows={4} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="location" className="mt-0 space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ville</FormLabel>
                              <FormControl>
                                <Input placeholder="Magog" {...field} />
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
                                <Input placeholder="Québec" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      <div className="grid md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="addressFr"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Adresse (FR)</FormLabel>
                              <FormControl>
                                <Textarea rows={2} {...field} />
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
                                <Textarea rows={2} {...field} />
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
                                <Textarea rows={2} {...field} />
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
                          name="latitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Latitude</FormLabel>
                              <FormControl>
                                <Input placeholder="45.2736" {...field} />
                              </FormControl>
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
                                <Input placeholder="-72.1426" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="details" className="mt-0 space-y-6">
                      <div className="grid md:grid-cols-4 gap-4">
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
                        <FormField
                          control={form.control}
                          name="cleaningFee"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frais ménage ($)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      <div className="grid md:grid-cols-4 gap-4">
                        <FormField
                          control={form.control}
                          name="minNights"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nuits minimum</FormLabel>
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
                              <FormLabel>Nuits maximum</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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

                    <TabsContent value="photos" className="mt-0">
                      <FormField
                        control={form.control}
                        name="photos"
                        render={({ field }) => (
                          <FormItem>
                            <PhotosManager 
                              images={field.value || []} 
                              onChange={field.onChange} 
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="rules" className="mt-0 space-y-6">
                      <div className="grid md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="houseRulesFr"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Règles de la maison (FR)</FormLabel>
                              <FormControl>
                                <Textarea rows={6} placeholder="Une règle par ligne..." {...field} />
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
                                <Textarea rows={6} placeholder="One rule per line..." {...field} />
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
                                <Textarea rows={6} placeholder="Una regla por línea..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="calendar" className="mt-0">
                      {property ? (
                        <CalendarManager property={property} />
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>Sauvegardez d'abord la propriété pour gérer le calendrier</p>
                        </div>
                      )}
                    </TabsContent>
                  </CardContent>
                </Card>
              </Tabs>
            </form>
          </Form>
        </div>

        <div className="hidden lg:block">
          <PropertyPreview formData={formValues as PropertyFormData} />
        </div>
      </div>
    </div>
  );
}
