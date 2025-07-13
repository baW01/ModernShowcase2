import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function VerifySale() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [comment, setComment] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [productId, setProductId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Get token from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    
    if (!urlToken) {
      toast({
        title: "Błąd",
        description: "Nieprawidłowy lub brakujący token",
        variant: "destructive",
      });
      setLocation("/");
      return;
    }

    setToken(urlToken);
    // Validate token and get product info
    validateToken(urlToken);
  }, [toast, setLocation]);

  const validateToken = async (token: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/validate-sale-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error('Invalid token');
      }

      const data = await response.json();
      setProductTitle(data.productTitle);
      setProductId(data.productId);
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nieprawidłowy token lub produkt nie istnieje",
        variant: "destructive",
      });
      setLocation("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productId) {
      toast({
        title: "Błąd",
        description: "Brak identyfikatora produktu",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/products/${productId}/verify-sale`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          comment: comment.trim() || undefined,
          token: token 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify sale');
      }

      setIsSubmitted(true);
      toast({
        title: "Sukces",
        description: "Produkt został oznaczony jako sprzedany i zweryfikowany",
      });
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zweryfikować sprzedaży",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !productTitle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Sprawdzanie tokena...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-green-600">Produkt oznaczony jako sprzedany!</CardTitle>
            <CardDescription>
              Dziękujemy za potwierdzenie sprzedaży produktu "{productTitle}". Produkt jest teraz oznaczony jako sprzedany i zweryfikowany.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setLocation("/")} 
              className="w-full"
            >
              Powrót do strony głównej
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Potwierdź sprzedaż</span>
          </CardTitle>
          <CardDescription>
            Potwierdź sprzedaż produktu "{productTitle}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comment">Komentarz (opcjonalnie)</Label>
              <Textarea
                id="comment"
                placeholder="Dodaj komentarz o sprzedaży (np. data sprzedaży, cena końcowa, itp.)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Co się stanie?</p>
                  <p>Produkt zostanie oznaczony jako sprzedany i zweryfikowany. Będzie widoczny z zieloną ikoną potwierdzenia dla innych użytkowników.</p>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Potwierdzanie...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Potwierdź sprzedaż
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}