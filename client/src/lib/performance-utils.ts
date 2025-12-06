// Performance monitoring and optimization utilities

export function measurePerformance(name: string, fn: () => Promise<void> | void) {
  const start = performance.now();
  const result = fn();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const duration = performance.now() - start;
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    });
  } else {
    const duration = performance.now() - start;
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    return result;
  }
}

// Debounce function for API calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Preload images for better perceived performance
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Batch multiple API calls to reduce server load
export class APIBatcher {
  private queue: Array<{
    url: string;
    options: RequestInit;
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
  }> = [];
  
  private batchTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly batchSize = 10;
  private readonly batchDelay = 100; // 100ms

  async add(url: string, options: RequestInit = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ url, options, resolve, reject });
      
      if (this.queue.length >= this.batchSize) {
        this.processBatch();
      } else if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => this.processBatch(), this.batchDelay);
      }
    });
  }

  private async processBatch() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    const batch = this.queue.splice(0, this.batchSize);
    
    // Process all requests in parallel
    const promises = batch.map(async ({ url, options, resolve, reject }) => {
      try {
        const response = await fetch(withApiBase(url), options);
        const data = await response.json();
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });

    await Promise.allSettled(promises);
  }
}

// Singleton instance for API batching
export const apiBatcher = new APIBatcher();

// Memory usage monitoring
export function logMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log('[Memory]', {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
    });
  }
}

// Check if user is on a slow connection
export function isSlowConnection(): boolean {
  const connection = (navigator as any).connection;
  if (connection) {
    return connection.effectiveType === 'slow-2g' || 
           connection.effectiveType === '2g' || 
           connection.downlink < 1.5;
  }
  return false;
}

// Adaptive loading based on connection speed
export function getOptimalImageQuality(): 'low' | 'medium' | 'high' {
  if (isSlowConnection()) {
    return 'low';
  }
  
  const connection = (navigator as any).connection;
  if (connection && connection.effectiveType === '3g') {
    return 'medium';
  }
  
  return 'high';
}
import { withApiBase } from "@/lib/queryClient";
