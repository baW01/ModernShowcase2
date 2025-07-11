import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { Request, Response, NextFunction } from 'express';

// Get environment variables with defaults for development
const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2a$10$Q7.xGqVlWR3KvXHGFZGNLe4xqKhMHGxHvXmYFxXhZVSbgXzz.KFZS'; // Default: "Kopia15341534!"

interface JWTPayload {
  isAdmin: boolean;
  iat: number;
  exp: number;
}

// Extend Express Request type to include auth info
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export function generateToken(isAdmin: boolean): string {
  return jwt.sign(
    { isAdmin },
    JWT_SECRET,
    { expiresIn: '24h' } // Token expires in 24 hours
  );
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function verifyPassword(password: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Middleware to authenticate API requests
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

  req.user = payload;
  next();
}

// Middleware to check if user is admin
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

// Rate limiting configuration for auth endpoints
export const authRateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
};