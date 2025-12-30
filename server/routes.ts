import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { registerChatRoutes } from "./replit_integrations/chat";

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
