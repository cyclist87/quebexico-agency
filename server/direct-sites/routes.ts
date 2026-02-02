import type { Express } from "express";
import { getDirectSiteClientAsync, isDirectSiteEnabledAsync, type DirectSiteStorage } from "./client";
import { z } from "zod";
import {
  DirectSiteConfigSchema,
  DirectSitePropertySchema,
  DirectSiteAvailabilitySchema,
  DirectSitePricingSchema,
  ReservationRequestSchema,
  ReservationResponseSchema,
  InquiryRequestSchema,
  InquiryResponseSchema,
} from "@shared/direct-sites";

export function registerDirectSiteRoutes(app: Express, storage: DirectSiteStorage) {
  app.get("/api/direct-site/enabled", async (req, res) => {
    const enabled = await isDirectSiteEnabledAsync(storage);
    res.json({ enabled });
  });

  app.get("/api/direct-site/config", async (req, res) => {
    const client = await getDirectSiteClientAsync(storage);
    if (!client) {
      return res.status(503).json({ error: "Direct site integration not configured" });
    }

    try {
      const rawConfig = await client.getConfig();
      const config = DirectSiteConfigSchema.parse(rawConfig);
      res.json(config);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.error("Direct site config validation error:", error.errors);
        return res.status(502).json({ error: "Invalid response from Direct site API" });
      }
      console.error("Direct site config error:", error.message);
      res.status(500).json({ error: "Failed to fetch Direct site config" });
    }
  });

  app.get("/api/direct-site/properties", async (req, res) => {
    const client = await getDirectSiteClientAsync(storage);
    if (!client) {
      return res.status(503).json({ error: "Direct site integration not configured" });
    }

    try {
      const rawProperties = await client.getProperties();
      const properties = (Array.isArray(rawProperties) ? rawProperties : []).map((p: any) => ({
        id: p.id ?? p.propertyId,
        name: p.name ?? "",
        address: p.address ?? null,
        platform: p.platform ?? "direct",
        icalExportToken: p.icalExportToken ?? null,
      }));
      const parsed = z.array(DirectSitePropertySchema).parse(properties);
      res.json(parsed);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.error("Direct site properties validation error:", error.errors);
        return res.status(502).json({ error: "Invalid response from Direct site API" });
      }
      console.error("Direct site properties error:", error.message);
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  });

  const availabilityQuerySchema = z.object({
    propertyId: z.string().min(1),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  });

  app.get("/api/direct-site/availability", async (req, res) => {
    const client = await getDirectSiteClientAsync(storage);
    if (!client) {
      return res.status(503).json({ error: "Direct site integration not configured" });
    }

    const queryResult = availabilityQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({ error: "Invalid query parameters", details: queryResult.error.errors });
    }

    try {
      const { propertyId, startDate, endDate } = queryResult.data;
      const rawAvailability = await client.getAvailability(propertyId, startDate, endDate);
      const availability = DirectSiteAvailabilitySchema.parse({
        ...rawAvailability,
        availableDates: (rawAvailability as any).availableDates ?? [],
      });
      res.json(availability);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.error("Direct site availability validation error:", error.errors);
        return res.status(502).json({ error: "Invalid response from Direct site API" });
      }
      console.error("Direct site availability error:", error.message);
      res.status(500).json({ error: "Failed to fetch availability" });
    }
  });

  const pricingQuerySchema = z.object({
    propertyId: z.string().min(1),
    checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    guests: z.string().optional(),
  });

  app.get("/api/direct-site/pricing", async (req, res) => {
    const client = await getDirectSiteClientAsync(storage);
    if (!client) {
      return res.status(503).json({ error: "Direct site integration not configured" });
    }

    const queryResult = pricingQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({ error: "Invalid query parameters", details: queryResult.error.errors });
    }

    try {
      const { propertyId, checkIn, checkOut, guests } = queryResult.data;
      const rawPricing = await client.getPricing(
        propertyId,
        checkIn,
        checkOut,
        guests ? parseInt(guests) : undefined
      );
      const pricing = DirectSitePricingSchema.parse({
        ...rawPricing,
        taxes: (rawPricing as any).taxes ?? 0,
      });
      res.json(pricing);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.error("Direct site pricing validation error:", error.errors);
        return res.status(502).json({ error: "Invalid response from Direct site API" });
      }
      console.error("Direct site pricing error:", error.message);
      res.status(500).json({ error: "Failed to fetch pricing" });
    }
  });

  app.post("/api/direct-site/reservations", async (req, res) => {
    const client = await getDirectSiteClientAsync(storage);
    if (!client) {
      return res.status(503).json({ error: "Direct site integration not configured" });
    }

    const bodyResult = ReservationRequestSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({ error: "Invalid request body", details: bodyResult.error.errors });
    }

    try {
      const rawResponse = await client.createReservation(bodyResult.data);
      const response = ReservationResponseSchema.parse(rawResponse);
      res.status(201).json(response);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.error("Direct site reservation validation error:", error.errors);
        return res.status(502).json({ error: "Invalid response from Direct site API" });
      }
      console.error("Direct site reservation error:", error.message);
      res.status(500).json({ error: "Failed to create reservation" });
    }
  });

  app.post("/api/direct-site/inquiries", async (req, res) => {
    const client = await getDirectSiteClientAsync(storage);
    if (!client) {
      return res.status(503).json({ error: "Direct site integration not configured" });
    }

    const bodyResult = InquiryRequestSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({ error: "Invalid request body", details: bodyResult.error.errors });
    }

    try {
      const rawResponse = await client.createInquiry(bodyResult.data);
      const response = InquiryResponseSchema.parse(rawResponse);
      res.status(201).json(response);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.error("Direct site inquiry validation error:", error.errors);
        return res.status(502).json({ error: "Invalid response from Direct site API" });
      }
      console.error("Direct site inquiry error:", error.message);
      res.status(500).json({ error: "Failed to create inquiry" });
    }
  });
}
