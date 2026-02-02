import { z } from "zod";

export const DirectSiteConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  primaryLanguage: z.string(),
  supportedLanguages: z.array(z.string()),
  logoUrl: z.string().nullable().optional(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  accentColor: z.string(),
  tagline: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  contactEmail: z.string().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
  enablePayments: z.boolean(),
  enableChat: z.boolean(),
  enableAiConcierge: z.boolean(),
  enableInstantBooking: z.boolean(),
});

export const DirectSitePropertySchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string().nullable().optional(),
  platform: z.string(),
  icalExportToken: z.string().nullable().optional(),
});

export const BlockedDateSchema = z.object({
  start: z.string(),
  end: z.string(),
  source: z.string(),
});

export const DirectSiteAvailabilitySchema = z.object({
  propertyId: z.string(),
  blockedDates: z.array(BlockedDateSchema),
  availableDates: z.array(z.string()),
});

export const DirectSitePricingSchema = z.object({
  propertyId: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  nights: z.number(),
  pricePerNight: z.number(),
  subtotal: z.number(),
  cleaningFee: z.number(),
  taxes: z.number(),
  total: z.number(),
  currency: z.string(),
});

export const GuestInfoSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  guests: z.number().min(1, "Au moins 1 invité"),
  message: z.string().optional(),
});

export const ReservationRequestSchema = z.object({
  propertyId: z.string(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guest: GuestInfoSchema,
  nightlyRate: z.number().optional(),
  cleaningFee: z.number().optional(),
  totalPrice: z.number().optional(),
  currency: z.string().optional(),
});

export const InquiryRequestSchema = z.object({
  propertyId: z.string(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  guest: GuestInfoSchema,
});

export const ReservationResponseSchema = z.object({
  id: z.string(),
  status: z.enum(["pending", "confirmed", "cancelled"]),
  propertyId: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  total: z.number(),
  currency: z.string(),
  confirmationCode: z.string().optional(),
  createdAt: z.string(),
});

export const InquiryResponseSchema = z.object({
  id: z.string(),
  status: z.enum(["sent", "replied", "closed"]),
  propertyId: z.string(),
  createdAt: z.string(),
});

export type DirectSiteConfig = z.infer<typeof DirectSiteConfigSchema>;
export type DirectSiteProperty = z.infer<typeof DirectSitePropertySchema>;
export type DirectSiteAvailability = z.infer<typeof DirectSiteAvailabilitySchema>;
export type DirectSitePricing = z.infer<typeof DirectSitePricingSchema>;
export type BlockedDate = z.infer<typeof BlockedDateSchema>;
export type GuestInfo = z.infer<typeof GuestInfoSchema>;
export type ReservationRequest = z.infer<typeof ReservationRequestSchema>;
export type InquiryRequest = z.infer<typeof InquiryRequestSchema>;
export type ReservationResponse = z.infer<typeof ReservationResponseSchema>;
export type InquiryResponse = z.infer<typeof InquiryResponseSchema>;
