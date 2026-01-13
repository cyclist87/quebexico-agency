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
  ctaText: text("cta_text"),
  ctaUrl: text("cta_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// === STR PROPERTIES (Autonomous Rental) ===

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameFr: text("name_fr").notNull(),
  nameEn: text("name_en").notNull(),
  nameEs: text("name_es").notNull(),
  descriptionFr: text("description_fr"),
  descriptionEn: text("description_en"),
  descriptionEs: text("description_es"),
  addressFr: text("address_fr"),
  addressEn: text("address_en"),
  addressEs: text("address_es"),
  city: text("city"),
  region: text("region"),
  country: text("country").default("CA"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  photos: text("photos").array(),
  amenitiesFr: text("amenities_fr").array(),
  amenitiesEn: text("amenities_en").array(),
  amenitiesEs: text("amenities_es").array(),
  maxGuests: integer("max_guests").default(4),
  bedrooms: integer("bedrooms").default(1),
  bathrooms: integer("bathrooms").default(1),
  pricePerNight: integer("price_per_night").notNull(),
  cleaningFee: integer("cleaning_fee").default(0),
  currency: text("currency").default("CAD"),
  minNights: integer("min_nights").default(1),
  maxNights: integer("max_nights").default(30),
  checkInTime: text("check_in_time").default("15:00"),
  checkOutTime: text("check_out_time").default("11:00"),
  houseRulesFr: text("house_rules_fr"),
  houseRulesEn: text("house_rules_en"),
  houseRulesEs: text("house_rules_es"),
  wifiName: text("wifi_name"),
  wifiPassword: text("wifi_password"),
  accessCodeFr: text("access_code_fr"),
  accessCodeEn: text("access_code_en"),
  accessCodeEs: text("access_code_es"),
  icalUrl: text("ical_url"),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const blockedDates = pgTable("blocked_dates", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  source: text("source").default("manual"),
  reason: text("reason"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  confirmationCode: text("confirmation_code").notNull().unique(),
  status: text("status").default("pending"),
  checkIn: timestamp("check_in").notNull(),
  checkOut: timestamp("check_out").notNull(),
  nights: integer("nights").notNull(),
  guests: integer("guests").notNull(),
  guestFirstName: text("guest_first_name").notNull(),
  guestLastName: text("guest_last_name").notNull(),
  guestEmail: text("guest_email").notNull(),
  guestPhone: text("guest_phone"),
  guestMessage: text("guest_message"),
  pricePerNight: integer("price_per_night").notNull(),
  subtotal: integer("subtotal").notNull(),
  cleaningFee: integer("cleaning_fee").default(0),
  serviceFee: integer("service_fee").default(0),
  taxes: integer("taxes").default(0),
  discountAmount: integer("discount_amount").default(0),
  couponCode: text("coupon_code"),
  total: integer("total").notNull(),
  currency: text("currency").default("CAD"),
  language: text("language").default("fr"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id, { onDelete: "set null" }),
  status: text("status").default("new"),
  guestFirstName: text("guest_first_name").notNull(),
  guestLastName: text("guest_last_name").notNull(),
  guestEmail: text("guest_email").notNull(),
  guestPhone: text("guest_phone"),
  message: text("message").notNull(),
  checkIn: timestamp("check_in"),
  checkOut: timestamp("check_out"),
  guests: integer("guests"),
  language: text("language").default("fr"),
  repliedAt: timestamp("replied_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// === COUPONS / PROMOTIONS (Reusable for any template) ===

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  nameFr: text("name_fr").notNull(),
  nameEn: text("name_en").notNull(),
  nameEs: text("name_es"),
  descriptionFr: text("description_fr"),
  descriptionEn: text("description_en"),
  descriptionEs: text("description_es"),
  discountType: text("discount_type").notNull().default("percentage"),
  discountValue: integer("discount_value").notNull(),
  currency: text("currency").default("CAD"),
  minSubtotal: integer("min_subtotal"),
  maxDiscount: integer("max_discount"),
  minNights: integer("min_nights"),
  maxNights: integer("max_nights"),
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  maxRedemptions: integer("max_redemptions"),
  currentRedemptions: integer("current_redemptions").default(0),
  maxPerGuest: integer("max_per_guest"),
  applicablePropertyIds: integer("applicable_property_ids").array(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const couponRedemptions = pgTable("coupon_redemptions", {
  id: serial("id").primaryKey(),
  couponId: integer("coupon_id").notNull().references(() => coupons.id, { onDelete: "cascade" }),
  reservationId: integer("reservation_id").references(() => reservations.id, { onDelete: "set null" }),
  guestEmail: text("guest_email").notNull(),
  discountApplied: integer("discount_applied").notNull(),
  currency: text("currency").default("CAD"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// === SITE CONFIGURATION (CMS) ===

export const siteConfig = pgTable("site_config", {
  id: serial("id").primaryKey(),
  templateType: text("template_type").notNull().default("str"),
  siteName: text("site_name").notNull().default("Mon Site"),
  siteDescription: text("site_description"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  primaryColor: text("primary_color").default("#2563eb"),
  secondaryColor: text("secondary_color").default("#64748b"),
  accentColor: text("accent_color").default("#f59e0b"),
  fontFamily: text("font_family").default("Inter"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  addressFr: text("address_fr"),
  addressEn: text("address_en"),
  addressEs: text("address_es"),
  footerTextFr: text("footer_text_fr"),
  footerTextEn: text("footer_text_en"),
  footerTextEs: text("footer_text_es"),
  socialFacebook: text("social_facebook"),
  socialInstagram: text("social_instagram"),
  socialLinkedin: text("social_linkedin"),
  socialTwitter: text("social_twitter"),
  socialYoutube: text("social_youtube"),
  metaTitleFr: text("meta_title_fr"),
  metaTitleEn: text("meta_title_en"),
  metaTitleEs: text("meta_title_es"),
  metaDescriptionFr: text("meta_description_fr"),
  metaDescriptionEn: text("meta_description_en"),
  metaDescriptionEs: text("meta_description_es"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const contentSections = pgTable("content_sections", {
  id: serial("id").primaryKey(),
  sectionType: text("section_type").notNull(),
  isEnabled: boolean("is_enabled").default(true),
  orderIndex: integer("order_index").default(0),
  titleFr: text("title_fr"),
  titleEn: text("title_en"),
  titleEs: text("title_es"),
  subtitleFr: text("subtitle_fr"),
  subtitleEn: text("subtitle_en"),
  subtitleEs: text("subtitle_es"),
  contentFr: text("content_fr"),
  contentEn: text("content_en"),
  contentEs: text("content_es"),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  buttonTextFr: text("button_text_fr"),
  buttonTextEn: text("button_text_en"),
  buttonTextEs: text("button_text_es"),
  buttonUrl: text("button_url"),
  customData: text("custom_data"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// === TEMPLATE FEATURE CONFIGURATIONS ===

export const templateFeatures = pgTable("template_features", {
  id: serial("id").primaryKey(),
  templateType: text("template_type").notNull().unique(),
  enabledFeatures: text("enabled_features").array().notNull(),
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

export const insertPropertySchema = createInsertSchema(properties).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBlockedDateSchema = createInsertSchema(blockedDates).omit({ id: true, createdAt: true });
export const insertReservationSchema = createInsertSchema(reservations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInquirySchema = createInsertSchema(inquiries).omit({ id: true, createdAt: true });

export const insertCouponSchema = createInsertSchema(coupons).omit({ id: true, currentRedemptions: true, createdAt: true, updatedAt: true });
export const insertCouponRedemptionSchema = createInsertSchema(couponRedemptions).omit({ id: true, createdAt: true });

export const insertSiteConfigSchema = createInsertSchema(siteConfig).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContentSectionSchema = createInsertSchema(contentSections).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTemplateFeatureSchema = createInsertSchema(templateFeatures).omit({ id: true, createdAt: true, updatedAt: true });

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

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;

export type BlockedDate = typeof blockedDates.$inferSelect;
export type InsertBlockedDate = z.infer<typeof insertBlockedDateSchema>;

export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = z.infer<typeof insertReservationSchema>;

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;

export type CouponRedemption = typeof couponRedemptions.$inferSelect;
export type InsertCouponRedemption = z.infer<typeof insertCouponRedemptionSchema>;

export type SiteConfigType = typeof siteConfig.$inferSelect;
export type InsertSiteConfig = z.infer<typeof insertSiteConfigSchema>;

export type ContentSection = typeof contentSections.$inferSelect;
export type InsertContentSection = z.infer<typeof insertContentSectionSchema>;

export type TemplateFeature = typeof templateFeatures.$inferSelect;
export type InsertTemplateFeature = z.infer<typeof insertTemplateFeatureSchema>;

// API Request/Response Types
export type CreateMessageRequest = InsertMessage;
export type CreateSubscriberRequest = InsertSubscriber;
