import type { Express, Request, Response } from "express";
import type OpenAI from "openai";
import { chatStorage } from "./storage";
import { db } from "../../db";
import { knowledgeBase } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getOpenAIClient } from "../../routes";
import { storage } from "../../storage";

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function estimateCost(inputTokens: number, outputTokens: number, model: string): string {
  const pricing: Record<string, { input: number; output: number }> = {
    "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
    "gpt-4o": { input: 0.0025, output: 0.01 },
  };
  const modelPricing = pricing[model] || pricing["gpt-4o-mini"];
  const cost = (inputTokens / 1000) * modelPricing.input + (outputTokens / 1000) * modelPricing.output;
  return cost.toFixed(6);
}

// Validation schemas
const createSessionSchema = z.object({
  visitorId: z.string().min(1, "Visitor ID is required"),
  language: z.enum(["fr", "en", "es"]).optional().default("fr"),
});

const createMessageSchema = z.object({
  content: z.string().min(1, "Message content is required").max(2000),
  language: z.enum(["fr", "en", "es"]).optional().default("fr"),
});

const createKnowledgeDocSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required").max(10000),
  language: z.enum(["fr", "en", "es"]).optional().default("fr"),
  category: z.string().max(100).optional(),
});

const updateKnowledgeDocSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(10000).optional(),
  language: z.enum(["fr", "en", "es"]).optional(),
  category: z.string().max(100).optional().nullable(),
  isActive: z.boolean().optional(),
});

