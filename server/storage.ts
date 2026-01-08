import { db } from "./db";
import {
  messages,
  subscribers,
  projects,
  blogPosts,
  blogCategories,
  siteSettings,
  aiUsage,
  type InsertMessage,
  type InsertSubscriber,
  type InsertProject,
  type InsertBlogPost,
  type InsertBlogCategory,
  type InsertAiUsage,
  type Message,
  type Subscriber,
  type Project,
  type BlogPost,
  type BlogCategory,
  type SiteSetting,
  type AiUsage
} from "@shared/schema";
import { eq, desc, asc, and, sql, gte } from "drizzle-orm";

export interface IStorage {
  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Subscribers
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  
  // Projects
  getProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  
  // Blog Categories
  getBlogCategories(): Promise<BlogCategory[]>;
  getBlogCategoryById(id: number): Promise<BlogCategory | undefined>;
  createBlogCategory(category: InsertBlogCategory): Promise<BlogCategory>;
  updateBlogCategory(id: number, category: Partial<InsertBlogCategory>): Promise<BlogCategory | undefined>;
  deleteBlogCategory(id: number): Promise<boolean>;
  
  // Blog Posts
  getPublishedBlogPosts(): Promise<BlogPost[]>;
  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPostById(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
  updateBlogPostOrder(id: number, orderIndex: number): Promise<BlogPost | undefined>;
  setFeaturedPost(id: number): Promise<BlogPost | undefined>;
  
  // Site Settings
  getAllSettings(): Promise<SiteSetting[]>;
  getSetting(key: string): Promise<SiteSetting | undefined>;
  upsertSetting(key: string, value: string | null): Promise<SiteSetting>;
  
  // AI Usage Tracking
  recordAiUsage(usage: InsertAiUsage): Promise<AiUsage>;
  getAiUsageStats(): Promise<{
    totalTokens: number;
    totalCost: number;
    usageByDay: { date: string; tokens: number; cost: number }[];
    customKeyUsage: number;
    platformKeyUsage: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Messages
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  // Subscribers
  async createSubscriber(insertSubscriber: InsertSubscriber): Promise<Subscriber> {
    const [subscriber] = await db.insert(subscribers).values(insertSubscriber).returning();
    return subscriber;
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const [subscriber] = await db.select().from(subscribers).where(eq(subscribers.email, email));
    return subscriber;
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  // Blog Categories
  async getBlogCategories(): Promise<BlogCategory[]> {
    return await db.select().from(blogCategories).orderBy(asc(blogCategories.nameFr));
  }

  async getBlogCategoryById(id: number): Promise<BlogCategory | undefined> {
    const [category] = await db.select().from(blogCategories).where(eq(blogCategories.id, id));
    return category;
  }

  async createBlogCategory(category: InsertBlogCategory): Promise<BlogCategory> {
    const [newCategory] = await db.insert(blogCategories).values(category).returning();
    return newCategory;
  }

  async updateBlogCategory(id: number, category: Partial<InsertBlogCategory>): Promise<BlogCategory | undefined> {
    const [updated] = await db.update(blogCategories).set(category).where(eq(blogCategories.id, id)).returning();
    return updated;
  }

  async deleteBlogCategory(id: number): Promise<boolean> {
    const result = await db.delete(blogCategories).where(eq(blogCategories.id, id));
    return true;
  }

  // Blog Posts
  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts)
      .where(eq(blogPosts.isPublished, true))
      .orderBy(desc(blogPosts.isFeatured), asc(blogPosts.orderIndex), desc(blogPosts.publishedAt));
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts)
      .orderBy(desc(blogPosts.isFeatured), asc(blogPosts.orderIndex), desc(blogPosts.createdAt));
  }

  async getBlogPostById(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [newPost] = await db.insert(blogPosts).values(post).returning();
    return newPost;
  }

  async updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const [updated] = await db.update(blogPosts)
      .set({ ...post, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return updated;
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
    return true;
  }

  async updateBlogPostOrder(id: number, orderIndex: number): Promise<BlogPost | undefined> {
    const [updated] = await db.update(blogPosts)
      .set({ orderIndex, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return updated;
  }

  async setFeaturedPost(id: number): Promise<BlogPost | undefined> {
    await db.update(blogPosts).set({ isFeatured: false });
    const [updated] = await db.update(blogPosts)
      .set({ isFeatured: true, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return updated;
  }

  // Site Settings
  async getAllSettings(): Promise<SiteSetting[]> {
    return await db.select().from(siteSettings);
  }

  async getSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting;
  }

  async upsertSetting(key: string, value: string | null): Promise<SiteSetting> {
    const existing = await this.getSetting(key);
    if (existing) {
      const [updated] = await db.update(siteSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(siteSettings.key, key))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(siteSettings)
        .values({ key, value })
        .returning();
      return created;
    }
  }

  // AI Usage Tracking
  async recordAiUsage(usage: InsertAiUsage): Promise<AiUsage> {
    const [record] = await db.insert(aiUsage).values(usage).returning();
    return record;
  }

  async getAiUsageStats() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const allUsage = await db.select().from(aiUsage).where(gte(aiUsage.createdAt, thirtyDaysAgo));

    let totalTokens = 0;
    let totalCost = 0;
    let customKeyUsage = 0;
    let platformKeyUsage = 0;
    const usageByDayMap: Record<string, { tokens: number; cost: number }> = {};

    for (const record of allUsage) {
      totalTokens += record.totalTokens;
      const cost = parseFloat(record.estimatedCost || "0");
      totalCost += cost;

      if (record.useCustomKey) {
        customKeyUsage += record.totalTokens;
      } else {
        platformKeyUsage += record.totalTokens;
      }

      const dateKey = record.createdAt.toISOString().split("T")[0];
      if (!usageByDayMap[dateKey]) {
        usageByDayMap[dateKey] = { tokens: 0, cost: 0 };
      }
      usageByDayMap[dateKey].tokens += record.totalTokens;
      usageByDayMap[dateKey].cost += cost;
    }

    const usageByDay = Object.entries(usageByDayMap)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalTokens,
      totalCost,
      usageByDay,
      customKeyUsage,
      platformKeyUsage,
    };
  }
}

export const storage = new DatabaseStorage();
