import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertSettingsSchema, insertProductRequestSchema, insertCategorySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all products with optional sorting
  app.get("/api/products", async (req, res) => {
    try {
      const sortBy = req.query.sortBy as 'popularity' | 'newest' | 'price_asc' | 'price_desc' | undefined;
      const products = await storage.getProducts(sortBy);
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
        submitterEmail: request.submitterEmail, // Store submitter email for delete requests
      };

      const product = await storage.createProduct(productData);
      
      // Send approval email to submitter
      if (request.submitterEmail) {
        const { sendEmail, generateApprovalEmailHtml } = await import('./email');
        try {
          await sendEmail({
            to: request.submitterEmail,
            from: process.env.FROM_EMAIL || 'noreply@spotted-gfc.com',
            subject: 'Twój produkt został zatwierdzony! ✅',
            html: generateApprovalEmailHtml(request.title, product.id)
          });
        } catch (emailError) {
          console.error('Failed to send approval email:', emailError);
          // Don't fail the product creation if email fails
        }
      }
      
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

  // Delete Requests routes
  app.get("/api/delete-requests", async (req, res) => {
    try {
      const requests = await storage.getDeleteRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch delete requests" });
    }
  });

  app.post("/api/delete-requests", async (req, res) => {
    try {
      const { productId, submitterEmail, reason } = req.body;
      
      if (!productId || !submitterEmail) {
        return res.status(400).json({ message: "Product ID and submitter email are required" });
      }

      // Verify that the product exists and the email matches
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.submitterEmail !== submitterEmail) {
        return res.status(403).json({ message: "Email does not match the product submitter" });
      }

      const deleteRequest = await storage.createDeleteRequest({
        productId,
        submitterEmail,
        reason,
      });

      // Send confirmation email to submitter
      const { sendEmail, generateDeleteRequestEmailHtml } = await import('./email');
      try {
        await sendEmail({
          to: submitterEmail,
          from: process.env.FROM_EMAIL || 'noreply@spotted-gfc.com',
          subject: 'Prośba o usunięcie produktu otrzymana 📝',
          html: generateDeleteRequestEmailHtml(product.title, reason)
        });
      } catch (emailError) {
        console.error('Failed to send delete request email:', emailError);
        // Don't fail the request creation if email fails
      }

      res.status(201).json(deleteRequest);
    } catch (error) {
      console.error('Delete request error:', error);
      res.status(500).json({ message: "Failed to create delete request" });
    }
  });

  app.put("/api/delete-requests/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, adminNotes } = req.body;
      
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'approved' or 'rejected'" });
      }

      const deleteRequest = await storage.updateDeleteRequestStatus(id, status, adminNotes);
      
      if (!deleteRequest) {
        return res.status(404).json({ message: "Delete request not found" });
      }

      // If approved, delete the product
      if (status === "approved") {
        const success = await storage.deleteProduct(deleteRequest.productId);
        if (!success) {
          console.error('Failed to delete product after approving delete request');
        }
      }
      
      res.json(deleteRequest);
    } catch (error) {
      res.status(500).json({ message: "Failed to update delete request status" });
    }
  });

  app.delete("/api/delete-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDeleteRequest(id);
      
      if (!success) {
        return res.status(404).json({ message: "Delete request not found" });
      }
      
      res.json({ message: "Delete request deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete delete request" });
    }
  });

  // Product statistics endpoints
  app.post("/api/products/:id/view", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ipAddress = req.ip;
      const userAgent = req.get('User-Agent');
      await storage.incrementProductViews(id, ipAddress, userAgent);
      res.json({ message: "View recorded" });
    } catch (error) {
      res.status(500).json({ message: "Failed to record view" });
    }
  });

  app.post("/api/products/:id/click", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ipAddress = req.ip;
      const userAgent = req.get('User-Agent');
      await storage.incrementProductClicks(id, ipAddress, userAgent);
      res.json({ message: "Click recorded" });
    } catch (error) {
      res.status(500).json({ message: "Failed to record click" });
    }
  });

  app.get("/api/products/:id/stats", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const stats = await storage.getProductStats(id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product stats" });
    }
  });

  // Categories endpoints
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, validatedData);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCategory(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
