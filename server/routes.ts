import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { registerChatRoutes } from "./replit_integrations/chat";
import OpenAI from "openai";
import { encrypt, decrypt, isEncrypted } from "./utils/encryption";

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || "admin-secret-key";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function getOpenAIClient(): Promise<OpenAI> {
  try {
    const setting = await storage.getSetting("openai_api_key");
    if (setting?.value) {
      const decryptedKey = isEncrypted(setting.value) 
        ? decrypt(setting.value) 
        : setting.value;
      return new OpenAI({ apiKey: decryptedKey });
    }
  } catch (error) {
    console.error("Error getting custom OpenAI key, using platform key:", error);
  }
  return openai;
}

function requireAdminAuth(req: any, res: any, next: any) {
  const adminKey = req.headers["x-admin-key"];
  if (adminKey !== ADMIN_SECRET_KEY) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Register chatbot routes
  registerChatRoutes(app);
  
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

  // Get all settings
  app.get(api.admin.settings.get.path, requireAdminAuth, async (req, res) => {
    const settings = await storage.getAllSettings();
    res.json(settings);
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
      
      // Encrypt OpenAI API key before storing
      if (req.params.key === "openai_api_key" && value) {
        value = encrypt(value);
      }
      
      const setting = await storage.upsertSetting(req.params.key, value);
      
      // For sensitive keys, don't return the actual value
      if (req.params.key === "openai_api_key" && setting.value) {
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

      const response = await openai.chat.completions.create({
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
