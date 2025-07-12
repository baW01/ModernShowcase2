import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Trash2, AlertCircle, CheckCircle, Info } from "lucide-react";

const deleteRequestSchema = z.object({
  submitterEmail: z.string().min(1, "Email jest wymagany").email("Podaj prawidłowy adres email"),
  reason: z.string().optional(),
});

type DeleteRequestFormData = z.infer<typeof deleteRequestSchema>;

export default function DeleteRequest() {
  const [location] = useLocation();
  const [productId, setProductId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<DeleteRequestFormData>({
    resolver: zodResolver(deleteRequestSchema),
    defaultValues: {
      submitterEmail: "",
      reason: "",
    },
  });

  useEffect(() => {
    console.log('Current location:', location);
    console.log('Window search:', window.location.search);
    const urlParams = new URLSearchParams(window.location.search);
    
    // Try to get token first (new secure method)
    const tokenParam = urlParams.get('token');
    if (tokenParam) {
      console.log('Extracted token:', tokenParam);
      setToken(tokenParam);
      return;
    }
    
    // Fallback to old productId method for backward compatibility
    const productIdParam = urlParams.get('productId');
    if (productIdParam) {
      console.log('Extracted productId (legacy):', productIdParam);
      setProductId(parseInt(productIdParam));
    }
  }, [location]);

  // Validate token and get product info
  const { data: tokenValidation, isLoading: isValidatingToken, error: tokenError } = useQuery({
    queryKey: ['/api/validate-token', token],
    enabled: !!token,
    retry: false,
  });

  // Check if product exists (for legacy productId method)
  const { data: product, isLoading: isLoadingProduct, error: productError } = useQuery({
    queryKey: ['/api/products', productId],
    enabled: !!productId && !token,
    retry: false,
  });

  // Determine the actual product data and ID to use
  const actualProduct = tokenValidation?.valid ? {
    id: tokenValidation.productId,
    title: tokenValidation.productTitle
  } : product;
  
  const actualProductId = tokenValidation?.valid ? tokenValidation.productId : productId;
  const isLoading = token ? isValidatingToken : isLoadingProduct;
  const hasError = token ? (tokenError || !tokenValidation?.valid) : (productError || !product);

  const deleteRequestMutation = useMutation({
    mutationFn: async (data: DeleteRequestFormData & { productId: number }) => {
      return await apiRequest("/api/delete-requests", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Sukces",
        description: "Prośba o usunięcie została wysłana! Sprawdź swój email.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Błąd",
        description: error.message || "Nie udało się wysłać prośby o usunięcie",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DeleteRequestFormData) => {
    if (!actualProductId) {
      toast({
        title: "Błąd",
        description: "Brak ID produktu",
        variant: "destructive",
      });
      return;
    }

    deleteRequestMutation.mutate({
      ...data,
      productId: actualProductId,
    });
  };

  if (!token && !productId) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Błąd
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Nie znaleziono parametrów linku. Upewnij się, że używasz prawidłowego linku z emaila.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <p>Sprawdzanie produktu...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasError || !actualProduct) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Info className="h-5 w-5" />
              {token ? "Nieprawidłowy lub wygasły link" : "Produkt już nie istnieje"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {token ? (
              <div>
                <p>Link do usunięcia produktu jest nieprawidłowy lub wygasł. Linki są ważne przez 30 dni od momentu zatwierdzenia produktu.</p>
                <p className="mt-4 text-sm text-muted-foreground">
                  Jeśli potrzebujesz usunąć produkt, skontaktuj się z administratorem.
                </p>
              </div>
            ) : (
              <div>
                <p>Produkt o ID {actualProductId} został już usunięty z katalogu. Możliwe że Twoja prośba została już rozpatrzona lub produkt został usunięty przez administratora.</p>
                <p className="mt-4 text-sm text-muted-foreground">
                  Jeśli masz pytania, skontaktuj się z administratorem.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Prośba wysłana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Twoja prośba o usunięcie produktu została wysłana do administratora. Otrzymasz email z informacją o decyzji.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Prośba o usunięcie produktu
          </CardTitle>
          {actualProduct && (
            <p className="text-sm text-muted-foreground">
              Produkt: <strong>{actualProduct.title}</strong>
            </p>
          )}
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Aby poprosić o usunięcie produktu, podaj email użyty przy zgłaszaniu produktu. 
              Administrator rozpatrzy Twoją prośbę i poinformuje Cię o decyzji.
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="submitterEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email używany przy zgłaszaniu produktu *</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="jan@example.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Powód usunięcia (opcjonalny)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Np. produkt został sprzedany, zmiana planów..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={deleteRequestMutation.isPending}
                className="w-full"
              >
                {deleteRequestMutation.isPending ? (
                  "Wysyłanie..."
                ) : (
                  "Wyślij prośbę o usunięcie"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}