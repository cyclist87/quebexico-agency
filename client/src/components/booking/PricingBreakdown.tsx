import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Tag, X, Check } from "lucide-react";
import { useValidateCoupon } from "@/hooks/use-coupons";
import { useLanguage } from "@/contexts/LanguageContext";

interface PricingData {
  pricePerNight: number;
  nights: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee?: number;
  taxes: number;
  total: number;
  currency: string;
}

interface AppliedCoupon {
  id: number;
  code: string;
  nameFr: string;
  nameEn: string;
  nameEs?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxDiscount?: number | null;
  discountAmount: number;
}

interface PricingBreakdownProps {
  pricing: PricingData | null;
  isLoading?: boolean;
  error?: string;
  propertyId?: number;
  guestEmail?: string;
  onCouponApplied?: (coupon: AppliedCoupon | null) => void;
  appliedCoupon?: AppliedCoupon | null;
  showCouponInput?: boolean;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

const translations = {
  fr: {
    priceDetails: "Détail du prix",
    nights: "nuits",
    night: "nuit",
    cleaningFee: "Frais de ménage",
    serviceFee: "Frais de service",
    taxes: "Taxes",
    total: "Total",
    selectDates: "Sélectionnez des dates pour voir les tarifs",
    couponCode: "Code promo",
    apply: "Appliquer",
    applied: "Appliqué",
    remove: "Retirer",
    discount: "Rabais",
    invalidCode: "Code invalide",
  },
  en: {
    priceDetails: "Price details",
    nights: "nights",
    night: "night",
    cleaningFee: "Cleaning fee",
    serviceFee: "Service fee",
    taxes: "Taxes",
    total: "Total",
    selectDates: "Select dates to see rates",
    couponCode: "Promo code",
    apply: "Apply",
    applied: "Applied",
    remove: "Remove",
    discount: "Discount",
    invalidCode: "Invalid code",
  },
  es: {
    priceDetails: "Detalles del precio",
    nights: "noches",
    night: "noche",
    cleaningFee: "Limpieza",
    serviceFee: "Tarifa de servicio",
    taxes: "Impuestos",
    total: "Total",
    selectDates: "Selecciona fechas para ver tarifas",
    couponCode: "Código promocional",
    apply: "Aplicar",
    applied: "Aplicado",
    remove: "Quitar",
    discount: "Descuento",
    invalidCode: "Código inválido",
  },
};

export function PricingBreakdown({ 
  pricing, 
  isLoading, 
  error, 
  propertyId,
  guestEmail,
  onCouponApplied,
  appliedCoupon,
  showCouponInput = true,
}: PricingBreakdownProps) {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.fr;
  
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const validateCoupon = useValidateCoupon();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !pricing) return;

    setCouponError(null);
    try {
      const result = await validateCoupon.mutateAsync({
        code: couponCode.trim().toUpperCase(),
        subtotal: pricing.subtotal,
        nights: pricing.nights,
        propertyId,
        guestEmail,
      });

      if (result.valid) {
        onCouponApplied?.({
          id: result.coupon.id,
          code: result.coupon.code,
          nameFr: result.coupon.nameFr,
          nameEn: result.coupon.nameEn,
          nameEs: result.coupon.nameEs,
          discountType: result.coupon.discountType,
          discountValue: result.coupon.discountValue,
          maxDiscount: result.coupon.maxDiscount,
          discountAmount: result.discountAmount,
        });
        setCouponCode("");
      }
    } catch (err: any) {
      setCouponError(err.message || t.invalidCode);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponApplied?.(null);
    setCouponError(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive py-4" data-testid="text-pricing-error">{error}</p>
    );
  }

  if (!pricing) {
    return (
      <p className="text-sm text-muted-foreground py-4" data-testid="text-pricing-empty">
        {t.selectDates}
      </p>
    );
  }

  const discountAmount = appliedCoupon?.discountAmount || 0;
  const adjustedTotal = pricing.total - discountAmount;

  const getCouponName = () => {
    if (!appliedCoupon) return "";
    if (language === "en") return appliedCoupon.nameEn;
    if (language === "es") return appliedCoupon.nameEs || appliedCoupon.nameFr;
    return appliedCoupon.nameFr;
  };

  return (
    <div data-testid="card-pricing-breakdown" className="space-y-3 bg-muted/50 rounded-lg p-4">
      <h4 className="font-semibold text-sm mb-3">{t.priceDetails}</h4>
      
      <div className="flex justify-between text-sm gap-2">
        <span className="text-muted-foreground">
          {formatCurrency(pricing.pricePerNight, pricing.currency)} × {pricing.nights} {pricing.nights > 1 ? t.nights : t.night}
        </span>
        <span className="font-medium" data-testid="text-subtotal">{formatCurrency(pricing.subtotal, pricing.currency)}</span>
      </div>

      {pricing.cleaningFee > 0 && (
        <div className="flex justify-between text-sm gap-2">
          <span className="text-muted-foreground">{t.cleaningFee}</span>
          <span className="font-medium" data-testid="text-cleaning-fee">{formatCurrency(pricing.cleaningFee, pricing.currency)}</span>
        </div>
      )}

      {pricing.serviceFee && pricing.serviceFee > 0 && (
        <div className="flex justify-between text-sm gap-2">
          <span className="text-muted-foreground">{t.serviceFee}</span>
          <span className="font-medium" data-testid="text-service-fee">{formatCurrency(pricing.serviceFee, pricing.currency)}</span>
        </div>
      )}

      {pricing.taxes > 0 && (
        <div className="flex justify-between text-sm gap-2">
          <span className="text-muted-foreground">{t.taxes}</span>
          <span className="font-medium" data-testid="text-taxes">{formatCurrency(pricing.taxes, pricing.currency)}</span>
        </div>
      )}

      {appliedCoupon && discountAmount > 0 && (
        <div className="flex justify-between text-sm gap-2 text-green-600 dark:text-green-400">
          <span className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {t.discount} ({appliedCoupon.code})
          </span>
          <span className="font-medium" data-testid="text-discount">
            -{formatCurrency(discountAmount, pricing.currency)}
          </span>
        </div>
      )}

      <Separator className="my-2" />

      <div className="flex justify-between font-semibold gap-2">
        <span>{t.total}</span>
        <span data-testid="text-total">{formatCurrency(adjustedTotal, pricing.currency)}</span>
      </div>

      {showCouponInput && (
        <div className="pt-3 border-t mt-3">
          {appliedCoupon ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Check className="h-3 w-3" />
                  {appliedCoupon.code}
                </Badge>
                <span className="text-xs text-muted-foreground">{getCouponName()}</span>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleRemoveCoupon}
                data-testid="button-remove-coupon"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder={t.couponCode}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 text-sm"
                  data-testid="input-coupon-code"
                />
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || validateCoupon.isPending}
                  data-testid="button-apply-coupon"
                >
                  {validateCoupon.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t.apply
                  )}
                </Button>
              </div>
              {couponError && (
                <p className="text-xs text-destructive" data-testid="text-coupon-error">{couponError}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export type { AppliedCoupon };
