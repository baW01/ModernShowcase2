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
            <li><strong>Kategoria</strong> - sposób klasyfikacji produktów na platformie</li>
            <li><strong>Administrator</strong> - osoba zarządzająca platformą</li>
            <li><strong>Statystyki</strong> - dane o wyświetleniach i kliknięciach produktów</li>
          </ul>

          <h2>3. Produkty zabronione</h2>
          <p>
            <strong>Na platformie SpottedGFC zabronione jest oferowanie następujących produktów:</strong>
          </p>
          <ul>
            <li><strong>Broń, amunicja i materiały wybuchowe</strong> - obrót wymaga specjalnych zezwoleń (Ustawa o broni i amunicji)</li>
            <li><strong>Narkotyki, substancje psychotropowe i środki odurzające</strong> (w tym dopalacze) - zgodnie z ustawą o przeciwdziałaniu narkomanii</li>
            <li><strong>Leki na receptę i wyroby medyczne</strong> - sprzedaż wymaga koncesji farmaceutycznej</li>
            <li><strong>Organy, tkanki, krew i wydzieliny ludzkie</strong> - handel częściami ludzkiego ciała jest przestępstwem</li>
            <li><strong>Chronione gatunki CITES</strong> - handel wymaga specjalnych pozwoleń zgodnie z ustawą o ochronie przyrody</li>
            <li><strong>Oprogramowanie i urządzenia do działań przestępczych</strong> - wirusy, trojany, narzędzia do łamania zabezpieczeń</li>
            <li><strong>Pornografia dziecięca i materiały obsceniczne z udziałem małoletnich</strong> - bezwzględnie zabronione</li>
            <li><strong>Podróbki oraz nielegalne kopie</strong> - naruszające prawa autorskie i znaki towarowe</li>
            <li><strong>Dokumenty urzędowe, karty bankowe/prepaid</strong> - fałszerstwo dokumentów jest przestępstwem</li>
            <li><strong>Hazard i maszyny do gier</strong> - wymaga koncesji na obrót zgodnie z ustawą o grach hazardowych</li>
            <li><strong>Alkohol i wyroby tytoniowe</strong> - sprzedaż tylko przez licencjonowanych sprzedawców</li>
            <li><strong>Niebezpieczne substancje chemiczne i prekursory</strong> - wymaga specjalnych zezwoleń</li>
          </ul>
          <p>
            <strong>Uwaga:</strong> Użytkownicy ponoszą pełną odpowiedzialność prawną za oferowane produkty. 
            Oferowanie zabronionych przedmiotów może skutkować usunięciem oferty i zgłoszeniem do odpowiednich organów.
          </p>

          <h2>4. Zasady korzystania</h2>
          <ol>
            <li>Użytkownik zobowiązuje się do podawania prawdziwych informacji o produktach</li>
            <li>Zabronione jest umieszczanie treści niezgodnych z prawem</li>
            <li>Użytkownik odpowiada za jakość i stan oferowanych produktów</li>
            <li>Transakcje odbywają się bezpośrednio między użytkownikami</li>
            <li>Produkty muszą być przypisane do odpowiedniej kategorii</li>
            <li>Platforma automatycznie zbiera statystyki wyświetleń i kliknięć</li>
            <li>Zabronione jest sztuczne zwiększanie statystyk produktów</li>
            <li>Użytkownik zobowiązuje się do sprawdzenia legalności oferowanych produktów przed ich umieszczeniem</li>
            <li>Zabronione jest oferowanie produktów wymagających specjalnych licencji lub zezwoleń bez ich posiadania</li>
          </ol>

          <h2>5. Odpowiedzialność</h2>
          <p>
            Administrator platformy nie ponosi odpowiedzialności za:
          </p>
          <ul>
            <li>Jakość i stan produktów</li>
            <li>Realizację transakcji między użytkownikami</li>
            <li>Szkody wynikłe z korzystania z platformy</li>
            <li>Dokładność statystyk wyświetleń i kliknięć</li>
            <li>Nieprawidłowe kategoryzowanie produktów przez użytkowników</li>
            <li>Legalność oferowanych produktów - sprawdzenie zgodności z prawem leży po stronie użytkownika</li>
          </ul>

          <h2>6. Moderacja i kontrola treści</h2>
          <p>
            Administrator zastrzega sobie prawo do:
          </p>
          <ul>
            <li>Usuwania ofert niezgodnych z regulaminem lub prawem</li>
            <li>Blokowania dostępu użytkownikom naruszającym regulamin</li>
            <li>Zgłaszania nielegalnych działań do odpowiednich organów</li>
            <li>Weryfikacji legalności oferowanych produktów</li>
            <li>Wprowadzania dodatkowych ograniczeń w zakresie oferowanych produktów</li>
          </ul>

          <h2>7. Ochrona danych osobowych</h2>
          <p>
            Szczegółowe informacje o przetwarzaniu danych osobowych znajdują się w 
            <a href="/polityka-prywatnosci" className="text-primary hover:underline"> Polityce Prywatności</a>.
          </p>

          <h2>8. Funkcjonalności platformy</h2>
          <p>
            Platforma oferuje następujące funkcjonalności:
          </p>
          <ul>
            <li>Przeglądanie produktów według kategorii</li>
            <li>Sortowanie produktów według popularności, daty dodania lub ceny</li>
            <li>Wyświetlanie statystyk popularności produktów</li>
            <li>System zarządzania kategoriami przez administratora</li>
            <li>Bezpośredni kontakt telefoniczny ze sprzedającymi</li>
          </ul>

          <h2>9. Postanowienia końcowe</h2>
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