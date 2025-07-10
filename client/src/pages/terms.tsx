import { Footer } from "@/components/footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Regulamin SpottedGFC</h1>
        
        <div className="prose prose-lg max-w-none">
          <h2>1. Postanowienia ogólne</h2>
          <p>
            Niniejszy regulamin określa zasady korzystania z platformy SpottedGFC, 
            która umożliwia użytkownikom sprzedaż, kupno i wymianę różnego rodzaju produktów.
          </p>

          <h2>2. Definicje</h2>
          <ul>
            <li><strong>Platforma</strong> - serwis internetowy SpottedGFC</li>
            <li><strong>Użytkownik</strong> - osoba korzystająca z platformy</li>
            <li><strong>Produkt</strong> - przedmiot oferowany do sprzedaży lub wymiany</li>
            <li><strong>Administrator</strong> - osoba zarządzająca platformą</li>
          </ul>

          <h2>3. Zasady korzystania</h2>
          <ol>
            <li>Użytkownik zobowiązuje się do podawania prawdziwych informacji o produktach</li>
            <li>Zabronione jest umieszczanie treści niezgodnych z prawem</li>
            <li>Użytkownik odpowiada za jakość i stan oferowanych produktów</li>
            <li>Transakcje odbywają się bezpośrednio między użytkownikami</li>
          </ol>

          <h2>4. Odpowiedzialność</h2>
          <p>
            Administrator platformy nie ponosi odpowiedzialności za:
          </p>
          <ul>
            <li>Jakość i stan produktów</li>
            <li>Realizację transakcji między użytkownikami</li>
            <li>Szkody wynikłe z korzystania z platformy</li>
          </ul>

          <h2>5. Ochrona danych osobowych</h2>
          <p>
            Szczegółowe informacje o przetwarzaniu danych osobowych znajdują się w 
            <a href="/polityka-prywatnosci" className="text-primary hover:underline"> Polityce Prywatności</a>.
          </p>

          <h2>6. Postanowienia końcowe</h2>
          <p>
            Administrator zastrzega sobie prawo do modyfikacji regulaminu. 
            Zmiany wchodzą w życie z chwilą publikacji na stronie.
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