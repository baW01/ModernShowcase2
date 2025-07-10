import { Heart, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* SpottedGFC Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SpottedGFC</h3>
            <p className="text-gray-600 mb-4">
              Platforma do sprzedaży i wymiany produktów w społeczności SpottedGFC. 
              Znajdź to, czego szukasz lub sprzedaj swoje rzeczy.
            </p>
            <a 
              href="https://suppi.pl/spottedgfc" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
            >
              <Heart className="mr-2 h-4 w-4" />
              Wspieraj nas
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Szybkie linki</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/regulamin" 
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  Regulamin
                </a>
              </li>
              <li>
                <a 
                  href="/polityka-prywatnosci" 
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  Polityka prywatności
                </a>
              </li>
              <li>
                <a 
                  href="mailto:kontakt@spottedgfc.pl" 
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  Kontakt
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Wsparcie</h3>
            <p className="text-gray-600 mb-4">
              Pomóż nam rozwijać platformę i wspierać społeczność SpottedGFC.
            </p>
            <a 
              href="https://suppi.pl/spottedgfc" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Heart className="mr-2 h-4 w-4" />
              Wspomóż nas
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-600">
            © 2024 SpottedGFC. Wszystkie prawa zastrzeżone. 
            <span className="mx-2">•</span>
            <a 
              href="https://suppi.pl" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Wspieraj na suppi.pl
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}