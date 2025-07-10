import { Footer } from "@/components/footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Polityka Prywatności SpottedGFC</h1>
        
        <div className="prose prose-lg max-w-none">
          <h2>1. Administrator danych</h2>
          <p>
            Administratorem danych osobowych zbieranych za pośrednictwem platformy SpottedGFC 
            jest społeczność SpottedGFC.
          </p>

          <h2>2. Rodzaje zbieranych danych</h2>
          <p>Zbieramy następujące dane:</p>
          <ul>
            <li>Dane podane podczas dodawania produktów (nazwa, opis, cena, kategoria)</li>
            <li>Dane kontaktowe (numer telefonu, adres email)</li>
            <li>Dane techniczne (adres IP, informacje o przeglądarce, user agent)</li>
            <li>Statystyki korzystania z platformy (wyświetlenia i kliknięcia produktów)</li>
            <li>Dane o interakcjach z produktami (historia przeglądania)</li>
            <li>Preferencje dotyczące plików cookie</li>
          </ul>

          <h2>3. Cel przetwarzania danych</h2>
          <p>Dane są przetwarzane w celu:</p>
          <ul>
            <li>Umożliwienia korzystania z platformy</li>
            <li>Ułatwienia kontaktu między użytkownikami</li>
            <li>Prowadzenia statystyk i analiz popularności produktów</li>
            <li>Zapewnienia bezpieczeństwa platformy</li>
            <li>Kategoryzacji i organizacji produktów</li>
            <li>Zapobiegania nadużyciom i spam-owi</li>
            <li>Optymalizacji działania platformy</li>
          </ul>

          <h2>4. Podstawa prawna</h2>
          <p>
            Podstawą prawną przetwarzania danych jest:
          </p>
          <ul>
            <li>Zgoda użytkownika (art. 6 ust. 1 lit. a RODO)</li>
            <li>Realizacja umowy (art. 6 ust. 1 lit. b RODO)</li>
            <li>Prawnie uzasadniony interes (art. 6 ust. 1 lit. f RODO)</li>
          </ul>

          <h2>5. Udostępnianie danych</h2>
          <p>
            Dane osobowe mogą być udostępniane wyłącznie:
          </p>
          <ul>
            <li>Innym użytkownikom w zakresie danych kontaktowych przy produktach</li>
            <li>Podmiotom świadczącym usługi techniczne</li>
            <li>Organom państwowym na podstawie przepisów prawa</li>
          </ul>

          <h2>6. Okres przechowywania danych</h2>
          <p>
            Dane są przechowywane przez okres niezbędny do realizacji celów, 
            dla których zostały zebrane, nie dłużej niż przez 5 lat od ostatniej aktywności.
          </p>

          <h2>7. Prawa użytkownika</h2>
          <p>Użytkownik ma prawo do:</p>
          <ul>
            <li>Dostępu do swoich danych</li>
            <li>Sprostowania danych</li>
            <li>Usunięcia danych</li>
            <li>Ograniczenia przetwarzania</li>
            <li>Przenoszenia danych</li>
            <li>Wniesienia sprzeciwu</li>
          </ul>

          <h2>8. Bezpieczeństwo danych</h2>
          <p>
            Stosujemy odpowiednie środki techniczne i organizacyjne w celu 
            zabezpieczenia danych osobowych przed nieuprawnionym dostępem, 
            utratą, zniszczeniem lub uszkodzeniem.
          </p>

          <h2>9. Pliki cookies i śledzenie</h2>
          <p>
            Platforma wykorzystuje pliki cookies oraz systemy śledzenia w celu:
          </p>
          <ul>
            <li>Zapewnienia prawidłowego funkcjonowania platformy</li>
            <li>Analizy ruchu i popularności produktów</li>
            <li>Zapobiegania wielokrotnemu liczeniu statystyk od tego samego użytkownika</li>
            <li>Zapamiętywania preferencji użytkownika dotyczących cookies</li>
          </ul>
          <p>
            Użytkownik może zarządzać cookies poprzez ustawienia przeglądarki lub 
            banner zgody na cookies. Statystyki wyświetleń i kliknięć są zbierane 
            anonimowo z uwzględnieniem adresu IP w celu unikania duplikatów.
          </p>

          <h2>10. Kontakt</h2>
          <p>
            W sprawach dotyczących ochrony danych osobowych można kontaktować się 
            pod adresem: <a href="mailto:kontakt@spottedgfc.pl" className="text-primary hover:underline">kontakt@spottedgfc.pl</a>
          </p>
          
          <p className="text-sm text-gray-600 mt-8">
            Ostatnia aktualizacja: {new Date().toLocaleDateString("pl-PL")}
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}