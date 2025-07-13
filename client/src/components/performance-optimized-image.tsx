import { useState, useRef, useEffect } from "react";

interface PerformanceOptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function PerformanceOptimizedImage({
  src,
  alt,
  className = "",
  loading = "lazy",
  fallbackSrc = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=800",
  onLoad,
  onError,
}: PerformanceOptimizedImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Preload next image if lazy loading
  useEffect(() => {
    if (loading === "lazy" && src && !isLoaded) {
      const img = new Image();
      img.src = src;
      img.onload = () => setIsLoaded(true);
      img.onerror = () => setHasError(true);
    }
  }, [src, loading, isLoaded]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    if (!hasError && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(true);
    }
    onError?.();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded"></div>
      )}
      
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        draggable={false}
        decoding="async"
        // Add srcset for responsive images if supported
        srcSet={`${currentSrc} 1x, ${currentSrc.replace('w=800', 'w=1600')} 2x`}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}