// Admin key check - requires ADMIN_SECRET_KEY to be set
function requireAdmin(req: Request, res: Response): boolean {
  const adminKey = process.env.ADMIN_SECRET_KEY;
  
  // Fail if admin key is not configured
  if (!adminKey) {
    console.error("ADMIN_SECRET_KEY environment variable is not set");
    res.status(503).json({ error: "Admin access not configured" });
    return false;
  }
  
  const providedKey = req.headers["x-admin-key"] || req.query.adminKey;
  if (providedKey !== adminKey) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

const SYSTEM_PROMPT = `Tu es l'assistant virtuel de QUEBEXICO, une agence créative stratégique basée au Québec. 

Ton rôle est d'aider les visiteurs à:
- Comprendre les services de l'agence (Stratégie & Positionnement, Image de marque, Expériences digitales, Activation & Croissance)
- Répondre aux questions sur l'approche et la philosophie de l'agence
- Qualifier les prospects et les orienter vers une prise de rendez-vous
- Fournir des informations pratiques

Sois professionnel, chaleureux et concis. Réponds dans la langue de l'utilisateur (français, anglais ou espagnol).

PRISE DE RENDEZ-VOUS:
Quand quelqu'un veut prendre rendez-vous ou parler à l'équipe, propose TOUJOURS les deux options suivantes:
1. Appel découverte (15 min, gratuit) - pour explorer les besoins: /book/discovery
2. Consultation expert (45 min) - pour une analyse approfondie: /book/expert

Exemple de réponse pour une demande de rendez-vous:
"Parfait ! Voici nos options de rendez-vous:
- Appel découverte (15 min, gratuit): [Réserver ici](/book/discovery)
- Consultation expert (45 min): [Réserver ici](/book/expert)

Vous pouvez aussi nous contacter à salut@quebexico.co"

INFORMATIONS SUR L'AGENCE:
`;

export function registerChatRoutes(app: Express): void {
  // === ADMIN ROUTES (require authentication) ===
  
  // Get all chat sessions (admin only)
  app.get("/api/admin/chat/sessions", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const sessions = await chatStorage.getAllSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  // Get single session with messages (admin only)
  app.get("/api/admin/chat/sessions/:id", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid session ID" });
      }
      const session = await chatStorage.getSession(id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      const messages = await chatStorage.getMessagesBySession(id);
      res.json({ ...session, messages });
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  // Delete session (admin only)
  app.delete("/api/admin/chat/sessions/:id", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid session ID" });
      }
      await chatStorage.deleteSession(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting session:", error);
      res.status(500).json({ error: "Failed to delete session" });
    }
  });

  // === KNOWLEDGE BASE ROUTES (admin only) ===

  app.get("/api/admin/knowledge-base", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const docs = await db.select().from(knowledgeBase);
      res.json(docs);
    } catch (error) {
      console.error("Error fetching knowledge base:", error);
      res.status(500).json({ error: "Failed to fetch knowledge base" });
    }
  });

  app.post("/api/admin/knowledge-base", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const parseResult = createKnowledgeDocSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: parseResult.error.errors[0].message,
          field: parseResult.error.errors[0].path.join(".")
        });
      }
      const { title, content, language, category } = parseResult.data;
      const [doc] = await db.insert(knowledgeBase).values({ 
        title, 
        content, 
        language,
        category 
      }).returning();
      res.status(201).json(doc);
    } catch (error) {
      console.error("Error creating knowledge base doc:", error);
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  app.put("/api/admin/knowledge-base/:id", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid document ID" });
      }
      const parseResult = updateKnowledgeDocSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: parseResult.error.errors[0].message,
          field: parseResult.error.errors[0].path.join(".")
        });
      }
      const [doc] = await db.update(knowledgeBase)
        .set(parseResult.data)
        .where(eq(knowledgeBase.id, id))
        .returning();
      res.json(doc);
    } catch (error) {
      console.error("Error updating knowledge base doc:", error);
      res.status(500).json({ error: "Failed to update document" });
    }
  });

  app.delete("/api/admin/knowledge-base/:id", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid document ID" });
      }
      await db.delete(knowledgeBase).where(eq(knowledgeBase.id, id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting knowledge base doc:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // === PUBLIC ROUTES (for chat widget) ===

  // Create or get existing session (public)
  app.post("/api/chat/sessions", async (req: Request, res: Response) => {
    try {
      const parseResult = createSessionSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: parseResult.error.errors[0].message,
          field: parseResult.error.errors[0].path.join(".")
        });
      }
      const { visitorId, language } = parseResult.data;
      
      // Check if session exists
      let session = await chatStorage.getSessionByVisitor(visitorId);
      if (!session) {
        session = await chatStorage.createSession(visitorId, language);
      }
      
      const messages = await chatStorage.getMessagesBySession(session.id);
      res.status(201).json({ ...session, messages });
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // Send message and get AI response (streaming) - public
  app.post("/api/chat/sessions/:id/messages", async (req: Request, res: Response) => {
    try {
      const sessionId = parseInt(req.params.id);
      if (isNaN(sessionId)) {
        return res.status(400).json({ error: "Invalid session ID" });
      }

      const parseResult = createMessageSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: parseResult.error.errors[0].message,
          field: parseResult.error.errors[0].path.join(".")
        });
      }
      const { content, language } = parseResult.data;

      // Verify session exists
      const session = await chatStorage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Save user message
      await chatStorage.createMessage(sessionId, "user", content);

      // Get session messages for context
      const sessionMessages = await chatStorage.getMessagesBySession(sessionId);
      
      // Get knowledge base for context
      const kbDocs = await chatStorage.getKnowledgeBase(language);
      const kbContext = kbDocs.map(doc => `${doc.title}: ${doc.content}`).join("\n\n");

      const chatMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: SYSTEM_PROMPT + kbContext },
        ...sessionMessages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      // Set up SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Get OpenAI client (custom key if configured, otherwise platform key)
      let openaiClient: OpenAI;
      let usedCustomKey: boolean;
      try {
        const result = await getOpenAIClient();
        openaiClient = result.client;
        usedCustomKey = result.usedCustomKey;
      } catch (err: any) {
        if (err?.message?.includes("credentials") || err?.message?.includes("configuré") || err?.message?.includes("API key")) {
          if (!res.headersSent) res.status(503).json({ error: "Chat non configuré. Définis AI_INTEGRATIONS_OPENAI_API_KEY ou Admin → Intégrations." });
          return;
        }
        throw err;
      }

      // Stream response from OpenAI
      const stream = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: chatMessages,
        stream: true,
        max_tokens: 1024,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const chunkContent = chunk.choices[0]?.delta?.content || "";
        if (chunkContent) {
          fullResponse += chunkContent;
          res.write(`data: ${JSON.stringify({ content: chunkContent })}\n\n`);
        }
      }

      // Save assistant message
      await chatStorage.createMessage(sessionId, "assistant", fullResponse);

      // Track AI usage
      const inputText = chatMessages.map(m => m.content).join(" ");
      const inputTokens = estimateTokens(inputText);
      const outputTokens = estimateTokens(fullResponse);
      const totalTokens = inputTokens + outputTokens;
      const model = "gpt-4o-mini";

      await storage.recordAiUsage({
        model,
        inputTokens,
        outputTokens,
        totalTokens,
        estimatedCost: estimateCost(inputTokens, outputTokens, model),
        sessionId,
        useCustomKey: usedCustomKey,
      });

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error sending message:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to send message" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to send message" });
      }
    }
  });
}
