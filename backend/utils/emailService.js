const nodemailer = require('nodemailer');

// Create transporter - configure based on your email service
// For development, you can use Gmail, SendGrid, or other services
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_HOST && !process.env.EMAIL_USER) {
    console.warn('⚠️ Email configuration not found. Emails will not be sent.');
    console.warn('   Please set EMAIL_USER and EMAIL_PASS in your .env file');
    return null;
  }

  // Check if password is configured
  if (!process.env.EMAIL_PASS) {
    console.error('❌ EMAIL_PASS is not set in .env file');
    console.error('   For Gmail: Use an App Password (not your regular password)');
    console.error('   Get App Password: Google Account → Security → 2-Step Verification → App Passwords');
    return null;
  }

  // For SMTP (custom email server)
  if (process.env.EMAIL_HOST) {
    console.log('📧 Using SMTP configuration:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      user: process.env.EMAIL_USER
    });
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // For Gmail (requires App Password)
  if (process.env.EMAIL_USER) {
    console.log('📧 Using Gmail service configuration');
    console.log('⚠️  IMPORTANT: Gmail requires an App Password, not your regular password!');
    console.log('   If you get authentication errors, create an App Password:');
    console.log('   1. Go to Google Account → Security');
    console.log('   2. Enable 2-Step Verification (if not already enabled)');
    console.log('   3. Go to App Passwords');
    console.log('   4. Generate a new App Password for "Mail"');
    console.log('   5. Use that 16-character password in EMAIL_PASS');
    
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  return null;
};

// Generate plain text email
const generatePlainTextEmail = (studentName, workshopTitle, dateTime, joinUrl, platformName = 'AlumniConnect') => {
  return `Hi ${studentName},

You're registered for "${workshopTitle}" on ${dateTime}.

Join link: ${joinUrl}

If you didn't register, ignore this email.

— ${platformName} Workshops Team`;
};

// Generate HTML email
const generateHTMLEmail = (studentName, workshopTitle, dateTime, joinUrl, platformName = 'AlumniConnect') => {
  return `
<div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1976d2;">You're registered — "${workshopTitle}"</h2>
  <p>Hi <strong>${studentName}</strong>,</p>
  <p>Here is your join link for <strong>${workshopTitle}</strong>:</p>
  <p style="margin: 20px 0;">
    <a href="${joinUrl}" style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
      Click here to join the workshop
    </a>
  </p>
  <p>If it doesn't open, copy this URL:<br>
    <small style="color: #666; word-break: break-all;">${joinUrl}</small>
  </p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
  <p style="font-size: 12px; color: #777;">
    This email was sent by ${platformName}.<br>
    Workshop Date: ${dateTime}
  </p>
</div>`;
};

// Generate HTML for password reset OTP email matching workshop style
const generateResetHTMLEmail = (userName, otp, ttlMinutes, platformName = 'AlumniConnect') => {
  return `
<div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
  <img src="${process.env.PLATFORM_LOGO_URL || ''}" alt="${platformName}" style="max-width:120px; margin-bottom:12px;" />
  <h2 style="color: #1976d2; margin-bottom:8px;">${platformName} — Password Reset</h2>
  <p>Hi ${userName || 'User'},</p>
  <p>Use the following one-time code to reset your password. This code expires in ${ttlMinutes} minutes.</p>
  <div style="font-size:32px; font-weight:700; letter-spacing:6px; margin: 18px 0;">${otp}</div>
  <p style="color:#666; font-size:13px;">If you didn't request this, you can safely ignore this email or contact support immediately.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
  <p style="font-size:12px; color:#777;">This email was sent by ${platformName}. If you need help, reply to this email.</p>
</div>`;
};

// Send workshop registration email
const sendWorkshopEmail = async (email, studentName, workshopTitle, workshopDate, joinUrl, registrationMode = 'email-only') => {
  try {
    // Validate email parameter
    if (!email || !email.trim()) {
      console.error('❌ Cannot send email: email address is missing or empty');
      return { success: false, error: 'Email address is required' };
    }

    console.log('📧 Attempting to send email:', {
      to: email,
      workshop: workshopTitle,
      mode: registrationMode
    });

    const transporter = createTransporter();
    
    if (!transporter) {
      console.error('❌ Email transporter not available. Check your .env configuration.');
      console.error('Required variables: EMAIL_USER and EMAIL_PASS (or EMAIL_HOST for SMTP)');
      console.log('Email would have been sent to:', email);
      console.log('Workshop:', workshopTitle);
      console.log('Join URL:', joinUrl);
      return { success: false, error: 'Email service not configured' };
    }

    console.log('✅ Email transporter created successfully');

    // Format date and time
    const dateTime = new Date(workshopDate).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    const platformName = process.env.PLATFORM_NAME || 'AlumniConnect';
    const subject = `Your access link for '${workshopTitle}' — ${new Date(workshopDate).toLocaleDateString()}`;

    const plainText = generatePlainTextEmail(studentName, workshopTitle, dateTime, joinUrl, platformName);
    const html = generateHTMLEmail(studentName, workshopTitle, dateTime, joinUrl, platformName);

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@alumniconnect.com',
      to: email,
      subject: subject,
      text: plainText,
      html: html
    };

    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.error('Error code:', error.code);
    console.error('Error command:', error.command);
    console.error('Full error:', error);
    
    // Provide helpful error messages
    let errorMessage = error.message;
    if (error.code === 'EAUTH') {
      errorMessage = 'Authentication failed. Check your EMAIL_USER and EMAIL_PASS.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Connection failed. Check your EMAIL_HOST and EMAIL_PORT.';
    }
    
    return { success: false, error: errorMessage, details: error.code };
  }
};

module.exports = {
  sendWorkshopEmail,
  generatePlainTextEmail,
  generateHTMLEmail
};

// Generic email sender for other flows (password reset, confirmations)
module.exports.sendEmail = async (to, subject, text, html) => {
  try {
    if (!to || !to.trim()) return { success: false, error: 'Missing recipient' };
    const transporter = createTransporter();
    if (!transporter) return { success: false, error: 'Email transporter not configured' };

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@alumniconnect.com',
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Generic email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Error sending generic email:', err);
    return { success: false, error: err.message };
  }
};

// Convenience helper for password reset emails that matches the workshop/email branding
module.exports.sendPasswordResetEmail = async (to, userName, otp, ttlMinutes) => {
  const platformName = process.env.PLATFORM_NAME || 'AlumniConnect';
  const subject = `Your password reset code for ${platformName}`;
  const text = `Hi ${userName || ''},\n\nUse this 6-digit code to reset your password: ${otp}\n\nThis code expires in ${ttlMinutes} minutes.\n\nIf you didn't request this, ignore this email or contact support.`;
  const html = generateResetHTMLEmail(userName, otp, ttlMinutes, platformName);
  return module.exports.sendEmail(to, subject, text, html);
};

