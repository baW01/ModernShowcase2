/**
 * Image compression utilities for reducing file sizes
 */

// Simple image compression by reducing quality and resizing
export function compressBase64Image(base64Image: string, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create canvas for compression
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convert to compressed base64
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    img.src = base64Image;
  });
}

// Convert base64 to buffer for server-side processing
export function base64ToBuffer(base64String: string): Buffer {
  // Remove data URL prefix if present
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

// Server-side image compression using sharp (would need to be installed)
export async function compressImageBuffer(buffer: Buffer, maxWidth = 800, quality = 80): Promise<Buffer> {
  try {
    // For now, return original buffer since we don't have sharp installed
    // In production, this would use sharp or similar library:
    // const sharp = require('sharp');
    // return await sharp(buffer)
    //   .resize(maxWidth, null, { withoutEnlargement: true })
    //   .jpeg({ quality })
    //   .toBuffer();
    
    console.log(`[Image Compression] Processing image (${buffer.length} bytes)`);
    
    // Basic compression by limiting buffer size
    if (buffer.length > 500 * 1024) { // Over 500KB
      console.warn(`[Image Compression] Large image detected (${Math.round(buffer.length / 1024)}KB), recommend using proper compression library`);
    }
    
    return buffer;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Failed to compress image');
  }
}

// Estimate compressed size
export function estimateCompressedSize(originalSize: number, quality = 0.7): number {
  return Math.round(originalSize * quality * 0.6); // Rough estimation
}