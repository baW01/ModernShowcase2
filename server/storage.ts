import { 
  products, 
  settings, 
  productRequests, 
  categories,
  productViews,
  productClicks,
  deleteRequests,
  type Product, 
  type InsertProduct, 
  type Settings, 
  type InsertSettings, 
  type ProductRequest, 
  type InsertProductRequest,
  type Category,
  type InsertCategory,
  type ProductView,
  type ProductClick,
  type DeleteRequest,
  type InsertDeleteRequest
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

export interface IStorage {
  // Products
  getProducts(sortBy?: 'popularity' | 'newest' | 'price_asc' | 'price_desc'): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  verifySale(id: number, comment?: string): Promise<Product | undefined>;
  
  // Product Statistics
  incrementProductViews(productId: number, ipAddress?: string, userAgent?: string): Promise<void>;
  incrementProductClicks(productId: number, ipAddress?: string, userAgent?: string): Promise<void>;
  getProductStats(productId: number): Promise<{ views: number; clicks: number }>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Settings
  getSettings(): Promise<Settings | undefined>;
  updateSettings(settings: InsertSettings): Promise<Settings>;
  
  // Product Requests
  getProductRequests(): Promise<ProductRequest[]>;
  getProductRequest(id: number): Promise<ProductRequest | undefined>;
  createProductRequest(request: InsertProductRequest): Promise<ProductRequest>;
  updateProductRequestStatus(id: number, status: "approved" | "rejected", adminNotes?: string): Promise<ProductRequest | undefined>;
  deleteProductRequest(id: number): Promise<boolean>;
  
  // Delete Requests
  getDeleteRequests(): Promise<DeleteRequest[]>;
  getDeleteRequest(id: number): Promise<DeleteRequest | undefined>;
  createDeleteRequest(request: InsertDeleteRequest): Promise<DeleteRequest>;
  updateDeleteRequestStatus(id: number, status: "approved" | "rejected", adminNotes?: string): Promise<DeleteRequest | undefined>;
  deleteDeleteRequest(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(sortBy: 'popularity' | 'newest' | 'price_asc' | 'price_desc' = 'newest'): Promise<Product[]> {
    try {
      let query = db.select().from(products);
      
      switch (sortBy) {
        case 'popularity':
          query = query.orderBy(desc(sql`${products.views} + ${products.clicks} * 2`));
          break;
        case 'newest':
          query = query.orderBy(desc(products.createdAt));
          break;
        case 'price_asc':
          query = query.orderBy(products.price);
          break;
        case 'price_desc':
          query = query.orderBy(desc(products.price));
          break;
      }
      
      const productList = await query;
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
      // First delete related records to avoid foreign key violations
      await db.delete(productClicks).where(eq(productClicks.productId, id));
      await db.delete(productViews).where(eq(productViews.productId, id));
      
      // Then delete the product
      const result = await db.delete(products).where(eq(products.id, id));
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product from database');
    }
  }

  async verifySale(id: number, comment?: string): Promise<Product | undefined> {
    try {
      const [updatedProduct] = await db
        .update(products)
        .set({
          isSold: true,
          saleVerified: true,
          saleVerificationComment: comment || null,
          saleVerifiedAt: new Date()
        })
        .where(eq(products.id, id))
        .returning();
      return updatedProduct || undefined;
    } catch (error) {
      console.error('Error verifying sale:', error);
      throw new Error('Failed to verify sale in database');
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

  // Product Statistics
  async incrementProductViews(productId: number, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      // Check if this IP already viewed this product
      if (ipAddress) {
        const existingView = await db
          .select()
          .from(productViews)
          .where(and(
            eq(productViews.productId, productId),
            eq(productViews.ipAddress, ipAddress)
          ))
          .limit(1);
        
        if (existingView.length > 0) {
          // IP already viewed this product, don't count again
          return;
        }
      }

      // Log the view
      await db.insert(productViews).values({
        productId,
        ipAddress,
        userAgent,
      });

      // Increment the view count on the product
      await db
        .update(products)
        .set({ views: sql`${products.views} + 1` })
        .where(eq(products.id, productId));
    } catch (error) {
      console.error('Error incrementing product views:', error);
      throw new Error('Failed to increment product views');
    }
  }

  async incrementProductClicks(productId: number, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      // Check if this IP already clicked on this product
      if (ipAddress) {
        const existingClick = await db
          .select()
          .from(productClicks)
          .where(and(
            eq(productClicks.productId, productId),
            eq(productClicks.ipAddress, ipAddress)
          ))
          .limit(1);
        
        if (existingClick.length > 0) {
          // IP already clicked on this product, don't count again
          return;
        }
      }

      // Log the click
      await db.insert(productClicks).values({
        productId,
        ipAddress,
        userAgent,
      });

      // Increment the click count on the product
      await db
        .update(products)
        .set({ clicks: sql`${products.clicks} + 1` })
        .where(eq(products.id, productId));
    } catch (error) {
      console.error('Error incrementing product clicks:', error);
      throw new Error('Failed to increment product clicks');
    }
  }

  async getProductStats(productId: number): Promise<{ views: number; clicks: number }> {
    try {
      const [product] = await db
        .select({ views: products.views, clicks: products.clicks })
        .from(products)
        .where(eq(products.id, productId));
      
      return product ? { views: product.views, clicks: product.clicks } : { views: 0, clicks: 0 };
    } catch (error) {
      console.error('Error fetching product stats:', error);
      throw new Error('Failed to fetch product stats');
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const categoryList = await db.select().from(categories).where(eq(categories.isActive, true));
      return categoryList;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories from database');
    }
  }

  async getCategory(id: number): Promise<Category | undefined> {
    try {
      const [category] = await db.select().from(categories).where(eq(categories.id, id));
      return category || undefined;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw new Error('Failed to fetch category from database');
    }
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    try {
      const [category] = await db
        .insert(categories)
        .values(insertCategory)
        .returning();
      return category;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('Failed to create category in database');
    }
  }

  async updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    try {
      const [updatedCategory] = await db
        .update(categories)
        .set(updates)
        .where(eq(categories.id, id))
        .returning();
      return updatedCategory || undefined;
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error('Failed to update category in database');
    }
  }

  async deleteCategory(id: number): Promise<boolean> {
    try {
      // Soft delete by setting isActive to false
      const result = await db
        .update(categories)
        .set({ isActive: false })
        .where(eq(categories.id, id));
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('Failed to delete category from database');
    }
  }

  // Delete Requests
  async getDeleteRequests(): Promise<DeleteRequest[]> {
    try {
      const requests = await db.select().from(deleteRequests).orderBy(deleteRequests.submittedAt);
      return requests;
    } catch (error) {
      console.error('Error fetching delete requests:', error);
      throw new Error('Failed to fetch delete requests from database');
    }
  }

  async getDeleteRequest(id: number): Promise<DeleteRequest | undefined> {
    try {
      const [request] = await db.select().from(deleteRequests).where(eq(deleteRequests.id, id));
      return request || undefined;
    } catch (error) {
      console.error('Error fetching delete request:', error);
      throw new Error('Failed to fetch delete request from database');
    }
  }

  async createDeleteRequest(insertRequest: InsertDeleteRequest): Promise<DeleteRequest> {
    try {
      const [request] = await db
        .insert(deleteRequests)
        .values(insertRequest)
        .returning();
      return request;
    } catch (error) {
      console.error('Error creating delete request:', error);
      throw new Error('Failed to create delete request in database');
    }
  }

  async updateDeleteRequestStatus(id: number, status: "approved" | "rejected", adminNotes?: string): Promise<DeleteRequest | undefined> {
    try {
      console.log(`Attempting to update delete request ${id} to status ${status}`);
      const [updatedRequest] = await db
        .update(deleteRequests)
        .set({
          status,
          reviewedAt: new Date(),
          adminNotes,
        })
        .where(eq(deleteRequests.id, id))
        .returning();
      console.log('Database update result:', updatedRequest);
      return updatedRequest || undefined;
    } catch (error) {
      console.error('Error updating delete request status:', error);
      console.error('Error details:', error);
      throw error; // Re-throw the original error instead of wrapping it
    }
  }

  async deleteDeleteRequest(id: number): Promise<boolean> {
    try {
      const result = await db.delete(deleteRequests).where(eq(deleteRequests.id, id));
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting delete request:', error);
      throw new Error('Failed to delete delete request from database');
    }
  }
}

export const storage = new DatabaseStorage();
