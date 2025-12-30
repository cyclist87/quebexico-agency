import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { registerChatRoutes } from "./replit_integrations/chat";

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || "admin-secret-key";

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
