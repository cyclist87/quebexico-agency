import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Property, BlockedDate, Reservation, Inquiry } from "@shared/schema";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

export interface PropertyAvailability {
  propertyId: number;
  blockedDates: Array<{
    start: string;
    end: string;
    source: string;
  }>;
}

export interface PropertyPricing {
  propertyId: number;
  checkIn: string;
  checkOut: string;
  nights: number;
  pricePerNight: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  total: number;
  currency: string;
}

export interface CreateReservationRequest {
  propertySlug: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone?: string;
  guestMessage?: string;
  language?: string;
}

export interface CreateReservationResponse {
  id: number;
  confirmationCode: string;
  status: string;
  propertyId: number;
  checkIn: string;
  checkOut: string;
  total: number;
  currency: string;
}

export interface CreateInquiryRequest {
  propertySlug?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone?: string;
  message: string;
  language?: string;
}

export interface CreateInquiryResponse {
  id: number;
  status: string;
  createdAt: string;
}

export function useProperties() {
  return useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });
}

export function useProperty(slug: string | null) {
  return useQuery<Property>({
    queryKey: ["/api/properties", slug],
    queryFn: () => fetchJson<Property>(`/api/properties/${slug}`),
    enabled: !!slug,
  });
}

export function usePropertyAvailability(
  slug: string | null,
  startDate?: string,
  endDate?: string
) {
  return useQuery<PropertyAvailability>({
    queryKey: ["/api/properties", slug, "availability", startDate, endDate],
    queryFn: () => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const query = params.toString() ? `?${params.toString()}` : "";
      return fetchJson<PropertyAvailability>(`/api/properties/${slug}/availability${query}`);
    },
    enabled: !!slug,
  });
}

export function usePropertyPricing(
  slug: string | null,
  checkIn: string | null,
  checkOut: string | null,
  guests?: number
) {
  return useQuery<PropertyPricing>({
    queryKey: ["/api/properties", slug, "pricing", checkIn, checkOut, guests],
    queryFn: () => {
      const params = new URLSearchParams({
        checkIn: checkIn!,
        checkOut: checkOut!,
      });
      if (guests) params.append("guests", guests.toString());
      return fetchJson<PropertyPricing>(`/api/properties/${slug}/pricing?${params}`);
    },
    enabled: !!slug && !!checkIn && !!checkOut,
  });
}

export function useCreateReservation() {
  return useMutation<CreateReservationResponse, Error, CreateReservationRequest>({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", "/api/reservations", data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties", variables.propertySlug, "availability"] });
    },
  });
}

export function useCreateInquiry() {
  return useMutation<CreateInquiryResponse, Error, CreateInquiryRequest>({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", "/api/inquiries", data);
      return res.json();
    },
  });
}

export function useAdminProperties() {
  return useQuery<Property[]>({
    queryKey: ["/api/admin/properties"],
  });
}

export function useAdminProperty(id: number | null) {
  return useQuery<Property>({
    queryKey: ["/api/admin/properties", id],
    queryFn: () => fetchJson<Property>(`/api/admin/properties/${id}`),
    enabled: !!id,
  });
}

export function useCreateProperty() {
  return useMutation<Property, Error, Partial<Property>>({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", "/api/admin/properties", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
    },
  });
}

export function useUpdateProperty() {
  return useMutation<Property, Error, { id: number; data: Partial<Property> }>({
    mutationFn: async ({ id, data }) => {
      const res = await apiRequest("PUT", `/api/admin/properties/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
    },
  });
}

export function useDeleteProperty() {
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await apiRequest("DELETE", `/api/admin/properties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
    },
  });
}

export function useAdminBlockedDates(propertyId: number | null) {
  return useQuery<BlockedDate[]>({
    queryKey: ["/api/admin/properties", propertyId, "blocked-dates"],
    queryFn: () => fetchJson<BlockedDate[]>(`/api/admin/properties/${propertyId}/blocked-dates`),
    enabled: !!propertyId,
  });
}

export function useCreateBlockedDate() {
  return useMutation<BlockedDate, Error, { propertyId: number; startDate: string; endDate: string; reason?: string }>({
    mutationFn: async ({ propertyId, ...data }) => {
      const res = await apiRequest("POST", `/api/admin/properties/${propertyId}/blocked-dates`, data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties", variables.propertyId, "blocked-dates"] });
    },
  });
}

export function useDeleteBlockedDate() {
  return useMutation<void, Error, { id: number; propertyId: number }>({
    mutationFn: async ({ id }) => {
      await apiRequest("DELETE", `/api/admin/blocked-dates/${id}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties", variables.propertyId, "blocked-dates"] });
    },
  });
}

export function useAdminReservations(propertyId?: number) {
  return useQuery<Reservation[]>({
    queryKey: ["/api/admin/reservations", propertyId],
    queryFn: () => {
      const params = propertyId ? `?propertyId=${propertyId}` : "";
      return fetchJson<Reservation[]>(`/api/admin/reservations${params}`);
    },
  });
}

export function useUpdateReservation() {
  return useMutation<Reservation, Error, { id: number; data: Partial<Reservation> }>({
    mutationFn: async ({ id, data }) => {
      const res = await apiRequest("PUT", `/api/admin/reservations/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reservations"] });
    },
  });
}

export function useAdminInquiries(propertyId?: number) {
  return useQuery<Inquiry[]>({
    queryKey: ["/api/admin/inquiries", propertyId],
    queryFn: () => {
      const params = propertyId ? `?propertyId=${propertyId}` : "";
      return fetchJson<Inquiry[]>(`/api/admin/inquiries${params}`);
    },
  });
}

export function useUpdateInquiry() {
  return useMutation<Inquiry, Error, { id: number; data: Partial<Inquiry> }>({
    mutationFn: async ({ id, data }) => {
      const res = await apiRequest("PUT", `/api/admin/inquiries/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inquiries"] });
    },
  });
}
