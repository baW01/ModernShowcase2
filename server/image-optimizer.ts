/**
 * Image optimization utilities for reducing data transfer sizes
 */

export function optimizeImageUrls(imageUrls: string[] | null, isListView = true): string[] | null {
  if (!imageUrls || !Array.isArray(imageUrls)) {
    return imageUrls;
  }

  // For list view, only include first image to drastically reduce transfer size
  const maxImages = isListView ? 1 : 3;
  const limitedUrls = imageUrls.slice(0, maxImages);

  // If images are base64, replace large ones with placeholder for list view
  return limitedUrls.map((url, index) => {
    if (url && url.startsWith('data:image/')) {
      const sizeEstimate = url.length * 0.75; // Rough base64 size estimation
      
      if (isListView && sizeEstimate > 5 * 1024) { // Over 5KB for list view - extremely aggressive
        console.warn(`[Performance] Large image detected (${Math.round(sizeEstimate / 1024)}KB) - replacing with placeholder for list view`);
        // Return null to completely remove large images from list view
        return null;
      }
      
      if (sizeEstimate > 500 * 1024) { // Over 500KB
        console.warn(`[Performance] Very large image detected (${Math.round(sizeEstimate / 1024)}KB), consider compression`);
      }
    }
    return url;
  });
}

export function estimateDataSize(data: any): number {
  return JSON.stringify(data).length;
}

export function logDataTransferSize(endpoint: string, data: any): void {
  const size = estimateDataSize(data);
  const sizeKB = Math.round(size / 1024);
  
  if (sizeKB > 100) {
    console.warn(`[Performance] Large response from ${endpoint}: ${sizeKB}KB`);
  } else {
    console.log(`[Performance] Response from ${endpoint}: ${sizeKB}KB`);
  }
}