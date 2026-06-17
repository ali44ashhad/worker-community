import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Clock, XCircle, LogOut, Home } from 'lucide-react';
import { logoutUser } from '../features/authSlice';
import { formatCommunDisplayName } from '../utils/communName';

const PendingApproval = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = user?.accountStatus || 'approved';
  const isProviderPending = user?.role === 'provider' && status === 'pending';
  const isRejected = status === 'rejected';

  useEffect(() => {
    if (user && status === 'approved') {
      navigate('/', { replace: true });
    }
  }, [user, status, navigate]);

  if (!user) {
    return (
      <div className="home-page flex min-h-screen items-center justify-center bg-[var(--background-subtle)] px-4">
        <div className="w-full max-w-sm rounded-2xl border border-purple-100/50 bg-white/80 p-8 text-center shadow-lg shadow-purple-500/5">
          <p className="text-sm text-[var(--text-secondary)]">Please sign in to continue.</p>
          <Link
            to="/login"
            className="mt-4 inline-block text-sm font-semibold text-[var(--purple-primary)] hover:text-[var(--magenta)] transition-colors"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'approved') {
    return null;
  }

  return (
    <div className="home-page relative min-h-screen overflow-hidden bg-[var(--background-subtle)]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-50/40 via-white to-fuchsia-50/30" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(217,70,239,0.06),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(107,70,193,0.06),transparent_45%)]" />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-28">
        <motion.div
          className="mx-auto w-full max-w-md rounded-3xl border border-purple-100/50 bg-white/80 p-8 text-center shadow-xl shadow-purple-500/10 backdrop-blur-sm sm:p-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div
            className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${
              isRejected
                ? 'bg-red-50 text-red-500'
                : 'bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]'
            }`}
          >
            {isRejected ? <XCircle className="h-7 w-7" /> : <Clock className="h-7 w-7" />}
          </div>

          <div className="mb-4 inline-block rounded-full bg-gradient-to-r from-purple-100 to-fuchsia-100 px-3 py-1.5">
            <span className="text-xs font-semibold bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent">
              {isRejected ? 'Not approved' : 'Under review'}
            </span>
          </div>

          <h1 className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
            {isRejected ? 'Registration not approved' : 'Waiting for approval'}
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
            {isRejected
              ? 'Your account was not approved. If you think this is a mistake, please contact support.'
              : isProviderPending
                ? 'Your provider application has been submitted. A secretary will review your profile and services. You will be able to use the provider dashboard once approved.'
                : 'Your Commun account is pending review by a secretary. You will get access after approval.'}
          </p>

          {user.communName || user.communityCommunName ? (
            <p className="mt-5 rounded-xl border border-purple-100 bg-purple-50/50 px-4 py-3 text-sm text-[var(--text-secondary)]">
              Community:{' '}
              <span className="font-semibold text-[var(--purple-primary)]">
                {formatCommunDisplayName(user.communName || user.communityCommunName)}
              </span>
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={async () => {
                await dispatch(logoutUser());
                navigate('/login', { replace: true });
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-100 px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-purple-50"
            >
              <LogOut className="h-4 w-4 text-[var(--purple-primary)]" />
              Log out
            </button>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90"
            >
              <Home className="h-4 w-4" />
              Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PendingApproval;
