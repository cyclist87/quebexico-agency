import type { Express } from "express";
import { getHostProClient, isHostProEnabled } from "./client";
import { z } from "zod";
import {
  HostProConfigSchema,
  HostProPropertySchema,
  HostProAvailabilitySchema,
  HostProPricingSchema,
  ReservationRequestSchema,
  ReservationResponseSchema,
  InquiryRequestSchema,
  InquiryResponseSchema,
} from "@shared/hostpro";

export function registerHostProRoutes(app: Express) {
  app.get("/api/hostpro/enabled", (req, res) => {
    res.json({ enabled: isHostProEnabled() });
  });

  app.get("/api/hostpro/config", async (req, res) => {
    const client = getHostProClient();
    if (!client) {
      return res.status(503).json({ error: "HostPro integration not configured" });
    }

    try {
      const rawConfig = await client.getConfig();
      const config = HostProConfigSchema.parse(rawConfig);
      res.json(config);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.error("HostPro config validation error:", error.errors);
        return res.status(502).json({ error: "Invalid response from HostPro API" });
      }
      console.error("HostPro config error:", error.message);
      res.status(500).json({ error: "Failed to fetch HostPro config" });
    }
  });

  app.get("/api/hostpro/properties", async (req, res) => {
    const client = getHostProClient();
    if (!client) {
      return res.status(503).json({ error: "HostPro integration not configured" });
    }

    try {
      const rawProperties = await client.getProperties();
      const properties = z.array(HostProPropertySchema).parse(rawProperties);
      res.json(properties);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.error("HostPro properties validation error:", error.errors);
        return res.status(502).json({ error: "Invalid response from HostPro API" });
      }
      console.error("HostPro properties error:", error.message);
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  });

  const availabilityQuerySchema = z.object({
    propertyId: z.string().min(1),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  });

  app.get("/api/hostpro/availability", async (req, res) => {
    const client = getHostProClient();
    if (!client) {
      return res.status(503).json({ error: "HostPro integration not configured" });
    }

    const queryResult = availabilityQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({ error: "Invalid query parameters", details: queryResult.error.errors });
    }

    try {
      const { propertyId, startDate, endDate } = queryResult.data;
      const rawAvailability = await client.getAvailability(propertyId, startDate, endDate);
      const availability = HostProAvailabilitySchema.parse(rawAvailability);
      res.json(availability);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.error("HostPro availability validation error:", error.errors);
        return res.status(502).json({ error: "Invalid response from HostPro API" });
      }
      console.error("HostPro availability error:", error.message);
      res.status(500).json({ error: "Failed to fetch availability" });
    }
  });

  const pricingQuerySchema = z.object({
    propertyId: z.string().min(1),
    checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    guests: z.string().optional(),
  });

  app.get("/api/hostpro/pricing", async (req, res) => {
    const client = getHostProClient();
    if (!client) {
      return res.status(503).json({ error: "HostPro integration not configured" });
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
      const pricing = HostProPricingSchema.parse(rawPricing);
      res.json(pricing);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.error("HostPro pricing validation error:", error.errors);
        return res.status(502).json({ error: "Invalid response from HostPro API" });
      }
      console.error("HostPro pricing error:", error.message);
      res.status(500).json({ error: "Failed to fetch pricing" });
    }
  });

  app.post("/api/hostpro/reservations", async (req, res) => {
    const client = getHostProClient();
    if (!client) {
      return res.status(503).json({ error: "HostPro integration not configured" });
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
        console.error("HostPro reservation validation error:", error.errors);
        return res.status(502).json({ error: "Invalid response from HostPro API" });
      }
      console.error("HostPro reservation error:", error.message);
      res.status(500).json({ error: "Failed to create reservation" });
    }
  });

  app.post("/api/hostpro/inquiries", async (req, res) => {
    const client = getHostProClient();
    if (!client) {
      return res.status(503).json({ error: "HostPro integration not configured" });
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
        console.error("HostPro inquiry validation error:", error.errors);
        return res.status(502).json({ error: "Invalid response from HostPro API" });
      }
      console.error("HostPro inquiry error:", error.message);
      res.status(500).json({ error: "Failed to create inquiry" });
    }
  });
}
