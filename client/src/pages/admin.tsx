import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Store, Eye, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminNav } from "@/components/admin-nav";
import { ProductForm } from "@/components/product-form";
import { ProductsTable } from "@/components/products-table";
import { SettingsForm } from "@/components/settings-form";
import { AdminLogin } from "@/components/admin-login";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import type { Product, Settings as SettingsType } from "@shared/schema";
import { useState } from "react";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("products");
  const { isAuthenticated, isLoading: authLoading, login, logout } = useAdminAuth();

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: isAuthenticated, // Only fetch when authenticated
  });

  const { data: settings } = useQuery<SettingsType>({
    queryKey: ["/api/settings"],
    enabled: isAuthenticated, // Only fetch when authenticated
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} />;
  }

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
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  Widok publiczny
                </Button>
              </Link>
              <Button variant="default" size="sm" className="bg-primary/10 text-primary hover:bg-primary/20">
                <Settings className="mr-2 h-4 w-4" />
                Panel Admin
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={logout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Wyloguj
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-text mb-2">Panel Administracyjny</h2>
          <p className="text-gray-600">Zarządzaj produktami i ustawieniami sklepu</p>
        </div>

        <AdminNav activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="mt-8">
          {activeTab === "products" && <ProductsTable products={products} />}
          {activeTab === "add-product" && <ProductForm />}
          {activeTab === "settings" && <SettingsForm settings={settings} />}
        </div>
      </div>
    </div>
  );
}
