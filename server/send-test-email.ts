import 'dotenv/config';
import { sendEmail } from './email.js';

async function main() {
  console.log('Sending SMTP test email with current env settings...');
  console.log({
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_USER: process.env.SMTP_USER,
    FROM_EMAIL: process.env.FROM_EMAIL
  });

  const success = await sendEmail({
    to: 'volstermc@gmail.com',
    from: process.env.FROM_EMAIL || 'noreply@spottedgfc.pl',
    subject: 'SpottedGFC SMTP test (nodemailer)',
    text: 'Test message sent via nodemailer SMTP transport.',
    html: `<p>Test message sent via nodemailer SMTP transport.</p><p>Time: ${new Date().toISOString()}</p>`
  });

  if (!success) {
    console.error('Test email failed to send.');
    process.exit(1);
  }

  console.log('Test email sent successfully.');
}

main().catch((err) => {
  console.error('Test email script error:', err);
  process.exit(1);
});
