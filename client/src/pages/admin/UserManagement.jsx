import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllUsersAdmin, updateUserStatusAdmin } from '../../features/adminSlice';
import ProfileAvatar from '../../components/ProfileAvatar';
import { getFullName } from '../../utils/userHelpers';

const inputClass =
  'w-full pl-9 pr-3 py-2.5 text-sm border border-purple-100 rounded-xl bg-white text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/25 focus:border-[var(--purple-primary)] transition-all';

const StatusBadge = ({ isActive }) => (
  <span
    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
      isActive === false ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
    }`}
  >
    {isActive === false ? 'Inactive' : 'Active'}
  </span>
);

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

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, usersPagination, isLoading } = useSelector((state) => state.admin);
  const authUser = useSelector((state) => state.auth.user);

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const pageSize = 10;

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

  const onToggleStatus = async (user) => {
    if (updatingUserId) return;
    try {
      setUpdatingUserId(user._id);
      await dispatch(updateUserStatusAdmin({ userId: user._id, isActive: !user.isActive })).unwrap();
    } finally {
      setUpdatingUserId(null);
    }
  };

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
          Activate or deactivate user accounts.
        </p>
      </motion.div>

      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name, email, role, phone"
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
              <div className="mb-3 flex items-center gap-3">
                <ProfileAvatar
                  user={user}
                  alt={getFullName(user)}
                  size="lg"
                  className="border border-[var(--purple-primary)]/20"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                    {getFullName(user)}
                  </p>
                  <p className="truncate text-xs text-[var(--text-secondary)]">{user.email}</p>
                </div>
                <StatusBadge isActive={user.isActive} />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-purple-100 pt-3">
                <span className="text-xs capitalize text-[var(--text-secondary)]">{user.role}</span>
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
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-purple-100 bg-purple-50/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                  Email
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
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-purple-100 border-t-[var(--purple-primary)]" />
                    <p className="text-sm text-[var(--text-secondary)]">Loading users…</p>
                  </td>
                </tr>
              )}
              {!isLoading && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-[var(--text-secondary)]">
                    No users found.
                  </td>
                </tr>
              )}
              {!isLoading &&
                users.map((user) => (
                  <tr key={user._id} className="border-b border-purple-50 last:border-b-0 hover:bg-purple-50/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProfileAvatar
                          user={user}
                          alt={getFullName(user)}
                          size="md"
                          className="border border-[var(--purple-primary)]/20"
                        />
                        <div className="text-sm font-medium text-[var(--text-primary)]">
                          {getFullName(user)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{user.email}</td>
                    <td className="px-4 py-3 text-sm capitalize text-[var(--text-secondary)]">
                      {user.role}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge isActive={user.isActive} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ActionButton
                        user={user}
                        updatingUserId={updatingUserId}
                        authUserId={authUser?._id}
                        onToggle={onToggleStatus}
                      />
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
    </div>
  );
};

export default UserManagement;
