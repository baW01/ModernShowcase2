# 🔧 Poprawka konfiguracji Gmail SMTP

## Problem
Gmail SMTP wymaga aby `SMTP_USER` był rzeczywistym adresem Gmail, nie domeną niestandardową.

## Rozwiązanie

### 1. Zaktualizuj zmienne środowiskowe
Potrzebujesz zmienić `SMTP_USER` na Twój rzeczywisty adres Gmail:

```bash
SMTP_USER=twoj_rzeczywisty_gmail@gmail.com
SMTP_PASS=xzfl taao tfdd inwh  # Twoje App Password
FROM_EMAIL=noreply@spottedgfc.pl  # Ta zostaje bez zmian
```

### 2. Jak to działa
- **Uwierzytelnianie**: Używa rzeczywistego Gmail (SMTP_USER)
- **Wysyłanie**: Emaile wychodzą z domeny spottedgfc.pl (FROM_EMAIL)
- **Odbieranie**: Cloudflare Email Routing przekierowuje na Twój Gmail

### 3. Konfiguracja Gmail (ważne!)
1. Idź do **Gmail Settings** → **Accounts and Import**
2. W sekcji **"Send mail as"** kliknij **"Add another email address"**
3. Dodaj: `noreply@spottedgfc.pl`
4. Gmail wyśle email weryfikacyjny na noreply@spottedgfc.pl
5. Sprawdź swój Gmail (Cloudflare przekieruje email)
6. Kliknij link weryfikacyjny

### 4. Alternatywne rozwiązania

#### Opcja A: Mailgun (Zalecane dla biznesu)
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@mail.spottedgfc.pl
SMTP_PASS=twoje_mailgun_haslo
FROM_EMAIL=noreply@spottedgfc.pl
```

#### Opcja B: Outlook
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=twoj_outlook@outlook.com
SMTP_PASS=twoje_haslo
FROM_EMAIL=noreply@spottedgfc.pl
```

## Test po konfiguracji
```bash
tsx server/email-test.ts twoj_email@example.com
```

## Co dalej
Po poprawieniu SMTP_USER system będzie:
- ✅ Uwierzytelniać się z Gmail
- ✅ Wysyłać emaile z noreply@spottedgfc.pl
- ✅ Odbierać przez Cloudflare na spottedgfc.pl