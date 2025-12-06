import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { parseImagePair } from "@/lib/image-utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ImageGalleryProps {
  images?: string[];
  alt: string;
  className?: string;
}

const PLACEHOLDER = "/api/placeholder-image.svg";

export function ImageGallery({ images = [], alt, className }: ImageGalleryProps) {
  const normalizedImages = useMemo(() => {
    const source = images.length > 0 ? images : [PLACEHOLDER];

    return source.map((image, index) => {
      const { thumb, full } = parseImagePair(image);
      const fullSrc = full?.trim() || thumb?.trim() || PLACEHOLDER;
      const thumbSrc = thumb?.trim() || full?.trim() || PLACEHOLDER;

      return {
        id: `${index}-${fullSrc}`,
        full: fullSrc,
        thumb: thumbSrc,
      };
    });
  }, [images]);

  const [api, setApi] = useState<CarouselApi>();
  const [lightboxApi, setLightboxApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const [failed, setFailed] = useState<Record<number, boolean>>({});

  const showControls = normalizedImages.length > 1;
  const handleImageClick = () => {
    setLightboxIndex(currentIndex);
    setIsLightboxOpen(true);
  };

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => setCurrentIndex(api.selectedScrollSnap());
    handleSelect();

    api.on("select", handleSelect);
    api.on("reInit", handleSelect);

    return () => {
      api.off("select", handleSelect);
      api.off("reInit", handleSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!lightboxApi || !isLightboxOpen) return;
    lightboxApi.scrollTo(lightboxIndex);
    const handleLightboxSelect = () => {
      const selected = lightboxApi.selectedScrollSnap();
      setLightboxIndex(selected);
      setCurrentIndex(selected);
    };
    handleLightboxSelect();
    lightboxApi.on("select", handleLightboxSelect);
    lightboxApi.on("reInit", handleLightboxSelect);
    return () => {
      lightboxApi.off("select", handleLightboxSelect);
      lightboxApi.off("reInit", handleLightboxSelect);
    };
  }, [lightboxApi, isLightboxOpen, lightboxIndex]);

  return (
    <div className="w-full">
      <Carousel
        opts={{ loop: showControls, align: "start" }}
        className="w-full"
        setApi={setApi}
      >
        <CarouselContent className="-ml-0">
          {normalizedImages.map((image, index) => (
            <CarouselItem key={image.id} className="pl-0">
              <div
                className={cn(
                  "relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100",
                  "cursor-zoom-in",
                  className
                )}
                role="button"
                tabIndex={0}
                onClick={handleImageClick}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleImageClick();
                  }
                }}
              >
                {!loaded[index] && <Skeleton className="absolute inset-0" />}
                <img
                  src={failed[index] ? PLACEHOLDER : image.full}
                  alt={`${alt}${normalizedImages.length > 1 ? ` (${index + 1}/${normalizedImages.length})` : ""}`}
                  className={cn(
                    "h-full w-full object-cover transition-opacity duration-200",
                    loaded[index] ? "opacity-100" : "opacity-0"
                  )}
                  loading={index === 0 ? "eager" : "lazy"}
                  onLoad={() =>
                    setLoaded((prev) => ({
                      ...prev,
                      [index]: true,
                    }))
                  }
                  onError={() =>
                    setFailed((prev) => ({
                      ...prev,
                      [index]: true,
                    }))
                  }
                  draggable={false}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {showControls && (
          <>
            <CarouselPrevious className="hidden sm:flex bg-white/80 text-gray-700 shadow hover:bg-white" />
            <CarouselNext className="hidden sm:flex bg-white/80 text-gray-700 shadow hover:bg-white" />
          </>
        )}
      </Carousel>

      {showControls && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {normalizedImages.map((image, index) => (
            <button
              key={`${image.id}-thumb`}
              type="button"
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "h-12 w-12 overflow-hidden rounded-md border border-transparent bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                currentIndex === index
                  ? "ring-2 ring-primary ring-offset-2 border-primary"
                  : "hover:border-gray-300"
              )}
              aria-label={`Pokaz zdjecie ${index + 1}`}
            >
              <img
                src={image.thumb}
                alt={`${alt} miniaturka ${index + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}

      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="sr-only">Podgląd zdjęć: {alt}</DialogTitle>
          </DialogHeader>
          <Carousel
            opts={{ loop: showControls, align: "center" }}
            className="w-full"
            setApi={setLightboxApi}
          >
            <CarouselContent className="-ml-0">
              {normalizedImages.map((image) => (
                <CarouselItem key={`${image.id}-lightbox`} className="pl-0">
                  <div className="relative w-full overflow-hidden rounded-lg bg-black/5">
                    <img
                      src={image.full}
                      alt={alt}
                      className="h-full w-full max-h-[70vh] object-contain bg-black/5"
                      loading="lazy"
                      draggable={false}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {showControls && (
              <>
                <CarouselPrevious className="bg-white/90 text-gray-700 shadow hover:bg-white" />
                <CarouselNext className="bg-white/90 text-gray-700 shadow hover:bg-white" />
              </>
            )}
          </Carousel>
          {showControls && (
            <div className="mt-3 flex items-center justify-center gap-2">
              {normalizedImages.map((image, index) => (
                <button
                  key={`${image.id}-lightbox-thumb`}
                  type="button"
                  onClick={() => lightboxApi?.scrollTo(index)}
                  className={cn(
                    "h-14 w-14 overflow-hidden rounded-md border border-transparent bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    lightboxIndex === index
                      ? "ring-2 ring-primary ring-offset-2 border-primary"
                      : "hover:border-gray-300"
                  )}
                  aria-label={`Pokaz zdjecie ${index + 1}`}
                >
                  <img
                    src={image.thumb}
                    alt={`${alt} miniaturka ${index + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
