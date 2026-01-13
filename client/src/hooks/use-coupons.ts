import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Coupon, InsertCoupon } from "@shared/schema";

const ADMIN_KEY = localStorage.getItem("adminKey") || "";

export function useAdminCoupons(activeOnly?: boolean) {
  return useQuery<Coupon[]>({
    queryKey: ["/api/admin/coupons", { active: activeOnly }],
    queryFn: async () => {
      const url = activeOnly ? "/api/admin/coupons?active=true" : "/api/admin/coupons";
      const res = await fetch(url, {
        headers: { "x-admin-key": ADMIN_KEY },
      });
      if (!res.ok) throw new Error("Failed to fetch coupons");
      return res.json();
    },
  });
}

export function useCreateCoupon() {
  return useMutation({
    mutationFn: async (data: InsertCoupon) => {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": ADMIN_KEY,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create coupon");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
    },
  });
}

export function useUpdateCoupon() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCoupon> }) => {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": ADMIN_KEY,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update coupon");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
    },
  });
}

export function useDeleteCoupon() {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
        headers: { "x-admin-key": ADMIN_KEY },
      });
      if (!res.ok) throw new Error("Failed to delete coupon");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
    },
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: async (data: {
      code: string;
      subtotal?: number;
      nights?: number;
      propertyId?: number;
      guestEmail?: string;
    }) => {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Invalid coupon");
      }
      return result;
    },
  });
}
