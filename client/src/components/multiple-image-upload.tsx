import { useState, useRef } from "react";
import { CloudUpload, X, Image as ImageIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface MultipleImageUploadProps {
  onImagesUpload: (urls: string[]) => void;
  currentImageUrls?: string[];
  maxImages?: number;
}

export function MultipleImageUpload({ 
  onImagesUpload, 
  currentImageUrls = [], 
  maxImages = 5 
}: MultipleImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>(currentImageUrls);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  const handleFileUpload = (files: File[]) => {
    // Check if adding these files would exceed the maximum
    if (imageUrls.length + files.length > maxImages) {
      toast({
        title: "Błąd",
        description: `Możesz dodać maksymalnie ${maxImages} zdjęć`,
        variant: "destructive",
      });
      return;
    }

    // Validate file types
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Błąd",
          description: `Plik ${file.name} nie jest obrazem`,
          variant: "destructive",
        });
        return false;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Błąd",
          description: `Plik ${file.name} jest za duży. Maksymalny rozmiar to 10MB`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);

    // Process each file
    const newUrls: string[] = [];
    let processedCount = 0;

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        newUrls.push(result);
        processedCount++;
        
        if (processedCount === validFiles.length) {
          const updatedUrls = [...imageUrls, ...newUrls];
          setImageUrls(updatedUrls);
          onImagesUpload(updatedUrls);
          setIsUploading(false);
          
          toast({
            title: "Sukces",
            description: `Dodano ${validFiles.length} zdjęć`,
          });
        }
      };
      
      reader.onerror = () => {
        processedCount++;
        if (processedCount === validFiles.length) {
          setIsUploading(false);
        }
        toast({
          title: "Błąd",
          description: `Nie udało się wczytać zdjęcia ${file.name}`,
          variant: "destructive",
        });
      };
      
      reader.readAsDataURL(file);
    });
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
        }`}
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
        />
        
        <div className="flex flex-col items-center space-y-2">
          <CloudUpload className="h-8 w-8 text-gray-400" />
          <div className="text-sm text-gray-600">
            <span className="font-medium">Kliknij aby dodać zdjęcia</span> lub przeciągnij i upuść
          </div>
          <div className="text-xs text-gray-500">
            Maksymalnie {maxImages} zdjęć, każde do 10MB
          </div>
        </div>
      </div>

      {/* URL Input */}
      <div className="flex space-x-2">
        <Input
          placeholder="Lub wklej adres URL zdjęcia"
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
          size="sm"
          onClick={(e) => {
            const input = e.currentTarget.parentElement?.querySelector("input");
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
                  src={url}
                  alt={`Zdjęcie ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement!.classList.add("flex", "items-center", "justify-center");
                    e.currentTarget.parentElement!.innerHTML = `
                      <div class="text-center">
                        <svg class="h-8 w-8 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p class="text-xs text-gray-500 mt-1">Błąd ładowania</p>
                      </div>
                    `;
                  }}
                />
              </div>
              <button
                type="button"
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Status */}
      {isUploading && (
        <div className="flex items-center justify-center space-x-2 text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm">Przesyłanie zdjęć...</span>
        </div>
      )}

      {/* Image Count */}
      <div className="text-sm text-gray-500 text-center">
        {imageUrls.length} z {maxImages} zdjęć
      </div>
    </div>
  );
}