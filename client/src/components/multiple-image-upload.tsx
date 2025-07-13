import { useState, useRef } from "react";
import { CloudUpload, X, Image as ImageIcon, Plus, Loader2 } from "lucide-react";
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
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Image compression function
  const compressImage = (file: File, maxSizeInMB: number = 5): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions to maintain aspect ratio
        const maxWidth = 1920;
        const maxHeight = 1920;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Start with quality 0.8 and reduce if needed
        let quality = 0.8;
        const targetSizeBytes = maxSizeInMB * 1024 * 1024;
        
        const tryCompress = () => {
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          
          // Calculate size (approximation: base64 is ~33% larger than binary)
          const sizeInBytes = (compressedDataUrl.length * 3) / 4;
          
          if (sizeInBytes <= targetSizeBytes || quality <= 0.1) {
            resolve(compressedDataUrl);
          } else {
            quality -= 0.1;
            tryCompress();
          }
        };
        
        tryCompress();
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
      
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);

    // Add files to uploading set
    const newUploadingFiles = new Set(uploadingFiles);
    validFiles.forEach(file => newUploadingFiles.add(file.name));
    setUploadingFiles(newUploadingFiles);

    // Process each file
    const newUrls: string[] = [];
    let processedCount = 0;

    const processFile = async (file: File) => {
      try {
        let finalDataUrl: string;
        
        // Check if file is larger than 10MB and needs compression
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "Kompresja",
            description: `Plik ${file.name} jest duży (${(file.size / 1024 / 1024).toFixed(1)}MB). Kompresuję...`,
          });
          
          finalDataUrl = await compressImage(file, 5);
          
          toast({
            title: "Sukces",
            description: `Plik ${file.name} został skompresowany`,
          });
        } else {
          // File is small enough, just convert to base64
          finalDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
          });
        }
        
        // Upload to server immediately
        try {
          const response = await fetch('/api/upload-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageData: finalDataUrl }),
          });

          if (!response.ok) {
            throw new Error('Upload failed');
          }

          const result = await response.json();
          newUrls.push(result.imageUrl);
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          // Fallback to local base64 if upload fails
          newUrls.push(finalDataUrl);
        }
        
        // Remove from uploading set
        setUploadingFiles(prev => {
          const updated = new Set(prev);
          updated.delete(file.name);
          return updated;
        });
        
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        toast({
          title: "Błąd",
          description: `Nie udało się przetworzyć zdjęcia ${file.name}`,
          variant: "destructive",
        });
        
        // Remove from uploading set
        setUploadingFiles(prev => {
          const updated = new Set(prev);
          updated.delete(file.name);
          return updated;
        });
      }
      
      processedCount++;
      
      if (processedCount === validFiles.length) {
        const updatedUrls = [...imageUrls, ...newUrls];
        setImageUrls(updatedUrls);
        onImagesUpload(updatedUrls);
        setIsUploading(false);
        
        if (newUrls.length > 0) {
          toast({
            title: "Sukces",
            description: `Dodano ${newUrls.length} zdjęć`,
          });
        }
      }
    };

    // Process all files
    validFiles.forEach(processFile);
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
            Maksymalnie {maxImages} zdjęć. Pliki powyżej 10MB zostaną automatycznie skompresowane
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

      {/* Individual Loading Indicators for Files Being Processed */}
      {uploadingFiles.size > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from(uploadingFiles).map((fileName) => (
            <div key={fileName} className="relative">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                <div className="text-center">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-blue-500" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">Przetwarzanie...</p>
                  <p className="text-xs text-gray-400 mt-1 truncate max-w-[100px]" title={fileName}>
                    {fileName}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Status */}
      {isUploading && (
        <div className="flex items-center justify-center space-x-2 text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">
            {uploadingFiles.size > 0 
              ? `Przetwarzanie ${uploadingFiles.size} zdjęć...` 
              : 'Przesyłanie zdjęć...'
            }
          </span>
        </div>
      )}

      {/* Image Count */}
      <div className="text-sm text-gray-500 text-center">
        {imageUrls.length} z {maxImages} zdjęć
      </div>
    </div>
  );
}