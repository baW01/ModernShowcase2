import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Powrót na stronę główną
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Regulamin</h1>
          <p className="text-gray-600">Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}</p>
        </div>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Postanowienia ogólne</h2>
            <p>
              Niniejszy Regulamin określa zasady korzystania z platformy Spotted GFC, 
              będącej serwisem internetowym umożliwiającym publikację ogłoszeń o sprzedaży produktów.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Definicje</h2>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Platforma</strong> - serwis internetowy Spotted GFC</li>
              <li><strong>Użytkownik</strong> - osoba korzystająca z platformy</li>
              <li><strong>Ogłoszenie</strong> - treść publikowana przez użytkownika zawierająca informacje o produktach</li>
              <li><strong>Administrator</strong> - podmiot zarządzający platformą</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Zasady korzystania z platformy</h2>
            <h3 className="text-xl font-medium mb-3">3.1 Ogólne zasady</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Korzystanie z platformy jest bezpłatne</li>
              <li>Użytkownik zobowiązuje się podawać prawdziwe informacje</li>
              <li>Publikowane treści muszą być zgodne z prawem polskim</li>
              <li>Zabronione jest publikowanie treści obraźliwych, niezgodnych z prawem lub wprowadzających w błąd</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">3.2 Publikowanie ogłoszeń</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Każde ogłoszenie podlega moderacji przez administratora</li>
              <li>Administrator ma prawo odrzucić ogłoszenie bez podania przyczyny</li>
              <li>Użytkownik ponosi pełną odpowiedzialność za treść publikowanych ogłoszeń</li>
              <li>Zabroniona jest sprzedaż towarów zakazanych prawem</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Funkcja autouzupełniania danych</h2>
            <h3 className="text-xl font-medium mb-3">4.1 Opis funkcji</h3>
            <p className="mb-4">
              Platforma oferuje funkcję autouzupełniania danych kontaktowych, która:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Zapisuje dane kontaktowe w pamięci lokalnej przeglądarki użytkownika</li>
              <li>Automatycznie uzupełnia formularze przy kolejnych ogłoszeniach</li>
              <li>Działa wyłącznie na urządzeniu użytkownika</li>
              <li>Może być wyłączona w każdej chwili przez usunięcie danych</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">4.2 Zgoda na korzystanie</h3>
            <p>
              Korzystanie z funkcji autouzupełniania oznacza wyrażenie zgody na przechowywanie 
              danych kontaktowych w pamięci lokalnej przeglądarki. Zgoda może być cofnięta 
              w każdej chwili poprzez usunięcie danych.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Ograniczenia korzystania</h2>
            <p>Wprowadzone są następujące ograniczenia:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Maksymalnie 3 ogłoszenia na 10 minut z jednego adresu IP</li>
              <li>Maksymalnie 2 prośby o dodanie produktu na 5 minut z jednego adresu IP</li>
              <li>Maksymalnie 5 prób logowania na 15 minut z jednego adresu IP</li>
              <li>Ograniczenia dotyczące wyświetleń/kliknięć oraz przesyłania obrazów (rate limiting) w celu ochrony przed nadużyciami</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Weryfikacja sprzedaży</h2>
            <p>
              Platforma oferuje system weryfikacji sprzedaży, który pozwala sprzedającym 
              potwierdzić, że produkt został sprzedany. Weryfikacja odbywa się poprzez 
              specjalny link wysyłany na adres e-mail podany w ogłoszeniu.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Usuwanie ogłoszeń</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Użytkownik może zgłosić prośbę o usunięcie swojego ogłoszenia</li>
              <li>Administrator może usunąć ogłoszenie naruszające regulamin</li>
              <li>Prośby o usunięcie są rozpatrywane w ciągu 48 godzin</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Odpowiedzialność</h2>
            <h3 className="text-xl font-medium mb-3">8.1 Odpowiedzialność użytkownika</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Użytkownik ponosi pełną odpowiedzialność za publikowane treści</li>
              <li>Użytkownik zobowiązuje się do zgodnego z prawem korzystania z platformy</li>
              <li>Użytkownik odpowiada za prawdziwość podawanych informacji</li>
              <li>Użytkownik odpowiada za posiadanie praw do przesyłanych obrazów oraz przyjmuje do wiadomości,
                że przesłane pliki są przechowywane w publicznie dostępnym katalogu (link może być widoczny dla każdego, kto go posiada)</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">8.2 Odpowiedzialność administratora</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Administrator nie ponosi odpowiedzialności za treści publikowane przez użytkowników</li>
              <li>Administrator nie gwarantuje ciągłości działania platformy</li>
              <li>Administrator nie pośredniczy w transakcjach między użytkownikami</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Ochrona danych osobowych</h2>
            <p>
              Zasady przetwarzania danych osobowych określa odrębna Polityka Prywatności, 
              stanowiąca integralną część niniejszego Regulaminu.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Procedura zgłaszania naruszeń</h2>
            <p>
              Użytkownicy mogą zgłaszać naruszenia regulaminu lub problematyczne treści 
              za pośrednictwem formularza kontaktowego lub bezpośrednio do administratora.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Zmiany regulaminu</h2>
            <p>
              Administrator zastrzega sobie prawo do wprowadzania zmian w regulaminie. 
              O istotnych zmianach użytkownicy będą informowani poprzez stronę internetową 
              z 7-dniowym wyprzedzeniem.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Postanowienia końcowe</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Regulamin wchodzi w życie z dniem publikacji</li>
              <li>W sprawach nieuregulowanych zastosowanie mają przepisy prawa polskiego</li>
              <li>Ewentualne spory rozstrzygane są przez sądy polskie</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Kontakt</h2>
            <p>
              W przypadku pytań dotyczących regulaminu prosimy o kontakt za pośrednictwem 
              formularza kontaktowego dostępnego na platformie.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
