import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type {
  DirectSiteConfig,
  DirectSiteProperty,
  DirectSiteAvailability,
  DirectSitePricing,
  ReservationRequest,
  ReservationResponse,
  InquiryRequest,
  InquiryResponse,
} from "@shared/direct-sites";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

export function useDirectSiteEnabled() {
  return useQuery<{ enabled: boolean }>({
    queryKey: ["/api/direct-site/enabled"],
  });
}

export function useDirectSiteConfig() {
  return useQuery<DirectSiteConfig>({
    queryKey: ["/api/direct-site/config"],
  });
}

export function useDirectSiteProperties() {
  return useQuery<DirectSiteProperty[]>({
    queryKey: ["/api/direct-site/properties"],
  });
}

export function useDirectSiteAvailability(
  propertyId: string | null,
  startDate: string,
  endDate: string
) {
  return useQuery<DirectSiteAvailability>({
    queryKey: ["/api/direct-site/availability", propertyId, startDate, endDate],
    queryFn: () => {
      const params = new URLSearchParams({ propertyId: propertyId!, startDate, endDate });
      return fetchJson<DirectSiteAvailability>(`/api/direct-site/availability?${params}`);
    },
    enabled: !!propertyId,
  });
}

export function useDirectSitePricing(
  propertyId: string | null,
  checkIn: string | null,
  checkOut: string | null,
  guests?: number
) {
  return useQuery<DirectSitePricing>({
    queryKey: ["/api/direct-site/pricing", propertyId, checkIn, checkOut, guests],
    queryFn: () => {
      const params = new URLSearchParams({
        propertyId: propertyId!,
        checkIn: checkIn!,
        checkOut: checkOut!,
        ...(guests ? { guests: guests.toString() } : {}),
      });
      return fetchJson<DirectSitePricing>(`/api/direct-site/pricing?${params}`);
    },
    enabled: !!propertyId && !!checkIn && !!checkOut,
  });
}

export function useCreateReservation() {
  return useMutation<ReservationResponse, Error, ReservationRequest>({
    mutationFn: async (data) => {
      const res = await fetch("/api/direct-site/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/direct-site/availability"] });
    },
  });
}

export function useCreateInquiry() {
  return useMutation<InquiryResponse, Error, InquiryRequest>({
    mutationFn: async (data) => {
      const res = await fetch("/api/direct-site/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      return res.json();
    },
  });
}
