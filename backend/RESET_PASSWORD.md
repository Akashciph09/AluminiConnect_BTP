Password reset / OTP flow

Environment variables
- RESET_OTP_TTL_MINUTES (default 10)
- RESET_OTP_RESEND_COOLDOWN_SECONDS (default 60)
- RESET_OTP_MAX_REQUESTS_PER_HOUR (default 5)
- RESET_OTP_MAX_RESEND_PER_HOUR (default 3)
- RESET_OTP_MAX_VERIFY_ATTEMPTS (default 5)

Email configuration (required to actually send emails):
- EMAIL_USER
- EMAIL_PASS
- EMAIL_HOST (optional for custom SMTP)
- EMAIL_PORT
- EMAIL_FROM (optional)

API endpoints (public)
- POST /api/auth/forgot-password { email }
  - Sends a 6-digit OTP to the email if account exists. Always returns { ok: true } to avoid user enumeration.

- POST /api/auth/resend-otp { email }
  - Resends an OTP if allowed (cooldown + per-hour limits). Returns generic success.

- POST /api/auth/verify-otp { email, otp, newPassword }
  - Verifies OTP and resets password when valid. Returns { ok: true, message } on success.

Notes
- OTPs are stored hashed (bcrypt) in the PasswordReset collection and expire after `expiresAt`. A TTL index auto-deletes expired documents.
- Attempts and resend counts are tracked to prevent abuse.
- Confirmation emails are sent after a successful password change.

Testing
- To test locally without SMTP, you can set EMAIL_USER and EMAIL_PASS to dummy values but emails won't be delivered. The system will still create the PasswordReset document so you can test the verify flow if you log the OTP during development (not recommended in production).
