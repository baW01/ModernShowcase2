import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import noImagePlaceholder from "@/assets/no-image-placeholder.svg";

interface ImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

export function ImageGallery({ images, alt, className = "" }: ImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Add global mouse event listeners for smooth dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handlePointerMove(e.clientX);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handlePointerEnd();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, startX, dragOffset]);

  // If no images or only one image, show single image
  if (!images || images.length === 0) {
    return (
      <div className={`aspect-square bg-gray-100 relative overflow-hidden ${className} flex items-center justify-center`}>
        <img 
          src={noImagePlaceholder}
          alt="Brak zdjęcia"
          className="w-32 h-32 opacity-60"
        />
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className={`aspect-square bg-gray-100 relative overflow-hidden ${className}`}>
        <img 
          src={images[0] || noImagePlaceholder}
          alt={alt}
          className={images[0] ? "w-full h-full object-cover" : "w-32 h-32 opacity-60 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"}
          draggable={false}
        />
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
    setDragOffset(0);
  };

  // Calculate the transform offset for smooth dragging
  const getTransformOffset = () => {
    const baseOffset = -currentImageIndex * 100;
    const dragOffsetPercent = (dragOffset / (containerRef.current?.offsetWidth || 1)) * 100;
    return baseOffset + dragOffsetPercent;
  };

  // Handle mouse/touch start
  const handlePointerStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setDragOffset(0);
  };

  // Handle mouse/touch move
  const handlePointerMove = (clientX: number) => {
    if (!isDragging) return;
    
    const diff = clientX - startX;
    setDragOffset(diff);
  };

  // Handle mouse/touch end
  const handlePointerEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    const threshold = 50; // minimum distance to trigger slide
    const containerWidth = containerRef.current?.offsetWidth || 300;
    const dragPercent = Math.abs(dragOffset) / containerWidth;
    
    if (Math.abs(dragOffset) > threshold && dragPercent > 0.15) {
      if (dragOffset > 0 && currentImageIndex > 0) {
        // Dragged right - go to previous image
        prevImage();
      } else if (dragOffset < 0 && currentImageIndex < images.length - 1) {
        // Dragged left - go to next image
        nextImage();
      }
    }
    
    setDragOffset(0);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handlePointerStart(e.clientX);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handlePointerStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handlePointerMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handlePointerEnd();
  };

  // Prevent context menu on right click during drag
  const handleContextMenu = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`aspect-square bg-gray-100 relative overflow-hidden group select-none ${className}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onContextMenu={handleContextMenu}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Images Container */}
      <div 
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ 
          transform: `translateX(${getTransformOffset()}%)`,
          transitionDuration: isDragging ? '0ms' : '300ms'
        }}
      >
        {images.map((image, index) => (
          <div key={index} className="w-full h-full flex-shrink-0">
            <img 
              src={image || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=800"}
              alt={`${alt} - zdjęcie ${index + 1}`}
              className="w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=800";
              }}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* UI Elements - Only show if there are multiple images */}
      {images.length > 1 && (
        <>
          {/* Image Counter */}
          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded z-10 pointer-events-none">
            {currentImageIndex + 1} / {images.length}
          </div>

          {/* Dots Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex 
                    ? 'bg-white' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goToImage(index);
                }}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}