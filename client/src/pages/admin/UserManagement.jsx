import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Mail,
  Phone,
  User,
  MapPin,
  Building2,
} from 'lucide-react';
import {
  getAllUsersAdmin,
  updateUserStatusAdmin,
  getUserByIdAdmin,
  updateUserCommunityAdmin,
  getSecretariesAdmin,
} from '../../features/adminSlice';
import ProfileAvatar from '../../components/ProfileAvatar';
import {
  getFullName,
  getUserCommunityInfo,
  getUserFlatNumber,
  formatAddress,
  getUserStreetAddressLine1,
} from '../../utils/userHelpers';
import { formatCommunDisplayName } from '../../utils/communName';

const inputClass =
  'w-full pl-9 pr-3 py-2.5 text-sm border border-purple-100 rounded-xl bg-white text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/25 focus:border-[var(--purple-primary)] transition-all';

const selectClass =
  'w-full rounded-xl border border-purple-100 bg-white px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/25 focus:border-[var(--purple-primary)]';

const StatusBadge = ({ isActive }) => (
  <span
    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
      isActive === false
        ? 'bg-red-50 text-red-600 border border-red-100'
        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
    }`}
  >
    {isActive === false ? 'Inactive' : 'Active'}
  </span>
);

const ApprovalBadge = ({ status }) => {
  const value = status || 'approved';
  const styles =
    value === 'pending'
      ? 'bg-amber-50 text-amber-800 border-amber-100'
      : value === 'rejected'
        ? 'bg-red-50 text-red-600 border-red-100'
        : 'bg-emerald-50 text-emerald-700 border-emerald-100';
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${styles}`}>
      {value}
    </span>
  );
};

const CommunityDisplay = ({ user }) => {
  const info = getUserCommunityInfo(user);
  return (
    <div className="min-w-[140px]">
      <p className="font-medium text-[var(--text-primary)]">{info.name}</p>
      <span
        className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${info.badgeClass}`}
      >
        {info.badge}
      </span>
      {info.subtext ? (
        <p className="mt-1 text-[11px] leading-snug text-[var(--text-secondary)]">{info.subtext}</p>
      ) : null}
    </div>
  );
};

const ActionButton = ({ user, updatingUserId, authUserId, onToggle }) => {
  const isSelf = authUserId === user._id;
  const isUpdating = updatingUserId === user._id;
  const isInactive = user.isActive === false;

  return (
    <button
      type="button"
      disabled={isUpdating || isSelf}
      onClick={() => onToggle(user)}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
        isInactive
          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
          : 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
      }`}
      title={isSelf ? 'You cannot change your own status' : undefined}
    >
      {isUpdating ? 'Updating…' : isInactive ? 'Activate' : 'Deactivate'}
    </button>
  );
};

const canChangeCommunity = (user) => user && user.role !== 'admin' && user.role !== 'secretary';

const DetailRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3 border-b border-purple-50 py-2 last:border-b-0">
    <span className="text-xs font-medium text-[var(--text-secondary)]">{label}</span>
    <span className="max-w-[65%] text-right text-sm text-[var(--text-primary)] break-words">
      {value || '—'}
    </span>
  </div>
);

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, usersPagination, isLoading, secretaries, secretariesLoading } = useSelector(
    (state) => state.admin
  );
  const authUser = useSelector((state) => state.auth.user);

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const pageSize = 10;

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [communityOpen, setCommunityOpen] = useState(false);
  const [communityUser, setCommunityUser] = useState(null);
  const [communityMode, setCommunityMode] = useState('listed');
  const [communitySlug, setCommunitySlug] = useState('');
  const [otherCommunityName, setOtherCommunityName] = useState('');
  const [accountStatus, setAccountStatus] = useState('approved');
  const [communitySaving, setCommunitySaving] = useState(false);

  const communityOptions = useMemo(() => {
    const list = (secretaries || [])
      .filter((s) => s.isActive !== false && s.communName)
      .map((s) => ({
        value: s.communName,
        label: formatCommunDisplayName(s.communName),
      }));
    list.sort((a, b) => a.label.localeCompare(b.label));
    return list;
  }, [secretaries]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    dispatch(getAllUsersAdmin({ page: currentPage, limit: pageSize, search: searchTerm }));
  }, [dispatch, currentPage, searchTerm]);

  useEffect(() => {
    dispatch(getSecretariesAdmin());
  }, [dispatch]);

  const onToggleStatus = async (user) => {
    if (updatingUserId) return;
    try {
      setUpdatingUserId(user._id);
      await dispatch(updateUserStatusAdmin({ userId: user._id, isActive: !user.isActive })).unwrap();
    } finally {
      setUpdatingUserId(null);
    }
  };

  const openProfile = async (user) => {
    setProfileOpen(true);
    setSelectedUser(user);
    setProfileLoading(true);
    try {
      const full = await dispatch(getUserByIdAdmin(user._id)).unwrap();
      setSelectedUser(full);
    } catch {
      // toast handled in thunk; keep list row as fallback
    } finally {
      setProfileLoading(false);
    }
  };

  const closeProfile = () => {
    setProfileOpen(false);
    setSelectedUser(null);
    setProfileLoading(false);
  };

  const openCommunityEditor = (user) => {
    if (!canChangeCommunity(user)) return;
    setCommunityUser(user);
    if (user.communityCommunName) {
      setCommunityMode('listed');
      setCommunitySlug(user.communityCommunName);
      setOtherCommunityName(user.requestedCommunityName || '');
    } else if (user.isPublicMember || user.requestedCommunityName) {
      setCommunityMode('other');
      setCommunitySlug('');
      setOtherCommunityName(user.requestedCommunityName || '');
    } else {
      setCommunityMode('listed');
      setCommunitySlug(communityOptions[0]?.value || '');
      setOtherCommunityName('');
    }
    setAccountStatus(user.accountStatus || 'approved');
    setCommunityOpen(true);
  };

  const closeCommunityEditor = () => {
    setCommunityOpen(false);
    setCommunityUser(null);
    setCommunitySaving(false);
  };

  const saveCommunity = async () => {
    if (!communityUser || communitySaving) return;
    try {
      setCommunitySaving(true);
      const updated = await dispatch(
        updateUserCommunityAdmin({
          userId: communityUser._id,
          mode: communityMode,
          communityCommunName: communityMode === 'listed' ? communitySlug : undefined,
          requestedCommunityName: communityMode === 'other' ? otherCommunityName : undefined,
          accountStatus,
        })
      ).unwrap();
      if (selectedUser?._id === updated._id) {
        setSelectedUser((prev) => ({ ...prev, ...updated }));
      }
      closeCommunityEditor();
    } catch {
      // toast handled in thunk
    } finally {
      setCommunitySaving(false);
    }
  };

  const joinedLabel = selectedUser?.createdAt
    ? new Date(selectedUser.createdAt).toLocaleString()
    : '—';

  return (
    <div className="p-4 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-6"
      >
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--purple-primary)]">
          Admin
        </p>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">User Management</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Click a name or photo for the full profile. Use Change community to reassign members manually.
        </p>
      </motion.div>

      <div className="mb-5 flex flex-wrap gap-2 text-[11px]">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
          Listed community — signed up from secretary list
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 font-medium text-amber-800">
          Other (manual) — user typed their own community name
        </span>
      </div>

      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name, email, role, phone, community"
          className={inputClass}
        />
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        {isLoading ? (
          <div className="rounded-2xl border border-purple-100/50 bg-white/80 p-10 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-purple-100 border-t-[var(--purple-primary)]" />
            <p className="text-sm text-[var(--text-secondary)]">Loading users…</p>
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-2xl border border-purple-100/50 bg-white/80 p-10 text-center text-sm text-[var(--text-secondary)]">
            No users found.
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className="rounded-2xl border border-purple-100/50 bg-white/80 p-4 shadow-sm shadow-purple-500/5"
            >
              <button
                type="button"
                onClick={() => openProfile(user)}
                className="mb-3 flex w-full items-center gap-3 text-left"
              >
                <ProfileAvatar
                  user={user}
                  alt={getFullName(user)}
                  size="lg"
                  className="border border-[var(--purple-primary)]/20"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--purple-primary)] underline-offset-2 hover:underline">
                    {getFullName(user)}
                  </p>
                  <p className="truncate text-xs text-[var(--text-secondary)]">{user.email}</p>
                </div>
                <StatusBadge isActive={user.isActive} />
              </button>
              <div className="mb-3 border-t border-purple-100 pt-3">
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                  Community
                </p>
                <CommunityDisplay user={user} />
              </div>
              <div className="mb-3 flex items-center justify-between gap-3 border-t border-purple-100 pt-3 text-xs text-[var(--text-secondary)]">
                <span>Flat: {getUserFlatNumber(user) || '—'}</span>
                <span className="capitalize">{user.role}</span>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-purple-100 pt-3">
                {canChangeCommunity(user) ? (
                  <button
                    type="button"
                    onClick={() => openCommunityEditor(user)}
                    className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-medium text-[var(--purple-primary)] hover:bg-purple-100"
                  >
                    Change community
                  </button>
                ) : null}
                <ActionButton
                  user={user}
                  updatingUserId={updatingUserId}
                  authUserId={authUser?._id}
                  onToggle={onToggleStatus}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-purple-100/50 bg-white/80 shadow-sm shadow-purple-500/5 lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px]">
            <thead className="border-b border-purple-100 bg-purple-50/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                  Community
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                  Flat No.
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-purple-100 border-t-[var(--purple-primary)]" />
                    <p className="text-sm text-[var(--text-secondary)]">Loading users…</p>
                  </td>
                </tr>
              )}
              {!isLoading && users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-[var(--text-secondary)]">
                    No users found.
                  </td>
                </tr>
              )}
              {!isLoading &&
                users.map((user) => (
                  <tr key={user._id} className="border-b border-purple-50 last:border-b-0 hover:bg-purple-50/30">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openProfile(user)}
                        className="flex items-center gap-3 text-left"
                      >
                        <ProfileAvatar
                          user={user}
                          alt={getFullName(user)}
                          size="md"
                          className="border border-[var(--purple-primary)]/20"
                        />
                        <div className="text-sm font-medium text-[var(--purple-primary)] underline-offset-2 hover:underline">
                          {getFullName(user)}
                        </div>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{user.email}</td>
                    <td className="px-4 py-3">
                      <CommunityDisplay user={user} />
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                      {getUserFlatNumber(user) || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm capitalize text-[var(--text-secondary)]">
                      {user.role}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge isActive={user.isActive} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex flex-wrap items-center justify-end gap-2">
                        {canChangeCommunity(user) ? (
                          <button
                            type="button"
                            onClick={() => openCommunityEditor(user)}
                            className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-medium text-[var(--purple-primary)] hover:bg-purple-100"
                          >
                            Change community
                          </button>
                        ) : null}
                        <ActionButton
                          user={user}
                          updatingUserId={updatingUserId}
                          authUserId={authUser?._id}
                          onToggle={onToggleStatus}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[var(--text-secondary)] sm:text-sm">
          Page {usersPagination?.currentPage || 1} of {usersPagination?.totalPages || 1}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={!usersPagination?.hasPrevPage}
            className="inline-flex items-center gap-1 rounded-xl border border-purple-100 px-3 py-1.5 text-sm text-[var(--text-primary)] transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={!usersPagination?.hasNextPage}
            className="inline-flex items-center gap-1 rounded-xl border border-purple-100 px-3 py-1.5 text-sm text-[var(--text-primary)] transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Profile modal */}
      <AnimatePresence>
        {profileOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeProfile}
            role="dialog"
            aria-modal="true"
            aria-label="User profile"
          >
            <motion.div
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-purple-100 bg-white shadow-xl"
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-purple-100 bg-white px-6 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  {selectedUser ? (
                    <ProfileAvatar
                      user={selectedUser}
                      alt={getFullName(selectedUser)}
                      size="lg"
                      className="border border-[var(--purple-primary)]/20"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--purple-primary)]">
                      User profile
                    </p>
                    <h2 className="mt-1 truncate text-lg font-semibold text-[var(--text-primary)]">
                      {selectedUser ? getFullName(selectedUser) : 'Loading…'}
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeProfile}
                  className="rounded-xl border border-purple-100 bg-white p-2 text-[var(--text-secondary)] transition-colors hover:bg-purple-50"
                  aria-label="Close profile"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-6 py-5">
                {profileLoading && !selectedUser ? (
                  <div className="py-10 text-center text-sm text-[var(--text-secondary)]">Loading profile…</div>
                ) : selectedUser ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge isActive={selectedUser.isActive} />
                      <ApprovalBadge status={selectedUser.accountStatus} />
                      <span className="inline-flex rounded-full border border-purple-100 bg-purple-50 px-2.5 py-1 text-xs font-medium capitalize text-[var(--purple-primary)]">
                        {selectedUser.role}
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-purple-100 bg-purple-50/30 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                          Contact
                        </p>
                        <div className="mt-3 space-y-2 text-sm text-[var(--text-primary)]">
                          <p className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-[var(--purple-primary)]" />
                            <span className="truncate">{selectedUser.email || '—'}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-[var(--purple-primary)]" />
                            <span className="truncate">{selectedUser.phoneNumber || '—'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-purple-100 bg-purple-50/30 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                          Account
                        </p>
                        <div className="mt-3 space-y-2 text-sm text-[var(--text-primary)]">
                          <p className="flex items-center gap-2">
                            <User className="h-4 w-4 text-[var(--purple-primary)]" />
                            <span className="capitalize">{selectedUser.role || '—'}</span>
                          </p>
                          <p>
                            <span className="text-[var(--text-secondary)]">Joined:</span> {joinedLabel}
                          </p>
                          {selectedUser.updatedAt ? (
                            <p>
                              <span className="text-[var(--text-secondary)]">Updated:</span>{' '}
                              {new Date(selectedUser.updatedAt).toLocaleString()}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="rounded-xl border border-purple-100 bg-purple-50/30 p-4 sm:col-span-2">
                        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                          <Building2 className="h-3.5 w-3.5" />
                          Community
                        </p>
                        <CommunityDisplay user={selectedUser} />
                        <div className="mt-3 space-y-1">
                          <DetailRow
                            label="Listed slug"
                            value={selectedUser.communityCommunName || '—'}
                          />
                          <DetailRow
                            label="Requested / Other"
                            value={selectedUser.requestedCommunityName || '—'}
                          />
                          <DetailRow
                            label="Public member"
                            value={selectedUser.isPublicMember ? 'Yes' : 'No'}
                          />
                          {selectedUser.communName ? (
                            <DetailRow label="Secretary Commun name" value={selectedUser.communName} />
                          ) : null}
                        </div>
                      </div>

                      <div className="rounded-xl border border-purple-100 bg-purple-50/30 p-4 sm:col-span-2">
                        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                          <MapPin className="h-3.5 w-3.5" />
                          Address
                        </p>
                        <div className="space-y-1">
                          <DetailRow label="Flat / house" value={getUserFlatNumber(selectedUser)} />
                          <DetailRow label="Street line 1" value={getUserStreetAddressLine1(selectedUser)} />
                          <DetailRow label="Street line 2" value={selectedUser.addressLine2} />
                          <DetailRow label="City" value={selectedUser.city} />
                          <DetailRow label="State" value={selectedUser.state} />
                          <DetailRow label="ZIP" value={selectedUser.zip} />
                          <DetailRow label="Full address" value={formatAddress(selectedUser)} />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2 pt-1">
                      {canChangeCommunity(selectedUser) ? (
                        <button
                          type="button"
                          onClick={() => openCommunityEditor(selectedUser)}
                          className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-[var(--purple-primary)] hover:bg-purple-100"
                        >
                          Change community
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={closeProfile}
                        className="rounded-xl border border-purple-100 px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-purple-50"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center text-sm text-[var(--text-secondary)]">Profile not found.</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change community modal */}
      <AnimatePresence>
        {communityOpen && communityUser && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCommunityEditor}
            role="dialog"
            aria-modal="true"
            aria-label="Change community"
          >
            <motion.div
              className="w-full max-w-md overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-xl"
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 border-b border-purple-100 px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--purple-primary)]">
                    Change community
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                    {getFullName(communityUser)}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeCommunityEditor}
                  className="rounded-xl border border-purple-100 p-2 text-[var(--text-secondary)] hover:bg-purple-50"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 px-5 py-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                    Assignment type
                  </label>
                  <select
                    className={selectClass}
                    value={communityMode}
                    onChange={(e) => setCommunityMode(e.target.value)}
                  >
                    <option value="listed">Listed community (secretary)</option>
                    <option value="other">Other (manual / public)</option>
                    <option value="clear">Clear community link</option>
                  </select>
                </div>

                {communityMode === 'listed' ? (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                      Community
                    </label>
                    <select
                      className={selectClass}
                      value={communitySlug}
                      onChange={(e) => setCommunitySlug(e.target.value)}
                      disabled={secretariesLoading || communityOptions.length === 0}
                    >
                      {communityOptions.length === 0 ? (
                        <option value="">No communities available</option>
                      ) : (
                        communityOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                ) : null}

                {communityMode === 'other' ? (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                      Requested community name
                    </label>
                    <input
                      className="w-full rounded-xl border border-purple-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/25"
                      value={otherCommunityName}
                      onChange={(e) => setOtherCommunityName(e.target.value)}
                      placeholder="e.g. Green Park Extension"
                    />
                  </div>
                ) : null}

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                    Approval status
                  </label>
                  <select
                    className={selectClass}
                    value={accountStatus}
                    onChange={(e) => setAccountStatus(e.target.value)}
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={closeCommunityEditor}
                    className="rounded-xl border border-purple-100 px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-purple-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={
                      communitySaving ||
                      (communityMode === 'listed' && !communitySlug)
                    }
                    onClick={saveCommunity}
                    className="rounded-xl bg-[var(--purple-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {communitySaving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
