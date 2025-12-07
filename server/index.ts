import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { testConnection } from "./db";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import compression from "compression";
import dotenv from "dotenv";
import path from "path";
import { verifyToken } from "./auth";

// Load environment variables
dotenv.config();

const app = express();
const APP_ENV = process.env.NODE_ENV || "production";
const allowedOrigin = APP_ENV === 'production'
  ? (process.env.FRONTEND_URL || process.env.PUBLIC_BASE_URL || undefined)
  : true;

if (APP_ENV === 'production' && !allowedOrigin) {
  throw new Error('[Security] Set FRONTEND_URL or PUBLIC_BASE_URL in production to lock down CORS');
}
app.set("env", APP_ENV);
const PUBLIC_DIR = path.resolve(import.meta.dirname, "..", "public");

// Trust proxy for rate limiting to work correctly
app.set('trust proxy', 1);

// Enable compression for all responses (improves loading speed)
app.use(compression({
  level: 6, // Balanced compression level
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req: express.Request, res: express.Response) => {
    // Don't compress responses for certain routes
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
}));

// Security middleware
app.use(helmet({
  // Allow resources (images/api) to be fetched even if host/header differs (IP vs domain)
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'"].concat(typeof allowedOrigin === 'string' ? [allowedOrigin] : []),
      fontSrc: ["'self'"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));

// General rate limiting with exemption for authenticated admins
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for authenticated admin users
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      return decoded?.isAdmin === true; // Skip rate limiting for admins
    }
    return false; // Apply rate limiting for non-authenticated requests
  }
});

app.use('/api/', limiter);

// Increase payload limit for image uploads (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Cache static assets for better performance
app.use(express.static(PUBLIC_DIR, {
  maxAge: '1y',
  etag: true,
  lastModified: true,
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

(async () => {
  // Test database connection first
  try {
    await testConnection();
  } catch (error) {
    console.error('Failed to connect to database. Server will not start.');
    process.exit(1);
  }
  
  const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error(`Error ${status} on ${req.method} ${req.path}:`, err);
    
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  const listenOptions: { port: number; host: string; reusePort?: boolean } = {
    port,
    host: "0.0.0.0",
  };

  // reusePort is not supported on Windows; avoid ENOTSUP
  if (process.platform !== "win32") {
    listenOptions.reusePort = true;
  }

  server.listen(listenOptions, () => {
    log(`serving on port ${port}`);
  });
})();
