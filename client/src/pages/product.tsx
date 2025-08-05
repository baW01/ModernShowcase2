import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageGallery } from "@/components/image-gallery";
import { ContactModal } from "@/components/contact-modal";
import { useState, useEffect } from "react";
import { Share, ArrowLeft, Phone, Eye, Store } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  imageUrls?: string[];
  contactPhone?: string;
  isSold: boolean;
  views: number;
  clicks: number;
  createdAt: string;
}

export default function Product() {
  const [, params] = useRoute("/product/:id");
  const [, setLocation] = useLocation();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const { toast } = useToast();
  
  const productId = params?.id ? parseInt(params.id) : null;

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ['/api/products', productId],
    enabled: !!productId,
    staleTime: 30 * 60 * 1000, // 30 minutes - cache individual products longer
    refetchOnWindowFocus: false, // Don't refetch when window gets focus
    retry: 1, // Only retry once on failure for faster error handling
    refetchOnMount: false, // Don't refetch if we have cached data
  });

  const { data: settings } = useQuery<{storeName?: string}>({
    queryKey: ['/api/settings'],
    staleTime: 30 * 60 * 1000, // 30 minutes - settings rarely change
    refetchOnWindowFocus: false,
  });

  // Record product view when component mounts (debounced for performance)
  useEffect(() => {
    if (productId && product) {
      // Debounce view tracking to avoid multiple requests
      const timer = setTimeout(() => {
        fetch(`/api/products/${productId}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }).catch(console.error);
      }, 1000); // 1 second delay
      
      return () => clearTimeout(timer);
    }
  }, [productId, product]);

  // Update page meta tags for social sharing
  useEffect(() => {
    if (product) {
      // Update page title
      document.title = `${product.title} - ${product.category} | ${settings?.storeName || 'Spotted GFC'}`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 
          `${product.description.substring(0, 155)}... Cena: ${(product.price / 100).toFixed(2)} zł`
        );
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = `${product.description.substring(0, 155)}... Cena: ${(product.price / 100).toFixed(2)} zł`;
        document.head.appendChild(meta);
      }

      // Update Open Graph tags
      updateOrCreateMetaTag('property', 'og:title', product.title);
      updateOrCreateMetaTag('property', 'og:description', product.description);
      updateOrCreateMetaTag('property', 'og:type', 'product');
      updateOrCreateMetaTag('property', 'og:url', window.location.href);
      
      // Use first image for preview
      const previewImage = product.imageUrls?.[0] || product.imageUrl;
      if (previewImage) {
        updateOrCreateMetaTag('property', 'og:image', previewImage);
        updateOrCreateMetaTag('property', 'og:image:width', '800');
        updateOrCreateMetaTag('property', 'og:image:height', '600');
      }

      // Twitter Card tags
      updateOrCreateMetaTag('name', 'twitter:card', 'summary_large_image');
      updateOrCreateMetaTag('name', 'twitter:title', product.title);
      updateOrCreateMetaTag('name', 'twitter:description', product.description);
      if (previewImage) {
        updateOrCreateMetaTag('name', 'twitter:image', previewImage);
      }
    }
  }, [product, settings]);

  const updateOrCreateMetaTag = (attribute: string, attributeValue: string, content: string) => {
    let meta = document.querySelector(`meta[${attribute}="${attributeValue}"]`);
    if (meta) {
      meta.setAttribute('content', content);
    } else {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, attributeValue);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    }
  };

  const handleContactClick = async () => {
    // Record click
    if (productId) {
      fetch(`/api/products/${productId}/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).catch(console.error);
    }
    
    if (product?.contactPhone) {
      setIsContactModalOpen(true);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product?.title || '',
      text: `${product?.title} - ${(product?.price || 0) / 100} zł`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled share or error occurred
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
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

  if (!productId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Nieprawidłowy identyfikator produktu</h1>
          <Button onClick={() => setLocation('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrót do strony głównej
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie produktu...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produkt nie został znaleziony</h1>
          <p className="text-gray-600 mb-6">Podany produkt nie istnieje lub został usunięty.</p>
          <Button onClick={() => setLocation('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrót do strony głównej
          </Button>
        </div>
      </div>
    );
  }

  const images = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls 
    : product.imageUrl 
      ? [product.imageUrl] 
      : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/')}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrót
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleShare}
            className="flex items-center"
          >
            <Share className="w-4 h-4 mr-2" />
            Udostępnij
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Gallery */}
              <div>
                <ImageGallery 
                  images={images}
                  alt={product.title}
                  className="rounded-lg"
                />
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{product.category}</Badge>
                    {product.isSold && (
                      <Badge variant="destructive">Sprzedane</Badge>
                    )}
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {product.title}
                  </h1>
                  
                  <p className="text-2xl font-bold text-blue-600 mb-4">
                    {(product.price / 100).toFixed(2)} zł
                  </p>
                </div>

                <div className="prose prose-gray max-w-none">
                  <h3 className="text-lg font-semibold mb-2">Opis</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {product.views} wyświetleń
                  </div>
                  <div>•</div>
                  <div>
                    Dodano: {new Date(product.createdAt).toLocaleDateString('pl-PL')}
                  </div>
                </div>

                {/* Contact Button */}
                {!product.isSold && product.contactPhone && (
                  <Button 
                    onClick={handleContactClick}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Skontaktuj się: {product.contactPhone}
                  </Button>
                )}

                {product.isSold && (
                  <div className="p-4 bg-gray-100 rounded-lg text-center">
                    <p className="text-gray-600 font-medium">Ten produkt został już sprzedany</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Modal */}
      {product.contactPhone && (
        <ContactModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          phoneNumber={product.contactPhone}
          productTitle={product.title}
        />
      )}
    </div>
  );
}