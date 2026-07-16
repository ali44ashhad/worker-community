import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser } from '../features/authSlice';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Sparkles, LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import SignupWizard from '../components/SignupWizard';
import LoginPhoneForm from '../components/LoginPhoneForm';

const inputClass =
  'w-full px-4 py-3 border border-purple-100 rounded-xl bg-white text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/30 focus:border-[var(--purple-primary)] transition-all duration-300';

const Login = () => {
  const [mode, setMode] = useState(null);
  const [loginMethod, setLoginMethod] = useState('phone');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const passwordRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const navigateAfterLogin = (u) => {
    const userRole = u?.role;
    const accountStatus = u?.accountStatus || 'approved';

    if (userRole === 'admin') {
      navigate('/admin/dashboard');
    } else if (accountStatus === 'pending' || accountStatus === 'rejected') {
      navigate('/pending-approval');
    } else if (userRole === 'secretary') {
      navigate('/secretary/services');
    } else {
      // customer, provider, and other non-admin panel users
      navigate('/community/services');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await dispatch(
        loginUser({ email: formData.email, password: formData.password })
      ).unwrap();

      const success = Boolean(data?.success || data?.user);
      const message = data?.message || (success ? 'Login Successful!' : 'Something went wrong!');

      if (success) {
        toast.success(message);
        navigateAfterLogin(data?.user);
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error(error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLoginSuccess = (data) => {
    navigateAfterLogin(data?.user);
  };

  const handleSignupSuccess = (data) => {
    const accountStatus = data?.user?.accountStatus || 'approved';
    if (accountStatus === 'pending' || accountStatus === 'rejected') {
      navigate('/pending-approval');
    } else {
      navigate('/');
    }
  };

  const goBackToChoice = () => {
    setMode(null);
    setLoginMethod('phone');
    setShowPassword(false);
    setLoading(false);
  };

  const selectMode = (selected) => {
    setLoginMethod('phone');
    setMode(selected);
  };

  const switchToLogin = () => {
    setLoginMethod('phone');
    setMode('login');
  };

  return (
    <div className="home-page min-h-screen bg-[var(--background-subtle)] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/40 via-white to-fuchsia-50/30 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(217,70,239,0.06),transparent_45%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(107,70,193,0.06),transparent_45%)] pointer-events-none" />
      <div className="relative min-h-screen flex items-center justify-center px-4 py-28 sm:px-6">
        <motion.div
          className="flex w-full max-w-5xl items-stretch overflow-hidden rounded-3xl border border-purple-100/50 bg-white/80 shadow-xl shadow-purple-500/10 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative hidden md:flex md:w-1/2 self-stretch overflow-hidden">
            <motion.img
              className="h-full w-full object-cover object-center"
              src="login.png"
              alt="CommuN community"
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6 }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--purple-primary)]/80 via-[var(--purple-secondary)]/70 to-[var(--magenta)]/60" />
            <div className="absolute inset-0 flex flex-col justify-end p-10 text-white">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm mb-4">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Your neighbourhood, connected</span>
              </div>
              <h2 className="text-3xl font-bold leading-tight mb-2">Welcome to CommuN</h2>
              <p className="text-purple-100 text-sm leading-relaxed max-w-sm">
                Discover trusted local services, connect with providers in your colony, and
                strengthen your community.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col items-center justify-center p-8 md:w-1/2 md:p-12">
            {mode === null ? (
              <motion.div
                className="flex w-full max-w-md flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <div className="mb-8 w-full self-start text-center md:text-left">
                  <div className="mb-4 inline-block rounded-full bg-gradient-to-r from-purple-100 to-fuchsia-100 px-3 py-1.5">
                    <span className="text-xs font-semibold bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent">
                      Welcome to CommuN
                    </span>
                  </div>
                  <h2 className="mb-2 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                    Get started
                  </h2>
                  <p className="text-base text-[var(--text-secondary)]">
                    Choose how you would like to continue
                  </p>
                </div>

                <div className="flex w-full flex-col gap-4">
                  <motion.button
                    type="button"
                    onClick={() => selectMode('login')}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-purple-100 bg-white py-4 font-semibold text-[var(--text-primary)] shadow-sm transition-all hover:border-[var(--purple-primary)]/40 hover:shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogIn className="h-5 w-5 text-[var(--purple-primary)]" />
                    Login
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => selectMode('signup')}
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] py-4 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:opacity-90"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <UserPlus className="h-5 w-5" />
                    Sign Up
                  </motion.button>
                </div>
              </motion.div>
            ) : mode === 'signup' ? (
              <motion.div
                className="flex w-full max-w-md flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <SignupWizard
                  onBack={goBackToChoice}
                  onSuccess={handleSignupSuccess}
                  onSwitchToLogin={switchToLogin}
                />
              </motion.div>
            ) : (
              <motion.div
                className="flex w-full max-w-md flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <button
                  type="button"
                  onClick={goBackToChoice}
                  className="mb-4 flex w-full items-center gap-1.5 self-start text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--purple-primary)]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>

                <div className="mb-6 w-full self-start">
                  <div className="mb-4 inline-block rounded-full bg-gradient-to-r from-purple-100 to-fuchsia-100 px-3 py-1.5">
                    <span className="text-xs font-semibold bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent">
                      Welcome back
                    </span>
                  </div>
                  <h2 className="mb-2 self-start text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                    Sign in
                  </h2>
                  <p className="self-start text-base text-[var(--text-secondary)]">
                    {loginMethod === 'phone'
                      ? 'Enter your phone number to receive an OTP'
                      : 'Sign in with your email and password'}
                  </p>
                </div>

                {loginMethod === 'phone' ? (
                  <LoginPhoneForm
                    onLoginSuccess={handlePhoneLoginSuccess}
                    onSwitchToEmail={() => setLoginMethod('email')}
                  />
                ) : (
                  <motion.form
                    className="flex w-full flex-col items-center justify-center"
                    onSubmit={handleLoginSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="mb-4 w-full">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        className={inputClass}
                        required
                      />
                    </div>

                    <div className="relative mb-6 w-full">
                      <input
                        ref={passwordRef}
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        className={`${inputClass} pr-12`}
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] transition-colors hover:text-[var(--purple-primary)] focus:outline-none"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                      </button>
                    </div>

                    <div className="-mt-4 mb-6 flex w-full justify-end">
                      <button
                        type="button"
                        onClick={() => navigate('/forgot-password')}
                        className="text-sm font-semibold text-[var(--purple-primary)] transition-colors hover:text-[var(--magenta)]"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <motion.button
                      type="submit"
                      className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] py-3.5 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                      {loading ? 'Please wait...' : 'Sign In'}
                    </motion.button>

                    <button
                      type="button"
                      onClick={() => setLoginMethod('phone')}
                      className="mt-4 w-full text-center text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--purple-primary)]"
                    >
                      Login with phone
                    </button>
                  </motion.form>
                )}

                <p className="mt-6 text-sm text-[var(--text-secondary)]">
                  Don&apos;t have an account?{' '}
                  <motion.button
                    type="button"
                    className="cursor-pointer font-semibold text-[var(--purple-primary)] transition-colors hover:text-[var(--magenta)]"
                    onClick={() => setMode('signup')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Sign up
                  </motion.button>
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
