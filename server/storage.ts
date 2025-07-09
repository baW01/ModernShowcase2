import { products, settings, productRequests, type Product, type InsertProduct, type Settings, type InsertSettings, type ProductRequest, type InsertProductRequest } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Settings
  getSettings(): Promise<Settings | undefined>;
  updateSettings(settings: InsertSettings): Promise<Settings>;
  
  // Product Requests
  getProductRequests(): Promise<ProductRequest[]>;
  getProductRequest(id: number): Promise<ProductRequest | undefined>;
  createProductRequest(request: InsertProductRequest): Promise<ProductRequest>;
  updateProductRequestStatus(id: number, status: "approved" | "rejected", adminNotes?: string): Promise<ProductRequest | undefined>;
  deleteProductRequest(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(): Promise<Product[]> {
    try {
      const productList = await db.select().from(products);
      return productList;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products from database');
    }
  }

  async getProduct(id: number): Promise<Product | undefined> {
    try {
      const [product] = await db.select().from(products).where(eq(products.id, id));
      return product || undefined;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error('Failed to fetch product from database');
    }
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    try {
      const [product] = await db
        .insert(products)
        .values(insertProduct)
        .returning();
      return product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product in database');
    }
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    try {
      const [updatedProduct] = await db
        .update(products)
        .set(updates)
        .where(eq(products.id, id))
        .returning();
      return updatedProduct || undefined;
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product in database');
    }
  }

  async deleteProduct(id: number): Promise<boolean> {
    try {
      const result = await db.delete(products).where(eq(products.id, id));
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product from database');
    }
  }

  async getSettings(): Promise<Settings | undefined> {
    try {
      const [setting] = await db.select().from(settings).limit(1);
      return setting || undefined;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw new Error('Failed to fetch settings from database');
    }
  }

  async updateSettings(settingsData: InsertSettings): Promise<Settings> {
    try {
      // First try to update existing settings
      const [updatedSettings] = await db
        .update(settings)
        .set(settingsData)
        .returning();
      
      // If no settings exist, create new ones
      if (!updatedSettings) {
        const [newSettings] = await db
          .insert(settings)
          .values(settingsData)
          .returning();
        return newSettings;
      }
      
      return updatedSettings;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw new Error('Failed to update settings in database');
    }
  }

  async getProductRequests(): Promise<ProductRequest[]> {
    try {
      const requests = await db.select().from(productRequests).orderBy(productRequests.submittedAt);
      return requests;
    } catch (error) {
      console.error('Error fetching product requests:', error);
      throw new Error('Failed to fetch product requests from database');
    }
  }

  async getProductRequest(id: number): Promise<ProductRequest | undefined> {
    try {
      const [request] = await db.select().from(productRequests).where(eq(productRequests.id, id));
      return request || undefined;
    } catch (error) {
      console.error('Error fetching product request:', error);
      throw new Error('Failed to fetch product request from database');
    }
  }

  async createProductRequest(insertRequest: InsertProductRequest): Promise<ProductRequest> {
    try {
      const [request] = await db
        .insert(productRequests)
        .values({
          ...insertRequest,
          submittedAt: new Date().toISOString(),
        })
        .returning();
      return request;
    } catch (error) {
      console.error('Error creating product request:', error);
      throw new Error('Failed to create product request in database');
    }
  }

  async updateProductRequestStatus(id: number, status: "approved" | "rejected", adminNotes?: string): Promise<ProductRequest | undefined> {
    try {
      const [updatedRequest] = await db
        .update(productRequests)
        .set({
          status,
          reviewedAt: new Date().toISOString(),
          adminNotes,
        })
        .where(eq(productRequests.id, id))
        .returning();
      return updatedRequest || undefined;
    } catch (error) {
      console.error('Error updating product request status:', error);
      throw new Error('Failed to update product request status in database');
    }
  }

  async deleteProductRequest(id: number): Promise<boolean> {
    try {
      const result = await db.delete(productRequests).where(eq(productRequests.id, id));
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting product request:', error);
      throw new Error('Failed to delete product request from database');
    }
  }
}

export const storage = new DatabaseStorage();
