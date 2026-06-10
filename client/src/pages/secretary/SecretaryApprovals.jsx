import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPendingRegistrations,
  approveUserRegistration,
  rejectUserRegistration,
} from '../../features/secretarySlice';
import { getFullName } from '../../utils/userHelpers';

const SecretaryApprovals = () => {
  const dispatch = useDispatch();
  const { pendingUsers, loading } = useSelector((state) => state.secretary);

  useEffect(() => {
    dispatch(fetchPendingRegistrations());
  }, [dispatch]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Secretary</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">Approve / reject</h1>
        <p className="mt-2 text-sm text-gray-600 sm:text-base">
          Review new registrations and provider applications for your Commun community.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-bold text-gray-900">Pending accounts</h2>
        <p className="mt-1 text-sm text-gray-500">Customers and providers awaiting approval.</p>

        {loading && pendingUsers.length === 0 ? (
          <p className="mt-8 text-center text-sm text-gray-500">Loading…</p>
        ) : pendingUsers.length === 0 ? (
          <p className="mt-8 rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-sm text-gray-600">
            No pending registrations right now.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-gray-100">
            {pendingUsers.map((u) => (
              <li key={u._id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{getFullName(u)}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                  {(u.communName || u.communityCommunName) && (
                    <p className="text-xs font-medium text-indigo-600">@{u.communName || u.communityCommunName}</p>
                  )}
                  <p className="mt-1 text-xs capitalize text-gray-600">
                    Role: {u.role}
                    {u.role === 'provider' ? ' · provider application' : ' · new signup'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => dispatch(approveUserRegistration(u._id))}
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch(rejectUserRegistration(u._id))}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
};

export default SecretaryApprovals;
