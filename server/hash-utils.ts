import crypto from 'crypto';

const APP_ENV = process.env.NODE_ENV || 'production';
const DEFAULT_HASH_SECRET = 'your-secure-secret-key-change-this';

// Secret key for hashing - should be in environment variable in production
const HASH_SECRET = (() => {
  if (APP_ENV === 'production' && (!process.env.HASH_SECRET || process.env.HASH_SECRET === DEFAULT_HASH_SECRET)) {
    throw new Error('[Security] HASH_SECRET must be set in production');
  }
  return process.env.HASH_SECRET || DEFAULT_HASH_SECRET;
})();

/**
 * Generates a secure hash token for a product ID that can be used in delete request links
 * @param productId - The product ID to hash
 * @returns A secure hash token
 */
export function generateProductToken(productId: number): string {
  const timestamp = Date.now();
  const data = `${productId}:${timestamp}`;
  const hash = crypto.createHmac('sha256', HASH_SECRET).update(data).digest('hex');
  
  // Combine timestamp and hash, encode as base64 for URL safety
  const token = Buffer.from(`${timestamp}:${hash}:${productId}`).toString('base64url');
  return token;
}

/**
 * Validates and extracts product ID from a secure token
 * @param token - The token to validate
 * @returns Product ID if valid, null if invalid or expired
 */
export function validateProductToken(token: string): number | null {
  try {
    // Decode the token
    const decoded = Buffer.from(token, 'base64url').toString();
    const [timestampStr, hash, productIdStr] = decoded.split(':');
    
    if (!timestampStr || !hash || !productIdStr) {
      return null;
    }
    
    const timestamp = parseInt(timestampStr);
    const productId = parseInt(productIdStr);
    
    if (isNaN(timestamp) || isNaN(productId)) {
      return null;
    }
    
    // Check if token is not older than 30 days (30 * 24 * 60 * 60 * 1000 ms)
    const maxAge = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > maxAge) {
      return null;
    }
    
    // Verify the hash
    const data = `${productId}:${timestamp}`;
    const expectedHash = crypto.createHmac('sha256', HASH_SECRET).update(data).digest('hex');
    
    if (hash !== expectedHash) {
      return null;
    }
    
    return productId;
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}

/**
 * Generates a secure token for product deletion requests
 * This is a convenience function that calls generateProductToken
 * @param productId - The product ID
 * @returns A secure token for delete requests
 */
export function generateDeleteRequestToken(productId: number): string {
  return generateProductToken(productId);
}
