#!/usr/bin/env tsx
/**
 * Send test approval email
 */

import { sendEmail, generateApprovalEmailHtml } from './email.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function sendTestApprovalEmail() {
  console.log('📧 Wysyłanie testowego emaila zatwierdzenia produktu...\n');
  
  // Test product data
  const productTitle = 'Laptop Gaming MSI - Test Product';
  const productId = 999;
  
  // Generate HTML email
  const emailHtml = generateApprovalEmailHtml(productTitle, productId);
  
  const emailParams = {
    to: 'xacmax27@gmail.com',
    from: process.env.FROM_EMAIL!,
    subject: '✅ Twój produkt został zatwierdzony - Spotted GFC',
    text: `Witaj!

Mamy miłą wiadomość - Twój produkt "${productTitle}" został zatwierdzony przez administratora i jest już dostępny w naszym katalogu.

Twój produkt jest teraz widoczny dla wszystkich odwiedzających. Gdy sprzedasz produkt, kliknij przycisk "Sprzedane" aby oznaczyć go jako sprzedany.

Jeśli chcesz usunąć produkt, użyj przycisku usuwania w emailu.

Dziękujemy za skorzystanie z naszej platformy!

© 2025 Spotted GFC - https://spottedgfc.pl`,
    html: emailHtml
  };
  
  console.log(`📤 Wysyłanie na: ${emailParams.to}`);
  console.log(`📝 Temat: ${emailParams.subject}`);
  console.log(`🏷️ Produkt: ${productTitle}\n`);
  
  try {
    const success = await sendEmail(emailParams);
    
    if (success) {
      console.log('🎉 Email zatwierdzenia wysłany pomyślnie!');
      console.log('📬 Sprawdź skrzynkę odbiorczą na xacmax27@gmail.com');
    } else {
      console.log('❌ Błąd wysyłania emaila - sprawdź logi powyżej');
    }
  } catch (error) {
    console.error('💥 Niespodziewany błąd:', error);
  }
}

// Run the test
sendTestApprovalEmail()
  .then(() => {
    console.log('\n✅ Test zakończony.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  });