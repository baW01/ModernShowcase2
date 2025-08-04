# Konfiguracja SMTP dla Spotted GFC

## Przegląd
Twój projekt został zaktualizowany aby używać własnego serwera SMTP zamiast SendGrid. To daje Ci pełną kontrolę nad wysyłaniem emaili i nielimitowane możliwości.

## Konfiguracja wymagana

### 1. Zmienne środowiskowe w pliku `.env`

Dodaj następujące zmienne do swojego pliku `.env`:

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@spottedgfc.pl
SMTP_PASS=your_gmail_app_password

# From Email Address
FROM_EMAIL=noreply@spottedgfc.pl
```

### 2. Konfiguracja Gmail SMTP

#### Krok 1: Włącz 2-Factor Authentication
1. Idź do [Google Account Security](https://myaccount.google.com/security)
2. Włącz "2-Step Verification"

#### Krok 2: Wygeneruj App Password
1. Idź do [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Wybierz "Mail" jako aplikację
3. Wybierz "Other" jako urządzenie i wpisz "Spotted GFC"
4. Skopiuj wygenerowane hasło do zmiennej `SMTP_PASS`

#### Krok 3: Skonfiguruj Gmail do wysyłania z Twojej domeny
1. Otwórz Gmail Settings → "Accounts and Import"
2. Kliknij "Add another email address"
3. Wpisz: `noreply@spottedgfc.pl`
4. Użyj SMTP settings:
   - Server: `smtp.gmail.com`
   - Port: `587`
   - Username: Twój Gmail
   - Password: App Password z kroku 2

### 3. Alternatywne dostawcy SMTP

#### Mailgun (Zalecane dla biznesu)
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your_mailgun_username
SMTP_PASS=your_mailgun_password
```

#### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=noreply@spottedgfc.pl
SMTP_PASS=your_outlook_password
```

## Testowanie konfiguracji

### Uruchom test SMTP:
```bash
npm run test:email your_test_email@example.com
```

Lub bezpośrednio:
```bash
tsx server/email-test.ts your_test_email@example.com
```

## Funkcje systemu

### Automatyczne emaile wysyłane przez platformę:
1. **Email zatwierdzenia** - gdy admin zatwierdzi produkt
2. **Email odrzucenia** - gdy admin odrzuci produkt  
3. **Potwierdzenie prośby o usunięcie** - gdy użytkownik prosi o usunięcie

### Bezpieczeństwo:
- Weryfikacja połączenia SMTP przed wysłaniem
- Bezpieczne tokeny do weryfikacji sprzedaży/usunięcia
- Profesjonalne nagłówki email
- Ochrona przed złośliwymi certyfikatami

## Monitoring

System loguje wszystkie operacje email:
- Status połączenia SMTP
- Szczegóły błędów
- Potwierdzenia wysłania
- Message ID dla trackingu

## Korzyści vs SendGrid

✅ **Nielimitowane emaile** - brak limitów na liczbę
✅ **Pełna kontrola** - własny serwer SMTP  
✅ **Niższe koszty** - tylko koszty domeny
✅ **Lepsze dostarczanie** - przez Gmail/Mailgun
✅ **Branding** - używa Twojej domeny spottedgfc.pl

## Rozwiązywanie problemów

### Email się nie wysyła:
1. Sprawdź logi serwera
2. Uruchom `npm run test:email`
3. Zweryfikuj App Password Gmail
4. Sprawdź firewall/port 587

### Gmail blokuje logowanie:
1. Użyj App Password, nie hasła głównego
2. Włącz 2FA na koncie Google
3. Sprawdź "Less secure app access" (niezalecane)

### Cloudflare Email Routing:
Twoje rekordy DNS są już skonfigurowane poprawnie dla odbierania emaili przez Cloudflare. System SMTP obsługuje wysyłanie, a Cloudflare obsługuje odbieranie.