import type { Express, Request, Response } from "express";
import OpenAI from "openai";
import { chatStorage } from "./storage";
import { db } from "../../db";
import { knowledgeBase } from "@shared/schema";
import { eq } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const SYSTEM_PROMPT = `Tu es l'assistant virtuel de QUEBEXICO, une agence créative stratégique basée au Québec. 

Ton rôle est d'aider les visiteurs à:
- Comprendre les services de l'agence (Stratégie & Positionnement, Image de marque, Expériences digitales, Activation & Croissance)
- Répondre aux questions sur l'approche et la philosophie de l'agence
- Qualifier les prospects et les orienter vers une prise de rendez-vous
- Fournir des informations pratiques

Sois professionnel, chaleureux et concis. Réponds dans la langue de l'utilisateur (français, anglais ou espagnol).
Si tu ne connais pas la réponse, invite l'utilisateur à contacter l'équipe à salut@quebexico.co ou à prendre rendez-vous.

INFORMATIONS SUR L'AGENCE:
`;

export function registerChatRoutes(app: Express): void {
  // Get all chat sessions (admin)
  app.get("/api/chat/sessions", async (req: Request, res: Response) => {
    try {
      const sessions = await chatStorage.getAllSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  // Get single session with messages (admin)
  app.get("/api/chat/sessions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
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

  // Create or get existing session (public)
  app.post("/api/chat/sessions", async (req: Request, res: Response) => {
    try {
      const { visitorId, language } = req.body;
      
      // Check if session exists
      let session = await chatStorage.getSessionByVisitor(visitorId);
      if (!session) {
        session = await chatStorage.createSession(visitorId, language || "fr");
      }
      
      const messages = await chatStorage.getMessagesBySession(session.id);
      res.status(201).json({ ...session, messages });
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // Update session with email
  app.patch("/api/chat/sessions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { email } = req.body;
      await chatStorage.updateSessionEmail(id, email);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  // Delete session (admin)
  app.delete("/api/chat/sessions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await chatStorage.deleteSession(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting session:", error);
      res.status(500).json({ error: "Failed to delete session" });
    }
  });

  // Send message and get AI response (streaming) - public
  app.post("/api/chat/sessions/:id/messages", async (req: Request, res: Response) => {
    try {
      const sessionId = parseInt(req.params.id);
      const { content, language } = req.body;

      // Save user message
      await chatStorage.createMessage(sessionId, "user", content);

      // Get session messages for context
      const sessionMessages = await chatStorage.getMessagesBySession(sessionId);
      
      // Get knowledge base for context
      const kbDocs = await chatStorage.getKnowledgeBase(language || "fr");
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

      // Stream response from OpenAI
      const stream = await openai.chat.completions.create({
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

  // === KNOWLEDGE BASE ROUTES (admin) ===

  app.get("/api/admin/knowledge-base", async (req: Request, res: Response) => {
    try {
      const docs = await db.select().from(knowledgeBase);
      res.json(docs);
    } catch (error) {
      console.error("Error fetching knowledge base:", error);
      res.status(500).json({ error: "Failed to fetch knowledge base" });
    }
  });

  app.post("/api/admin/knowledge-base", async (req: Request, res: Response) => {
    try {
      const { title, content, language, category } = req.body;
      const [doc] = await db.insert(knowledgeBase).values({ 
        title, 
        content, 
        language: language || "fr",
        category 
      }).returning();
      res.status(201).json(doc);
    } catch (error) {
      console.error("Error creating knowledge base doc:", error);
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  app.put("/api/admin/knowledge-base/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { title, content, language, category, isActive } = req.body;
      const [doc] = await db.update(knowledgeBase)
        .set({ title, content, language, category, isActive })
        .where(eq(knowledgeBase.id, id))
        .returning();
      res.json(doc);
    } catch (error) {
      console.error("Error updating knowledge base doc:", error);
      res.status(500).json({ error: "Failed to update document" });
    }
  });

  app.delete("/api/admin/knowledge-base/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(knowledgeBase).where(eq(knowledgeBase.id, id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting knowledge base doc:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  });
}
