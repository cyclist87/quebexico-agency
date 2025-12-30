import { db } from "../../db";
import { chatSessions, chatMessages, knowledgeBase } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IChatStorage {
  getSession(id: number): Promise<typeof chatSessions.$inferSelect | undefined>;
  getSessionByVisitor(visitorId: string): Promise<typeof chatSessions.$inferSelect | undefined>;
  getAllSessions(): Promise<(typeof chatSessions.$inferSelect)[]>;
  createSession(visitorId: string, language?: string): Promise<typeof chatSessions.$inferSelect>;
  updateSessionEmail(id: number, email: string): Promise<void>;
  deleteSession(id: number): Promise<void>;
  getMessagesBySession(sessionId: number): Promise<(typeof chatMessages.$inferSelect)[]>;
  createMessage(sessionId: number, role: string, content: string): Promise<typeof chatMessages.$inferSelect>;
  getKnowledgeBase(language?: string): Promise<(typeof knowledgeBase.$inferSelect)[]>;
}

export const chatStorage: IChatStorage = {
  async getSession(id: number) {
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
    return session;
  },

  async getSessionByVisitor(visitorId: string) {
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.visitorId, visitorId));
    return session;
  },

  async getAllSessions() {
    return db.select().from(chatSessions).orderBy(desc(chatSessions.createdAt));
  },

  async createSession(visitorId: string, language?: string) {
    const [session] = await db.insert(chatSessions).values({ 
      visitorId, 
      language: language || "fr" 
    }).returning();
    return session;
  },

  async updateSessionEmail(id: number, email: string) {
    await db.update(chatSessions).set({ email }).where(eq(chatSessions.id, id));
  },

  async deleteSession(id: number) {
    await db.delete(chatMessages).where(eq(chatMessages.sessionId, id));
    await db.delete(chatSessions).where(eq(chatSessions.id, id));
  },

  async getMessagesBySession(sessionId: number) {
    return db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId)).orderBy(chatMessages.createdAt);
  },

  async createMessage(sessionId: number, role: string, content: string) {
    const [message] = await db.insert(chatMessages).values({ sessionId, role, content }).returning();
    return message;
  },

  async getKnowledgeBase(language?: string) {
    if (language) {
      return db.select().from(knowledgeBase).where(eq(knowledgeBase.language, language));
    }
    return db.select().from(knowledgeBase);
  },
};
