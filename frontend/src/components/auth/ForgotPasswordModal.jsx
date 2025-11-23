import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert
} from '@mui/material';
import axios from '../../utils/axiosConfig';

const ForgotPasswordModal = ({ open, onClose }) => {
  const [step, setStep] = useState(1); // 1=send OTP, 2=verify
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [expiryAt, setExpiryAt] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (expiryAt) {
      timer = setInterval(() => {
        const diff = new Date(expiryAt).getTime() - Date.now();
        if (diff <= 0) {
          setExpiryAt(null);
          clearInterval(timer);
          return;
        }
        // force update
        setExpiryAt(expiryAt);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [expiryAt]);

  useEffect(() => {
    let cd;
    if (resendCooldown > 0) {
      cd = setInterval(() => {
        setResendCooldown((s) => {
          if (s <= 1) { clearInterval(cd); return 0; }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(cd);
  }, [resendCooldown]);

  const validateEmail = (e) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(e).toLowerCase());
  };

  const handleSendOtp = async () => {
    setError('');
    setMessage('');
    if (!validateEmail(email)) { setError('Please enter a valid email'); return; }
    setLoading(true);
    try {
      const res = await axios.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setMessage('If an account exists, an OTP has been sent.');
      setStep(2);
      // set expiry to 10 minutes from now
      setExpiryAt(new Date(Date.now() + 10 * 60 * 1000));
      setResendCooldown(60);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true); setError('');
    try {
      await axios.post('/auth/resend-otp', { email: email.trim().toLowerCase() });
      setMessage('OTP resent if account exists.');
      setExpiryAt(new Date(Date.now() + 10 * 60 * 1000));
      setResendCooldown(60);
    } catch (err) {
      console.error(err);
      setError('Failed to resend OTP');
    } finally { setLoading(false); }
  };

  const handleVerify = async () => {
    setError('');
    if (!otp || otp.trim().length !== 6) { setError('Enter the 6-digit OTP'); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await axios.post('/auth/verify-otp', { email: email.trim().toLowerCase(), otp: otp.trim(), newPassword });
      if (res.data?.ok) {
        setMessage('Password reset successful. Redirecting to login...');
        setTimeout(() => {
          onClose();
          window.location.href = '/login';
        }, 1500);
      } else {
        setError(res.data?.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to verify OTP');
    } finally { setLoading(false); }
  };

  const handleClose = () => {
    setStep(1); setEmail(''); setOtp(''); setNewPassword(''); setConfirmPassword(''); setError(''); setMessage(''); setExpiryAt(null); setResendCooldown(0);
    onClose();
  };

  const formatExpiry = () => {
    if (!expiryAt) return '';
    const diff = Math.max(0, new Date(expiryAt).getTime() - Date.now());
    const minutes = Math.floor(diff / 60000); const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="forgot-password-title">
      <DialogTitle id="forgot-password-title">Forgot Password</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

        {step === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              fullWidth
            />
            <Typography variant="caption">We'll email a 6-digit OTP to your registered address. OTP expires in 10 minutes.</Typography>
          </Box>
        )}

        {step === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
            <TextField
              label="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0,6))}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              required
              fullWidth
            />

            <TextField
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption">OTP expires in: {formatExpiry()}</Typography>
              <Typography variant="caption">{resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : ''}</Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {step === 1 ? (
          <>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSendOtp} disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</Button>
          </>
        ) : (
          <>
            <Button onClick={() => { setStep(1); setOtp(''); }}>Back</Button>
            <Button onClick={handleResend} disabled={resendCooldown > 0 || loading}>Resend OTP</Button>
            <Button onClick={handleVerify} disabled={loading}>{loading ? 'Verifying...' : 'Verify & Reset Password'}</Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ForgotPasswordModal;
