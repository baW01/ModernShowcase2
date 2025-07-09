import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, Store, Settings as SettingsIcon, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/product-card";
import type { Product, Settings } from "@shared/schema";
import { useState } from "react";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

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

  const categories = [...new Set(products.map(p => p.category))];

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-primary flex items-center">
                  <Store className="mr-2 h-6 w-6" />
                  {settings?.storeName || "ProductHub"}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="default" size="sm" className="bg-primary/10 text-primary hover:bg-primary/20">
                <Eye className="mr-2 h-4 w-4" />
                Widok publiczny
              </Button>
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Panel Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Odkryj niesamowite produkty</h2>
          <p className="text-xl text-blue-100 mb-8">
            {settings?.storeDescription || "Przeglądaj naszą wyselekcjonowaną kolekcję i skontaktuj się bezpośrednio ze sprzedawcami"}
          </p>
          <div className="flex justify-center items-center space-x-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-accent">📞</span>
              <span className="ml-2">{settings?.contactPhone || "+1 (555) 123-4567"}</span>
            </div>
          </div>
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
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-text mb-2">Dostępne produkty</h3>
              <p className="text-gray-600">Skontaktuj się bezpośrednio ze sprzedawcami w sprawie zapytań</p>
            </div>

            {availableProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Nie znaleziono dostępnych produktów.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {availableProducts.map(product => (
                  <ProductCard key={product.id} product={product} contactPhone={settings?.contactPhone} />
                ))}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {soldProducts.map(product => (
                  <ProductCard key={product.id} product={product} contactPhone={settings?.contactPhone} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
