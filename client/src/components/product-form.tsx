import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { insertProductSchema } from "@shared/schema";
import type { InsertProduct, Category } from "@shared/schema";
import { z } from "zod";
import { ImageUploadCompressed } from "./image-upload-compressed";

const formSchema = insertProductSchema.extend({
  price: z.number().min(0.01, "Price must be greater than 0"),
});

type FormData = z.infer<typeof formSchema>;

export function ProductForm() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: undefined,
      category: "",
      imageUrl: "",
      imageUrls: [],
      contactPhone: "",
      isSold: false,
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      return await apiRequest("/api/products", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Sukces",
        description: "Produkt został utworzony pomyślnie",
      });
      form.reset();
      setImageUrls([]);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"], exact: false });
      // Invalidate public products cache so new products appear immediately (all variants)
      queryClient.invalidateQueries({
        predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === "/api/products",
      });
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: error.message || "Nie udało się utworzyć produktu",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    const productData: InsertProduct = {
      ...data,
      price: Math.round((data.price || 0) * 100), // Convert to cents
      imageUrl: imageUrls.length > 0 ? imageUrls[0] : null,
      imageUrls: imageUrls,
    };
    createProductMutation.mutate(productData);
  };

  const handleImagesUpload = (urls: string[]) => {
    setImageUrls(urls);
    form.setValue("imageUrls", urls);
    // Set the first image as the primary image for backward compatibility
    if (urls.length > 0) {
      form.setValue("imageUrl", urls[0]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dodaj nowy produkt</CardTitle>
      </CardHeader>
      <CardContent>
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
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? undefined : parseFloat(value));
                          }}
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
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
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
                      <Input type="tel" placeholder="+48 123 456 789" value={field.value || ''} onChange={field.onChange} onBlur={field.onBlur} name={field.name} />
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
              <ImageUploadCompressed 
                onImagesUpload={handleImagesUpload}
                currentImageUrls={imageUrls}
                maxImages={5}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  form.reset();
                  setImageUrls([]);
                }}
              >
                Anuluj
              </Button>
              <Button 
                type="submit" 
                disabled={createProductMutation.isPending}
              >
                {createProductMutation.isPending ? "Dodawanie..." : "Dodaj produkt"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
