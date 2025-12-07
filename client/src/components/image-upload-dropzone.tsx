import { useState, useRef, useEffect } from "react";
import { CloudUpload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { withApiBase } from "@/lib/queryClient";
import { parseImagePair } from "@/lib/image-utils";

interface ImageUploadDropzoneProps {
  value?: string;
  onChange: (url: string) => void;
}

export function ImageUploadDropzone({ value = "", onChange }: ImageUploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value || "");
  const [previewUrl, setPreviewUrl] = useState(value || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Keep local preview/input in sync with external value (form state)
  useEffect(() => {
    const { thumb, full } = parseImagePair(value || "");
    setUrlInput(full || thumb || "");
    setPreviewUrl(thumb || full || "");
  }, [value]);

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
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Błąd",
        description: "Proszę wybrać plik obrazu",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      let finalDataUrl: string;
      
      // Check if file is larger than 10MB and needs compression
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Kompresja",
          description: `Plik jest duży (${(file.size / 1024 / 1024).toFixed(1)}MB). Kompresuję...`,
        });
        
        finalDataUrl = await compressImage(file, 5);
        
        toast({
          title: "Sukces",
          description: "Plik został skompresowany i przesłany",
        });
      } else {
        // File is small enough, just convert to base64
        finalDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });
        
        toast({
          title: "Sukces",
          description: "Zdjęcie zostało przesłane",
        });
      }
      
      // Upload to server immediately
      try {
        const response = await fetch(withApiBase('/api/images/compress'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ images: [finalDataUrl] }),
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const result = await response.json();
        const pair = Array.isArray(result?.compressedUrls) ? result.compressedUrls[0] : null;
        const { thumb, full } = parseImagePair(typeof pair === "string" ? pair : "");
        const finalUrl = full || thumb || finalDataUrl;

        setPreviewUrl(thumb || full || finalDataUrl);
        setUrlInput(finalUrl);
        onChange(pair || finalUrl);
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        // Fallback to local base64 if upload fails
        setPreviewUrl(finalDataUrl);
        setUrlInput(finalDataUrl);
        onChange(finalDataUrl);
        
        toast({
          title: "Ostrzeżenie",
          description: "Zdjęcie zostało załadowane lokalnie. Spróbuj ponownie jeśli problem się powtarza.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się przetworzyć zdjęcia",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    const { thumb, full } = parseImagePair(url || "");
    setUrlInput(full || thumb || url);
    setPreviewUrl(thumb || full || "");
    onChange(url);
  };

  const removeImage = () => {
    setPreviewUrl("");
    setUrlInput("");
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lub wprowadź URL zdjęcia
        </label>
        <Input
          type="url"
          placeholder="https://example.com/image.jpg"
          value={urlInput}
          onChange={(e) => handleUrlChange(e.target.value)}
        />
      </div>

      {/* Drag & Drop Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
          isDragOver
            ? "border-primary bg-primary/10"
            : "border-gray-300 hover:border-primary"
        } ${isUploading ? "opacity-50" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Podgląd"
              className="max-w-full max-h-48 mx-auto rounded-lg object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div>
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
                <p className="text-sm text-blue-600 mb-2">Przetwarzanie zdjęcia...</p>
                <p className="text-xs text-gray-500">Może to zająć chwilę dla większych plików</p>
              </div>
            ) : (
              <div>
                <CloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Przeciągnij i upuść zdjęcie tutaj
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  lub
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={openFileDialog}
                  disabled={isUploading}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Wybierz plik
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Pliki powyżej 10MB zostaną automatycznie skompresowane
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
