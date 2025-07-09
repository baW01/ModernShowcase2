import { useState, useRef } from "react";
import { CloudUpload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadDropzoneProps {
  onImageUpload: (url: string) => void;
  currentImageUrl?: string;
}

export function ImageUploadDropzone({ onImageUpload, currentImageUrl }: ImageUploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || "");
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

  const handleFileUpload = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Błąd",
        description: "Proszę wybrać plik obrazu",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Błąd",
        description: "Plik jest za duży. Maksymalny rozmiar to 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
      
      // For demo purposes, we'll use the base64 data URL
      // In a real app, you'd upload to a file storage service
      onImageUpload(result);
      setIsUploading(false);
      
      toast({
        title: "Sukces",
        description: "Zdjęcie zostało przesłane",
      });
    };
    
    reader.onerror = () => {
      setIsUploading(false);
      toast({
        title: "Błąd",
        description: "Nie udało się wczytać zdjęcia",
        variant: "destructive",
      });
    };
    
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    if (url) {
      setPreviewUrl(url);
      onImageUpload(url);
    }
  };

  const removeImage = () => {
    setPreviewUrl("");
    setImageUrl("");
    onImageUpload("");
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
          value={imageUrl}
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
            <CloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              {isUploading ? "Przesyłanie..." : "Przeciągnij i upuść zdjęcie tutaj"}
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
              Maksymalny rozmiar: 10MB (JPG, PNG, GIF)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}