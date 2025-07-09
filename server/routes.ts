import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertSettingsSchema, insertProductRequestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get single product
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Create new product
  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Update product
  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, validatedData);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  // Delete product
  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProduct(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Get settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Update settings
  app.put("/api/settings", async (req, res) => {
    try {
      const validatedData = insertSettingsSchema.parse(req.body);
      const settings = await storage.updateSettings(validatedData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Get all product requests
  app.get("/api/product-requests", async (req, res) => {
    try {
      const requests = await storage.getProductRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product requests" });
    }
  });

  // Create new product request
  app.post("/api/product-requests", async (req, res) => {
    try {
      const validatedData = insertProductRequestSchema.parse(req.body);
      const request = await storage.createProductRequest(validatedData);
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product request" });
    }
  });

  // Update product request status (approve/reject)
  app.put("/api/product-requests/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, adminNotes } = req.body;
      
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'approved' or 'rejected'" });
      }

      const request = await storage.updateProductRequestStatus(id, status, adminNotes);
      
      if (!request) {
        return res.status(404).json({ message: "Product request not found" });
      }
      
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product request status" });
    }
  });

  // Convert approved product request to actual product
  app.post("/api/product-requests/:id/convert", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const request = await storage.getProductRequest(id);
      
      if (!request) {
        return res.status(404).json({ message: "Product request not found" });
      }
      
      if (request.status !== "approved") {
        return res.status(400).json({ message: "Only approved requests can be converted to products" });
      }

      // Create product from request
      const productData = {
        title: request.title,
        description: request.description,
        price: request.price,
        category: request.category,
        imageUrl: request.imageUrl,
        contactPhone: request.contactPhone,
      };

      const product = await storage.createProduct(productData);
      
      // Delete the request after conversion
      await storage.deleteProductRequest(id);
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to convert product request" });
    }
  });

  // Delete product request
  app.delete("/api/product-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProductRequest(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Product request not found" });
      }
      
      res.json({ message: "Product request deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
