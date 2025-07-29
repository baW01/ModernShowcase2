import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertSettingsSchema, insertProductRequestSchema, insertCategorySchema } from "@shared/schema";
import { z } from "zod";
import { generateToken, verifyPassword, authenticateToken, requireAdmin, authRateLimitConfig } from "./auth";
import { validateProductToken } from "./hash-utils";
import rateLimit from "express-rate-limit";
import { readFileSync } from "fs";
import { join } from "path";

interface HTMLMetaTags {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogPrice?: string;
  ogCurrency?: string;
}

function generateHTML(meta: HTMLMetaTags): string {
  // Read the base HTML template
  let html: string;
  try {
    html = readFileSync(join(process.cwd(), 'client/index.html'), 'utf-8');
  } catch (error) {
    // Fallback HTML if file reading fails
    html = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`;
  }

  // Add meta tags before the closing head tag
  const metaTags = `
    <title>${meta.title}</title>
    <meta name="description" content="${meta.description}" />
    
    <!-- Open Graph meta tags -->
    <meta property="og:title" content="${meta.ogTitle}" />
    <meta property="og:description" content="${meta.ogDescription}" />
    <meta property="og:type" content="product" />
    <meta property="og:url" content="${meta.ogUrl}" />
    <meta property="og:site_name" content="Spotted GFC" />
    ${meta.ogImage ? `<meta property="og:image" content="${meta.ogImage}" />` : ''}
    ${meta.ogImage ? `<meta property="og:image:width" content="800" />` : ''}
    ${meta.ogImage ? `<meta property="og:image:height" content="600" />` : ''}
    ${meta.ogPrice ? `<meta property="product:price:amount" content="${meta.ogPrice}" />` : ''}
    ${meta.ogCurrency ? `<meta property="product:price:currency" content="${meta.ogCurrency}" />` : ''}
    
    <!-- Twitter Card meta tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${meta.ogTitle}" />
    <meta name="twitter:description" content="${meta.ogDescription}" />
    ${meta.ogImage ? `<meta name="twitter:image" content="${meta.ogImage}" />` : ''}
  `;

  return html.replace('</head>', `${metaTags}</head>`);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create auth rate limiter
  const authLimiter = rateLimit(authRateLimitConfig);

  // Rate limiter for product creation to prevent spam
  const productCreationLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 3, // Limit each IP to 3 product posts per 10 minutes
    message: 'Zbyt dużo postów w krótkim czasie. Spróbuj ponownie za 10 minut.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Use IP + user agent for better spam detection
      return req.ip + '|' + (req.get('user-agent') || '');
    }
  });

  // Rate limiter for product requests to prevent spam
  const productRequestLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes  
    max: 2, // Limit each IP to 2 product requests per 5 minutes
    message: 'Zbyt dużo próśb w krótkim czasie. Spróbuj ponownie za 5 minut.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return req.ip + '|' + (req.get('user-agent') || '');
    }
  });

  // Authentication endpoint
  app.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }

      const isValid = await verifyPassword(password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid password" });
      }

      const token = generateToken(true); // Admin login
      res.json({ 
        token, 
        expiresIn: '24h',
        message: "Login successful" 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Verify token endpoint
  app.get("/api/auth/verify", authenticateToken, (req, res) => {
    res.json({ 
      valid: true, 
      isAdmin: req.user?.isAdmin || false 
    });
  });

  // Get all products with optional sorting - PUBLIC endpoint (filtered for public view)
  app.get("/api/products", async (req, res) => {
    try {
      const sortBy = req.query.sortBy as 'popularity' | 'newest' | 'price_asc' | 'price_desc' | undefined;
      const products = await storage.getProducts(sortBy);
      
      // Filter out sensitive data for public view
      const publicProducts = products.map(product => ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId,
        category: product.category,
        imageUrl: product.imageUrl,
        imageUrls: product.imageUrls,
        contactPhone: product.contactPhone,
        isSold: product.isSold,
        saleVerified: product.saleVerified,
        views: product.views,
        clicks: product.clicks,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
        // submitterEmail removed for privacy
      }));
      
      // Add cache headers for better performance
      res.set({
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600', // 5 minutes cache
        'ETag': `"products-${Date.now()}"`,
        'Last-Modified': new Date().toUTCString()
      });
      
      res.json(publicProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get single product - PUBLIC endpoint (filtered for public view)
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Filter out sensitive data for public view
      const publicProduct = {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId,
        category: product.category,
        imageUrl: product.imageUrl,
        imageUrls: product.imageUrls,
        contactPhone: product.contactPhone,
        isSold: product.isSold,
        saleVerified: product.saleVerified,
        views: product.views,
        clicks: product.clicks,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
        // submitterEmail removed for privacy
      };
      
      // Add cache headers for single product
      res.set({
        'Cache-Control': 'public, max-age=600, stale-while-revalidate=1800', // 10 minutes cache
        'ETag': `"product-${product.id}-${product.updatedAt}"`,
        'Last-Modified': new Date(product.updatedAt).toUTCString()
      });
      
      res.json(publicProduct);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Get all products for admin - ADMIN ONLY (with full data including sensitive fields)
  app.get("/api/admin/products", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const sortBy = req.query.sortBy as 'popularity' | 'newest' | 'price_asc' | 'price_desc' | undefined;
      const products = await storage.getProducts(sortBy);
      res.json(products); // Return full data including submitterEmail
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Create new product - ADMIN ONLY
  app.post("/api/products", productCreationLimiter, authenticateToken, requireAdmin, async (req, res) => {
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

  // Update product - ADMIN ONLY
  app.put("/api/products/:id", authenticateToken, requireAdmin, async (req, res) => {
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

  // Delete product - ADMIN ONLY
  app.delete("/api/products/:id", authenticateToken, requireAdmin, async (req, res) => {
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

  // Verify sale - PUBLIC endpoint with token validation (marks as sold AND verified)
  app.put("/api/products/:id/verify-sale", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { comment, token } = req.body;
      
      // Validate that the token corresponds to this product
      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }
      
      const tokenProductId = validateProductToken(token);
      
      if (!tokenProductId || tokenProductId !== id) {
        return res.status(403).json({ message: "Invalid or expired token for this product" });
      }
      
      // Mark as both sold and verified since owner confirmed the sale
      const product = await storage.updateProduct(id, {
        isSold: true,
        saleVerified: true,
        saleVerificationComment: comment || null,
        saleVerifiedAt: new Date()
      });
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error('Sale verification error:', error);
      res.status(500).json({ message: "Failed to verify sale" });
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

  // Update settings - ADMIN ONLY
  app.put("/api/settings", authenticateToken, requireAdmin, async (req, res) => {
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

  // Image upload endpoint - PUBLIC endpoint for immediate image processing
  app.post("/api/upload-image", async (req, res) => {
    try {
      const { imageData } = req.body;
      
      if (!imageData || typeof imageData !== 'string') {
        return res.status(400).json({ message: "No image data provided" });
      }

      // Validate that it's a valid base64 data URL
      if (!imageData.startsWith('data:image/')) {
        return res.status(400).json({ message: "Invalid image format" });
      }

      // For now, we just return the same data URL
      // In a real application, you might want to:
      // 1. Save to cloud storage (AWS S3, Cloudinary, etc.)
      // 2. Optimize the image further
      // 3. Generate different sizes/thumbnails
      
      res.json({ 
        imageUrl: imageData,
        message: "Image uploaded successfully"
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Validate sale token - PUBLIC endpoint for verify-sale page
  app.post("/api/validate-sale-token", async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: "No token provided" });
      }

      const productId = validateProductToken(token);
      
      if (!productId) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({ 
        productId: product.id,
        productTitle: product.title 
      });
    } catch (error) {
      console.error('Token validation error:', error);
      res.status(500).json({ message: "Failed to validate token" });
    }
  });

  // Get all product requests - ADMIN ONLY
  app.get("/api/product-requests", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const requests = await storage.getProductRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product requests" });
    }
  });

  // Create new product request
  app.post("/api/product-requests", productRequestLimiter, async (req, res) => {
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

  // Update product request status (approve/reject) - ADMIN ONLY
  app.put("/api/product-requests/:id/status", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, adminNotes } = req.body;
      
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'approved' or 'rejected'" });
      }

      // Get the original request before updating it
      const originalRequest = await storage.getProductRequest(id);
      if (!originalRequest) {
        return res.status(404).json({ message: "Product request not found" });
      }

      const request = await storage.updateProductRequestStatus(id, status, adminNotes);
      
      if (!request) {
        return res.status(404).json({ message: "Product request not found" });
      }
      
      // Send rejection email if status is rejected and adminNotes (reason) is provided
      if (status === "rejected" && adminNotes && originalRequest.submitterEmail) {
        console.log(`Sending rejection email to: ${originalRequest.submitterEmail} for product: ${originalRequest.title}`);
        const { sendEmail, generateRejectionEmailHtml } = await import('./email.js');
        try {
          const emailSent = await sendEmail({
            to: originalRequest.submitterEmail,
            from: process.env.FROM_EMAIL || 'noreply@spotted-gfc.com',
            subject: 'Twoja prośba o dodanie produktu została odrzucona',
            html: generateRejectionEmailHtml(originalRequest.title, adminNotes)
          });
          
          if (emailSent) {
            console.log('Rejection email sent successfully');
          } else {
            console.log('Rejection email failed to send (returned false)');
          }
        } catch (emailError) {
          console.error('Failed to send rejection email:', emailError);
          // Don't fail the status update if email fails
        }
      }
      
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product request status" });
    }
  });

  // Convert approved product request to actual product - ADMIN ONLY
  app.post("/api/product-requests/:id/convert", authenticateToken, requireAdmin, async (req, res) => {
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
        imageUrls: request.imageUrls,
        contactPhone: request.contactPhone,
        submitterEmail: request.submitterEmail, // Store submitter email for delete requests
      };

      const product = await storage.createProduct(productData);
      
      // Send approval email to submitter
      if (request.submitterEmail) {
        console.log(`Sending approval email to: ${request.submitterEmail} for product: ${request.title}`);
        const { sendEmail, generateApprovalEmailHtml } = await import('./email');
        try {
          const emailSent = await sendEmail({
            to: request.submitterEmail,
            from: process.env.FROM_EMAIL || 'noreply@spotted-gfc.com',
            subject: 'Twój produkt został zatwierdzony! ✅',
            html: generateApprovalEmailHtml(request.title, product.id)
          });
          
          if (emailSent) {
            console.log('Approval email sent successfully');
          } else {
            console.log('Approval email failed to send (returned false)');
          }
        } catch (emailError) {
          console.error('Failed to send approval email:', emailError);
          // Don't fail the product creation if email fails
        }
      } else {
        console.log('No submitter email found, skipping approval email');
      }
      
      // Delete the request after conversion
      await storage.deleteProductRequest(id);
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to convert product request" });
    }
  });

  // Delete product request - ADMIN ONLY
  app.delete("/api/product-requests/:id", authenticateToken, requireAdmin, async (req, res) => {
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

  // Delete Requests routes - ADMIN ONLY
  app.get("/api/delete-requests", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const requests = await storage.getDeleteRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch delete requests" });
    }
  });

  app.post("/api/delete-requests", productRequestLimiter, async (req, res) => {
    try {
      const { productId, submitterEmail, reason, token } = req.body;
      
      let validatedProductId = productId;
      let validatedEmail = submitterEmail;
      
      // If token is provided, validate it and extract product info
      if (token) {
        const { validateProductToken } = await import('./hash-utils');
        validatedProductId = validateProductToken(token);
        
        if (!validatedProductId) {
          return res.status(400).json({ message: "Invalid or expired token" });
        }
        
        // Get product to extract submitter email
        const product = await storage.getProduct(validatedProductId);
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
        
        validatedEmail = product.submitterEmail;
      } else {
        // Legacy method - require both productId and submitterEmail
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
      }

      // Get product for email purposes
      const product = await storage.getProduct(validatedProductId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const deleteRequest = await storage.createDeleteRequest({
        productId: validatedProductId,
        submitterEmail: validatedEmail,
        reason,
      });

      // Send confirmation email to submitter
      const { sendEmail, generateDeleteRequestEmailHtml } = await import('./email');
      try {
        await sendEmail({
          to: validatedEmail,
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

  app.put("/api/delete-requests/:id/status", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, adminNotes } = req.body;
      
      console.log(`Updating delete request ${id} to status: ${status}`);
      
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'approved' or 'rejected'" });
      }

      const deleteRequest = await storage.updateDeleteRequestStatus(id, status, adminNotes);
      
      if (!deleteRequest) {
        return res.status(404).json({ message: "Delete request not found" });
      }

      console.log(`Delete request updated successfully:`, deleteRequest);

      // If approved, delete the product and then the delete request
      if (status === "approved") {
        console.log(`Attempting to delete product ${deleteRequest.productId}`);
        
        // First delete the delete request to avoid foreign key constraint
        const deleteRequestRemoved = await storage.deleteDeleteRequest(id);
        if (!deleteRequestRemoved) {
          console.error('Failed to delete the delete request record');
        } else {
          console.log('Delete request record removed successfully');
        }
        
        // Then delete the product
        const success = await storage.deleteProduct(deleteRequest.productId);
        if (!success) {
          console.error('Failed to delete product after approving delete request');
        } else {
          console.log(`Product ${deleteRequest.productId} deleted successfully`);
        }
      }
      
      res.json(deleteRequest);
    } catch (error) {
      console.error('Error in delete request status update:', error);
      res.status(500).json({ message: "Failed to update delete request status" });
    }
  });

  app.delete("/api/delete-requests/:id", authenticateToken, requireAdmin, async (req, res) => {
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

  // Token validation endpoint for secure delete requests
  app.get("/api/validate-token/:token", async (req, res) => {
    try {
      const token = req.params.token;
      const productId = validateProductToken(token);
      
      if (!productId) {
        return res.status(400).json({ 
          valid: false, 
          message: "Invalid or expired token" 
        });
      }
      
      // Check if product still exists
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ 
          valid: false, 
          message: "Product not found" 
        });
      }
      
      // Return minimal product info for validation
      res.json({
        valid: true,
        productId: productId,
        productTitle: product.title
      });
    } catch (error) {
      res.status(500).json({ 
        valid: false, 
        message: "Token validation failed" 
      });
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

  app.post("/api/categories", authenticateToken, requireAdmin, async (req, res) => {
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

  app.put("/api/categories/:id", authenticateToken, requireAdmin, async (req, res) => {
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

  app.delete("/api/categories/:id", authenticateToken, requireAdmin, async (req, res) => {
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

  // Server-side rendering for product pages with Open Graph meta tags
  app.get("/product/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      const settings = await storage.getSettings();
      
      if (!product) {
        // Return 404 page with basic meta tags
        return res.status(404).send(generateHTML({
          title: "Produkt nie znaleziony | Spotted GFC",
          description: "Podany produkt nie istnieje lub został usunięty.",
          ogTitle: "Produkt nie znaleziony",
          ogDescription: "Podany produkt nie istnieje lub został usunięty.",
          ogImage: "",
          ogUrl: `${req.protocol}://${req.get('host')}/product/${productId}`
        }));
      }

      // Generate meta tags for the product
      const title = `${product.title} - ${product.category} | ${settings?.storeName || 'Spotted GFC'}`;
      const description = `${product.description.substring(0, 155)}... Cena: ${(product.price / 100).toFixed(2)} zł`;
      const ogImage = product.imageUrls?.[0] || product.imageUrl || '';
      const ogUrl = `https://spottedgfc.pl/product/${productId}`;

      res.send(generateHTML({
        title,
        description,
        ogTitle: product.title,
        ogDescription: product.description,
        ogImage,
        ogUrl,
        ogPrice: (product.price / 100).toFixed(2),
        ogCurrency: 'PLN'
      }));
    } catch (error) {
      console.error('Error serving product page:', error);
      res.status(500).send(generateHTML({
        title: "Błąd serwera | Spotted GFC",
        description: "Wystąpił błąd podczas ładowania strony.",
        ogTitle: "Błąd serwera",
        ogDescription: "Wystąpił błąd podczas ładowania strony.",
        ogImage: "",
        ogUrl: `https://spottedgfc.pl/product/${req.params.id}`
      }));
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
