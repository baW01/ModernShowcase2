import { useState, useRef } from "react";
import { CloudUpload, X, Image as ImageIcon, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { parseImagePair } from "@/lib/image-utils";

interface ImageUploadCompressedProps {
  onImagesUpload: (urls: string[]) => void;
  currentImageUrls?: string[];
  maxImages?: number;
}

export function ImageUploadCompressed({ 
  onImagesUpload, 
  currentImageUrls = [], 
  maxImages = 5 
}: ImageUploadCompressedProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>(currentImageUrls);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Simple image compression function
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Resize to max 1200px width/height while maintaining aspect ratio
        const maxSize = 1200;
        let { width, height } = img;
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress to JPEG with 70% quality
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedBase64);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileUpload(Array.from(files));
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    const availableSlots = maxImages - imageUrls.length;
    const filesToProcess = files.slice(0, availableSlots);
    
    if (filesToProcess.length < files.length) {
      toast({
        title: "Uwaga",
        description: `Można dodać maksymalnie ${maxImages} zdjęć. Przetwarzam ${filesToProcess.length} z ${files.length} wybranych plików.`,
        variant: "default",
      });
    }

    // Filter only image files
    const imageFiles = filesToProcess.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Błąd",
          description: `Plik ${file.name} nie jest obrazem`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (imageFiles.length === 0) return;

    setIsUploading(true);
    
    try {
      // Compress images locally to base64
      const compressedBase64Images: string[] = [];
      
      for (const file of imageFiles) {
        try {
          toast({
            title: "Kompresja",
            description: `Kompresuję ${file.name}...`,
          });
          
          const compressedBase64 = await compressImage(file);
          compressedBase64Images.push(compressedBase64);
        } catch (error) {
          console.error(`Failed to compress ${file.name}:`, error);
          toast({
            title: "Błąd kompresji",
            description: `Nie udało się skompresować ${file.name}`,
            variant: "destructive",
          });
        }
      }
      
      // Send compressed images to server for object storage
      if (compressedBase64Images.length > 0) {
        toast({
          title: "Przesyłanie",
          description: "Przesyłam skompresowane zdjęcia...",
        });
        
        const response = await apiRequest("/api/images/compress", {
          method: "POST",
          body: JSON.stringify({ images: compressedBase64Images }),
        });
        
        const { compressedUrls } = response as { compressedUrls: string[] };
        const updatedUrls = [...imageUrls, ...compressedUrls];
        setImageUrls(updatedUrls);
        onImagesUpload(updatedUrls);
        
        toast({
          title: "Sukces",
          description: `Pomyślnie dodano ${compressedUrls.length} skompresowanych zdjęć`,
        });
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Błąd",
        description: "Wystąpił błąd podczas przesyłania zdjęć",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlAdd = (url: string) => {
    if (!url.trim()) return;
    
    if (imageUrls.length >= maxImages) {
      toast({
        title: "Błąd",
        description: `Możesz dodać maksymalnie ${maxImages} zdjęć`,
        variant: "destructive",
      });
      return;
    }

    const updatedUrls = [...imageUrls, url.trim()];
    setImageUrls(updatedUrls);
    onImagesUpload(updatedUrls);
    
    toast({
      title: "Sukces",
      description: "Zdjęcie zostało dodane",
    });
  };

  const removeImage = (index: number) => {
    const updatedUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(updatedUrls);
    onImagesUpload(updatedUrls);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragOver
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center space-y-2">
          {isUploading ? (
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          ) : (
            <CloudUpload className="h-8 w-8 text-gray-400" />
          )}
          <div className="text-sm text-gray-600">
            <span className="font-medium">
              {isUploading ? "Przetwarzanie..." : "Kliknij aby dodać zdjęcia"}
            </span>
            {!isUploading && " lub przeciągnij i upuść"}
          </div>
          <div className="text-xs text-gray-500">
            Maksymalnie {maxImages} zdjęć. Automatyczna kompresja i optymalizacja
          </div>
        </div>
      </div>

      {/* URL Input */}
      <div className="flex space-x-2">
        <Input
          placeholder="Lub wklej adres URL zdjęcia"
          disabled={isUploading}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleUrlAdd(e.currentTarget.value);
              e.currentTarget.value = "";
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={isUploading}
          onClick={() => {
            const input = document.querySelector('input[placeholder*="URL"]') as HTMLInputElement;
            if (input) {
              handleUrlAdd(input.value);
              input.value = "";
            }
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Image Preview Grid */}
      {imageUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {imageUrls.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={parseImagePair(url).thumb || parseImagePair(url).full}
                  alt={`Zdjęcie ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback for broken images
                    const target = e.target as HTMLImageElement;
                    target.src = '/api/placeholder-image.svg';
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="text-center text-sm text-gray-500">
          Kompresja i przesyłanie zdjęć...
        </div>
      )}
    </div>
  );
}
