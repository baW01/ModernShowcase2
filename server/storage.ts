import { products, settings, type Product, type InsertProduct, type Settings, type InsertSettings } from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private settings: Settings | undefined;
  private currentProductId: number;

  constructor() {
    this.products = new Map();
    this.currentProductId = 1;
    
    // Initialize default settings
    this.settings = {
      id: 1,
      contactPhone: "+1 (555) 123-4567",
      storeName: "ProductHub",
      storeDescription: "Browse our curated collection and connect with sellers directly"
    };

    // Add some initial products
    this.seedInitialProducts();
  }

  private seedInitialProducts() {
    const initialProducts: Omit<Product, 'id'>[] = [
      {
        title: "Luxury Watch",
        description: "Swiss-made timepiece with automatic movement and sapphire crystal",
        price: 249900, // $2499.00 in cents
        category: "Accessories",
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
        contactPhone: "+48 123 456 789",
        isSold: false
      },
      {
        title: "Wireless Headphones",
        description: "Premium audio quality with noise cancellation and long battery life",
        price: 34900, // $349.00 in cents
        category: "Electronics",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
        contactPhone: "+48 987 654 321",
        isSold: false
      },
      {
        title: "Vintage Camera",
        description: "Classic film camera in excellent condition with original lens",
        price: 69900, // $699.00 in cents
        category: "Electronics",
        imageUrl: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
        contactPhone: "+48 555 123 456",
        isSold: false
      },
      {
        title: "Gaming Laptop",
        description: "High-performance laptop with RTX graphics card",
        price: 129900, // $1299.00 in cents
        category: "Electronics",
        imageUrl: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
        contactPhone: "+48 777 888 999",
        isSold: true
      },
      {
        title: "Designer Sunglasses",
        description: "Premium sunglasses with UV protection and polarized lenses",
        price: 19900, // $199.00 in cents
        category: "Accessories",
        imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
        contactPhone: "+48 111 222 333",
        isSold: true
      }
    ];

    initialProducts.forEach(product => {
      const id = this.currentProductId++;
      this.products.set(id, { ...product, id });
    });
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { 
      ...insertProduct, 
      id,
      imageUrl: insertProduct.imageUrl || null,
      contactPhone: insertProduct.contactPhone || null,
      isSold: insertProduct.isSold || false
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  async getSettings(): Promise<Settings | undefined> {
    return this.settings;
  }

  async updateSettings(settingsData: InsertSettings): Promise<Settings> {
    this.settings = { ...this.settings, ...settingsData, id: 1 };
    return this.settings;
  }
}

export const storage = new MemStorage();
