import { Button } from "@/components/ui/button";
import { Box, Plus, Settings } from "lucide-react";

interface AdminNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminNav({ activeTab, onTabChange }: AdminNavProps) {
  const tabs = [
    { id: "products", label: "Products", icon: Box },
    { id: "add-product", label: "Add Product", icon: Plus },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant="ghost"
              className={`border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}
