import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { logoutUser } from '../features/authSlice';

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
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-gray-600">Please sign in to continue.</p>
        <Link to="/login" className="mt-4 inline-block font-semibold text-indigo-600">
          Go to login
        </Link>
      </div>
    );
  }

  if (status === 'approved') {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 px-4 py-16">
      <motion.div
        className="mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
            isRejected ? 'bg-red-100' : 'bg-amber-100'
          }`}
        >
          {isRejected ? '✕' : '⏳'}
        </div>
        <h1 className="text-xl font-bold text-gray-900">
          {isRejected ? 'Registration not approved' : 'Waiting for approval'}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          {isRejected
            ? 'Your account was not approved. If you think this is a mistake, please contact support.'
            : isProviderPending
              ? 'Your provider application has been submitted. A secretary will review your profile and services. You will be able to use the provider dashboard once approved.'
              : 'Your Commun account is pending review by a secretary. You will get access after approval.'}
        </p>
        {user.communName || user.communityCommunName ? (
          <p className="mt-4 text-sm font-medium text-gray-800">
            Commun:{' '}
            <span className="text-indigo-600">{user.communName || user.communityCommunName}</span>
          </p>
        ) : null}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={async () => {
              await dispatch(logoutUser());
              navigate('/login', { replace: true });
            }}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            Log out
          </button>
          <Link
            to="/"
            className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PendingApproval;
