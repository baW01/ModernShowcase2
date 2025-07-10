import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertProductRequestSchema, type InsertProductRequest } from "@shared/schema";
import { ImageUploadDropzone } from "@/components/image-upload-dropzone";

const formSchema = insertProductRequestSchema.extend({
  price: insertProductRequestSchema.shape.price.transform((val) => Math.round(val * 100)),
  title: insertProductRequestSchema.shape.title.min(1, "Nazwa produktu jest wymagana"),
  description: insertProductRequestSchema.shape.description.min(1, "Opis produktu jest wymagany"),
  contactPhone: insertProductRequestSchema.shape.contactPhone.min(1, "Telefon kontaktowy jest wymagany"),
  submitterName: insertProductRequestSchema.shape.submitterName.min(1, "Imię i nazwisko jest wymagane"),
  submitterEmail: insertProductRequestSchema.shape.submitterEmail.min(1, "Email jest wymagany").email("Podaj prawidłowy adres email"),
  category: insertProductRequestSchema.shape.category.min(1, "Kategoria jest wymagana"),
});

type FormData = {
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  contactPhone: string;
  submitterName: string;
  submitterEmail: string;
};

export function ProductRequestForm() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      category: "",
      imageUrl: "",
      contactPhone: "",
      submitterName: "",
      submitterEmail: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertProductRequest) => {
      const response = await apiRequest("POST", "/api/product-requests", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sukces",
        description: "Prośba o dodanie produktu została wysłana!",
      });
      form.reset();
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/product-requests"] });
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: "Nie udało się wysłać prośby o dodanie produktu",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    const productData: InsertProductRequest = {
      title: data.title,
      description: data.description,
      price: data.price,
      category: data.category,
      imageUrl: data.imageUrl || "",
      contactPhone: data.contactPhone,
      submitterName: data.submitterName,
      submitterEmail: data.submitterEmail || "",
    };

    mutation.mutate(productData);
  };

  const handleImageUpload = (url: string) => {
    form.setValue("imageUrl", url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90 text-black w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Poproś o dodanie produktu</span>
          <span className="sm:hidden">Dodaj produkt</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Poproś o dodanie produktu</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="submitterName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twoje imię i nazwisko *</FormLabel>
                    <FormControl>
                      <Input placeholder="Jan Kowalski" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="submitterEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="jan@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-600">
                      Email jest wymagany do wysłania potwierdzenia zatwierdzenia i możliwości usuwania produktu przez maila
                    </p>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa produktu *</FormLabel>
                  <FormControl>
                    <Input placeholder="Wpisz nazwę produktu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opis produktu *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Opisz swój produkt - stan, cechy, historia itp."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cena (PLN) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategoria *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz kategorię" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Elektronika">Elektronika</SelectItem>
                        <SelectItem value="Moda">Moda</SelectItem>
                        <SelectItem value="Dom">Dom i ogród</SelectItem>
                        <SelectItem value="Sport">Sport i rekreacja</SelectItem>
                        <SelectItem value="Kultura">Kultura i rozrywka</SelectItem>
                        <SelectItem value="Motoryzacja">Motoryzacja</SelectItem>
                        <SelectItem value="Zdrowie">Zdrowie i uroda</SelectItem>
                        <SelectItem value="Inne">Inne</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon kontaktowy *</FormLabel>
                  <FormControl>
                    <Input placeholder="+48 123 456 789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zdjęcie produktu (opcjonalne)</FormLabel>
                  <FormControl>
                    <ImageUploadDropzone 
                      onImageUpload={handleImageUpload}
                      currentImageUrl={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={mutation.isPending}
              >
                Anuluj
              </Button>
              <Button 
                type="submit" 
                disabled={mutation.isPending}
                className="bg-accent hover:bg-accent/90 text-black"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wysyłanie...
                  </>
                ) : (
                  "Wyślij prośbę"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}