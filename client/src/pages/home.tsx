import { useQuery } from "@tanstack/react-query";
import { Search, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LazyProductCard } from "@/components/lazy-product-card";
import { ProductRequestForm } from "@/components/product-request-form";
import { Footer } from "@/components/footer";
import { AdvertisementCard } from "@/components/advertisement-card";
import type { Product, Settings, Advertisement } from "@shared/schema";
import { useState } from "react";
import { Link } from "wouter";
import { withApiBase } from "@/lib/queryClient";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState<'popularity' | 'newest' | 'price_asc' | 'price_desc'>('newest');

  const { data: productsResponse, isLoading: productsLoading, error: productsError } = useQuery<{products: Product[], pagination: any}>({
    queryKey: ["/api/products", sortBy],
    queryFn: () => fetch(withApiBase(`/api/products?sortBy=${sortBy}&limit=20`)).then(res => res.json()), // Load 20 products for faster loading
    staleTime: 0, // always refetch to show newest products immediately
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1, // Only retry once for faster error handling
  });
  
  const products = productsResponse?.products || [];

  const { data: settings, error: settingsError } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  const { data: advertisements = [] } = useQuery<Advertisement[]>({
    queryKey: ["/api/advertisements/active"],
    staleTime: 0, // Always refetch when cache is invalidated
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  // Debug: Log any errors and data (only in development)
  if (import.meta.env.DEV) {
    if (productsError) {
      console.error('Products error:', productsError);
    }
    if (settingsError) {
      console.error('Settings error:', settingsError);
    }
  }

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || 
                         (selectedStatus === "available" && !product.isSold) ||
                         (selectedStatus === "sold" && product.isSold);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Separate available and sold products
  const availableProducts = filteredProducts.filter(product => !product.isSold);
  const soldProducts = filteredProducts.filter(product => product.isSold);

  const categories = Array.from(new Set(products.map(p => p.category)));

  // Debug: Log products data to help troubleshoot (only in development)
  if (import.meta.env.DEV) {
    console.log('Products data:', products);
    console.log('Products loading:', productsLoading);
    console.log('Filtered products:', filteredProducts);
    console.log('Available products:', availableProducts);
    if (products.length > 0) {
      console.log(`[Performance] Products loaded: ${products.length} items`);
      console.log(`[Performance] Pagination info:`, productsResponse?.pagination);
    }
  }

  // Function to mix advertisements with products
  const mixAdvertisementsWithProducts = (products: Product[]) => {
    if (advertisements.length === 0) {
      return products;
    }
    if (products.length === 0) {
      return advertisements;
    }

    const mixed: (Product | Advertisement)[] = [];
    let adIndex = 0;
    let adInserted = false;
    
    products.forEach((product, index) => {
      mixed.push(product);
      
      // Insert advertisement every 6 products (not too frequently)
      if ((index + 1) % 6 === 0 && adIndex < advertisements.length) {
        mixed.push(advertisements[adIndex]);
        adIndex = (adIndex + 1) % advertisements.length; // Cycle through ads
        adInserted = true;
      }
    });

    // If the list is short and no ad was inserted, append one ad
    if (!adInserted && advertisements.length > 0) {
      mixed.push(advertisements[0]);
    }

    return mixed;
  };

  const mixedAvailableItems = mixAdvertisementsWithProducts(availableProducts);

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Ładowanie produktów...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle errors
  if (productsError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-destructive mb-4">Błąd ładowania produktów</p>
            <Button onClick={() => window.location.reload()}>
              Odśwież stronę
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center py-4 sm:py-0 sm:h-16 gap-4 sm:gap-0">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/">
                  <h1 className="text-xl font-bold text-primary flex items-center cursor-pointer hover:text-primary/80 transition-colors">
                    <Store className="mr-2 h-6 w-6" />
                    {settings?.storeName || "ProductHub"}
                  </h1>
                </Link>
              </div>
            </div>
            <div className="flex justify-end">
              <ProductRequestForm />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-300/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-300/30 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-300/20 rounded-full blur-2xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Odkryj niesamowite produkty</h2>
          <p className="text-xl text-gray-700 mb-8">
            {settings?.storeDescription || "Przeglądaj naszą wyselekcjonowaną kolekcję i skontaktuj się bezpośrednio ze sprzedawcami"}
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="bg-white shadow-sm py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Szukaj produktów..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Wszystkie kategorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie kategorie</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Wszystkie statusy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie statusy</SelectItem>
                  <SelectItem value="available">Dostępne</SelectItem>
                  <SelectItem value="sold">Sprzedane</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Available Products */}
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h3 className="text-2xl font-bold text-text mb-2">Dostępne produkty</h3>
                <p className="text-gray-600">Skontaktuj się bezpośrednio ze sprzedawcami w sprawie zapytań</p>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <p className="text-gray-600">
                  Znaleziono {availableProducts.length} {availableProducts.length === 1 ? 'produkt' : 'produktów'}
                </p>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'popularity' | 'newest' | 'price_asc' | 'price_desc')}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Sortuj według" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Najnowsze</SelectItem>
                    <SelectItem value="popularity">Najpopularniejsze</SelectItem>
                    <SelectItem value="price_asc">Cena: rosnąco</SelectItem>
                    <SelectItem value="price_desc">Cena: malejąco</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {mixedAvailableItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Nie znaleziono dostępnych produktów.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {mixedAvailableItems.map((item, index) => {
                  // Check if item is an advertisement by checking if it has 'priority' property
                  if ('priority' in item) {
                    return (
                      <div key={`ad-${item.id}`} className="col-span-2 lg:col-span-3 xl:col-span-4">
                        <AdvertisementCard advertisement={item as Advertisement} />
                      </div>
                    );
                  } else {
                    return (
                      <LazyProductCard key={item.id} product={item as Product} index={index} />
                    );
                  }
                })}
              </div>
            )}
          </div>

          {/* Sold Products */}
          {soldProducts.length > 0 && (
            <div className="border-t border-gray-200 pt-12">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-text mb-2">Sprzedane przedmioty</h3>
                <p className="text-gray-600">Niedawno sprzedane produkty</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {soldProducts.map((product, index) => (
                  <LazyProductCard key={product.id} product={product} index={index + availableProducts.length} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
