import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAdminCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from "@/hooks/use-coupons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Ticket, 
  Loader2,
  ChevronLeft,
  Percent,
  DollarSign,
  Calendar,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "wouter";
import type { Coupon } from "@shared/schema";

const couponFormSchema = z.object({
  code: z.string().min(3, "Code minimum 3 caractères").max(20, "Code maximum 20 caractères").regex(/^[A-Z0-9-]+$/i, "Lettres, chiffres et tirets seulement"),
  nameFr: z.string().min(1, "Nom requis"),
  nameEn: z.string().min(1, "Nom requis"),
  nameEs: z.string().optional(),
  descriptionFr: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionEs: z.string().optional(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().min(1, "Valeur requise"),
  minSubtotal: z.coerce.number().min(0).optional().nullable(),
  maxDiscount: z.coerce.number().min(0).optional().nullable(),
  minNights: z.coerce.number().min(0).optional().nullable(),
  maxNights: z.coerce.number().min(0).optional().nullable(),
  validFrom: z.string().optional().nullable(),
  validUntil: z.string().optional().nullable(),
  maxRedemptions: z.coerce.number().min(0).optional().nullable(),
  maxPerGuest: z.coerce.number().min(0).optional().nullable(),
  isActive: z.boolean().optional(),
});

type CouponFormData = z.infer<typeof couponFormSchema>;

function CouponListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-9 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CouponForm({ 
  coupon, 
  onClose 
}: { 
  coupon?: Coupon | null;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();
  const isEditing = !!coupon;

  const form = useForm<CouponFormData>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: coupon?.code || "",
      nameFr: coupon?.nameFr || "",
      nameEn: coupon?.nameEn || "",
      nameEs: coupon?.nameEs || "",
      descriptionFr: coupon?.descriptionFr || "",
      descriptionEn: coupon?.descriptionEn || "",
      descriptionEs: coupon?.descriptionEs || "",
      discountType: (coupon?.discountType as "percentage" | "fixed") || "percentage",
      discountValue: coupon?.discountValue || 10,
      minSubtotal: coupon?.minSubtotal || null,
      maxDiscount: coupon?.maxDiscount || null,
      minNights: coupon?.minNights || null,
      maxNights: coupon?.maxNights || null,
      validFrom: coupon?.validFrom ? format(new Date(coupon.validFrom), "yyyy-MM-dd") : null,
      validUntil: coupon?.validUntil ? format(new Date(coupon.validUntil), "yyyy-MM-dd") : null,
      maxRedemptions: coupon?.maxRedemptions || null,
      maxPerGuest: coupon?.maxPerGuest || null,
      isActive: coupon?.isActive ?? true,
    },
  });

  const discountType = form.watch("discountType");

  const onSubmit = async (data: CouponFormData) => {
    try {
      const payload = {
        ...data,
        validFrom: data.validFrom ? new Date(data.validFrom) : null,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        minSubtotal: data.minSubtotal || null,
        maxDiscount: data.maxDiscount || null,
        minNights: data.minNights || null,
        maxNights: data.maxNights || null,
        maxRedemptions: data.maxRedemptions || null,
        maxPerGuest: data.maxPerGuest || null,
      };

      if (isEditing && coupon) {
        await updateMutation.mutateAsync({ id: coupon.id, data: payload });
        toast({ title: "Coupon mis à jour" });
      } else {
        await createMutation.mutateAsync(payload as any);
        toast({ title: "Coupon créé" });
      }
      onClose();
    } catch (error: any) {
      toast({ 
        title: "Erreur", 
        description: error.message || "Impossible de sauvegarder le coupon",
        variant: "destructive" 
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="limits">Limites</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code promo</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="SUMMER2024" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      disabled={isEditing}
                    />
                  </FormControl>
                  <FormDescription>Lettres, chiffres et tirets uniquement</FormDescription>
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
                      <Input placeholder="Rabais été" {...field} />
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
                      <Input placeholder="Summer discount" {...field} />
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
                      <Input placeholder="Descuento verano" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de rabais</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-discount-type">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                        <SelectItem value="fixed">Montant fixe ($)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discountValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Valeur {discountType === "percentage" ? "(%)" : "($)"}
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
                    <Textarea rows={2} {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">Actif</FormLabel>
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="conditions" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minSubtotal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sous-total minimum ($)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>Laisser vide pour aucun minimum</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxDiscount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rabais maximum ($)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Illimité" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>Pour les % seulement</FormDescription>
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
                    <FormLabel>Nuits minimum</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} value={field.value || ""} />
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
                      <Input type="number" placeholder="Illimité" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="validFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valide à partir de</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valide jusqu'au</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="limits" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maxRedemptions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Utilisations totales max</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Illimité" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>Nombre total d'utilisations permises</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxPerGuest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Utilisations par client</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Illimité" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>Par adresse email</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={isPending} data-testid="button-save-coupon">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Mettre à jour" : "Créer le coupon"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function CouponCard({ 
  coupon, 
  onEdit, 
  onDelete 
}: { 
  coupon: Coupon; 
  onEdit: () => void; 
  onDelete: () => void;
}) {
  const now = new Date();
  const isExpired = coupon.validUntil && new Date(coupon.validUntil) < now;
  const isNotStarted = coupon.validFrom && new Date(coupon.validFrom) > now;
  const isLimitReached = coupon.maxRedemptions && coupon.currentRedemptions && coupon.currentRedemptions >= coupon.maxRedemptions;

  let statusBadge = null;
  if (!coupon.isActive) {
    statusBadge = <Badge variant="secondary">Inactif</Badge>;
  } else if (isExpired) {
    statusBadge = <Badge variant="destructive">Expiré</Badge>;
  } else if (isNotStarted) {
    statusBadge = <Badge variant="outline">Planifié</Badge>;
  } else if (isLimitReached) {
    statusBadge = <Badge variant="secondary">Limite atteinte</Badge>;
  } else {
    statusBadge = <Badge variant="default">Actif</Badge>;
  }

  return (
    <Card data-testid={`card-coupon-${coupon.code}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
              {coupon.discountType === "percentage" ? (
                <Percent className="h-6 w-6 text-primary" />
              ) : (
                <DollarSign className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{coupon.code}</h3>
                {statusBadge}
              </div>
              <p className="text-sm text-muted-foreground">{coupon.nameFr}</p>
              <p className="text-sm font-medium text-primary">
                {coupon.discountType === "percentage" 
                  ? `${coupon.discountValue}% de rabais`
                  : `${coupon.discountValue}$ de rabais`
                }
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-sm text-muted-foreground">
              {coupon.currentRedemptions || 0}
              {coupon.maxRedemptions ? ` / ${coupon.maxRedemptions}` : ""} utilisations
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={onEdit} data-testid={`button-edit-coupon-${coupon.code}`}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={onDelete} data-testid={`button-delete-coupon-${coupon.code}`}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminCoupons() {
  const { toast } = useToast();
  const { data: coupons, isLoading, error } = useAdminCoupons();
  const deleteMutation = useDeleteCoupon();

  const [isCreating, setIsCreating] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);

  const handleDelete = async () => {
    if (!deletingCoupon) return;
    try {
      await deleteMutation.mutateAsync(deletingCoupon.id);
      toast({ title: "Coupon supprimé" });
      setDeletingCoupon(null);
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer le coupon", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24" data-testid="page-admin-coupons">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Gestion des coupons</h1>
              <p className="text-muted-foreground">Créez et gérez vos codes promotionnels</p>
            </div>
          </div>
          <Button onClick={() => setIsCreating(true)} data-testid="button-create-coupon">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau coupon
          </Button>
        </div>

        {isLoading ? (
          <CouponListSkeleton />
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>Erreur de chargement des coupons</p>
            </CardContent>
          </Card>
        ) : coupons && coupons.length > 0 ? (
          <div className="space-y-4">
            {coupons.map((coupon) => (
              <CouponCard 
                key={coupon.id} 
                coupon={coupon} 
                onEdit={() => setEditingCoupon(coupon)}
                onDelete={() => setDeletingCoupon(coupon)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">Aucun coupon créé</p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un coupon
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isCreating || !!editingCoupon} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setEditingCoupon(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? "Modifier le coupon" : "Nouveau coupon"}
            </DialogTitle>
            <DialogDescription>
              {editingCoupon 
                ? "Modifiez les paramètres du code promo"
                : "Créez un nouveau code promotionnel"
              }
            </DialogDescription>
          </DialogHeader>
          <CouponForm 
            coupon={editingCoupon} 
            onClose={() => {
              setIsCreating(false);
              setEditingCoupon(null);
            }} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingCoupon} onOpenChange={(open) => !open && setDeletingCoupon(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le coupon</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le coupon "{deletingCoupon?.code}" ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingCoupon(null)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
