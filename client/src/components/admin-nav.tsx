import { Button } from "@/components/ui/button";
import { Box, Plus, Settings, Package, Folder, Trash2, Megaphone } from "lucide-react";

interface AdminNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminNav({ activeTab, onTabChange }: AdminNavProps) {
  const tabs = [
    { id: "products", label: "Produkty", icon: Box },
    { id: "add-product", label: "Dodaj produkt", icon: Plus },
    { id: "categories", label: "Kategorie", icon: Folder },
    { id: "advertisements", label: "Reklamy", icon: Megaphone },
    { id: "requests", label: "Prośby o produkty", icon: Package },
    { id: "delete-requests", label: "Prośby o usunięcie", icon: Trash2 },
    { id: "settings", label: "Ustawienia", icon: Settings },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex flex-wrap gap-2 sm:gap-8 sm:space-x-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant="ghost"
              className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors min-h-[44px] flex-1 sm:flex-none ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">
                {tab.id === "products" && "Produkty"}
                {tab.id === "add-product" && "Dodaj"}
                {tab.id === "categories" && "Kategorie"}
                {tab.id === "advertisements" && "Reklamy"}
                {tab.id === "requests" && "Prośby"}
                {tab.id === "delete-requests" && "Usunięcie"}
                {tab.id === "settings" && "Ustawienia"}
              </span>
            </Button>
          );
        })}
      </nav>
    </div>
  );
}
