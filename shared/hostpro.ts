import { z } from "zod";

export const HostProConfigSchema = z.object({
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

export const HostProPropertySchema = z.object({
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

export const HostProAvailabilitySchema = z.object({
  propertyId: z.string(),
  blockedDates: z.array(BlockedDateSchema),
  availableDates: z.array(z.string()),
});

export const HostProPricingSchema = z.object({
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

export type HostProConfig = z.infer<typeof HostProConfigSchema>;
export type HostProProperty = z.infer<typeof HostProPropertySchema>;
export type HostProAvailability = z.infer<typeof HostProAvailabilitySchema>;
export type HostProPricing = z.infer<typeof HostProPricingSchema>;
export type BlockedDate = z.infer<typeof BlockedDateSchema>;
