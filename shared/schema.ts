import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Store price in cents
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  isSold: boolean("is_sold").notNull().default(false),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  contactPhone: text("contact_phone").notNull(),
  storeName: text("store_name").notNull(),
  storeDescription: text("store_description").notNull(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
