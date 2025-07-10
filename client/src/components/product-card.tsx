import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Check, Eye, MousePointer2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Product } from "@shared/schema";
import { useEffect } from "react";

interface ProductCardProps {
  product: Product;
  contactPhone?: string;
}

export function ProductCard({ product, contactPhone }: ProductCardProps) {
  // Track view when component mounts
  useEffect(() => {
    apiRequest(`/api/products/${product.id}/views`, { method: 'POST' }).catch(() => {});
  }, [product.id]);

  const formatPrice = (priceInCents: number) => {
    return `${(priceInCents / 100).toFixed(2)} zł`;
  };

  const handleContact = async () => {
    // Track click
    try {
      await apiRequest(`/api/products/${product.id}/clicks`, { method: 'POST' });
    } catch (error) {
      // Ignore errors, don't block contact action
    }

    const phoneNumber = product.contactPhone || contactPhone;
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group ${product.isSold ? 'opacity-75' : ''}`}>
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        <img 
          src={product.imageUrl || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=800"} 
          alt={product.title}
          className={`w-full h-full object-cover transition-transform duration-300 ${!product.isSold ? 'group-hover:scale-105' : ''}`}
        />
        {product.isSold && (
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        )}
        <div className="absolute top-2 right-2">
          <Badge 
            variant={product.isSold ? "secondary" : "default"}
            className={product.isSold ? "bg-sold text-white" : "bg-secondary text-white"}
          >
            {product.isSold ? "Sprzedane" : "Dostępne"}
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <h4 className={`font-semibold mb-2 ${product.isSold ? 'text-sold' : 'text-text'}`}>
          {product.title}
        </h4>
        <p className={`text-sm mb-3 ${product.isSold ? 'text-gray-500' : 'text-gray-600'}`}>
          {product.description}
        </p>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-2xl font-bold ${product.isSold ? 'text-sold' : 'text-primary'}`}>
            {formatPrice(product.price)}
          </span>
          {/* Statistics */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{product.views || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <MousePointer2 className="h-3 w-3" />
              <span>{product.clicks || 0}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          {product.isSold ? (
            <Button 
              disabled 
              className="bg-gray-400 text-white cursor-not-allowed"
              size="sm"
            >
              <Check className="mr-2 h-4 w-4" />
              Sprzedane
            </Button>
          ) : (
            <Button 
              onClick={handleContact}
              className="bg-accent hover:bg-orange-600 text-white"
              size="sm"
            >
              <Phone className="mr-2 h-4 w-4" />
              Kontakt
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
