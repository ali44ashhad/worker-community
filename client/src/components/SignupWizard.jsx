import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { signupUser } from '../features/authSlice';
import { getApiBase } from '../utils/apiBase';
import { formatCommunDisplayName } from '../utils/communName';

const inputClass =
  'w-full px-4 py-3 border border-purple-100 rounded-xl bg-white text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/30 focus:border-[var(--purple-primary)] transition-all duration-300';

const btnPrimary =
  'flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60';

const btnSecondary =
  'flex items-center justify-center gap-2 rounded-xl border border-purple-100 bg-white px-5 py-3.5 text-sm font-semibold text-[var(--text-primary)] transition-all hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-60';

const btnAction =
  'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-purple-500/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';

const STEP_LABELS = ['Name', 'Account', 'Phone', 'Community', 'Flat'];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

const SignupWizard = ({ onBack, onSuccess, onSwitchToLogin }) => {
  const dispatch = useDispatch();
  const PHONE_DIGITS = 10;
  const RESEND_COOLDOWN = 30;

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    communityCommunName: '',
    otherCommunityName: '',
    flatNumber: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [communities, setCommunities] = useState([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneVerificationToken, setPhoneVerificationToken] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  const apiBase = getApiBase() || '';

  useEffect(() => {
    let cancelled = false;
    setCommunitiesLoading(true);
    (async () => {
      try {
        const res = await fetch(`${apiBase}/api/user/signup-communities`);
        const json = await res.json();
        if (cancelled) return;
        if (json?.success && Array.isArray(json.data?.communities)) {
          setCommunities(json.data.communities);
        } else {
          setCommunities([]);
        }
      } catch {
        if (!cancelled) {
          setCommunities([]);
          toast.error('Could not load communities. Refresh and try again.');
        }
      } finally {
        if (!cancelled) setCommunitiesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;
    const timer = setInterval(() => {
      setResendSeconds((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendSeconds]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      const digitsOnly = String(value || '')
        .replace(/\D/g, '')
        .slice(0, PHONE_DIGITS);
      setFormData((prev) => ({ ...prev, phoneNumber: digitsOnly }));
      if (phoneVerified) {
        setPhoneVerified(false);
        setPhoneVerificationToken('');
        setOtpSent(false);
        setOtpCode('');
      }
      return;
    }
    if (name === 'otpCode') {
      setOtpCode(String(value || '').replace(/\D/g, '').slice(0, 6));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const goToStep = (nextStep, dir = 1) => {
    setDirection(dir);
    setStep(nextStep);
  };

  const validateStep1 = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('Please enter your first and last name.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const email = formData.email.trim();
    if (!email) {
      toast.error('Email is required.');
      return false;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (formData.phoneNumber.length !== PHONE_DIGITS) {
      toast.error(`Enter a valid ${PHONE_DIGITS}-digit phone number.`);
      return false;
    }
    if (!phoneVerified) {
      toast.error('Please verify your phone number with OTP.');
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (formData.communityCommunName === '__other__') {
      if (!formData.otherCommunityName.trim()) {
        toast.error('Please enter your community name.');
        return false;
      }
      return true;
    }
    if (!formData.communityCommunName) {
      toast.error('Please select your community.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) goToStep(2, 1);
    else if (step === 2 && validateStep2()) goToStep(3, 1);
    else if (step === 3 && validateStep3()) goToStep(4, 1);
    else if (step === 4 && validateStep4()) goToStep(5, 1);
  };

  const handlePrev = () => {
    if (step === 1) onBack();
    else goToStep(step - 1, -1);
  };

  const sendOtp = async () => {
    if (formData.phoneNumber.length !== PHONE_DIGITS) {
      toast.error(`Enter a valid ${PHONE_DIGITS}-digit phone number.`);
      return;
    }
    setOtpSending(true);
    try {
      const res = await fetch(`${apiBase}/api/user/signup/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formData.phoneNumber }),
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

  const verifyOtp = async () => {
    if (!otpCode || otpCode.length < 4) {
      toast.error('Enter the OTP sent to your phone.');
      return;
    }
    setOtpVerifying(true);
    try {
      const res = await fetch(`${apiBase}/api/user/signup/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formData.phoneNumber, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Invalid OTP.');
      setPhoneVerified(true);
      setPhoneVerificationToken(data?.data?.phoneVerificationToken || '');
      toast.success(data?.message || 'Phone verified!');
    } catch (err) {
      toast.error(err?.message || 'Could not verify OTP.');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step !== 5) return;
    if (!formData.flatNumber.trim()) {
      toast.error('Please enter your flat number.');
      return;
    }
    if (!phoneVerificationToken) {
      toast.error('Please verify your phone number again.');
      goToStep(3, -1);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        phoneVerificationToken,
        flatNumber: formData.flatNumber.trim(),
        communityCommunName: formData.communityCommunName,
        otherCommunityName:
          formData.communityCommunName === '__other__'
            ? formData.otherCommunityName.trim()
            : '',
      };

      const data = await dispatch(signupUser(payload)).unwrap();
      const success = Boolean(data?.success || data?.user);
      if (success) {
        toast.success(data?.message || 'Signup successful!');
        onSuccess?.(data);
      } else {
        toast.error(data?.message || 'Signup failed.');
      }
    } catch (error) {
      toast.error(error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isOtherCommunity = formData.communityCommunName === '__other__';

  return (
    <div className="flex w-full max-w-md flex-col">
      <button
        type="button"
        onClick={handlePrev}
        className="mb-4 flex w-full items-center gap-1.5 self-start text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--purple-primary)]"
      >
        <ArrowLeft className="h-4 w-4" />
        {step === 1 ? 'Back' : 'Previous'}
      </button>

      <div className="mb-6 w-full self-start">
        <div className="mb-4 inline-block rounded-full bg-gradient-to-r from-purple-100 to-fuchsia-100 px-3 py-1.5">
          <span className="text-xs font-semibold bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent">
            Join CommuN · Step {step} of 5
          </span>
        </div>
        <h2 className="mb-2 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
          {step === 1 && 'Your name'}
          {step === 2 && 'Account details'}
          {step === 3 && 'Verify phone'}
          {step === 4 && 'Your community'}
          {step === 5 && 'Flat number'}
        </h2>
        <p className="text-base text-[var(--text-secondary)]">
          {step === 1 && 'Tell us who you are'}
          {step === 2 && 'Set up your login credentials'}
          {step === 3 && 'We will send an OTP via SMS'}
          {step === 4 && 'Select your colony or enter another'}
          {step === 5 && 'Enter your flat / house number'}
        </p>
      </div>

      <div className="mb-6 flex w-full gap-1.5">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`h-1.5 w-full rounded-full transition-colors ${
                i + 1 <= step ? 'bg-[var(--purple-primary)]' : 'bg-purple-100'
              }`}
            />
            <span className="hidden text-[10px] font-medium text-[var(--text-secondary)] sm:block">
              {label}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={step === 5 ? handleSubmit : (e) => e.preventDefault()} className="w-full">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  className={inputClass}
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className={inputClass}
                  required
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className={inputClass}
                autoComplete="email"
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className={`${inputClass} pr-12`}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--purple-primary)]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className={`${inputClass} pr-12`}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--purple-primary)]"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Phone Number (10 digits)"
                inputMode="numeric"
                maxLength={PHONE_DIGITS}
                className={inputClass}
                disabled={phoneVerified}
                required
              />

              {!phoneVerified && (
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={otpSending || formData.phoneNumber.length !== PHONE_DIGITS}
                  className={btnAction}
                >
                  {otpSending ? 'Sending…' : otpSent ? 'Resend OTP' : 'Send OTP'}
                </button>
              )}

              {otpSent && !phoneVerified && (
                <>
                  <input
                    type="text"
                    name="otpCode"
                    value={otpCode}
                    onChange={handleChange}
                    placeholder="Enter OTP"
                    inputMode="numeric"
                    maxLength={6}
                    className={inputClass}
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={verifyOtp}
                      disabled={otpVerifying || !otpCode}
                      className={btnAction}
                    >
                      {otpVerifying ? 'Verifying…' : 'Verify OTP'}
                    </button>
                    <button
                      type="button"
                      onClick={sendOtp}
                      disabled={otpSending || resendSeconds > 0}
                      className={`${btnSecondary} flex-1 shrink-0 whitespace-nowrap`}
                    >
                      {resendSeconds > 0 ? `Resend (${resendSeconds}s)` : 'Resend'}
                    </button>
                  </div>
                </>
              )}

              {phoneVerified && (
                <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  Phone number verified successfully.
                </p>
              )}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <label
                htmlFor="communityCommunName"
                className="block text-xs font-semibold text-[var(--text-primary)]"
              >
                Community<span className="text-red-500">*</span>
              </label>
              <select
                id="communityCommunName"
                name="communityCommunName"
                value={formData.communityCommunName}
                onChange={handleChange}
                className={inputClass}
                required
                disabled={communitiesLoading}
              >
                <option value="">
                  {communitiesLoading ? 'Loading communities…' : 'Select your community'}
                </option>
                {communities.map((c) => (
                  <option key={c.communName} value={c.communName}>
                    {formatCommunDisplayName(c.communName)}
                  </option>
                ))}
                <option value="__other__">Other</option>
              </select>

              {isOtherCommunity && (
                <input
                  type="text"
                  name="otherCommunityName"
                  value={formData.otherCommunityName}
                  onChange={handleChange}
                  placeholder="Enter your community name"
                  className={inputClass}
                  required
                />
              )}
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <input
                type="text"
                name="flatNumber"
                value={formData.flatNumber}
                onChange={handleChange}
                placeholder="Flat / House Number"
                className={inputClass}
                required
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 flex gap-3">
          {step < 5 ? (
            <button
              key="wizard-next"
              type="button"
              onClick={handleNext}
              className={`${btnPrimary} w-full`}
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              key="wizard-submit"
              type="submit"
              disabled={loading}
              className={`${btnPrimary} w-full`}
            >
              {loading ? 'Please wait…' : 'Sign Up'}
            </button>
          )}
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-[var(--purple-primary)] hover:text-[var(--magenta)]"
        >
          Sign in
        </button>
      </p>
    </div>
  );
};

export default SignupWizard;
