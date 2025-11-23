// Quick diagnostic script to check email configuration
// Run with: node utils/checkEmailConfig.js

require('dotenv').config();

console.log('📧 Email Configuration Check\n');
console.log('='.repeat(50));

// Check environment variables
const checks = {
  'EMAIL_USER': process.env.EMAIL_USER,
  'EMAIL_PASS': process.env.EMAIL_PASS ? '***' : undefined,
  'EMAIL_HOST': process.env.EMAIL_HOST,
  'EMAIL_PORT': process.env.EMAIL_PORT,
  'EMAIL_FROM': process.env.EMAIL_FROM,
  'FRONTEND_URL': process.env.FRONTEND_URL,
  'PLATFORM_NAME': process.env.PLATFORM_NAME
};

let hasErrors = false;

console.log('\nEnvironment Variables:');
Object.entries(checks).forEach(([key, value]) => {
  if (value) {
    console.log(`  ✅ ${key}: ${value}`);
  } else {
    console.log(`  ❌ ${key}: Not set`);
    if (key === 'EMAIL_USER' || key === 'EMAIL_PASS') {
      hasErrors = true;
    }
  }
});

console.log('\n' + '='.repeat(50));

// Check configuration type
if (process.env.EMAIL_HOST) {
  console.log('\n📋 Configuration Type: SMTP');
  console.log(`   Host: ${process.env.EMAIL_HOST}`);
  console.log(`   Port: ${process.env.EMAIL_PORT || 587}`);
  console.log(`   Secure: ${process.env.EMAIL_SECURE === 'true'}`);
} else if (process.env.EMAIL_USER) {
  console.log('\n📋 Configuration Type: Gmail');
  console.log(`   Service: gmail`);
} else {
  console.log('\n❌ No email configuration found!');
  hasErrors = true;
}

// Test transporter creation
console.log('\n' + '='.repeat(50));
console.log('\nTesting Transporter Creation:');

try {
  const { sendWorkshopEmail } = require('./emailService');
  const nodemailer = require('nodemailer');
  
  let transporter;
  if (process.env.EMAIL_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else if (process.env.EMAIL_USER) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  if (transporter) {
    console.log('  ✅ Transporter created successfully');
    
    // Try to verify connection
    console.log('\nVerifying connection...');
    transporter.verify((error, success) => {
      if (error) {
        console.log('  ❌ Connection verification failed:');
        console.log('     Error:', error.message);
        console.log('     Code:', error.code);
        
        if (error.code === 'EAUTH') {
          console.log('\n  💡 Tip: Check your EMAIL_USER and EMAIL_PASS');
          console.log('     For Gmail, use an App Password (not your regular password)');
        } else if (error.code === 'ECONNECTION') {
          console.log('\n  💡 Tip: Check your EMAIL_HOST and EMAIL_PORT');
        }
      } else {
        console.log('  ✅ Connection verified successfully!');
        console.log('     Server is ready to send emails');
      }
    });
  } else {
    console.log('  ❌ Could not create transporter');
    hasErrors = true;
  }
} catch (error) {
  console.log('  ❌ Error:', error.message);
  hasErrors = true;
}

console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.log('\n❌ Configuration issues found. Please fix the errors above.');
  process.exit(1);
} else {
  console.log('\n✅ Configuration looks good!');
  console.log('\n💡 To test sending an email, run: node utils/testEmail.js');
}

