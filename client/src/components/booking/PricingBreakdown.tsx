import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import type { HostProPricing } from "@shared/hostpro";

interface PricingBreakdownProps {
  pricing: HostProPricing | null;
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
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-destructive" data-testid="text-pricing-error">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!pricing) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground" data-testid="text-pricing-empty">
            Sélectionnez des dates pour voir les tarifs
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-pricing-breakdown">
      <CardHeader>
        <CardTitle className="text-lg">Détail du prix</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>
            {formatCurrency(pricing.pricePerNight, pricing.currency)} x {pricing.nights} nuit{pricing.nights > 1 ? "s" : ""}
          </span>
          <span data-testid="text-subtotal">{formatCurrency(pricing.subtotal, pricing.currency)}</span>
        </div>

        {pricing.cleaningFee > 0 && (
          <div className="flex justify-between text-sm">
            <span>Frais de ménage</span>
            <span data-testid="text-cleaning-fee">{formatCurrency(pricing.cleaningFee, pricing.currency)}</span>
          </div>
        )}

        {pricing.taxes > 0 && (
          <div className="flex justify-between text-sm">
            <span>Taxes</span>
            <span data-testid="text-taxes">{formatCurrency(pricing.taxes, pricing.currency)}</span>
          </div>
        )}

        <Separator />

        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span data-testid="text-total">{formatCurrency(pricing.total, pricing.currency)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
