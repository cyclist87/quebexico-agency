import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// === TABLE DEFINITIONS ===

// Store contact form messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Store newsletter subscribers
export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Optional: Dynamic projects if you want to manage them via DB later
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  link: text("link"),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === CHATBOT TABLES ===

// Chat sessions/conversations
export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  visitorId: text("visitor_id").notNull(),
  language: text("language").default("fr"),
  email: text("email"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Chat messages
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => chatSessions.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Knowledge base documents
export const knowledgeBase = pgTable("knowledge_base", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  language: text("language").default("fr"),
  category: text("category"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Admin users
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// === SITE SETTINGS ===

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// === BLOG TABLES ===

// Blog categories
export const blogCategories = pgTable("blog_categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameFr: text("name_fr").notNull(),
  nameEn: text("name_en").notNull(),
  nameEs: text("name_es").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Blog posts with multilingual support
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  titleFr: text("title_fr").notNull(),
  titleEn: text("title_en").notNull(),
  titleEs: text("title_es").notNull(),
  excerptFr: text("excerpt_fr"),
  excerptEn: text("excerpt_en"),
  excerptEs: text("excerpt_es"),
  contentFr: text("content_fr").notNull(),
  contentEn: text("content_en").notNull(),
  contentEs: text("content_es").notNull(),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  categoryId: integer("category_id").references(() => blogCategories.id),
  tags: text("tags").array(),
  isFeatured: boolean("is_featured").default(false),
  isPublished: boolean("is_published").default(false),
  orderIndex: integer("order_index").default(0),
  authorName: text("author_name"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// === DIGITAL CARDS ===

export const digitalCards = pgTable("digital_cards", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  fullName: text("full_name").notNull(),
  jobTitle: text("job_title"),
  company: text("company"),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  linkedin: text("linkedin"),
  facebook: text("facebook"),
  instagram: text("instagram"),
  twitter: text("twitter"),
  photoUrl: text("photo_url"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#2563eb"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// === EMAIL SIGNATURES ===

export const emailSignatures = pgTable("email_signatures", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  fullName: text("full_name").notNull(),
  jobTitle: text("job_title"),
  company: text("company"),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  linkedin: text("linkedin"),
  facebook: text("facebook"),
  instagram: text("instagram"),
  twitter: text("twitter"),
  photoUrl: text("photo_url"),
  logoUrl: text("logo_url"),
  template: text("template").default("modern"),
  primaryColor: text("primary_color").default("#2563eb"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// === AI USAGE TRACKING ===

export const aiUsage = pgTable("ai_usage", {
  id: serial("id").primaryKey(),
  model: text("model").notNull(),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  totalTokens: integer("total_tokens").notNull().default(0),
  estimatedCost: text("estimated_cost"),
  sessionId: integer("session_id").references(() => chatSessions.id, { onDelete: "set null" }),
  useCustomKey: boolean("use_custom_key").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// === SCHEMAS ===

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertSubscriberSchema = createInsertSchema(subscribers).omit({ id: true, isActive: true, createdAt: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export const insertKnowledgeBaseSchema = createInsertSchema(knowledgeBase).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({ id: true, createdAt: true });

export const insertBlogCategorySchema = createInsertSchema(blogCategories).omit({ id: true, createdAt: true });
export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiUsageSchema = createInsertSchema(aiUsage).omit({ id: true, createdAt: true });
export const insertDigitalCardSchema = createInsertSchema(digitalCards).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEmailSignatureSchema = createInsertSchema(emailSignatures).omit({ id: true, createdAt: true, updatedAt: true });

// === EXPLICIT TYPES ===

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type KnowledgeBaseDoc = typeof knowledgeBase.$inferSelect;
export type InsertKnowledgeBaseDoc = z.infer<typeof insertKnowledgeBaseSchema>;

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;

export type BlogCategory = typeof blogCategories.$inferSelect;
export type InsertBlogCategory = z.infer<typeof insertBlogCategorySchema>;

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;

export type AiUsage = typeof aiUsage.$inferSelect;
export type InsertAiUsage = z.infer<typeof insertAiUsageSchema>;

export type DigitalCard = typeof digitalCards.$inferSelect;
export type InsertDigitalCard = z.infer<typeof insertDigitalCardSchema>;

export type EmailSignature = typeof emailSignatures.$inferSelect;
export type InsertEmailSignature = z.infer<typeof insertEmailSignatureSchema>;

// API Request/Response Types
export type CreateMessageRequest = InsertMessage;
export type CreateSubscriberRequest = InsertSubscriber;
