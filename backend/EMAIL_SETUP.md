# Email Configuration Guide

## Quick Setup

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Step Verification**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable "2-Step Verification" if not already enabled

2. **Generate App Password**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" as the app
   - Select "Other (Custom name)" as the device
   - Enter "AlumniConnect" as the name
   - Click "Generate"
   - Copy the 16-character password (no spaces)

3. **Add to .env file**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   EMAIL_FROM=noreply@alumniconnect.com
   FRONTEND_URL=http://localhost:3000
   PLATFORM_NAME=AlumniConnect
   ```

### Option 2: SMTP (For Production or Other Email Providers)

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@alumniconnect.com
FRONTEND_URL=http://localhost:3000
PLATFORM_NAME=AlumniConnect
```

### Option 3: Other Email Providers

**SendGrid:**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com
```

**Outlook/Office365:**
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
EMAIL_FROM=your-email@outlook.com
```

## Testing Your Configuration

Run the test script:
```bash
cd backend
node utils/testEmail.js
```

Or use the diagnostic script:
```bash
node utils/checkEmailConfig.js
```

## Troubleshooting

### Error: "Authentication failed" (EAUTH)
- **Gmail**: Make sure you're using an App Password, not your regular password
- **Other providers**: Check your username and password are correct

### Error: "Connection failed" (ECONNECTION)
- Check your EMAIL_HOST and EMAIL_PORT settings
- Verify your firewall isn't blocking the connection
- For Gmail, try port 465 with EMAIL_SECURE=true

### Error: "Email transporter not available"
- Make sure EMAIL_USER and EMAIL_PASS are set in your .env file
- Restart your server after changing .env file

### Emails not being sent
1. Check backend console logs for error messages
2. Verify email configuration with `node utils/checkEmailConfig.js`
3. Test email sending with `node utils/testEmail.js`
4. Check spam/junk folder
5. Verify recipient email address is correct

## Important Notes

- **Never commit your .env file to version control**
- **Gmail App Passwords are required** - regular passwords won't work
- **App Passwords are 16 characters** with no spaces
- **2-Step Verification must be enabled** to generate App Passwords

