import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function PrivacyPolicy() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Polityka Prywatności</h1>
          <p className="text-gray-600">Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}</p>
        </div>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Wprowadzenie</h2>
            <p>
              Niniejsza Polityka Prywatności opisuje, w jaki sposób gromadzimy, używamy i chronimy 
              Twoje dane osobowe podczas korzystania z platformy Spotted GFC.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Dane które gromadzimy</h2>
            <h3 className="text-xl font-medium mb-3">2.1 Dane podawane przez użytkownika</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Imię i nazwisko</li>
              <li>Adres e-mail</li>
              <li>Numer telefonu</li>
              <li>Informacje o produktach (opisy, zdjęcia, ceny)</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">2.2 Dane automatycznie gromadzone</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Adres IP</li>
              <li>Informacje o przeglądarce (User Agent)</li>
              <li>Statystyki wyświetleń i kliknięć produktów</li>
              <li>Dane przechowywane lokalnie w przeglądarce (localStorage)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Funkcja autouzupełniania</h2>
            <p className="mb-4">
              Nasza platforma oferuje funkcję autouzupełniania danych kontaktowych, która:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Zapisuje Twoje dane kontaktowe (imię, nazwisko, e-mail, telefon) w pamięci lokalnej przeglądarki</li>
              <li>Automatycznie uzupełnia te dane w przyszłych formularzach</li>
              <li>Pozwala na łatwe usunięcie zapisanych danych w każdej chwili</li>
              <li>Dane są przechowywane tylko na Twoim urządzeniu - nie wysyłamy ich do naszych serwerów</li>
            </ul>
            <p>
              Możesz w każdej chwili usunąć zapisane dane klikając przycisk "Usuń" przy komunikacie 
              o autouzupełnieniu w formularzu.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Cel przetwarzania danych</h2>
            <p>Twoje dane wykorzystujemy w celu:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Publikacji ogłoszeń o produktach</li>
              <li>Kontaktu w sprawie Twoich ogłoszeń</li>
              <li>Wysyłania powiadomień o statusie ogłoszeń</li>
              <li>Zapewnienia bezpieczeństwa platformy (przeciwdziałanie spamowi)</li>
              <li>Analizy statystyk użytkowania platformy</li>
              <li>Ułatwienia korzystania z platformy poprzez autouzupełnianie</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Podstawa prawna przetwarzania</h2>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Zgoda</strong> - dla funkcji autouzupełniania i newslettera</li>
              <li><strong>Wykonanie umowy</strong> - dla publikacji ogłoszeń</li>
              <li><strong>Prawnie uzasadniony interes</strong> - dla bezpieczeństwa i statystyk</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Udostępnianie danych</h2>
            <p>
              Twoje dane osobowe nie są sprzedawane ani udostępniane podmiotom trzecim, 
              z wyjątkiem przypadków wymaganych prawem lub niezbędnych do działania platformy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Bezpieczeństwo danych</h2>
            <p>
              Stosujemy odpowiednie środki techniczne i organizacyjne w celu ochrony 
              Twoich danych osobowych przed nieautoryzowanym dostępem, utratą lub zniszczeniem.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Twoje prawa</h2>
            <p>Masz prawo do:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Dostępu do swoich danych osobowych</li>
              <li>Sprostowania nieprawidłowych danych</li>
              <li>Usunięcia danych (prawo do bycia zapomnianym)</li>
              <li>Ograniczenia przetwarzania</li>
              <li>Przenoszenia danych</li>
              <li>Sprzeciwu wobec przetwarzania</li>
              <li>Cofnięcia zgody w dowolnym momencie</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Cookies i localStorage</h2>
            <p className="mb-4">
              Nasza strona wykorzystuje localStorage przeglądarki do:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Zapisywania danych autouzupełniania (tylko na Twoim urządzeniu)</li>
              <li>Przechowywania preferencji użytkownika</li>
              <li>Sesji administratora (tokeny uwierzytelniania)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Okres przechowywania danych</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Dane kontaktowe: do momentu usunięcia ogłoszenia lub na Twoje żądanie</li>
              <li>Statystyki: dane anonimowe przechowywane bezterminowo</li>
              <li>Dane autouzupełniania: do momentu ręcznego usunięcia przez użytkownika</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Kontakt</h2>
            <p>
              W sprawie pytań dotyczących przetwarzania danych osobowych możesz skontaktować się z nami 
              za pośrednictwem formularza kontaktowego na stronie lub pod adresem e-mail podanym na platformie.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Zmiany w Polityce Prywatności</h2>
            <p>
              Zastrzegamy sobie prawo do wprowadzania zmian w niniejszej Polityce Prywatności. 
              O wszelkich istotnych zmianach będziemy informować użytkowników poprzez stronę internetową.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}