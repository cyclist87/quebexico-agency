import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { insertPropertySchema, insertCampWaitlistSchema } from "@shared/schema";
import { z } from "zod";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerDirectSiteRoutes } from "./direct-sites/routes";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import pexelsRouter from "./pexels";
import OpenAI from "openai";
import { encrypt, decrypt, isEncrypted } from "./utils/encryption";
import { setDirectSiteDecrypt } from "./direct-sites/client";
import { sendReservationConfirmation } from "./email";
import { isStripeConfigured } from "./stripeClient";

// Nettoyer BOM / espaces parasites (souvent cause de "clé invalide")
const ADMIN_SECRET_KEY = (process.env.ADMIN_SECRET_KEY || "admin-secret-key")
  .replace(/^\uFEFF/, "")
  .trim();

interface ICalEvent {
  uid?: string;
  summary?: string;
  start?: Date;
  end?: Date;
}

function parseICalEvents(icalData: string): ICalEvent[] {
  const events: ICalEvent[] = [];
  const lines = icalData.replace(/\r\n /g, "").split(/\r?\n/);
  
  let currentEvent: ICalEvent | null = null;
  
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      currentEvent = {};
    } else if (line === "END:VEVENT" && currentEvent) {
      if (currentEvent.start && currentEvent.end) {
        events.push(currentEvent);
      }
      currentEvent = null;
    } else if (currentEvent) {
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex);
        const value = line.substring(colonIndex + 1);
        
        if (key === "UID") {
          currentEvent.uid = value;
        } else if (key === "SUMMARY") {
          currentEvent.summary = value;
        } else if (key.startsWith("DTSTART")) {
          currentEvent.start = parseICalDate(value);
        } else if (key.startsWith("DTEND")) {
          currentEvent.end = parseICalDate(value);
        }
      }
    }
  }
  
  return events;
}

function parseICalDate(value: string): Date | undefined {
  try {
    if (value.length === 8) {
      const year = parseInt(value.substring(0, 4));
      const month = parseInt(value.substring(4, 6)) - 1;
      const day = parseInt(value.substring(6, 8));
      return new Date(year, month, day);
    }
    if (value.length >= 15) {
      const year = parseInt(value.substring(0, 4));
      const month = parseInt(value.substring(4, 6)) - 1;
      const day = parseInt(value.substring(6, 8));
      const hour = parseInt(value.substring(9, 11));
      const minute = parseInt(value.substring(11, 13));
      const second = parseInt(value.substring(13, 15));
      
      if (value.endsWith("Z")) {
        return new Date(Date.UTC(year, month, day, hour, minute, second));
      }
      return new Date(year, month, day, hour, minute, second);
    }
    return undefined;
  } catch {
    return undefined;
  }
}

interface CouponValidationParams {
  coupon: {
    id: number;
    code: string;
    isActive: boolean | null;
    validFrom: Date | null;
    validUntil: Date | null;
    maxRedemptions: number | null;
    currentRedemptions: number | null;
    minSubtotal: number | null;
    maxNights: number | null;
    minNights: number | null;
    applicablePropertyIds: number[] | null;
    maxPerGuest: number | null;
    discountType: string;
    discountValue: number;
    maxDiscount: number | null;
  };
  subtotal?: number;
  nights?: number;
  propertyId?: number;
  guestEmail?: string;
  getRedemptionsByEmail: (email: string, couponId: number) => Promise<any[]>;
}

interface CouponValidationResult {
  valid: boolean;
  errorMessage?: string;
  discountAmount?: number;
}

async function validateCouponForReservation(params: CouponValidationParams): Promise<CouponValidationResult> {
  const { coupon, subtotal, nights, propertyId, guestEmail, getRedemptionsByEmail } = params;

  if (!coupon.isActive) {
    return { valid: false, errorMessage: "Code inactif" };
  }

  const now = new Date();
  if (coupon.validFrom && new Date(coupon.validFrom) > now) {
    return { valid: false, errorMessage: "Code pas encore valide" };
  }
  if (coupon.validUntil && new Date(coupon.validUntil) < now) {
    return { valid: false, errorMessage: "Code expiré" };
  }

  const currentRedemptions = coupon.currentRedemptions ?? 0;
  if (coupon.maxRedemptions && currentRedemptions >= coupon.maxRedemptions) {
    return { valid: false, errorMessage: "Limite d'utilisation atteinte" };
  }

  if (subtotal !== undefined && coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    return { valid: false, errorMessage: `Minimum ${coupon.minSubtotal}$ requis` };
  }

  if (nights !== undefined && coupon.minNights && nights < coupon.minNights) {
    return { valid: false, errorMessage: `Minimum ${coupon.minNights} nuits requis` };
  }

  if (nights !== undefined && coupon.maxNights && nights > coupon.maxNights) {
    return { valid: false, errorMessage: `Maximum ${coupon.maxNights} nuits` };
  }

  if (propertyId !== undefined && coupon.applicablePropertyIds && coupon.applicablePropertyIds.length > 0) {
    if (!coupon.applicablePropertyIds.includes(propertyId)) {
      return { valid: false, errorMessage: "Code non applicable à cette propriété" };
    }
  }

  if (guestEmail && coupon.maxPerGuest) {
    const redemptions = await getRedemptionsByEmail(guestEmail, coupon.id);
    if (redemptions.length >= coupon.maxPerGuest) {
      return { valid: false, errorMessage: "Limite par client atteinte" };
    }
  }

  let discountAmount = 0;
  const effectiveSubtotal = subtotal ?? 0;
  if (coupon.discountType === "percentage") {
    discountAmount = Math.round(effectiveSubtotal * coupon.discountValue / 100);
  } else {
    discountAmount = coupon.discountValue;
  }
  if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
    discountAmount = coupon.maxDiscount;
  }

  return { valid: true, discountAmount };
}

export async function getOpenAIClient(): Promise<{ client: OpenAI; usedCustomKey: boolean }> {
  try {
    const setting = await storage.getSetting("openai_api_key");
    if (setting?.value) {
      const decryptedKey = isEncrypted(setting.value)
        ? decrypt(setting.value)
        : setting.value;
      return { client: new OpenAI({ apiKey: decryptedKey }), usedCustomKey: true };
    }
  } catch (error) {
    console.error("Error getting custom OpenAI key, using platform key:", error);
  }
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI non configuré. Définis AI_INTEGRATIONS_OPENAI_API_KEY ou configure une clé dans Admin → Intégrations.");
  }
  return {
    client: new OpenAI({
      apiKey,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    }),
    usedCustomKey: false,
  };
}

