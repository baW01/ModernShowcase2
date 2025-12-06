import sgMail from '@sendgrid/mail';
import { generateDeleteRequestToken } from './hash-utils.js';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SENDGRID_API_KEY not found, email not sent');
    return false;
  }

  if (!process.env.FROM_EMAIL) {
    console.warn('FROM_EMAIL not found, email not sent');
    return false;
  }

  console.log(`Attempting to send email to: ${params.to} from: ${params.from}`);
  console.log(`Subject: ${params.subject}`);

  try {
    const result = await sgMail.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text ?? '',
      html: params.html,
      trackingSettings: {
        clickTracking: {
          enable: false,
          enableText: false
        },
        openTracking: {
          enable: false
        }
      }
    });
    console.log(`Email sent successfully to ${params.to}`, result[0].statusCode);
    return true;
  } catch (error: any) {
    console.error('SendGrid email error:', {
      message: error.message,
      code: error.code,
      response: error.response?.body || 'No response body'
    });
    return false;
  }
}

export function generateApprovalEmailHtml(productTitle: string, productId: number): string {
  // Use custom domain instead of auto-detected Replit domains
  const baseUrl = 'https://spottedgfc.pl';
  
  // Generate secure token instead of using plain product ID
  const secureToken = generateDeleteRequestToken(productId);
  const deleteUrl = `${baseUrl}/delete-request?token=${secureToken}`;
  
  console.log(`Final generated delete URL with secure token: ${deleteUrl}`);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Produkt zatwierdzony</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f4f4f4; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        .footer { font-size: 12px; color: #666; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Twój produkt został zatwierdzony!</h1>
        </div>
        <div class="content">
          <p>Witaj!</p>
          <p>Mamy miłą wiadomość - Twój produkt "<strong>${productTitle}</strong>" został zatwierdzony przez administratora i jest już dostępny w naszym katalogu.</p>
          
          <h3>Co dalej?</h3>
          <p>Twój produkt jest teraz widoczny dla wszystkich odwiedzających. Gdy sprzedasz produkt, kliknij przycisk "Sprzedane" aby oznaczyć go jako sprzedany. Jeśli chcesz usunąć produkt, użyj przycisku usuwania:</p>
          
          <div style="text-align: center;">
            <a href="${baseUrl}/verify-sale?token=${secureToken}" class="button" style="background-color: #28a745;">✅ Oznacz jako sprzedane</a>
            <a href="${deleteUrl}" class="button" style="margin-left: 10px;">🗑️ Poproś o usunięcie produktu</a>
          </div>
          
          <p><strong>Ważne:</strong> Link do usunięcia działa tylko dla tego adresu email. Jeśli chcesz usunąć produkt, kliknij przycisk powyżej, a administrator rozpatrzy Twoją prośbę.</p>
        </div>
        <div class="footer">
          <p>Ten email został wysłany automatycznie. Prosimy nie odpowiadać na tę wiadomość.</p>
          <p>© 2025 Spotted GFC - <a href="https://spottedgfc.pl">spottedgfc.pl</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateDeleteRequestEmailHtml(productTitle: string, reason?: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Prośba o usunięcie produktu</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f4f4f4; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { font-size: 12px; color: #666; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📝 Prośba o usunięcie otrzymana</h1>
        </div>
        <div class="content">
          <p>Witaj!</p>
          <p>Otrzymaliśmy Twoją prośbę o usunięcie produktu "<strong>${productTitle}</strong>".</p>
          
          ${reason ? `<p><strong>Powód usunięcia:</strong> ${reason}</p>` : ''}
          
          <p>Administrator rozpatrzy Twoją prośbę w ciągu najbliższych dni roboczych. O decyzji zostaniesz poinformowany na ten adres email.</p>
          
          <p>Dziękujemy za skorzystanie z naszej platformy!</p>
        </div>
        <div class="footer">
          <p>Ten email został wysłany automatycznie. Prosimy nie odpowiadać na tę wiadomość.</p>
          <p>© 2025 Spotted GFC - <a href="https://spottedgfc.pl">spottedgfc.pl</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateRejectionEmailHtml(productTitle: string, reason: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Prośba o dodanie produktu odrzucona</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f4f4f4; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .reason-box { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 15px 0; }
        .footer { font-size: 12px; color: #666; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Prośba o dodanie produktu odrzucona</h1>
        </div>
        <div class="content">
          <p>Witaj!</p>
          <p>Niestety musimy poinformować Cię, że Twoja prośba o dodanie produktu "<strong>${productTitle}</strong>" została odrzucona przez administratora.</p>
          
          <div class="reason-box">
            <h3>Powód odrzucenia:</h3>
            <p>${reason}</p>
          </div>
          
          <p>Jeśli masz pytania dotyczące tej decyzji lub chcesz poprawić swoją prośbę, możesz spróbować ponownie z uwzględnieniem uwag administratora.</p>
          
          <p>Dziękujemy za zrozumienie i zapraszamy do ponownego skorzystania z naszej platformy.</p>
        </div>
        <div class="footer">
          <p>Ten email został wysłany automatycznie. Prosimy nie odpowiadać na tę wiadomość.</p>
          <p>© 2025 Spotted GFC - <a href="https://spottedgfc.pl">spottedgfc.pl</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}
