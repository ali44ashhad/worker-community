import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser, signupUser } from '../features/authSlice';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { getApiBase } from '../utils/apiBase';
import { formatCommunDisplayName } from '../utils/communName';

const inputClass =
  'w-full px-4 py-3 border border-purple-100 rounded-xl bg-white text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/30 focus:border-[var(--purple-primary)] transition-all duration-300';

const Login = () => {
  const [mode, setMode] = useState('login');
  const PHONE_DIGITS_MIN = 10;
  const PHONE_DIGITS_MAX = 10;
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    communityCommunName: '',
  });
  const [communities, setCommunities] = useState([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const passwordRef = useRef(null);

  useEffect(() => {
    if (mode !== 'signup') return;
    const base = getApiBase() || '';
    let cancelled = false;
    setCommunitiesLoading(true);
    (async () => {
      try {
        const res = await fetch(`${base}/api/user/signup-communities`);
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
          toast.error('Could not load Commun communities. Refresh and try again.');
        }
      } finally {
        if (!cancelled) setCommunitiesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phoneNumber') {
      const digitsOnly = String(value || '')
        .replace(/\D/g, '')
        .slice(0, PHONE_DIGITS_MAX);
      setFormData((prev) => ({ ...prev, phoneNumber: digitsOnly }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let data;

      if (mode === 'login') {
        data = await dispatch(
          loginUser({ email: formData.email, password: formData.password })
        ).unwrap();
      } else {
        const phoneDigits = String(formData.phoneNumber || '').replace(/\D/g, '');
        if (phoneDigits.length !== PHONE_DIGITS_MIN) {
          toast.error(`Enter a valid phone number (${PHONE_DIGITS_MIN} digits).`);
          setLoading(false);
          return;
        }
        if (!formData.communityCommunName) {
          toast.error('Please select your Commun community.');
          setLoading(false);
          return;
        }
        data = await dispatch(signupUser({ ...formData })).unwrap();
      }

      const success = Boolean(data?.success || data?.user);
      const message =
        data?.message ||
        (success
          ? mode === 'login'
            ? 'Login Successful!'
            : 'Signup Successful!'
          : 'Something went wrong!');

      if (success) {
        toast.success(message);

        const u = data?.user;
        const userRole = u?.role;
        const accountStatus = u?.accountStatus || 'approved';

        if (mode === 'login') {
          if (userRole === 'admin') {
            navigate('/admin/dashboard');
          } else if (userRole === 'secretary') {
            navigate('/secretary/dashboard');
          } else if (accountStatus === 'pending' || accountStatus === 'rejected') {
            navigate('/pending-approval');
          } else if (userRole === 'provider') {
            navigate('/provider/dashboard');
          } else {
            navigate('/');
          }
        } else {
          navigate('/pending-approval');
        }
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error(error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    if (mode === 'signup') {
      setFormData((prev) => ({ ...prev, communityCommunName: '' }));
    }
    setMode(mode === 'login' ? 'signup' : 'login');
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
          {/* Left panel */}
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
              <h2 className="text-3xl font-bold leading-tight mb-2">
                Welcome to CommuN
              </h2>
              <p className="text-purple-100 text-sm leading-relaxed max-w-sm">
                Discover trusted local services, connect with providers in your colony, and
                strengthen your community.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="flex w-full flex-col items-center justify-center p-8 md:w-1/2 md:p-12">
            <motion.form
              className="flex w-full max-w-md flex-col items-center justify-center"
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="mb-6 w-full self-start">
                <div className="mb-4 inline-block rounded-full bg-gradient-to-r from-purple-100 to-fuchsia-100 px-3 py-1.5">
                  <span className="text-xs font-semibold bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent">
                    {mode === 'login' ? 'Welcome back' : 'Join CommuN'}
                  </span>
                </div>
                <h2 className="mb-2 self-start text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                  {mode === 'login' ? 'Sign in' : 'Sign up'}
                </h2>
                <p className="self-start text-base text-[var(--text-secondary)]">
                  {mode === 'login'
                    ? 'Please sign in to continue to your account'
                    : 'Create your account to get started'}
                </p>
              </div>

              {mode === 'signup' && (
                <>
                  <div className="mb-4 grid w-full grid-cols-2 gap-3">
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

                  <div className="mb-4 w-full">
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="Phone Number"
                      inputMode="numeric"
                      pattern={`\\d{${PHONE_DIGITS_MIN}}`}
                      maxLength={PHONE_DIGITS_MAX}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div className="mb-4 w-full">
                    <label
                      htmlFor="communityCommunName"
                      className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]"
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
                      disabled={communitiesLoading || communities.length === 0}
                    >
                      <option value="">
                        {communitiesLoading
                          ? 'Loading communities…'
                          : communities.length === 0
                            ? 'No communities available'
                            : 'Select your Community'}
                      </option>
                      {communities.map((c) => (
                        <option key={c.communName} value={c.communName}>
                          {formatCommunDisplayName(c.communName)}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

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

              {mode === 'login' && (
                <div className="-mt-4 mb-6 flex w-full justify-end">
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-sm font-semibold text-[var(--purple-primary)] transition-colors hover:text-[var(--magenta)]"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <motion.button
                type="submit"
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] py-3.5 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={
                  loading || (mode === 'signup' && (communitiesLoading || communities.length === 0))
                }
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
              </motion.button>

              <p className="mt-6 text-sm text-[var(--text-secondary)]">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <motion.button
                  type="button"
                  className="cursor-pointer font-semibold text-[var(--purple-primary)] transition-colors hover:text-[var(--magenta)]"
                  onClick={switchMode}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </motion.button>
              </p>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
