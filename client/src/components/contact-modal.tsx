import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  productTitle: string;
}

export function ContactModal({ isOpen, onClose, phoneNumber, productTitle }: ContactModalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      setCopied(true);
      toast({
        title: "Skopiowano!",
        description: "Numer telefonu został skopiowany do schowka",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się skopiować numeru telefonu",
        variant: "destructive",
      });
    }
  };

  const handleCall = () => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" aria-describedby="contact-description">
        <DialogHeader>
          <DialogTitle className="text-center">Kontakt z sprzedającym</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">{productTitle}</h3>
            <p id="contact-description" className="text-gray-600 text-sm mb-4">
              Skontaktuj się z sprzedającym, aby uzyskać więcej informacji o produkcie
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-2">Numer telefonu:</p>
            <p className="text-2xl font-bold text-blue-600 mb-4">{phoneNumber}</p>
            
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={copyToClipboard}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Skopiowano
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Kopiuj
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleCall}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Phone className="h-4 w-4" />
                Zadzwoń
              </Button>
            </div>
          </div>
          
          <div className="text-center text-xs text-gray-500">
            <p>Kliknij "Zadzwoń" aby otworzyć aplikację telefonu</p>
            <p>lub skopiuj numer i zadzwoń ręcznie</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}