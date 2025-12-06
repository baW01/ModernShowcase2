import sharp from "sharp";

/**
 * Convert base64 string to buffer.
 */
export function base64ToBuffer(base64String: string): Buffer {
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64Data, "base64");
}

/**
 * Compress and resize image buffer using sharp.
 */
export async function compressImageBuffer(
  buffer: Buffer,
  maxWidth = 800,
  quality = 80,
): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .rotate() // fix orientation if EXIF present
      .resize({ width: maxWidth, withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
  } catch (error) {
    console.error("Error compressing image:", error);
    // Fall back to original buffer if compression fails
    return buffer;
  }
}
