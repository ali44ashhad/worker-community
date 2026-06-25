import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { loginWithPhoneOtp } from '../features/authSlice';
import { getApiBase } from '../utils/apiBase';

const inputClass =
  'w-full px-4 py-3 border border-purple-100 rounded-xl bg-white text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/30 focus:border-[var(--purple-primary)] transition-all duration-300';

const btnPrimary =
  'flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] py-3.5 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60';

const btnSecondary =
  'flex items-center justify-center rounded-xl border border-purple-100 bg-white px-4 py-3 font-semibold text-[var(--text-primary)] transition-all hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-60';

const LoginPhoneForm = ({ onLoginSuccess, onSwitchToEmail }) => {
  const dispatch = useDispatch();
  const PHONE_DIGITS = 10;
  const RESEND_COOLDOWN = 30;
  const apiBase = getApiBase() || '';

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;
    const timer = setInterval(() => {
      setResendSeconds((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendSeconds]);

  const handlePhoneChange = (e) => {
    const digitsOnly = String(e.target.value || '')
      .replace(/\D/g, '')
      .slice(0, PHONE_DIGITS);
    setPhoneNumber(digitsOnly);
    if (otpSent) {
      setOtpSent(false);
      setOtpCode('');
    }
  };

  const sendOtp = async () => {
    if (phoneNumber.length !== PHONE_DIGITS) {
      toast.error(`Enter a valid ${PHONE_DIGITS}-digit phone number.`);
      return;
    }
    setOtpSending(true);
    try {
      const res = await fetch(`${apiBase}/api/user/login/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Could not send OTP.');
      setOtpSent(true);
      setResendSeconds(RESEND_COOLDOWN);
      toast.success(data?.message || 'OTP sent to your phone.');
    } catch (err) {
      toast.error(err?.message || 'Could not send OTP.');
    } finally {
      setOtpSending(false);
    }
  };

  const verifyAndLogin = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      toast.error('Enter the OTP sent to your phone.');
      return;
    }
    setOtpVerifying(true);
    try {
      const data = await dispatch(
        loginWithPhoneOtp({ phoneNumber, code: otpCode })
      ).unwrap();
      const success = Boolean(data?.success || data?.user);
      if (success) {
        toast.success(data?.message || 'Login successful!');
        onLoginSuccess?.(data);
      } else {
        toast.error(data?.message || 'Login failed.');
      }
    } catch (err) {
      toast.error(err || 'Could not verify OTP.');
    } finally {
      setOtpVerifying(false);
    }
  };

  return (
    <form onSubmit={verifyAndLogin} className="w-full space-y-4">
      <input
        type="tel"
        name="phoneNumber"
        value={phoneNumber}
        onChange={handlePhoneChange}
        placeholder="Phone Number (10 digits)"
        inputMode="numeric"
        maxLength={PHONE_DIGITS}
        className={inputClass}
        required
      />

      {!otpSent ? (
        <motion.button
          type="button"
          onClick={sendOtp}
          disabled={otpSending || phoneNumber.length !== PHONE_DIGITS}
          className={btnPrimary}
          whileHover={{ scale: otpSending ? 1 : 1.02 }}
          whileTap={{ scale: otpSending ? 1 : 0.98 }}
        >
          {otpSending ? 'Sending…' : 'Send OTP'}
        </motion.button>
      ) : (
        <>
          <input
            type="text"
            name="otpCode"
            value={otpCode}
            onChange={(e) =>
              setOtpCode(String(e.target.value || '').replace(/\D/g, '').slice(0, 6))
            }
            placeholder="Enter OTP"
            inputMode="numeric"
            maxLength={6}
            className={inputClass}
            required
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={otpVerifying || !otpCode}
              className={`${btnPrimary} flex-1`}
            >
              {otpVerifying ? 'Verifying…' : 'Verify & Sign In'}
            </button>
            <button
              type="button"
              onClick={sendOtp}
              disabled={otpSending || resendSeconds > 0}
              className={`${btnSecondary} shrink-0 text-sm`}
            >
              {resendSeconds > 0 ? `${resendSeconds}s` : 'Resend'}
            </button>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={onSwitchToEmail}
        className="w-full pt-1 text-center text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--purple-primary)]"
      >
        Login with email
      </button>
    </form>
  );
};

export default LoginPhoneForm;
