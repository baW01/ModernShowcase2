import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Advertisement } from "@shared/schema";
import noImagePlaceholder from "@/assets/no-image-placeholder.svg";
import { parseImagePair } from "@/lib/image-utils";

interface AdvertisementCardProps {
  advertisement: Advertisement;
}

export function AdvertisementCard({ advertisement }: AdvertisementCardProps) {
  const [viewTracked, setViewTracked] = useState(false);
  const viewStorageKey = `ad_view_${advertisement.id}`;
  const { thumb, full } = parseImagePair(advertisement.imageUrl || "");
  const displayImage = thumb || full || noImagePlaceholder;

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
    <Card className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden relative">
      <div className="relative aspect-square bg-gray-50">
        <img
          src={displayImage}
          alt={advertisement.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = noImagePlaceholder;
          }}
        />
        <div className="absolute top-2 left-2 flex gap-1">
          <Badge className="bg-amber-500 text-white">Reklama</Badge>
          {advertisement.targetUrl && (
            <Badge variant="secondary" className="bg-white/80 text-blue-700 border-blue-200">
              Sponsor
            </Badge>
          )}
        </div>
      </div>
      <div className="p-3 sm:p-4 flex flex-col gap-3">
        <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2">
          {advertisement.title}
        </h3>
        {advertisement.description && (
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
            {advertisement.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Wspierane ogłoszenie</span>
          {advertisement.targetUrl && (
            <Button variant="outline" size="sm" onClick={handleClick} className="gap-2">
              Zobacz ofertę
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
