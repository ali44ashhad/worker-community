import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { getApiBase } from '../utils/apiBase';

const inputClass =
  'w-full px-4 py-3 border border-purple-100 rounded-xl bg-white text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/30 focus:border-[var(--purple-primary)] transition-all duration-300';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const API_URL = useMemo(() => getApiBase() || 'http://localhost:3001', []);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error('Password should be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/user/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const rawText = await res.text();
      const data = rawText
        ? (() => {
            try {
              return JSON.parse(rawText);
            } catch {
              return null;
            }
          })()
        : null;
      if (!res.ok) {
        throw new Error(data?.message || `Failed (${res.status}).`);
      }
      toast.success(data?.message || 'Password reset successfully. Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err?.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page min-h-screen bg-[var(--background-subtle)] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/40 via-white to-fuchsia-50/30 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(217,70,239,0.06),transparent_45%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(107,70,193,0.06),transparent_45%)] pointer-events-none" />

      <div className="relative min-h-screen flex items-center justify-center px-4 py-28 sm:px-6">
        <motion.div
          className="w-full max-w-md rounded-3xl border border-purple-100/50 bg-white/80 p-8 shadow-xl shadow-purple-500/10 backdrop-blur-sm sm:p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
            <LockKeyhole className="h-6 w-6" />
          </div>

          <div className="mb-6 inline-block rounded-full bg-gradient-to-r from-purple-100 to-fuchsia-100 px-3 py-1.5">
            <span className="text-xs font-semibold bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent">
              Set new password
            </span>
          </div>

          <h2 className="mb-2 text-3xl font-bold text-[var(--text-primary)]">Reset password</h2>
          <p className="mb-8 text-sm text-[var(--text-secondary)] leading-relaxed">
            Choose a strong new password for your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className={`${inputClass} pr-12`}
                required
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] transition-colors hover:text-[var(--purple-primary)] focus:outline-none"
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                {show ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

            <input
              type={show ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className={inputClass}
              required
            />

            <motion.button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] py-3.5 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? 'Please wait...' : 'Update password'}
            </motion.button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-100 py-3 font-semibold text-[var(--text-primary)] transition-all hover:bg-purple-50"
            >
              <ArrowLeft className="h-4 w-4 text-[var(--purple-primary)]" />
              Back to login
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
