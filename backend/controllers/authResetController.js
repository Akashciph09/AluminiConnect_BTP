const bcrypt = require('bcryptjs');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const { sendEmail } = require('../utils/emailService');

const RESET_TTL_MINUTES = Number(process.env.RESET_OTP_TTL_MINUTES || 10);
const RESEND_COOLDOWN_SECONDS = Number(process.env.RESET_OTP_RESEND_COOLDOWN_SECONDS || 60);
const MAX_REQUESTS_PER_HOUR = Number(process.env.RESET_OTP_MAX_REQUESTS_PER_HOUR || 5);
const MAX_RESEND_PER_HOUR = Number(process.env.RESET_OTP_MAX_RESEND_PER_HOUR || 3);
const MAX_VERIFY_ATTEMPTS = Number(process.env.RESET_OTP_MAX_VERIFY_ATTEMPTS || 5);

const generateOtp = () => ('' + Math.floor(100000 + Math.random() * 900000));

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(200).json({ ok: true });

  const normalized = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: normalized });
  // DEV DEBUG: log normalized email and whether a user was found
  console.log('forgotPassword requested for:', { normalizedEmail: normalized, userFound: !!user });

    // Rate limiting per email: count recent requests
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await PasswordReset.countDocuments({ email: normalized, createdAt: { $gte: oneHourAgo } });
    if (recentCount >= MAX_REQUESTS_PER_HOUR) {
      console.warn('Password reset request rate limited for', normalized);
      return res.status(200).json({ ok: true });
    }

    // Generate OTP and hash
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000);

    const resetDoc = await PasswordReset.create({
      userId: user?._id,
      email: normalized,
      otpHash,
      expiresAt,
      ip: req.ip,
      userAgent: req.headers['user-agent'] || ''
    });

    // Send OTP email (do not reveal if user doesn't exist)
    const platform = process.env.PLATFORM_NAME || 'AlumniConnect';
    const subject = `Your password reset code for ${platform}`;
    const text = `Hi ${user?.name || ''},\n\nUse this 6-digit code to reset your password: ${otp}\n\nThis code expires in ${RESET_TTL_MINUTES} minutes.\n\nIf you didn't request this, ignore this email or contact support.`;
    const html = `<div style="font-family: Arial, Helvetica, sans-serif; max-width:600px; margin:0 auto; padding:16px; text-align:center;">` +
      `<h2 style="color:#1976d2">${platform} — Password Reset</h2>` +
      `<p>Use the code below to reset your password. It expires in ${RESET_TTL_MINUTES} minutes.</p>` +
      `<div style="font-size:28px; font-weight:700; letter-spacing:4px; margin:16px 0;">${otp}</div>` +
      `<p style="font-size:12px; color:#666">If you didn't request this, ignore this email.</p>` +
      `</div>`;

    try {
      // Use branded password reset email helper to match workshop/welcome styles
      const userName = user?.name || '';
      const { sendPasswordResetEmail } = require('../utils/emailService');
      await sendPasswordResetEmail(normalized, userName, otp, RESET_TTL_MINUTES);
    } catch (err) {
      console.error('Failed to send password reset email:', err);
      // Do not fail the request for email errors
    }

    return res.json({ ok: true, message: 'If an account exists, an OTP has been sent.' });
  } catch (err) {
    console.error('forgotPassword error:', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(200).json({ ok: true });
    const normalized = String(email).trim().toLowerCase();

    // Find latest reset
    let latest = await PasswordReset.findOne({ email: normalized, used: false }).sort({ createdAt: -1 });
    const now = new Date();

    if (!latest || (latest.expiresAt && latest.expiresAt < now)) {
      // Fallback to creating a new one (reuse forgotPassword logic)
      return forgotPassword(req, res);
    }

    // Enforce cooldown
    const secondsSince = (Date.now() - new Date(latest.createdAt).getTime()) / 1000;
    if (secondsSince < RESEND_COOLDOWN_SECONDS) {
      return res.json({ ok: true, message: 'OTP resent (cooldown enforced)' });
    }

    // Enforce resend per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const resendsInHour = await PasswordReset.countDocuments({ email: normalized, createdAt: { $gte: oneHourAgo } });
    if (resendsInHour >= MAX_RESEND_PER_HOUR) {
      return res.json({ ok: true });
    }

    // Generate new OTP and update the doc
    const otp = generateOtp();
    latest.otpHash = await bcrypt.hash(otp, 10);
    latest.expiresAt = new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000);
    latest.resendCount = (latest.resendCount || 0) + 1;
    latest.createdAt = new Date();
    await latest.save();

    // send email
    const platform = process.env.PLATFORM_NAME || 'AlumniConnect';
    const subject = `Your password reset code for ${platform}`;
    const text = `Use this 6-digit code to reset your password: ${otp}`;
    const html = `<div style="font-family: Arial; text-align:center;"><h2>${platform}</h2><div style="font-size:28px;">${otp}</div></div>`;
  try { const { sendPasswordResetEmail } = require('../utils/emailService'); await sendPasswordResetEmail(normalized, '', otp, RESET_TTL_MINUTES); } catch (e) { console.error('resend email failed', e); }

    return res.json({ ok: true });
  } catch (err) {
    console.error('resendOtp error:', err);
    return res.status(500).json({ ok: false });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ ok: false, message: 'Missing fields' });

    if (String(newPassword).length < 8) return res.status(400).json({ ok: false, message: 'Password must be at least 8 characters' });

    const normalized = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalized });
    // If no user, still behave generically
    if (!user) return res.status(400).json({ ok: false, message: 'Invalid code or expired' });

    let reset = await PasswordReset.findOne({ email: normalized, used: false }).sort({ createdAt: -1 });
    if (!reset) return res.status(400).json({ ok: false, message: 'Invalid code or expired' });

    if (reset.expiresAt && new Date() > reset.expiresAt) return res.status(400).json({ ok: false, message: 'Invalid code or expired' });

    const match = await bcrypt.compare(String(otp), reset.otpHash);
    if (!match) {
      reset.attempts = (reset.attempts || 0) + 1;
      if (reset.attempts >= MAX_VERIFY_ATTEMPTS) {
        reset.used = true;
      }
      await reset.save();
      return res.status(400).json({ ok: false, message: 'Invalid code or expired' });
    }

    // Valid OTP — reset password
    user.password = newPassword; // User.pre('save') will hash
    await user.save();

    reset.used = true;
    await reset.save();

    // Audit log (console and optionally DB)
    console.log('Password reset for user:', { userId: user._id, ip: req.ip, userAgent: req.headers['user-agent'] });

    // Send confirmation email
    const platform = process.env.PLATFORM_NAME || 'AlumniConnect';
    const subject = `Your password has been changed`;
    const text = `Hi ${user.name || ''},\n\nYour password was changed on ${new Date().toLocaleString()}. If you did not request this, contact support.`;
    const html = `<div style="font-family: Arial"><p>Your password was changed on ${new Date().toLocaleString()}.</p></div>`;
  try { await sendEmail(normalized, subject, text, html); } catch (e) { console.error('confirmation email failed', e); }

    return res.json({ ok: true, message: 'Password reset successful' });
  } catch (err) {
    console.error('verifyOtp error:', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
};

module.exports = {
  forgotPassword,
  resendOtp,
  verifyOtp
};
