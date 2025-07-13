import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { insertProductSchema } from "@shared/schema";
import type { Product, InsertProduct } from "@shared/schema";
import { z } from "zod";
import { MultipleImageUpload } from "./multiple-image-upload";

const formSchema = insertProductSchema.extend({
  price: z.number().min(0.01, "Price must be greater than 0"),
});

type FormData = z.infer<typeof formSchema>;

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditProductModal({ product, isOpen, onClose }: EditProductModalProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      category: "",
      imageUrl: "",
      imageUrls: [],
      contactPhone: "",
      isSold: false,
    },
  });

  useEffect(() => {
    if (product) {
      const productImages = product.imageUrls && product.imageUrls.length > 0 
        ? product.imageUrls 
        : product.imageUrl 
          ? [product.imageUrl] 
          : [];
      
      form.reset({
        title: product.title,
        description: product.description,
        price: product.price / 100, // Convert from cents
        category: product.category,
        imageUrl: product.imageUrl || "",
        imageUrls: productImages,
        contactPhone: product.contactPhone || "",
        isSold: product.isSold,
      });
      setImageUrls(productImages);
    }
  }, [product, form]);

  const updateProductMutation = useMutation({
    mutationFn: async (data: Partial<InsertProduct>) => {
      if (!product) throw new Error("No product to update");
      return await apiRequest(`/api/products/${product.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Sukces",
        description: "Produkt został zaktualizowany",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: error.message || "Nie udało się zaktualizować produktu",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    const productData: Partial<InsertProduct> = {
      ...data,
      price: Math.round(data.price * 100), // Convert to cents
      imageUrl: imageUrls.length > 0 ? imageUrls[0] : null,
      imageUrls: imageUrls,
    };
    updateProductMutation.mutate(productData);
  };

  const handleImagesUpload = (urls: string[]) => {
    setImageUrls(urls);
    form.setValue("imageUrls", urls);
    // Set the first image as the primary image for backward compatibility
    if (urls.length > 0) {
      form.setValue("imageUrl", urls[0]);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edytuj Produkt</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nazwa produktu</FormLabel>
                    <FormControl>
                      <Input placeholder="Wprowadź nazwę produktu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cena</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">zł</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Wpisz cenę"
                          className="pl-8"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          onFocus={(e) => {
                            e.target.select();
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz kategorię" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Electronics">Elektronika</SelectItem>
                        <SelectItem value="Fashion">Moda</SelectItem>
                        <SelectItem value="Home & Garden">Dom i ogród</SelectItem>
                        <SelectItem value="Sports & Outdoors">Sport i rekreacja</SelectItem>
                        <SelectItem value="Books & Media">Książki i media</SelectItem>
                        <SelectItem value="Accessories">Akcesoria</SelectItem>
                        <SelectItem value="Other">Inne</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numer telefonu kontaktowego</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+48 123 456 789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opis</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Wprowadź opis produktu"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zdjęcia produktu</label>
              <MultipleImageUpload 
                onImagesUpload={handleImagesUpload}
                currentImageUrls={imageUrls}
                maxImages={5}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
              >
                Anuluj
              </Button>
              <Button 
                type="submit" 
                disabled={updateProductMutation.isPending}
              >
                {updateProductMutation.isPending ? "Zapisywanie..." : "Zapisz zmiany"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}