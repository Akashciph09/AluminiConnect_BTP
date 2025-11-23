// Test script to verify email configuration
// Run with: node utils/testEmail.js

require('dotenv').config();
const { sendWorkshopEmail } = require('./emailService');

async function testEmail() {
  console.log('Testing email configuration...\n');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST || 'Not set');
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT || 'Not set');
  console.log('EMAIL_USER:', process.env.EMAIL_USER || 'Not set');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***' : 'Not set');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'Not set');
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set');
  console.log('PLATFORM_NAME:', process.env.PLATFORM_NAME || 'Not set (using default: AlumniConnect)');
  console.log('\n');

  // Test email sending
  const testEmail = process.env.TEST_EMAIL || process.env.EMAIL_USER;
  
  if (!testEmail) {
    console.error('❌ Error: No test email address found.');
    console.log('Please set TEST_EMAIL in your .env file or use EMAIL_USER as the recipient.');
    process.exit(1);
  }

  console.log(`Sending test email to: ${testEmail}\n`);

  try {
    const result = await sendWorkshopEmail(
      testEmail,
      'Test Student',
      'Test Workshop',
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      'https://meet.google.com/test-workshop-link',
      'email-only'
    );

    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', result.messageId);
      console.log('\nPlease check your inbox (and spam folder) for the test email.');
    } else {
      console.error('❌ Failed to send email:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error sending test email:', error.message);
    console.error('\nCommon issues:');
    console.error('1. Check your EMAIL_USER and EMAIL_PASS are correct');
    console.error('2. For Gmail, use an App Password (not your regular password)');
    console.error('3. Ensure "Less secure app access" is enabled (if using Gmail)');
    console.error('4. Check your SMTP host and port settings');
    process.exit(1);
  }
}

testEmail();

