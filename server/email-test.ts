#!/usr/bin/env node
/**
 * Email Testing Script for Spotted GFC
 * Tests SMTP configuration and email sending functionality
 */

import { sendEmail } from './email.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testEmailConfiguration() {
  console.log('🧪 Testing Email Configuration for Spotted GFC\n');
  
  // Check required environment variables
  const requiredVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nPlease configure these in your .env file before testing.');
    process.exit(1);
  }
  
  console.log('✅ All required environment variables found');
  console.log(`📧 SMTP Host: ${process.env.SMTP_HOST}`);
  console.log(`👤 SMTP User: ${process.env.SMTP_USER}`);
  console.log(`📮 From Email: ${process.env.FROM_EMAIL}\n`);
  
  // Test email sending
  const testEmail = process.argv[2] || 'test@example.com';
  
  console.log(`📤 Sending test email to: ${testEmail}`);
  
  const emailParams = {
    to: testEmail,
    from: process.env.FROM_EMAIL!,
    subject: '✅ Test Email from Spotted GFC Platform',
    text: 'This is a test email from your Spotted GFC platform. If you received this, your SMTP configuration is working correctly!',
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2c5530;">✅ Test Email Success!</h1>
            <p>This is a test email from your <strong>Spotted GFC</strong> platform.</p>
            <p>If you received this email, your SMTP configuration is working correctly!</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Configuration Details:</h3>
              <ul>
                <li><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</li>
                <li><strong>From Address:</strong> ${process.env.FROM_EMAIL}</li>
                <li><strong>Test Time:</strong> ${new Date().toLocaleString()}</li>
              </ul>
            </div>
            <p style="color: #666; font-size: 12px;">
              This email was sent automatically from the Spotted GFC platform test script.
            </p>
          </div>
        </body>
      </html>
    `
  };
  
  try {
    const success = await sendEmail(emailParams);
    
    if (success) {
      console.log('🎉 Email sent successfully!');
      console.log('✅ Your SMTP configuration is working correctly.');
    } else {
      console.log('❌ Email sending failed. Check the logs above for details.');
    }
  } catch (error) {
    console.error('💥 Unexpected error during email test:', error);
  }
}

// Run the test
testEmailConfiguration()
  .then(() => {
    console.log('\n📊 Email test completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Email test failed:', error);
    process.exit(1);
  });