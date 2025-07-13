import { useState, useRef, useEffect } from "react";
import { ProductCard } from "./product-card";
import type { Product } from "@shared/schema";

interface LazyProductCardProps {
  product: Product;
  index: number;
}

export function LazyProductCard({ product, index }: LazyProductCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px",
        threshold: 0.1,
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Load first 8 products immediately for better UX
  const shouldRender = index < 8 || isVisible;

  return (
    <div ref={cardRef} className="h-full">
      {shouldRender ? (
        <ProductCard product={product} />
      ) : (
        <div className="bg-white rounded-lg shadow-sm h-full min-h-[280px] flex items-center justify-center">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-48 w-full rounded-t-lg mb-4"></div>
            <div className="px-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}