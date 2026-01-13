import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

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

interface PricingBreakdownProps {
  pricing: PricingData | null;
  isLoading?: boolean;
  error?: string;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export function PricingBreakdown({ pricing, isLoading, error }: PricingBreakdownProps) {
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
        Sélectionnez des dates pour voir les tarifs
      </p>
    );
  }

  return (
    <div data-testid="card-pricing-breakdown" className="space-y-2 bg-muted/50 rounded-lg p-4">
      <h4 className="font-semibold text-sm mb-3">Détail du prix</h4>
      
      <div className="flex justify-between text-sm gap-2">
        <span className="text-muted-foreground">
          {formatCurrency(pricing.pricePerNight, pricing.currency)} × {pricing.nights} nuit{pricing.nights > 1 ? "s" : ""}
        </span>
        <span className="font-medium" data-testid="text-subtotal">{formatCurrency(pricing.subtotal, pricing.currency)}</span>
      </div>

      {pricing.cleaningFee > 0 && (
        <div className="flex justify-between text-sm gap-2">
          <span className="text-muted-foreground">Frais de ménage</span>
          <span className="font-medium" data-testid="text-cleaning-fee">{formatCurrency(pricing.cleaningFee, pricing.currency)}</span>
        </div>
      )}

      {pricing.serviceFee && pricing.serviceFee > 0 && (
        <div className="flex justify-between text-sm gap-2">
          <span className="text-muted-foreground">Frais de service</span>
          <span className="font-medium" data-testid="text-service-fee">{formatCurrency(pricing.serviceFee, pricing.currency)}</span>
        </div>
      )}

      {pricing.taxes > 0 && (
        <div className="flex justify-between text-sm gap-2">
          <span className="text-muted-foreground">Taxes</span>
          <span className="font-medium" data-testid="text-taxes">{formatCurrency(pricing.taxes, pricing.currency)}</span>
        </div>
      )}

      <Separator className="my-2" />

      <div className="flex justify-between font-semibold gap-2">
        <span>Total</span>
        <span data-testid="text-total">{formatCurrency(pricing.total, pricing.currency)}</span>
      </div>
    </div>
  );
}
