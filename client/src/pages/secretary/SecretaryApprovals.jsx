import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { ClipboardCheck, MapPin, UserCheck, UserX } from 'lucide-react';
import {
  fetchPendingRegistrations,
  approveUserRegistration,
  rejectUserRegistration,
} from '../../features/secretarySlice';
import {
  formatAddress,
  getFullName,
  getUserFlatNumber,
  getUserStreetAddressLine1,
} from '../../utils/userHelpers';
import { formatCommunDisplayName } from '../../utils/communName';

const btnApprove =
  'inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90';
const btnReject =
  'inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100';

const SecretaryApprovals = () => {
  const dispatch = useDispatch();
  const { pendingUsers, loading } = useSelector((state) => state.secretary);

  useEffect(() => {
    dispatch(fetchPendingRegistrations());
  }, [dispatch]);

  return (
    <motion.div
      className="min-h-screen bg-[var(--background-subtle)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <section className="border-b border-purple-100/60 bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20 py-6 sm:py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--purple-primary)]">
            Secretary
          </p>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
            Approve / reject
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Review new registrations and provider applications for your Commun community.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm shadow-purple-500/5 backdrop-blur-sm sm:p-6"
        >
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
              <ClipboardCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">
                Pending accounts
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                Customers and providers awaiting approval.
              </p>
            </div>
          </div>

          {loading && pendingUsers.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-purple-100 border-t-[var(--purple-primary)]" />
              <p className="text-sm text-[var(--text-secondary)]">Loading pending registrations…</p>
            </div>
          ) : pendingUsers.length === 0 ? (
            <p className="rounded-xl border border-dashed border-purple-100 bg-purple-50/30 py-12 text-center text-sm text-[var(--text-secondary)]">
              No pending registrations right now.
            </p>
          ) : (
            <ul className="divide-y divide-purple-100/60">
              {pendingUsers.map((u, index) => {
                const flat = getUserFlatNumber(u);
                const address = formatAddress(u);
                const joined = u.createdAt
                  ? new Date(u.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : '—';
                return (
                <motion.li
                  key={u._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--text-primary)]">{getFullName(u)}</p>
                    <div className="mt-2 grid gap-x-6 gap-y-1.5 text-xs sm:grid-cols-2">
                      <p className="text-[var(--text-secondary)]">
                        <span className="font-medium text-[var(--text-primary)]">Email:</span> {u.email || '—'}
                      </p>
                      <p className="text-[var(--text-secondary)]">
                        <span className="font-medium text-[var(--text-primary)]">Phone:</span> {u.phoneNumber || '—'}
                      </p>
                      <p className="text-[var(--text-secondary)]">
                        <span className="font-medium text-[var(--text-primary)]">Community:</span>{' '}
                        {u.requestedCommunityName && !u.communityCommunName
                          ? `${u.requestedCommunityName} (requested)`
                          : formatCommunDisplayName(u.communName || u.communityCommunName) || '—'}
                      </p>
                      <p className="text-[var(--text-secondary)]">
                        <span className="font-medium text-[var(--text-primary)]">Registered:</span> {joined}
                      </p>
                      <p className="text-[var(--text-secondary)] sm:col-span-2">
                        <span className="font-medium text-[var(--text-primary)]">Role:</span>{' '}
                        <span className="capitalize">{u.role || '—'}</span>
                        {u.role === 'provider' ? ' · provider application' : ' · new signup'}
                      </p>
                    </div>
                    <div className="mt-3 rounded-xl border border-purple-100/70 bg-purple-50/30 p-3">
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
                        <MapPin className="h-3.5 w-3.5 text-[var(--purple-primary)]" />
                        Full address
                      </p>
                      <div className="grid gap-x-6 gap-y-1.5 text-xs sm:grid-cols-2">
                        <p className="text-[var(--text-secondary)]">
                          <span className="font-medium text-[var(--text-primary)]">Flat / house:</span> {flat || '—'}
                        </p>
                        <p className="text-[var(--text-secondary)]">
                          <span className="font-medium text-[var(--text-primary)]">Street line 1:</span>{' '}
                          {getUserStreetAddressLine1(u) || '—'}
                        </p>
                        <p className="text-[var(--text-secondary)]">
                          <span className="font-medium text-[var(--text-primary)]">Street line 2:</span>{' '}
                          {u.addressLine2 || '—'}
                        </p>
                        <p className="text-[var(--text-secondary)]">
                          <span className="font-medium text-[var(--text-primary)]">City:</span> {u.city || '—'}
                        </p>
                        <p className="text-[var(--text-secondary)]">
                          <span className="font-medium text-[var(--text-primary)]">State:</span> {u.state || '—'}
                        </p>
                        <p className="text-[var(--text-secondary)]">
                          <span className="font-medium text-[var(--text-primary)]">Postal code:</span> {u.zip || '—'}
                        </p>
                      </div>
                      {address ? (
                        <p className="mt-2 border-t border-purple-100/70 pt-2 text-xs text-[var(--text-secondary)]">
                          <span className="font-medium text-[var(--text-primary)]">Formatted:</span> {address}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => dispatch(approveUserRegistration(u._id))}
                      className={btnApprove}
                    >
                      <UserCheck className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch(rejectUserRegistration(u._id))}
                      className={btnReject}
                    >
                      <UserX className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                </motion.li>
                );
              })}
            </ul>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SecretaryApprovals;