// Track dev session tokens (in-memory, cleared on restart)
const devSessionTokens = new Set<string>();

function requireAdminAuth(req: any, res: any, next: any) {
  const raw = req.headers["x-admin-key"];
  const adminKey = typeof raw === "string" ? raw.trim() : "";
  // Accept either the real admin key or a valid dev session token
  if (adminKey === ADMIN_SECRET_KEY || devSessionTokens.has(adminKey)) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

function isDevEnvironment(): boolean {
  return process.env.NODE_ENV === "development";
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Log admin key status (length only, for debugging "invalid key")
  const fromEnv = !!process.env.ADMIN_SECRET_KEY?.trim();
  console.log(`[auth] Admin key: ${fromEnv ? "from .env" : "default"} (length ${ADMIN_SECRET_KEY.length})`);

  // Dev-only admin login route - only available in development
  // Creates a server-side session without exposing the actual secret key
  app.post("/api/auth/dev-login", (req, res) => {
    if (!isDevEnvironment()) {
      return res.status(404).json({ message: "Not found" });
    }
    // Generate a session token that maps to admin access
    const sessionToken = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    devSessionTokens.add(sessionToken);
    res.json({ sessionToken });
  });
  
  // Verify session token
  app.get("/api/auth/verify-session", (req, res) => {
    const raw = req.headers["x-admin-key"];
    const token = typeof raw === "string" ? raw.trim() : "";
    if (devSessionTokens.has(token) || token === ADMIN_SECRET_KEY) {
      return res.json({ valid: true });
    }
    return res.status(401).json({ valid: false });
  });

  // Debug (dev only): vérifier quelle clé le serveur a chargée (longueur uniquement)
  if (isDevEnvironment()) {
    app.get("/api/auth/debug-key", (_req, res) => {
      res.json({
        length: ADMIN_SECRET_KEY.length,
        fromEnv: !!process.env.ADMIN_SECRET_KEY?.trim(),
      });
    });
  }
  
  // Register chatbot routes
  registerChatRoutes(app);
  
  // Register Direct site integration routes (API quebexico.com)
  setDirectSiteDecrypt(decrypt, isEncrypted);
  registerDirectSiteRoutes(app, storage);
  
  // Register Object Storage routes for file uploads
  registerObjectStorageRoutes(app);
  
  // Register Pexels API routes
  app.use("/api/pexels", pexelsRouter);
  
  // Check Stripe integration status
  app.get("/api/integrations/stripe/status", async (req, res) => {
    try {
      const configured = await isStripeConfigured();
      res.json({ configured });
    } catch (error) {
      res.json({ configured: false });
    }
  });
  
  // Projects
  app.get(api.projects.list.path, async (req, res) => {
    const projects = await storage.getProjects();
    res.json(projects);
  });

  // Messages (Contact Form)
  app.post(api.messages.create.path, async (req, res) => {
    try {
      const input = api.messages.create.input.parse(req.body);
      const message = await storage.createMessage(input);
      res.status(201).json(message);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Newsletter Subscribers
  app.post(api.subscribers.create.path, async (req, res) => {
    try {
      const input = api.subscribers.create.input.parse(req.body);
      
      // Check for duplicate
      const existing = await storage.getSubscriberByEmail(input.email);
      if (existing) {
        return res.status(409).json({ message: "Email already subscribed" });
      }

      const subscriber = await storage.createSubscriber(input);
      res.status(201).json(subscriber);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // === PUBLIC BLOG ROUTES ===
  
  // Get published blog posts
  app.get(api.blog.list.path, async (req, res) => {
    const posts = await storage.getPublishedBlogPosts();
    res.json(posts);
  });

  // Get blog categories
  app.get(api.blogCategories.list.path, async (req, res) => {
    const categories = await storage.getBlogCategories();
    res.json(categories);
  });

  // Get single blog post by slug
  app.get("/api/blog/:slug", async (req, res) => {
    const post = await storage.getBlogPostBySlug(req.params.slug);
    if (!post || !post.isPublished) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  });

  // === ADMIN BLOG ROUTES ===

  // Get all blog posts (including drafts)
  app.get(api.admin.blog.list.path, requireAdminAuth, async (req, res) => {
    const posts = await storage.getAllBlogPosts();
    res.json(posts);
  });

  // Create blog post
  app.post(api.admin.blog.create.path, requireAdminAuth, async (req, res) => {
    try {
      const input = api.admin.blog.create.input.parse(req.body);
      const post = await storage.createBlogPost(input);
      res.status(201).json(post);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Update blog post
  app.put("/api/admin/blog/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.admin.blog.update.input.parse(req.body);
      const post = await storage.updateBlogPost(id, input);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Delete blog post
  app.delete("/api/admin/blog/:id", requireAdminAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteBlogPost(id);
    res.json({ success });
  });

  // Set featured post
  app.post("/api/admin/blog/:id/featured", requireAdminAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const post = await storage.setFeaturedPost(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  });

  // Update post order
  app.put(api.admin.blog.updateOrder.path, requireAdminAuth, async (req, res) => {
    try {
      const items = api.admin.blog.updateOrder.input.parse(req.body);
      for (const item of items) {
        await storage.updateBlogPostOrder(item.id, item.orderIndex);
      }
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // === ADMIN CATEGORY ROUTES ===

  // Get categories (admin)
  app.get(api.admin.categories.list.path, requireAdminAuth, async (req, res) => {
    const categories = await storage.getBlogCategories();
    res.json(categories);
  });

  // Create category
  app.post(api.admin.categories.create.path, requireAdminAuth, async (req, res) => {
    try {
      const input = api.admin.categories.create.input.parse(req.body);
      const category = await storage.createBlogCategory(input);
      res.status(201).json(category);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Update category
  app.put("/api/admin/blog/categories/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.admin.categories.update.input.parse(req.body);
      const category = await storage.updateBlogCategory(id, input);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Delete category
  app.delete("/api/admin/blog/categories/:id", requireAdminAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteBlogCategory(id);
    res.json({ success });
  });

  // === ADMIN SETTINGS ROUTES ===

  // Get all settings (mask sensitive keys so admin never receives raw value)
  app.get(api.admin.settings.get.path, requireAdminAuth, async (req, res) => {
    const settings = await storage.getAllSettings();
    const masked = settings.map((s) =>
      (s.key === "openai_api_key" || s.key === "direct_site_api_key") && s.value
        ? { ...s, value: "***configured***" }
        : s
    );
    res.json(masked);
  });

  // Get single setting by key
  app.get("/api/admin/settings/:key", requireAdminAuth, async (req, res) => {
    const setting = await storage.getSetting(req.params.key);
    res.json(setting || null);
  });

  // Upsert setting (with encryption for sensitive keys)
  app.put("/api/admin/settings/:key", requireAdminAuth, async (req, res) => {
    try {
      const input = api.admin.settings.upsert.input.parse(req.body);
      let value = input.value;
      
      // Encrypt sensitive API keys before storing
      if (req.params.key === "openai_api_key" && value) {
        value = encrypt(value);
      }
      if (req.params.key === "direct_site_api_key" && value) {
        value = encrypt(value);
      }

      const setting = await storage.upsertSetting(req.params.key, value);

      // For sensitive keys, don't return the actual value
      if ((req.params.key === "openai_api_key" || req.params.key === "direct_site_api_key") && setting.value) {
        res.json({ ...setting, value: "***configured***" });
      } else {
        res.json(setting);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Get AI usage statistics
  app.get("/api/admin/ai-usage", requireAdminAuth, async (req, res) => {
    try {
      const stats = await storage.getAiUsageStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching AI usage stats:", error);
      res.status(500).json({ error: "Failed to fetch usage stats" });
    }
  });

  // Validate OpenAI API key
  app.post("/api/admin/settings/validate-openai-key", requireAdminAuth, async (req, res) => {
    try {
      const { apiKey } = req.body;
      
      if (!apiKey || typeof apiKey !== "string") {
        return res.json({ valid: false, error: "Clé API requise" });
      }
      
      if (!apiKey.startsWith("sk-")) {
        return res.json({ valid: false, error: "La clé doit commencer par 'sk-'" });
      }
      
      // Test the key with a simple API call
      const testClient = new OpenAI({ apiKey });
      
      await testClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "test" }],
        max_tokens: 1,
      });
      
      res.json({ valid: true });
    } catch (error: any) {
      console.error("OpenAI key validation error:", error.message);
      
      if (error.status === 401) {
        return res.json({ valid: false, error: "Clé API invalide ou expirée" });
      }
      if (error.status === 429) {
        return res.json({ valid: false, error: "Quota dépassé ou limite de requêtes atteinte" });
      }
      
      res.json({ valid: false, error: "Impossible de valider la clé" });
    }
  });

  // === TEMPLATE FEATURES ROUTES ===

  const validTemplateTypes = ["str", "freelancer", "sports_club", "cleaning", "agency"] as const;
  
  const templateFeaturesSchema = z.object({
    enabledFeatures: z.array(z.string()),
  });

  const bulkTemplateFeaturesSchema = z.object({
    features: z.record(z.enum(validTemplateTypes), z.array(z.string())),
  });

  // Get all template features
  app.get("/api/admin/template-features", requireAdminAuth, async (req, res) => {
    const features = await storage.getTemplateFeatures();
    res.json(features);
  });

  // Get template features for a specific template
  app.get("/api/admin/template-features/:templateType", requireAdminAuth, async (req, res) => {
    const templateType = req.params.templateType;
    if (!validTemplateTypes.includes(templateType as typeof validTemplateTypes[number])) {
      return res.status(400).json({ message: "Invalid template type" });
    }
    const feature = await storage.getTemplateFeatureByType(templateType);
    res.json(feature);
  });

  // Upsert template features (create or update)
  app.put("/api/admin/template-features/:templateType", requireAdminAuth, async (req, res) => {
    try {
      const templateType = req.params.templateType;
      if (!validTemplateTypes.includes(templateType as typeof validTemplateTypes[number])) {
        return res.status(400).json({ message: "Invalid template type" });
      }
      
      const parsed = templateFeaturesSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "enabledFeatures must be an array of strings" });
      }
      
      const result = await storage.upsertTemplateFeature(templateType, parsed.data.enabledFeatures);
      res.json(result);
    } catch (err) {
      console.error("Error saving template features:", err);
      res.status(500).json({ message: "Failed to save template features" });
    }
  });

  // Bulk upsert all template features
  app.put("/api/admin/template-features", requireAdminAuth, async (req, res) => {
    try {
      const parsed = bulkTemplateFeaturesSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid features format" });
      }
      
      const results = [];
      for (const [templateType, enabledFeatures] of Object.entries(parsed.data.features)) {
        const result = await storage.upsertTemplateFeature(templateType, enabledFeatures);
        results.push(result);
      }
      res.json(results);
    } catch (err) {
      console.error("Error saving template features:", err);
      res.status(500).json({ message: "Failed to save template features" });
    }
  });

  // Translation endpoint
  const translateSchema = z.object({
    titleFr: z.string().min(1),
    excerptFr: z.string().optional(),
    contentFr: z.string().min(1),
  });

  app.post("/api/admin/translate", requireAdminAuth, async (req, res) => {
    try {
      const { titleFr, excerptFr, contentFr } = translateSchema.parse(req.body);
      
      const prompt = `Translate the following French content to English and Spanish. Return ONLY a valid JSON object with these exact keys: titleEn, titleEs, excerptEn, excerptEs, contentEn, contentEs.

French Title: ${titleFr}
French Excerpt: ${excerptFr || ""}
French Content: ${contentFr}

Important:
- Preserve all HTML tags exactly as they are
- Maintain the same formatting and structure
- Return ONLY the JSON object, no markdown code blocks or additional text`;

      const { client: openaiClient } = await getOpenAIClient();
      const response = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a professional translator. Return only valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
      });

      const content = response.choices[0].message.content || "{}";
      // Clean up any markdown code blocks
      const cleanedContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const translations = JSON.parse(cleanedContent);
      
      res.json({
        titleEn: translations.titleEn || "",
        titleEs: translations.titleEs || "",
        excerptEn: translations.excerptEn || "",
        excerptEs: translations.excerptEs || "",
        contentEn: translations.contentEn || "",
        contentEs: translations.contentEs || "",
      });
    } catch (err) {
      console.error("Translation error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input" });
      }
      res.status(500).json({ message: "Translation failed" });
    }
  });

  // === DIGITAL CARDS ROUTES ===
  
  // Public: Get card by slug
  app.get(api.digitalCards.getBySlug.path, async (req, res) => {
    const card = await storage.getDigitalCardBySlug(req.params.slug);
    if (!card || !card.isActive) {
      return res.status(404).json({ message: "Card not found" });
    }
    res.json(card);
  });

  // Admin: List all cards
  app.get(api.admin.digitalCards.list.path, requireAdminAuth, async (req, res) => {
    const cards = await storage.getDigitalCards();
    res.json(cards);
  });

  // Admin: Create card
  app.post(api.admin.digitalCards.create.path, requireAdminAuth, async (req, res) => {
    try {
      const input = api.admin.digitalCards.create.input.parse(req.body);
      
      // Check for duplicate slug
      const existing = await storage.getDigitalCardBySlug(input.slug);
      if (existing) {
        return res.status(409).json({ message: "Ce slug existe déjà" });
      }
      
      const card = await storage.createDigitalCard(input);
      res.status(201).json(card);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Admin: Update card
  app.put(api.admin.digitalCards.update.path, requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const input = api.admin.digitalCards.update.input.parse(req.body);
      
      // If changing slug, check for duplicates
      if (input.slug) {
        const existing = await storage.getDigitalCardBySlug(input.slug);
        if (existing && existing.id !== id) {
          return res.status(409).json({ message: "Ce slug existe déjà" });
        }
      }
      
      const card = await storage.updateDigitalCard(id, input);
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }
      res.json(card);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Admin: Delete card
  app.delete(api.admin.digitalCards.delete.path, requireAdminAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const card = await storage.getDigitalCardById(id);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }
    await storage.deleteDigitalCard(id);
    res.json({ success: true });
  });

  // ==================== EMAIL SIGNATURES ====================
  
  // Admin: List all signatures
  app.get(api.admin.emailSignatures.list.path, requireAdminAuth, async (req, res) => {
    const signatures = await storage.getEmailSignatures();
    res.json(signatures);
  });

  // Admin: Create signature
  app.post(api.admin.emailSignatures.create.path, requireAdminAuth, async (req, res) => {
    try {
      const input = api.admin.emailSignatures.create.input.parse(req.body);
      
      // Check for duplicate slug
      const existing = await storage.getEmailSignatureBySlug(input.slug);
      if (existing) {
        return res.status(409).json({ message: "Ce slug existe déjà" });
      }
      
      const signature = await storage.createEmailSignature(input);
      res.status(201).json(signature);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Admin: Update signature
  app.put(api.admin.emailSignatures.update.path, requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const input = api.admin.emailSignatures.update.input.parse(req.body);
      
      // If changing slug, check for duplicates
      if (input.slug) {
        const existing = await storage.getEmailSignatureBySlug(input.slug);
        if (existing && existing.id !== id) {
          return res.status(409).json({ message: "Ce slug existe déjà" });
        }
      }
      
      const signature = await storage.updateEmailSignature(id, input);
      if (!signature) {
        return res.status(404).json({ message: "Signature not found" });
      }
      res.json(signature);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Admin: Delete signature
  app.delete(api.admin.emailSignatures.delete.path, requireAdminAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const signature = await storage.getEmailSignatureById(id);
    if (!signature) {
      return res.status(404).json({ message: "Signature not found" });
    }
    await storage.deleteEmailSignature(id);
    res.json({ success: true });
  });

  // ============================================================
  // PROPERTIES API (PUBLIC - STR Autonomous)
  // ============================================================

  // Public: Get all active properties
  app.get("/api/properties", async (req, res) => {
    const properties = await storage.getProperties(true);
    res.json(properties);
  });

  // Public: Get property by slug
  app.get("/api/properties/:slug", async (req, res) => {
    const property = await storage.getPropertyBySlug(req.params.slug);
    if (!property || !property.isActive) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.json(property);
  });

  // Public: Get availability (blocked dates + reservations) for a property
  app.get("/api/properties/:slug/availability", async (req, res) => {
    const property = await storage.getPropertyBySlug(req.params.slug);
    if (!property || !property.isActive) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date();
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate as string) 
      : new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000);
    
    const blockedDates = await storage.getBlockedDates(property.id, startDate, endDate);
    const reservations = await storage.getReservations(property.id);
    
    const reservedRanges = reservations
      .filter(r => r.status !== "cancelled")
      .map(r => ({
        start: r.checkIn.toISOString().split("T")[0],
        end: r.checkOut.toISOString().split("T")[0],
        source: "reservation"
      }));
    
    const blockedRanges = blockedDates.map(bd => ({
      start: bd.startDate.toISOString().split("T")[0],
      end: bd.endDate.toISOString().split("T")[0],
      source: bd.source || "blocked"
    }));
    
    res.json({
      propertyId: property.id,
      blockedDates: [...blockedRanges, ...reservedRanges]
    });
  });

  // Public: Calculate pricing for a date range
  app.get("/api/properties/:slug/pricing", async (req, res) => {
    const property = await storage.getPropertyBySlug(req.params.slug);
    if (!property || !property.isActive) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    const { checkIn, checkOut, guests } = req.query;
    if (!checkIn || !checkOut) {
      return res.status(400).json({ message: "checkIn and checkOut are required" });
    }
    
    const start = new Date(checkIn as string);
    const end = new Date(checkOut as string);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (nights < (property.minNights || 1)) {
      return res.status(400).json({ message: `Minimum ${property.minNights} nights required` });
    }
    if (nights > (property.maxNights || 30)) {
      return res.status(400).json({ message: `Maximum ${property.maxNights} nights allowed` });
    }
    
    const pricePerNight = property.pricePerNight;
    const subtotal = nights * pricePerNight;
    const cleaningFee = property.cleaningFee || 0;
    const serviceFee = Math.round(subtotal * 0.10);
    const taxes = Math.round((subtotal + cleaningFee + serviceFee) * 0.15);
    const total = subtotal + cleaningFee + serviceFee + taxes;
    
    res.json({
      propertyId: property.id,
      checkIn: checkIn as string,
      checkOut: checkOut as string,
      nights,
      pricePerNight,
      subtotal,
      cleaningFee,
      serviceFee,
      taxes,
      total,
      currency: property.currency || "CAD"
    });
  });

  // Public: Export iCal calendar for a property
  app.get("/api/properties/:slug/calendar.ics", async (req, res) => {
    try {
      const property = await storage.getPropertyBySlug(req.params.slug);
      if (!property) {
        return res.status(404).send("Property not found");
      }
      
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endDate = new Date(now.getFullYear() + 1, now.getMonth() + 1, 0);
      
      const blockedDates = await storage.getBlockedDates(property.id, startDate, endDate);
      const reservations = await storage.getReservations(property.id);
      
      const formatDate = (date: Date): string => {
        return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      };
      
      const formatDateOnly = (date: Date): string => {
        return date.toISOString().split("T")[0].replace(/-/g, "");
      };
      
      const addOneDay = (date: Date): Date => {
        const result = new Date(date);
        result.setDate(result.getDate() + 1);
        return result;
      };
      
      let icalContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//QUEBEXICO//STR Calendar//FR",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        `X-WR-CALNAME:${property.nameFr}`,
      ];
      
      reservations
        .filter(r => r.status !== "cancelled")
        .forEach(reservation => {
          const checkIn = new Date(reservation.checkIn);
          const checkOut = new Date(reservation.checkOut);
          
          icalContent.push(
            "BEGIN:VEVENT",
            `UID:reservation-${reservation.id}@quebexico`,
            `DTSTAMP:${formatDate(new Date())}`,
            `DTSTART;VALUE=DATE:${formatDateOnly(checkIn)}`,
            `DTEND;VALUE=DATE:${formatDateOnly(checkOut)}`,
            `SUMMARY:Réservé - ${reservation.guestFirstName} ${reservation.guestLastName.charAt(0)}.`,
            `DESCRIPTION:Réservation ${reservation.confirmationCode}`,
            "STATUS:CONFIRMED",
            "TRANSP:OPAQUE",
            "END:VEVENT"
          );
        });
      
      blockedDates.forEach(blocked => {
        const start = new Date(blocked.startDate);
        const end = new Date(blocked.endDate);
        
        icalContent.push(
          "BEGIN:VEVENT",
          `UID:blocked-${blocked.id}@quebexico`,
          `DTSTAMP:${formatDate(new Date())}`,
          `DTSTART;VALUE=DATE:${formatDateOnly(start)}`,
          `DTEND;VALUE=DATE:${formatDateOnly(end)}`,
          `SUMMARY:Bloqué${blocked.reason ? ` - ${blocked.reason}` : ""}`,
          `DESCRIPTION:${blocked.source === "ical_sync" ? "Importé depuis calendrier externe" : "Blocage manuel"}`,
          "STATUS:CONFIRMED",
          "TRANSP:OPAQUE",
          "END:VEVENT"
        );
      });
      
      icalContent.push("END:VCALENDAR");
      
      res.set({
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${property.slug}-calendar.ics"`,
      });
      res.send(icalContent.join("\r\n"));
    } catch (error) {
      console.error("Error generating iCal:", error);
      res.status(500).send("Error generating calendar");
    }
  });

  // Admin: Sync iCal from external URL
  app.post("/api/admin/properties/:id/sync-ical", requireAdminAuth, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getPropertyById(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      if (!property.icalUrl) {
        return res.status(400).json({ message: "No iCal URL configured for this property" });
      }
      
      const response = await fetch(property.icalUrl);
      if (!response.ok) {
        return res.status(400).json({ message: "Failed to fetch iCal URL" });
      }
      
      const icalData = await response.text();
      const events = parseICalEvents(icalData);
      
      await storage.clearBlockedDatesBySource(propertyId, "ical_sync");
      
      let importedCount = 0;
      for (const event of events) {
        if (event.start && event.end && event.end > event.start) {
          await storage.createBlockedDate({
            propertyId,
            startDate: event.start,
            endDate: event.end,
            source: "ical_sync",
            reason: event.summary || "External calendar",
          });
          importedCount++;
        }
      }
      
      res.json({ 
        success: true, 
        message: `Imported ${importedCount} blocked dates from external calendar`,
        importedCount 
      });
    } catch (error) {
      console.error("Error syncing iCal:", error);
      res.status(500).json({ message: "Failed to sync calendar" });
    }
  });

  // Public: Create reservation
  app.post("/api/reservations", async (req, res) => {
    try {
      const schema = z.object({
        propertySlug: z.string(),
        checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        guests: z.number().min(1),
        guestFirstName: z.string().min(1),
        guestLastName: z.string().min(1),
        guestEmail: z.string().email(),
        guestPhone: z.string().optional(),
        guestMessage: z.string().optional(),
        language: z.string().optional(),
        couponCode: z.string().optional(),
        discountAmount: z.number().optional(),
      });
      
      const input = schema.parse(req.body);
      const property = await storage.getPropertyBySlug(input.propertySlug);
      if (!property || !property.isActive) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      if (input.guests > (property.maxGuests || 4)) {
        return res.status(400).json({ message: `Maximum ${property.maxGuests} guests allowed` });
      }
      
      const checkInDate = new Date(input.checkIn);
      const checkOutDate = new Date(input.checkOut);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const blockedDates = await storage.getBlockedDates(property.id, checkInDate, checkOutDate);
      for (const blocked of blockedDates) {
        if (checkInDate < blocked.endDate && checkOutDate > blocked.startDate) {
          return res.status(400).json({ message: "Selected dates are not available" });
        }
      }
      
      const existingReservations = await storage.getReservations(property.id);
      for (const reservation of existingReservations) {
        if (reservation.status !== "cancelled") {
          if (checkInDate < reservation.checkOut && checkOutDate > reservation.checkIn) {
            return res.status(400).json({ message: "Selected dates overlap with an existing reservation" });
          }
        }
      }
      
      const pricePerNight = property.pricePerNight;
      const subtotal = nights * pricePerNight;
      const cleaningFee = property.cleaningFee || 0;
      const serviceFee = Math.round(subtotal * 0.10);
      const taxes = Math.round((subtotal + cleaningFee + serviceFee) * 0.15);
      
      let discountAmount = 0;
      let validatedCouponCode: string | undefined;
      
      if (input.couponCode) {
        const coupon = await storage.getCouponByCode(input.couponCode);
        if (coupon) {
          const validationResult = await validateCouponForReservation({
            coupon,
            subtotal,
            nights,
            propertyId: property.id,
            guestEmail: input.guestEmail,
            getRedemptionsByEmail: storage.getRedemptionsByEmail.bind(storage),
          });
          
          if (validationResult.valid && validationResult.discountAmount) {
            discountAmount = validationResult.discountAmount;
            const maxAllowedDiscount = subtotal + cleaningFee + serviceFee;
            if (discountAmount > maxAllowedDiscount) {
              discountAmount = maxAllowedDiscount;
            }
            validatedCouponCode = coupon.code;
          }
        }
      }
      
      const totalBeforeDiscount = subtotal + cleaningFee + serviceFee + taxes;
      const total = Math.max(taxes, totalBeforeDiscount - discountAmount);
      
      const confirmationCode = `QBX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      const reservation = await storage.createReservation({
        propertyId: property.id,
        confirmationCode,
        status: "pending",
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights,
        guests: input.guests,
        guestFirstName: input.guestFirstName,
        guestLastName: input.guestLastName,
        guestEmail: input.guestEmail,
        guestPhone: input.guestPhone,
        guestMessage: input.guestMessage,
        pricePerNight,
        subtotal,
        cleaningFee,
        serviceFee,
        taxes,
        discountAmount,
        couponCode: validatedCouponCode,
        total,
        currency: property.currency || "CAD",
        language: input.language || "fr"
      });
      
      if (validatedCouponCode && discountAmount > 0) {
        const coupon = await storage.getCouponByCode(validatedCouponCode);
        if (coupon) {
          await storage.createCouponRedemption({
            couponId: coupon.id,
            reservationId: reservation.id,
            guestEmail: input.guestEmail,
            discountApplied: discountAmount,
            currency: property.currency || "CAD",
          });
          await storage.incrementCouponRedemption(coupon.id);
        }
      }
      
      const lang = (input.language || "fr") as "fr" | "en" | "es";
      const propertyName = lang === "en" ? property.nameEn || property.nameFr :
                           lang === "es" ? property.nameEs || property.nameFr :
                           property.nameFr;
      
      // Fetch site config for email branding
      const siteConfig = await storage.getSiteConfig();
      const siteName = siteConfig?.siteName || undefined;
      const siteUrl = siteConfig?.customDomain 
        ? `https://${siteConfig.customDomain}` 
        : undefined;
      
      sendReservationConfirmation({
        guestName: `${input.guestFirstName} ${input.guestLastName}`,
        guestEmail: input.guestEmail,
        propertyName: propertyName || "Propriété",
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        nights,
        guests: input.guests,
        confirmationCode,
        subtotal,
        serviceFee,
        cleaningFee,
        taxes,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        couponCode: validatedCouponCode,
        total,
        language: lang,
        siteName,
        siteUrl,
      }).catch((err) => {
        console.error("Failed to send confirmation email:", err);
      });
      
      res.status(201).json({
        id: reservation.id,
        confirmationCode: reservation.confirmationCode,
        status: reservation.status,
        propertyId: reservation.propertyId,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        total: reservation.total,
        currency: reservation.currency
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.')
        });
      }
      throw err;
    }
  });

  // Public: Create inquiry
  app.post("/api/inquiries", async (req, res) => {
    try {
      const schema = z.object({
        propertySlug: z.string().optional(),
        checkIn: z.string().optional(),
        checkOut: z.string().optional(),
        guests: z.number().optional(),
        guestFirstName: z.string().min(1),
        guestLastName: z.string().min(1),
        guestEmail: z.string().email(),
        guestPhone: z.string().optional(),
        message: z.string().min(1),
        language: z.string().optional()
      });
      
      const input = schema.parse(req.body);
      
      let propertyId: number | null = null;
      if (input.propertySlug) {
        const property = await storage.getPropertyBySlug(input.propertySlug);
        propertyId = property?.id || null;
      }
      
      const inquiry = await storage.createInquiry({
        propertyId,
        status: "new",
        guestFirstName: input.guestFirstName,
        guestLastName: input.guestLastName,
        guestEmail: input.guestEmail,
        guestPhone: input.guestPhone,
        message: input.message,
        checkIn: input.checkIn ? new Date(input.checkIn) : undefined,
        checkOut: input.checkOut ? new Date(input.checkOut) : undefined,
        guests: input.guests,
        language: input.language || "fr"
      });
      
      res.status(201).json({
        id: inquiry.id,
        status: inquiry.status,
        createdAt: inquiry.createdAt
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.')
        });
      }
      throw err;
    }
  });

  // Public: Join camp waitlist
  app.post("/api/camp-waitlist", async (req, res) => {
    try {
      const input = insertCampWaitlistSchema.parse(req.body);
      
      const entry = await storage.createCampWaitlist(input);
      
      res.status(201).json({
        id: entry.id,
        message: "Successfully added to waitlist"
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.')
        });
      }
      throw err;
    }
  });

  // ============================================================
  // ADMIN PROPERTIES API
  // ============================================================

  // Admin: Get all properties (including inactive)
  app.get("/api/admin/properties", requireAdminAuth, async (req, res) => {
    const properties = await storage.getProperties(false);
    res.json(properties);
  });

  // Admin: Get property by ID
  app.get("/api/admin/properties/:id", requireAdminAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const property = await storage.getPropertyById(id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.json(property);
  });

  // Admin: Create property
  app.post("/api/admin/properties", requireAdminAuth, async (req, res) => {
    try {
      const existing = await storage.getPropertyBySlug(req.body.slug);
      if (existing) {
        return res.status(409).json({ message: "Ce slug existe déjà" });
      }
      
      // Normalize the input: convert empty strings to null for nullable fields
      const normalizedData = { ...req.body };
      const nullableFields = [
        'descriptionFr', 'descriptionEn', 'descriptionEs',
        'addressFr', 'addressEn', 'addressEs',
        'city', 'region', 'country', 'latitude', 'longitude',
        'houseRulesFr', 'houseRulesEn', 'houseRulesEs',
        'wifiName', 'wifiPassword', 'icalUrl',
        'accessCodeFr', 'accessCodeEn', 'accessCodeEs'
      ];
      for (const field of nullableFields) {
        if (normalizedData[field] === '' || normalizedData[field] === undefined) {
          normalizedData[field] = null;
        }
      }
      
      // Ensure required fields exist
      if (!normalizedData.nameFr) {
        return res.status(400).json({ message: "Le nom en français est requis", field: "nameFr" });
      }
      if (!normalizedData.pricePerNight) {
        return res.status(400).json({ message: "Le prix par nuit est requis", field: "pricePerNight" });
      }
      
      // Validate with insertPropertySchema
      const validatedData = insertPropertySchema.parse(normalizedData);
      
      const property = await storage.createProperty(validatedData);
      res.status(201).json(property);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.')
        });
      }
      throw err;
    }
  });

  // Admin: Update property
  app.put("/api/admin/properties/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (req.body.slug) {
        const existing = await storage.getPropertyBySlug(req.body.slug);
        if (existing && existing.id !== id) {
          return res.status(409).json({ message: "Ce slug existe déjà" });
        }
      }
      
      // Normalize the input: convert empty strings to null for nullable fields
      const normalizedData = { ...req.body };
      const nullableFields = [
        'descriptionFr', 'descriptionEn', 'descriptionEs',
        'addressFr', 'addressEn', 'addressEs',
        'city', 'region', 'country', 'latitude', 'longitude',
        'houseRulesFr', 'houseRulesEn', 'houseRulesEs',
        'wifiName', 'wifiPassword', 'icalUrl',
        'accessCodeFr', 'accessCodeEn', 'accessCodeEs'
      ];
      for (const field of nullableFields) {
        if (normalizedData[field] === '') {
          normalizedData[field] = null;
        }
      }
      
      // Validate with partial schema for updates
      const validatedData = insertPropertySchema.partial().parse(normalizedData);
      
      const property = await storage.updateProperty(id, validatedData);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.')
        });
      }
      throw err;
    }
  });

  // Admin: Delete property
  app.delete("/api/admin/properties/:id", requireAdminAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const property = await storage.getPropertyById(id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    await storage.deleteProperty(id);
    res.json({ success: true });
  });

  // Admin: Get blocked dates for a property
  app.get("/api/admin/properties/:id/blocked-dates", requireAdminAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const blockedDates = await storage.getBlockedDates(id);
    
    const transformedDates = blockedDates.map(bd => {
      const inclusiveEnd = new Date(bd.endDate);
      inclusiveEnd.setDate(inclusiveEnd.getDate() - 1);
      return {
        ...bd,
        endDate: inclusiveEnd
      };
    });
    
    res.json(transformedDates);
  });

  // Admin: Add blocked dates
  app.post("/api/admin/properties/:id/blocked-dates", requireAdminAuth, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id, 10);
      const schema = z.object({
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        reason: z.string().optional()
      });
      
      const input = schema.parse(req.body);
      
      const endDateExclusive = new Date(input.endDate);
      endDateExclusive.setDate(endDateExclusive.getDate() + 1);
      
      const blockedDate = await storage.createBlockedDate({
        propertyId,
        startDate: new Date(input.startDate),
        endDate: endDateExclusive,
        source: "manual",
        reason: input.reason
      });
      
      res.status(201).json(blockedDate);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.')
        });
      }
      throw err;
    }
  });

  // Admin: Delete blocked date
  app.delete("/api/admin/blocked-dates/:id", requireAdminAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    await storage.deleteBlockedDate(id);
    res.json({ success: true });
  });

  // === PRICING RULES ROUTES ===

  // Admin: Get pricing rules
  app.get("/api/admin/pricing-rules", requireAdminAuth, async (req, res) => {
    const propertyId = req.query.propertyId ? parseInt(req.query.propertyId as string, 10) : undefined;
    const rules = await storage.getPricingRules(propertyId);
    res.json(rules);
  });

  // Admin: Create pricing rule
  app.post("/api/admin/pricing-rules", requireAdminAuth, async (req, res) => {
    try {
      const rule = await storage.createPricingRule(req.body);
      res.status(201).json(rule);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.')
        });
      }
      throw err;
    }
  });

  // Admin: Update pricing rule
  app.put("/api/admin/pricing-rules/:id", requireAdminAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const rule = await storage.updatePricingRule(id, req.body);
    if (!rule) {
      return res.status(404).json({ message: "Pricing rule not found" });
    }
    res.json(rule);
  });

  // Admin: Delete pricing rule
  app.delete("/api/admin/pricing-rules/:id", requireAdminAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    await storage.deletePricingRule(id);
    res.json({ success: true });
  });

  // Admin: Get all reservations
  app.get("/api/admin/reservations", requireAdminAuth, async (req, res) => {
    const propertyId = req.query.propertyId ? parseInt(req.query.propertyId as string, 10) : undefined;
    const reservations = await storage.getReservations(propertyId);
    res.json(reservations);
  });

  // Admin: Update reservation status
  app.put("/api/admin/reservations/:id", requireAdminAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const reservation = await storage.updateReservation(id, req.body);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    res.json(reservation);
  });

  // Admin: Get all inquiries
  app.get("/api/admin/inquiries", requireAdminAuth, async (req, res) => {
    const propertyId = req.query.propertyId ? parseInt(req.query.propertyId as string, 10) : undefined;
    const inquiries = await storage.getInquiries(propertyId);
    res.json(inquiries);
  });

  // Admin: Update inquiry
  app.put("/api/admin/inquiries/:id", requireAdminAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const inquiry = await storage.updateInquiry(id, req.body);
    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }
    res.json(inquiry);
  });

  // === COUPON ROUTES ===

  // Public: Validate coupon code
  app.post("/api/coupons/validate", async (req, res) => {
    const { code, subtotal, nights, propertyId, guestEmail } = req.body;
    
    if (!code) {
      return res.status(400).json({ valid: false, message: "Code requis" });
    }

    const coupon = await storage.getCouponByCode(code);
    
    if (!coupon) {
      return res.status(404).json({ valid: false, message: "Code invalide" });
    }

    const validationResult = await validateCouponForReservation({
      coupon,
      subtotal: subtotal !== undefined ? subtotal : undefined,
      nights: nights !== undefined ? nights : undefined,
      propertyId: propertyId !== undefined ? propertyId : undefined,
      guestEmail: guestEmail || undefined,
      getRedemptionsByEmail: storage.getRedemptionsByEmail.bind(storage),
    });

    if (!validationResult.valid) {
      return res.status(400).json({ valid: false, message: validationResult.errorMessage });
    }

    res.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        nameFr: coupon.nameFr,
        nameEn: coupon.nameEn,
        nameEs: coupon.nameEs,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount,
      },
      discountAmount: validationResult.discountAmount || 0,
    });
  });

  // Admin: Get all coupons
  app.get("/api/admin/coupons", requireAdminAuth, async (req, res) => {
    const activeOnly = req.query.active === "true";
    const coupons = await storage.getCoupons(activeOnly);
    res.json(coupons);
  });

  // Admin: Get coupon by ID
  app.get("/api/admin/coupons/:id", requireAdminAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const coupon = await storage.getCouponById(id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.json(coupon);
  });

  // Admin: Create coupon
  app.post("/api/admin/coupons", requireAdminAuth, async (req, res) => {
    try {
      const existingCoupon = await storage.getCouponByCode(req.body.code);
      if (existingCoupon) {
        return res.status(400).json({ message: "Code already exists" });
      }
      const coupon = await storage.createCoupon(req.body);
      res.status(201).json(coupon);
    } catch (error) {
      res.status(400).json({ message: "Invalid coupon data" });
    }
  });

  // Admin: Update coupon
  app.put("/api/admin/coupons/:id", requireAdminAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const coupon = await storage.updateCoupon(id, req.body);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.json(coupon);
  });

  // Admin: Delete coupon
  app.delete("/api/admin/coupons/:id", requireAdminAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    await storage.deleteCoupon(id);
    res.json({ success: true });
  });

  // Admin: Get coupon redemptions
  app.get("/api/admin/coupons/:id/redemptions", requireAdminAuth, async (req, res) => {
    const couponId = parseInt(req.params.id, 10);
    const redemptions = await storage.getCouponRedemptions(couponId);
    res.json(redemptions);
  });

  // === SITE CONFIGURATION (CMS) ===

  // Public: Get site config
  app.get("/api/site-config", async (req, res) => {
    const config = await storage.getSiteConfig();
    res.json(config || null);
  });

  // Admin: Update site config
  app.put("/api/admin/site-config", requireAdminAuth, async (req, res) => {
    try {
      const config = await storage.upsertSiteConfig(req.body);
      res.json(config);
    } catch (error) {
      console.error("Error updating site config:", error);
      res.status(500).json({ message: "Failed to update site configuration" });
    }
  });

  // === CONTENT SECTIONS ===

  // Public: Get all enabled content sections
  app.get("/api/content-sections", async (req, res) => {
    const sections = await storage.getContentSections();
    const enabledSections = sections.filter(s => s.isEnabled);
    res.json(enabledSections);
  });

  // Public: Get content section by type
  app.get("/api/content-sections/:sectionType", async (req, res) => {
    const section = await storage.getContentSectionByType(req.params.sectionType);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }
    res.json(section);
  });

  // Admin: Get all content sections (including disabled)
  app.get("/api/admin/content-sections", requireAdminAuth, async (req, res) => {
    const sections = await storage.getContentSections();
    res.json(sections);
  });

  // Admin: Create content section
  app.post("/api/admin/content-sections", requireAdminAuth, async (req, res) => {
    try {
      const section = await storage.createContentSection(req.body);
      res.json(section);
    } catch (error) {
      console.error("Error creating content section:", error);
      res.status(500).json({ message: "Failed to create content section" });
    }
  });

  // Admin: Update content section
  app.put("/api/admin/content-sections/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid section id" });
      }
      const allowed = [
        "sectionType", "isEnabled", "orderIndex",
        "titleFr", "titleEn", "titleEs", "subtitleFr", "subtitleEn", "subtitleEs",
        "contentFr", "contentEn", "contentEs", "imageUrl", "videoUrl",
        "buttonTextFr", "buttonTextEn", "buttonTextEs", "buttonUrl", "customData",
      ];
      const raw = Object.fromEntries(
        allowed.filter((k) => req.body[k] !== undefined).map((k) => [k, req.body[k]])
      );
      if (raw.orderIndex !== undefined) raw.orderIndex = parseInt(String(raw.orderIndex), 10) || 0;
      if (raw.isEnabled !== undefined) raw.isEnabled = Boolean(raw.isEnabled);
      const section = await storage.updateContentSection(id, raw);
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }
      res.json(section);
    } catch (err) {
      console.error("Update content section error:", err);
      res.status(500).json({ message: "Impossible de mettre à jour la section." });
    }
  });

  // Admin: Delete content section
  app.delete("/api/admin/content-sections/:id", requireAdminAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    await storage.deleteContentSection(id);
    res.json({ success: true });
  });

  // === TRANSLATION API ===
  
  // Admin: Generate translations using AI
  app.post("/api/admin/translate", requireAdminAuth, async (req, res) => {
    try {
      const { texts, sourceLanguage, targetLanguages } = req.body;
      
      if (!texts || !sourceLanguage || !targetLanguages) {
        return res.status(400).json({ message: "Missing required fields: texts, sourceLanguage, targetLanguages" });
      }
      
      const { client: openaiClient } = await getOpenAIClient();
      
      const languageNames: Record<string, string> = {
        fr: "French",
        en: "English", 
        es: "Spanish"
      };
      
      const results: Record<string, Record<string, string>> = {};
      
      for (const targetLang of targetLanguages) {
        if (targetLang === sourceLanguage) continue;
        
        const textsToTranslate = Object.entries(texts)
          .filter(([_, value]) => value && String(value).trim())
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n");
        
        if (!textsToTranslate) continue;
        
        const response = await openaiClient.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a professional translator. Translate the following texts from ${languageNames[sourceLanguage]} to ${languageNames[targetLang]}. 
Maintain the exact same format with "key: translation" on each line.
Keep proper nouns, brand names, and technical terms as appropriate.
Return ONLY the translations, one per line, in the exact same format.`
            },
            {
              role: "user",
              content: textsToTranslate
            }
          ],
          max_tokens: 2000,
          temperature: 0.3
        });
        
        const translatedText = response.choices[0]?.message?.content || "";
        const lines = translatedText.split("\n").filter(line => line.includes(":"));
        
        results[targetLang] = {};
        for (const line of lines) {
          const colonIndex = line.indexOf(":");
          if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim();
            results[targetLang][key] = value;
          }
        }
      }
      
      res.json({ translations: results });
    } catch (error) {
      console.error("Error generating translations:", error);
      res.status(500).json({ message: "Failed to generate translations" });
    }
  });

  // Initialize seed data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingProjects = await storage.getProjects();
  if (existingProjects.length === 0) {
    // Seed some initial portfolio items based on typical creative agency work
    await storage.createProject({
      title: "Campagne Hiver 2024",
      description: "Production vidéo et stratégie sociale pour marque de vêtements.",
      imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
      category: "Vidéo",
      link: "#"
    });
    
    await storage.createProject({
      title: "Refonte Identité Visuelle",
      description: "Modernisation du logo et de la charte graphique pour une startup tech.",
      imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
      category: "Branding",
      link: "#"
    });

    await storage.createProject({
      title: "Application Mobile Santé",
      description: "Design UX/UI et développement d'une app de suivi bien-être.",
      imageUrl: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80",
      category: "Digital",
      link: "#"
    });

     await storage.createProject({
      title: "Documentaire Voyage",
      description: "Série de courts métrages promotionnels pour une agence de tourisme.",
      imageUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80",
      category: "Vidéo",
      link: "#"
    });
  }
}
