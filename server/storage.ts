import { db } from "./db";
import {
  messages,
  subscribers,
  projects,
  blogPosts,
  blogCategories,
  siteSettings,
  aiUsage,
  digitalCards,
  emailSignatures,
  properties,
  blockedDates,
  reservations,
  inquiries,
  coupons,
  couponRedemptions,
  siteConfig,
  contentSections,
  templateFeatures,
  type InsertMessage,
  type InsertSubscriber,
  type InsertProject,
  type InsertBlogPost,
  type InsertBlogCategory,
  type InsertAiUsage,
  type InsertDigitalCard,
  type InsertEmailSignature,
  type InsertProperty,
  type InsertBlockedDate,
  type InsertReservation,
  type InsertInquiry,
  type InsertCoupon,
  type InsertCouponRedemption,
  type InsertSiteConfig,
  type InsertContentSection,
  type Message,
  type Subscriber,
  type Project,
  type BlogPost,
  type BlogCategory,
  type SiteSetting,
  type AiUsage,
  type DigitalCard,
  type EmailSignature,
  type Property,
  type BlockedDate,
  type Reservation,
  type Inquiry,
  type Coupon,
  type CouponRedemption,
  type SiteConfigType,
  type ContentSection,
  type TemplateFeature
} from "@shared/schema";
import { eq, desc, asc, and, sql, gte, lte, or } from "drizzle-orm";

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
  
  // Digital Cards
  getDigitalCards(): Promise<DigitalCard[]>;
  getDigitalCardById(id: number): Promise<DigitalCard | undefined>;
  getDigitalCardBySlug(slug: string): Promise<DigitalCard | undefined>;
  createDigitalCard(card: InsertDigitalCard): Promise<DigitalCard>;
  updateDigitalCard(id: number, card: Partial<InsertDigitalCard>): Promise<DigitalCard | undefined>;
  deleteDigitalCard(id: number): Promise<boolean>;
  
  // Email Signatures
  getEmailSignatures(): Promise<EmailSignature[]>;
  getEmailSignatureById(id: number): Promise<EmailSignature | undefined>;
  getEmailSignatureBySlug(slug: string): Promise<EmailSignature | undefined>;
  createEmailSignature(signature: InsertEmailSignature): Promise<EmailSignature>;
  updateEmailSignature(id: number, signature: Partial<InsertEmailSignature>): Promise<EmailSignature | undefined>;
  deleteEmailSignature(id: number): Promise<boolean>;
  
  // Properties (STR)
  getProperties(activeOnly?: boolean): Promise<Property[]>;
  getPropertyById(id: number): Promise<Property | undefined>;
  getPropertyBySlug(slug: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;
  
  // Blocked Dates
  getBlockedDates(propertyId: number, startDate?: Date, endDate?: Date): Promise<BlockedDate[]>;
  createBlockedDate(blockedDate: InsertBlockedDate): Promise<BlockedDate>;
  deleteBlockedDate(id: number): Promise<boolean>;
  
  // Reservations
  getReservations(propertyId?: number): Promise<Reservation[]>;
  getReservationById(id: number): Promise<Reservation | undefined>;
  getReservationByCode(code: string): Promise<Reservation | undefined>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  updateReservation(id: number, reservation: Partial<InsertReservation>): Promise<Reservation | undefined>;
  
  // Inquiries
  getInquiries(propertyId?: number): Promise<Inquiry[]>;
  getInquiryById(id: number): Promise<Inquiry | undefined>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  updateInquiry(id: number, inquiry: Partial<InsertInquiry>): Promise<Inquiry | undefined>;
  
  // Coupons
  getCoupons(activeOnly?: boolean): Promise<Coupon[]>;
  getCouponById(id: number): Promise<Coupon | undefined>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: number, coupon: Partial<InsertCoupon>): Promise<Coupon | undefined>;
  deleteCoupon(id: number): Promise<boolean>;
  incrementCouponRedemption(id: number): Promise<Coupon | undefined>;
  
  // Coupon Redemptions
  getCouponRedemptions(couponId?: number): Promise<CouponRedemption[]>;
  createCouponRedemption(redemption: InsertCouponRedemption): Promise<CouponRedemption>;
  getRedemptionsByEmail(email: string, couponId: number): Promise<CouponRedemption[]>;
  
  // Site Configuration (CMS)
  getSiteConfig(): Promise<SiteConfigType | undefined>;
  upsertSiteConfig(config: InsertSiteConfig): Promise<SiteConfigType>;
  
  // Content Sections
  getContentSections(): Promise<ContentSection[]>;
  getContentSectionById(id: number): Promise<ContentSection | undefined>;
  getContentSectionByType(sectionType: string): Promise<ContentSection | undefined>;
  createContentSection(section: InsertContentSection): Promise<ContentSection>;
  updateContentSection(id: number, section: Partial<InsertContentSection>): Promise<ContentSection | undefined>;
  deleteContentSection(id: number): Promise<boolean>;
  
  // Template Features
  getTemplateFeatures(): Promise<TemplateFeature[]>;
  getTemplateFeatureByType(templateType: string): Promise<TemplateFeature | undefined>;
  upsertTemplateFeature(templateType: string, enabledFeatures: string[]): Promise<TemplateFeature>;
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

  // Digital Cards
  async getDigitalCards(): Promise<DigitalCard[]> {
    return await db.select().from(digitalCards).orderBy(desc(digitalCards.createdAt));
  }

  async getDigitalCardById(id: number): Promise<DigitalCard | undefined> {
    const [card] = await db.select().from(digitalCards).where(eq(digitalCards.id, id));
    return card;
  }

  async getDigitalCardBySlug(slug: string): Promise<DigitalCard | undefined> {
    const [card] = await db.select().from(digitalCards).where(eq(digitalCards.slug, slug));
    return card;
  }

  async createDigitalCard(card: InsertDigitalCard): Promise<DigitalCard> {
    const [newCard] = await db.insert(digitalCards).values(card).returning();
    return newCard;
  }

  async updateDigitalCard(id: number, card: Partial<InsertDigitalCard>): Promise<DigitalCard | undefined> {
    const [updated] = await db.update(digitalCards)
      .set({ ...card, updatedAt: new Date() })
      .where(eq(digitalCards.id, id))
      .returning();
    return updated;
  }

  async deleteDigitalCard(id: number): Promise<boolean> {
    await db.delete(digitalCards).where(eq(digitalCards.id, id));
    return true;
  }

  // Email Signatures
  async getEmailSignatures(): Promise<EmailSignature[]> {
    return await db.select().from(emailSignatures).orderBy(desc(emailSignatures.createdAt));
  }

  async getEmailSignatureById(id: number): Promise<EmailSignature | undefined> {
    const [signature] = await db.select().from(emailSignatures).where(eq(emailSignatures.id, id));
    return signature;
  }

  async getEmailSignatureBySlug(slug: string): Promise<EmailSignature | undefined> {
    const [signature] = await db.select().from(emailSignatures).where(eq(emailSignatures.slug, slug));
    return signature;
  }

  async createEmailSignature(signature: InsertEmailSignature): Promise<EmailSignature> {
    const [newSignature] = await db.insert(emailSignatures).values(signature).returning();
    return newSignature;
  }

  async updateEmailSignature(id: number, signature: Partial<InsertEmailSignature>): Promise<EmailSignature | undefined> {
    const [updated] = await db.update(emailSignatures)
      .set({ ...signature, updatedAt: new Date() })
      .where(eq(emailSignatures.id, id))
      .returning();
    return updated;
  }

  async deleteEmailSignature(id: number): Promise<boolean> {
    await db.delete(emailSignatures).where(eq(emailSignatures.id, id));
    return true;
  }

  // Properties (STR)
  async getProperties(activeOnly = false): Promise<Property[]> {
    if (activeOnly) {
      return await db.select().from(properties)
        .where(eq(properties.isActive, true))
        .orderBy(asc(properties.orderIndex), desc(properties.createdAt));
    }
    return await db.select().from(properties).orderBy(asc(properties.orderIndex), desc(properties.createdAt));
  }

  async getPropertyById(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async getPropertyBySlug(slug: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.slug, slug));
    return property;
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db.insert(properties).values(property).returning();
    return newProperty;
  }

  async updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined> {
    const [updated] = await db.update(properties)
      .set({ ...property, updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning();
    return updated;
  }

  async deleteProperty(id: number): Promise<boolean> {
    await db.delete(properties).where(eq(properties.id, id));
    return true;
  }

  // Blocked Dates
  async getBlockedDates(propertyId: number, startDate?: Date, endDate?: Date): Promise<BlockedDate[]> {
    let query = db.select().from(blockedDates).where(eq(blockedDates.propertyId, propertyId));
    
    if (startDate && endDate) {
      return await db.select().from(blockedDates).where(
        and(
          eq(blockedDates.propertyId, propertyId),
          or(
            and(gte(blockedDates.startDate, startDate), lte(blockedDates.startDate, endDate)),
            and(gte(blockedDates.endDate, startDate), lte(blockedDates.endDate, endDate)),
            and(lte(blockedDates.startDate, startDate), gte(blockedDates.endDate, endDate))
          )
        )
      ).orderBy(asc(blockedDates.startDate));
    }
    
    return await query.orderBy(asc(blockedDates.startDate));
  }

  async createBlockedDate(blockedDate: InsertBlockedDate): Promise<BlockedDate> {
    const [newBlocked] = await db.insert(blockedDates).values(blockedDate).returning();
    return newBlocked;
  }

  async deleteBlockedDate(id: number): Promise<boolean> {
    await db.delete(blockedDates).where(eq(blockedDates.id, id));
    return true;
  }

  // Reservations
  async getReservations(propertyId?: number): Promise<Reservation[]> {
    if (propertyId) {
      return await db.select().from(reservations)
        .where(eq(reservations.propertyId, propertyId))
        .orderBy(desc(reservations.createdAt));
    }
    return await db.select().from(reservations).orderBy(desc(reservations.createdAt));
  }

  async getReservationById(id: number): Promise<Reservation | undefined> {
    const [reservation] = await db.select().from(reservations).where(eq(reservations.id, id));
    return reservation;
  }

  async getReservationByCode(code: string): Promise<Reservation | undefined> {
    const [reservation] = await db.select().from(reservations).where(eq(reservations.confirmationCode, code));
    return reservation;
  }

  async createReservation(reservation: InsertReservation): Promise<Reservation> {
    const [newReservation] = await db.insert(reservations).values(reservation).returning();
    return newReservation;
  }

  async updateReservation(id: number, reservation: Partial<InsertReservation>): Promise<Reservation | undefined> {
    const [updated] = await db.update(reservations)
      .set({ ...reservation, updatedAt: new Date() })
      .where(eq(reservations.id, id))
      .returning();
    return updated;
  }

  // Inquiries
  async getInquiries(propertyId?: number): Promise<Inquiry[]> {
    if (propertyId) {
      return await db.select().from(inquiries)
        .where(eq(inquiries.propertyId, propertyId))
        .orderBy(desc(inquiries.createdAt));
    }
    return await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
  }

  async getInquiryById(id: number): Promise<Inquiry | undefined> {
    const [inquiry] = await db.select().from(inquiries).where(eq(inquiries.id, id));
    return inquiry;
  }

  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const [newInquiry] = await db.insert(inquiries).values(inquiry).returning();
    return newInquiry;
  }

  async updateInquiry(id: number, inquiry: Partial<InsertInquiry>): Promise<Inquiry | undefined> {
    const [updated] = await db.update(inquiries)
      .set(inquiry)
      .where(eq(inquiries.id, id))
      .returning();
    return updated;
  }

  // Coupons
  async getCoupons(activeOnly?: boolean): Promise<Coupon[]> {
    if (activeOnly) {
      return await db.select().from(coupons)
        .where(eq(coupons.isActive, true))
        .orderBy(desc(coupons.createdAt));
    }
    return await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  }

  async getCouponById(id: number): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id));
    return coupon;
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons)
      .where(sql`UPPER(${coupons.code}) = UPPER(${code})`);
    return coupon;
  }

  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const [newCoupon] = await db.insert(coupons).values({
      ...coupon,
      code: coupon.code.toUpperCase()
    }).returning();
    return newCoupon;
  }

  async updateCoupon(id: number, coupon: Partial<InsertCoupon>): Promise<Coupon | undefined> {
    const updateData = coupon.code 
      ? { ...coupon, code: coupon.code.toUpperCase(), updatedAt: new Date() }
      : { ...coupon, updatedAt: new Date() };
    const [updated] = await db.update(coupons)
      .set(updateData)
      .where(eq(coupons.id, id))
      .returning();
    return updated;
  }

  async deleteCoupon(id: number): Promise<boolean> {
    await db.delete(coupons).where(eq(coupons.id, id));
    return true;
  }

  async incrementCouponRedemption(id: number): Promise<Coupon | undefined> {
    const [updated] = await db.update(coupons)
      .set({ 
        currentRedemptions: sql`${coupons.currentRedemptions} + 1`,
        updatedAt: new Date()
      })
      .where(eq(coupons.id, id))
      .returning();
    return updated;
  }

  // Coupon Redemptions
  async getCouponRedemptions(couponId?: number): Promise<CouponRedemption[]> {
    if (couponId) {
      return await db.select().from(couponRedemptions)
        .where(eq(couponRedemptions.couponId, couponId))
        .orderBy(desc(couponRedemptions.createdAt));
    }
    return await db.select().from(couponRedemptions).orderBy(desc(couponRedemptions.createdAt));
  }

  async createCouponRedemption(redemption: InsertCouponRedemption): Promise<CouponRedemption> {
    const [newRedemption] = await db.insert(couponRedemptions).values(redemption).returning();
    return newRedemption;
  }

  async getRedemptionsByEmail(email: string, couponId: number): Promise<CouponRedemption[]> {
    return await db.select().from(couponRedemptions)
      .where(and(
        sql`LOWER(${couponRedemptions.guestEmail}) = LOWER(${email})`,
        eq(couponRedemptions.couponId, couponId)
      ))
      .orderBy(desc(couponRedemptions.createdAt));
  }

  // Site Configuration (CMS)
  async getSiteConfig(): Promise<SiteConfigType | undefined> {
    const [config] = await db.select().from(siteConfig).limit(1);
    return config;
  }

  async upsertSiteConfig(config: InsertSiteConfig): Promise<SiteConfigType> {
    const existing = await this.getSiteConfig();
    if (existing) {
      const [updated] = await db.update(siteConfig)
        .set({ ...config, updatedAt: new Date() })
        .where(eq(siteConfig.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(siteConfig).values(config).returning();
      return created;
    }
  }

  // Content Sections
  async getContentSections(): Promise<ContentSection[]> {
    return await db.select().from(contentSections).orderBy(asc(contentSections.orderIndex));
  }

  async getContentSectionById(id: number): Promise<ContentSection | undefined> {
    const [section] = await db.select().from(contentSections).where(eq(contentSections.id, id));
    return section;
  }

  async getContentSectionByType(sectionType: string): Promise<ContentSection | undefined> {
    const [section] = await db.select().from(contentSections).where(eq(contentSections.sectionType, sectionType));
    return section;
  }

  async createContentSection(section: InsertContentSection): Promise<ContentSection> {
    const [created] = await db.insert(contentSections).values(section).returning();
    return created;
  }

  async updateContentSection(id: number, section: Partial<InsertContentSection>): Promise<ContentSection | undefined> {
    const [updated] = await db.update(contentSections)
      .set({ ...section, updatedAt: new Date() })
      .where(eq(contentSections.id, id))
      .returning();
    return updated;
  }

  async deleteContentSection(id: number): Promise<boolean> {
    await db.delete(contentSections).where(eq(contentSections.id, id));
    return true;
  }

  // Template Features
  async getTemplateFeatures(): Promise<TemplateFeature[]> {
    return await db.select().from(templateFeatures);
  }

  async getTemplateFeatureByType(templateType: string): Promise<TemplateFeature | undefined> {
    const [feature] = await db.select().from(templateFeatures).where(eq(templateFeatures.templateType, templateType));
    return feature;
  }

  async upsertTemplateFeature(templateType: string, enabledFeatures: string[]): Promise<TemplateFeature> {
    const existing = await this.getTemplateFeatureByType(templateType);
    if (existing) {
      const [updated] = await db.update(templateFeatures)
        .set({ enabledFeatures, updatedAt: new Date() })
        .where(eq(templateFeatures.templateType, templateType))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(templateFeatures)
        .values({ templateType, enabledFeatures })
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
