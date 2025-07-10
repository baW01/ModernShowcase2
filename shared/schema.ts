import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Store price in cents
  categoryId: integer("category_id").references(() => categories.id),
  category: text("category").notNull(), // Keep for backward compatibility
  imageUrl: text("image_url"),
  contactPhone: text("contact_phone"), // Individual contact phone for each product
  isSold: boolean("is_sold").notNull().default(false),
  views: integer("views").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  submitterEmail: text("submitter_email"), // Track original submitter email for delete requests
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const productViews = pgTable("product_views", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  viewedAt: timestamp("viewed_at").notNull().defaultNow(),
});

export const productClicks = pgTable("product_clicks", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  clickedAt: timestamp("clicked_at").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  contactPhone: text("contact_phone").notNull(),
  storeName: text("store_name").notNull(),
  storeDescription: text("store_description").notNull(),
});

export const productRequests = pgTable("product_requests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Store price in cents
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  contactPhone: text("contact_phone").notNull(),
  submitterName: text("submitter_name").notNull(),
  submitterEmail: text("submitter_email").notNull(), // Now required for email confirmations
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  submittedAt: text("submitted_at").notNull().default("now()"),
  reviewedAt: text("reviewed_at"),
  adminNotes: text("admin_notes"),
});

export const deleteRequests = pgTable("delete_requests", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  submitterEmail: text("submitter_email").notNull(),
  reason: text("reason"),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  adminNotes: text("admin_notes"),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  views: true,
  clicks: true,
  createdAt: true,
  updatedAt: true,
  categoryId: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export const insertProductRequestSchema = createInsertSchema(productRequests).omit({
  id: true,
  status: true,
  submittedAt: true,
  reviewedAt: true,
  adminNotes: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertDeleteRequestSchema = createInsertSchema(deleteRequests).omit({
  id: true,
  status: true,
  submittedAt: true,
  reviewedAt: true,
  adminNotes: true,
});

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  views: many(productViews),
  clicks: many(productClicks),
}));

export const productViewsRelations = relations(productViews, ({ one }) => ({
  product: one(products, {
    fields: [productViews.productId],
    references: [products.id],
  }),
}));

export const productClicksRelations = relations(productClicks, ({ one }) => ({
  product: one(products, {
    fields: [productClicks.productId],
    references: [products.id],
  }),
}));

export const deleteRequestsRelations = relations(deleteRequests, ({ one }) => ({
  product: one(products, {
    fields: [deleteRequests.productId],
    references: [products.id],
  }),
}));

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type ProductRequest = typeof productRequests.$inferSelect;
export type InsertProductRequest = z.infer<typeof insertProductRequestSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type ProductView = typeof productViews.$inferSelect;
export type ProductClick = typeof productClicks.$inferSelect;
export type DeleteRequest = typeof deleteRequests.$inferSelect;
export type InsertDeleteRequest = z.infer<typeof insertDeleteRequestSchema>;
