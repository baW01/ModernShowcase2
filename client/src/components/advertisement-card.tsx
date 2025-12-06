import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Advertisement } from "@shared/schema";
import noImagePlaceholder from "@/assets/no-image-placeholder.svg";

interface AdvertisementCardProps {
  advertisement: Advertisement;
}

export function AdvertisementCard({ advertisement }: AdvertisementCardProps) {
  const [viewTracked, setViewTracked] = useState(false);
  const viewStorageKey = `ad_view_${advertisement.id}`;

  // Track view when component mounts (once per 6h via localStorage)
  useEffect(() => {
    if (viewTracked) return;

    const lastView = (() => {
      try {
        return localStorage.getItem(viewStorageKey);
      } catch {
        return null;
      }
    })();

    const sixHoursMs = 6 * 60 * 60 * 1000;
    if (lastView && Date.now() - Number(lastView) < sixHoursMs) {
      setViewTracked(true);
      return;
    }

    const trackView = async () => {
      try {
        await apiRequest(`/api/advertisements/${advertisement.id}/view`, {
          method: 'POST',
        });
        try {
          localStorage.setItem(viewStorageKey, String(Date.now()));
        } catch {
          // ignore storage errors
        }
        setViewTracked(true);
      } catch {
        // Ignore errors, don't block render
      }
    };
    
    const timer = setTimeout(trackView, 800);
    return () => clearTimeout(timer);
  }, [advertisement.id, viewStorageKey, viewTracked]);

  const handleClick = async () => {
    try {
      await apiRequest(`/api/advertisements/${advertisement.id}/click`, {
        method: 'POST',
      });
      
      if (advertisement.targetUrl) {
        window.open(advertisement.targetUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      // If tracking fails, still open the link
      if (advertisement.targetUrl) {
        window.open(advertisement.targetUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
    <Card 
      className={`bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-200 transition-all duration-200 ${
        advertisement.targetUrl ? 'hover:shadow-md cursor-pointer hover:border-blue-300' : ''
      }`}
      onClick={advertisement.targetUrl ? handleClick : undefined}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
            REKLAMA
          </Badge>
          {advertisement.targetUrl && (
            <ExternalLink className="h-4 w-4 text-blue-600" />
          )}
        </div>
        
        <div className="flex gap-3">
          {advertisement.imageUrl && (
            <div className="flex-shrink-0">
              <img
                src={advertisement.imageUrl}
                alt={advertisement.title}
                className="w-16 h-16 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = noImagePlaceholder;
                }}
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-900 mb-1">
              {advertisement.title}
            </h3>
            {advertisement.description && (
              <p className="text-xs text-gray-600 line-clamp-2">
                {advertisement.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
