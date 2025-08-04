# 📧 Szybka konfiguracja SMTP dla noreply@spottedgfc.pl

## 🎯 Co zostało zmienione
✅ **SendGrid usunięty** - brak limitów!  
✅ **Nodemailer SMTP** - pełna kontrola  
✅ **Twoja domena** - noreply@spottedgfc.pl  
✅ **Cloudflare Email Routing** - działa z Twoimi rekordami DNS  

## ⚡ Szybka konfiguracja (5 minut)

### 1. Utwórz Gmail App Password
1. Idź do [myaccount.google.com/security](https://myaccount.google.com/security)
2. Włącz **2-Step Verification** (jeśli nie masz)
3. Idź do [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Wybierz **Mail** → **Other** → wpisz "Spotted GFC"
5. **Skopiuj 16-znakowe hasło**

### 2. Dodaj do pliku .env
```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@spottedgfc.pl
SMTP_PASS=twoje_app_password_z_kroku_1

# From Email
FROM_EMAIL=noreply@spottedgfc.pl
```

### 3. Skonfiguruj Gmail dla wysyłania
1. Otwórz **Gmail Settings** → **Accounts and Import**
2. Kliknij **"Add another email address"**
3. Wpisz: `noreply@spottedgfc.pl`
4. Użyj SMTP settings:
   - **Server**: `smtp.gmail.com`
   - **Port**: `587`
   - **Username**: Twój główny Gmail
   - **Password**: App Password z kroku 1

### 4. Test systemu
```bash
# Uruchom test
tsx server/email-test.ts twoj_email@example.com
```

## 🎉 Gotowe!

Teraz masz:
- **Nielimitowane emaile** przez SMTP
- **Odbieranie** przez Cloudflare Email Routing (już skonfigurowane)
- **Wysyłanie** przez Gmail SMTP z Twojej domeny
- **Profesjonalne emaile** z noreply@spottedgfc.pl

## 🔧 Co robi system automatycznie:
- ✅ Email zatwierdzenia produktu
- ❌ Email odrzucenia produktu  
- 🗑️ Potwierdzenie prośby o usunięcie
- 📊 Bezpieczne tokeny weryfikacji

Wszystko działa z Twoją domeną **spottedgfc.pl**!