import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Cookie } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const rejectCookies = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto md:left-auto md:right-4 md:max-w-sm">
      <Card className="shadow-lg border-2">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Cookie className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-2">Używamy plików cookie</h3>
              <p className="text-xs text-gray-600 mb-3">
                Ta strona używa plików cookie aby zapewnić najlepsze doświadczenie użytkownika. 
                Kontynuując korzystanie ze strony, wyrażasz zgodę na ich wykorzystanie.
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={acceptCookies}
                  className="flex-1 text-xs"
                >
                  Akceptuję
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={rejectCookies}
                  className="flex-1 text-xs"
                >
                  Odrzuć
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="p-1 h-auto w-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}