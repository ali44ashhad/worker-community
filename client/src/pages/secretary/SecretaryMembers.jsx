import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Phone, Search, User, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCommunityMemberById, fetchCommunityMembers, updateCommunityMemberStatus } from '../../features/secretarySlice';
import { formatAddress, getFullName } from '../../utils/userHelpers';
import { formatCommunDisplayName } from '../../utils/communName';

const PAGE_SIZE = 10;

const SecretaryMembers = () => {
  const dispatch = useDispatch();
  const { members, membersLoading, membersError, membersMeta, membersPagination, memberProfile, memberProfileLoading } = useSelector(
    (state) => state.secretary
  );
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    dispatch(fetchCommunityMembers({ page: currentPage, limit: PAGE_SIZE, search: searchTerm }));
  }, [dispatch, currentPage, searchTerm]);

  useEffect(() => {
    if (
      membersPagination &&
      membersPagination.totalPages > 0 &&
      currentPage > membersPagination.totalPages
    ) {
      setCurrentPage(1);
    }
  }, [membersPagination, currentPage]);

  const pagination = membersPagination;
  const totalMembers = pagination?.totalMembers ?? members.length;
  const selectedMember = memberProfile && memberProfile?._id === selectedMemberId ? memberProfile : null;
  const selectedJoined = useMemo(() => {
    if (!selectedMember?.createdAt) return '—';
    return new Date(selectedMember.createdAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, [selectedMember?.createdAt]);

  const openProfile = (userId) => {
    setSelectedMemberId(userId);
    setIsProfileOpen(true);
    dispatch(fetchCommunityMemberById(userId));
  };

  const closeProfile = () => {
    setIsProfileOpen(false);
    setSelectedMemberId(null);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Secretary</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">Member list</h1>
        <p className="mt-2 text-sm text-gray-600 sm:text-base">
          People who signed up under your Commun community
          {membersMeta.communityCommunName ? (
            <span className="font-medium text-indigo-600">
              {' '}
              ({formatCommunDisplayName(membersMeta.communityCommunName)})
            </span>
          ) : null}
          {totalMembers > 0 ? (
            <span className="text-gray-500">
              {' '}
              · {totalMembers} member{totalMembers !== 1 ? 's' : ''} total
            </span>
          ) : null}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        {membersMeta.needsCommunName && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This secretary account has no Commun handle. Ask an admin to set your Commun name in Admin → Secretary
            management so members can be matched to you.
          </p>
        )}

        {!membersMeta.needsCommunName && (
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        )}

        {membersError && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{membersError}</p>
        )}

        {membersLoading && members.length === 0 && !membersError ? (
          <p className="mt-8 text-center text-sm text-gray-500">Loading…</p>
        ) : !membersMeta.needsCommunName && members.length === 0 ? (
          <p className="mt-8 rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-sm text-gray-600">
            {searchTerm
              ? 'No members match your search.'
              : 'No members in your community yet. They appear here after they choose your Commun on signup.'}
          </p>
        ) : members.length > 0 ? (
          <>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Phone</th>
                    <th className="pb-3 pr-4">Role</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Provider @</th>
                    <th className="pb-3 pr-4">Joined</th>
                    <th className="pb-3 text-right">Change status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {members.map((u) => {
                    const status = u.accountStatus || 'approved';
                    const joined = u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—';
                    return (
                      <tr key={u._id} className="text-gray-800">
                        <td className="py-3 pr-4 font-medium text-gray-900">
                          <button
                            type="button"
                            onClick={() => openProfile(u._id)}
                            className="max-w-[16rem] truncate text-left font-medium text-indigo-700 hover:text-indigo-900 hover:underline"
                            title="View full profile"
                          >
                            {getFullName(u)}
                          </button>
                        </td>
                        <td className="py-3 pr-4 text-gray-600">{u.email || '—'}</td>
                        <td className="py-3 pr-4 text-gray-600">{u.phoneNumber || '—'}</td>
                        <td className="py-3 pr-4 capitalize">{u.role || '—'}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              status === 'approved'
                                ? 'bg-green-50 text-green-800'
                                : status === 'pending'
                                  ? 'bg-amber-50 text-amber-800'
                                  : 'bg-red-50 text-red-800'
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-indigo-600">
                          {u.role === 'provider' && u.communName
                            ? formatCommunDisplayName(u.communName)
                            : '—'}
                        </td>
                        <td className="py-3 pr-4 text-gray-500">{joined}</td>
                        <td className="py-3 text-right">
                          <select
                            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            value={status}
                            onChange={(e) => {
                              const next = e.target.value;
                              dispatch(updateCommunityMemberStatus({ userId: u._id, accountStatus: next }));
                            }}
                          >
                            <option value="approved">approved</option>
                            <option value="pending">pending</option>
                            <option value="rejected">rejected</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500">
                  Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalMembers)} of{' '}
                  {pagination.totalMembers} members
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={!pagination.hasPrevPage || membersLoading}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          disabled={membersLoading}
                          className={`min-w-[2.25rem] rounded-xl border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                            pagination.currentPage === pageNum
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                    disabled={!pagination.hasNextPage || membersLoading}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : null}
      </motion.div>

      <AnimatePresence>
        {isProfileOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeProfile}
            role="dialog"
            aria-modal="true"
            aria-label="Member profile"
          >
            <motion.div
              className="w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl"
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 border-b border-gray-100 bg-white px-6 py-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Member profile</p>
                  <h2 className="mt-1 truncate text-lg font-semibold text-gray-900">
                    {selectedMember ? getFullName(selectedMember) : 'Loading…'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeProfile}
                  className="rounded-xl border border-gray-200 bg-white p-2 text-gray-600 transition-colors hover:bg-gray-50"
                  aria-label="Close profile"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-6 py-5">
                {memberProfileLoading && !selectedMember ? (
                  <div className="py-10 text-center text-sm text-gray-600">Loading profile…</div>
                ) : selectedMember ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Contact</p>
                      <div className="mt-3 space-y-2 text-sm">
                        <p className="flex items-center gap-2 text-gray-800">
                          <Mail className="h-4 w-4 text-indigo-600" />
                          <span className="truncate">{selectedMember.email || '—'}</span>
                        </p>
                        <p className="flex items-center gap-2 text-gray-800">
                          <Phone className="h-4 w-4 text-indigo-600" />
                          <span className="truncate">{selectedMember.phoneNumber || '—'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Account</p>
                      <div className="mt-3 space-y-2 text-sm text-gray-800">
                        <p className="flex items-center gap-2">
                          <User className="h-4 w-4 text-indigo-600" />
                          <span className="capitalize">{selectedMember.role || '—'}</span>
                        </p>
                        <p>
                          <span className="text-gray-500">Status:</span>{' '}
                          <span className="font-semibold">{selectedMember.accountStatus || 'approved'}</span>
                        </p>
                        <p>
                          <span className="text-gray-500">Joined:</span> {selectedJoined}
                        </p>
                      </div>
                    </div>

                    <div className="sm:col-span-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Address</p>
                      <p className="mt-3 text-sm text-gray-800">{formatAddress(selectedMember) || '—'}</p>
                    </div>

                    {(selectedMember.communName || selectedMember.communityCommunName || selectedMember.requestedCommunityName) && (
                      <div className="sm:col-span-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Community</p>
                        <p className="mt-3 text-sm font-medium text-indigo-700">
                          {selectedMember.requestedCommunityName && !selectedMember.communityCommunName
                            ? `${selectedMember.requestedCommunityName} (requested)`
                            : formatCommunDisplayName(selectedMember.communName || selectedMember.communityCommunName)}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-10 text-center text-sm text-gray-600">Profile not found.</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecretaryMembers;
