import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Check, Eye, Share, ExternalLink, CheckCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product } from "@shared/schema";
import { useEffect, useState } from "react";
import { ContactModal } from "./contact-modal";
import { ImageGallery } from "./image-gallery";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Track view when component mounts (debounced)
  useEffect(() => {
    const trackView = async () => {
      try {
        await apiRequest(`/api/products/${product.id}/view`, {
          method: 'POST',
        });
        // Don't invalidate cache to avoid scroll jumps
      } catch (error) {
        // Ignore errors, don't block view
      }
    };
    
    // Debounce view tracking to prevent excessive API calls
    const timer = setTimeout(trackView, 500);
    return () => clearTimeout(timer);
  }, [product.id]);

  const formatPrice = (priceInCents: number) => {
    return `${(priceInCents / 100).toFixed(2)} zł`;
  };

  const handleContact = async () => {
    // Track contact click
    try {
      await apiRequest(`/api/products/${product.id}/click`, {
        method: 'POST',
      });
      // Don't invalidate cache to avoid scroll jumps
    } catch (error) {
      // Ignore errors, don't block contact action
    }
    
    // Open contact modal
    setIsContactModalOpen(true);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const productUrl = `${window.location.origin}/product/${product.id}`;
    const shareData = {
      title: product.title,
      text: `${product.title} - ${formatPrice(product.price)}`,
      url: productUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled share or error occurred
        copyToClipboard(productUrl);
      }
    } else {
      copyToClipboard(productUrl);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link skopiowany!",
        description: "Link do produktu został skopiowany do schowka.",
      });
    }).catch(() => {
      toast({
        title: "Błąd",
        description: "Nie udało się skopiować linku.",
        variant: "destructive",
      });
    });
  };

  const handleViewProduct = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocation(`/product/${product.id}`);
  };

  // Prepare images array for gallery
  const images = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls 
    : product.imageUrl 
      ? [product.imageUrl] 
      : [];

  return (
    <div className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group ${product.isSold ? 'opacity-75' : ''}`}>
      <div className="relative">
        <ImageGallery 
          images={images}
          alt={product.title}
          className={`transition-transform duration-300 ${!product.isSold ? 'group-hover:scale-105' : ''}`}
        />
        {product.isSold && (
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          {product.saleVerified && (
            <Badge className="bg-green-600 text-white">
              <CheckCircle className="h-3 w-3 mr-1" />
              Zweryfikowane
            </Badge>
          )}
          <Badge 
            variant={product.isSold ? "secondary" : "default"}
            className={product.isSold ? "bg-sold text-white" : "bg-secondary text-white"}
          >
            {product.isSold ? "Sprzedane" : "Dostępne"}
          </Badge>
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <h4 className={`font-semibold text-sm sm:text-base mb-2 ${product.isSold ? 'text-sold' : 'text-text'}`} style={{
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
          overflow: 'hidden'
        }}>
          {product.title}
        </h4>
        <p className={`text-xs sm:text-sm mb-3 ${product.isSold ? 'text-gray-500' : 'text-gray-600'}`} style={{
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
          overflow: 'hidden'
        }}>
          {product.description}
        </p>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-base sm:text-xl font-bold ${product.isSold ? 'text-sold' : 'text-primary'}`}>
            {formatPrice(product.price)}
          </span>
          {/* Statistics */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{product.views || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{product.clicks || 0}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-0">
          <div className="flex gap-1 sm:gap-2 flex-1">
            <Button 
              onClick={handleViewProduct}
              variant="outline"
              size="sm"
              className="flex-1 text-xs sm:text-sm px-2 sm:px-3"
            >
              <ExternalLink className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Zobacz
            </Button>
            <Button 
              onClick={handleShare}
              variant="ghost"
              size="sm"
              className="px-2 sm:px-3"
            >
              <Share className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
          
          <div className="flex-1 sm:flex-none">
            {product.isSold ? (
              <Button 
                disabled 
                className="bg-gray-400 text-white cursor-not-allowed w-full sm:w-auto text-xs sm:text-sm px-2 sm:px-3"
                size="sm"
              >
                <Check className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Sprzedane
              </Button>
            ) : (
              <Button 
                onClick={handleContact}
                className="bg-accent hover:bg-orange-600 text-white w-full sm:w-auto text-xs sm:text-sm px-2 sm:px-3"
                size="sm"
              >
                <Phone className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Kontakt
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        phoneNumber={product.contactPhone || ""}
        productTitle={product.title}
      />
    </div>
  );
}
