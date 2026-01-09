import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type {
  HostProConfig,
  HostProProperty,
  HostProAvailability,
  HostProPricing,
  ReservationRequest,
  ReservationResponse,
  InquiryRequest,
  InquiryResponse,
} from "@shared/hostpro";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

export function useHostProEnabled() {
  return useQuery<{ enabled: boolean }>({
    queryKey: ["/api/hostpro/enabled"],
  });
}

export function useHostProConfig() {
  return useQuery<HostProConfig>({
    queryKey: ["/api/hostpro/config"],
  });
}

export function useHostProProperties() {
  return useQuery<HostProProperty[]>({
    queryKey: ["/api/hostpro/properties"],
  });
}

export function useHostProAvailability(
  propertyId: string | null,
  startDate: string,
  endDate: string
) {
  return useQuery<HostProAvailability>({
    queryKey: ["/api/hostpro/availability", propertyId, startDate, endDate],
    queryFn: () => {
      const params = new URLSearchParams({ propertyId: propertyId!, startDate, endDate });
      return fetchJson<HostProAvailability>(`/api/hostpro/availability?${params}`);
    },
    enabled: !!propertyId,
  });
}

export function useHostProPricing(
  propertyId: string | null,
  checkIn: string | null,
  checkOut: string | null,
  guests?: number
) {
  return useQuery<HostProPricing>({
    queryKey: ["/api/hostpro/pricing", propertyId, checkIn, checkOut, guests],
    queryFn: () => {
      const params = new URLSearchParams({
        propertyId: propertyId!,
        checkIn: checkIn!,
        checkOut: checkOut!,
        ...(guests ? { guests: guests.toString() } : {}),
      });
      return fetchJson<HostProPricing>(`/api/hostpro/pricing?${params}`);
    },
    enabled: !!propertyId && !!checkIn && !!checkOut,
  });
}

export function useCreateReservation() {
  return useMutation<ReservationResponse, Error, ReservationRequest>({
    mutationFn: async (data) => {
      const res = await fetch("/api/hostpro/reservations", {
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
      queryClient.invalidateQueries({ queryKey: ["/api/hostpro/availability"] });
    },
  });
}

export function useCreateInquiry() {
  return useMutation<InquiryResponse, Error, InquiryRequest>({
    mutationFn: async (data) => {
      const res = await fetch("/api/hostpro/inquiries", {
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
