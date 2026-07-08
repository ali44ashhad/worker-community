import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Pencil, Save, UserPlus, Users, X } from 'lucide-react';
import { getSecretariesAdmin, createSecretaryAdmin, updateSecretaryDetailsAdmin } from '../../features/adminSlice';
import ProfileAvatar from '../../components/ProfileAvatar';
import { getFullName } from '../../utils/userHelpers';
import { formatCommunDisplayName } from '../../utils/communName';

const inputClass =
  'w-full rounded-xl border border-purple-100 bg-white px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/70 focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/25 focus:border-[var(--purple-primary)] transition-all';

const labelClass = 'mb-1.5 block text-xs font-medium text-[var(--text-secondary)]';

const StatusBadge = ({ isActive }) => (
  <span
    className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
      isActive
        ? 'border border-emerald-100 bg-emerald-50 text-emerald-700'
        : 'border border-red-100 bg-red-50 text-red-600'
    }`}
  >
    {isActive ? 'Active' : 'Inactive'}
  </span>
);

const Card = ({ icon: Icon, title, description, children }) => (
  <div className="rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm shadow-purple-500/5 backdrop-blur-sm sm:p-6">
    <div className="mb-5 flex items-start gap-3">
      {Icon && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div>
        <h2 className="text-base font-semibold text-[var(--text-primary)] sm:text-lg">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">{description}</p>
        )}
      </div>
    </div>
    {children}
  </div>
);

const SecretaryManagement = () => {
  const dispatch = useDispatch();
  const { secretaries, secretariesLoading } = useSelector((state) => state.admin);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ firstName: '', lastName: '', email: '' });
  const [savingId, setSavingId] = useState(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    communName: '',
    password: '',
  });

  useEffect(() => {
    dispatch(getSecretariesAdmin());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      setForm((prev) => ({
        ...prev,
        phoneNumber: String(value || '')
          .replace(/\D/g, '')
          .slice(0, 15),
      }));
      return;
    }
    if (name === 'communName') {
      setForm((prev) => ({
        ...prev,
        communName: String(value || '')
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, ''),
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(createSecretaryAdmin(form));
    if (!result.error) {
      setForm({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        communName: '',
        password: '',
      });
    }
  };

  const startEdit = (u) => {
    setEditingId(u._id);
    setEditValues({
      firstName: String(u.firstName || '').trim(),
      lastName: String(u.lastName || '').trim(),
      email: String(u.email || '').trim(),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ firstName: '', lastName: '', email: '' });
    setSavingId(null);
  };

  const saveEdit = async (u) => {
    if (!u?._id) return;
    const next = {
      firstName: String(editValues.firstName || '').trim(),
      lastName: String(editValues.lastName || '').trim(),
      email: String(editValues.email || '').trim().toLowerCase(),
    };
    if (!next.firstName || !next.lastName || !next.email) return;
    try {
      setSavingId(u._id);
      await dispatch(
        updateSecretaryDetailsAdmin({
          userId: u._id,
          firstName: next.firstName,
          lastName: next.lastName,
          email: next.email,
        })
      ).unwrap();
      cancelEdit();
    } catch (err) {
      // toast is already handled in the thunk; keep console for debugging
      console.error('updateSecretaryDetailsAdmin failed:', err);
      setSavingId(null);
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
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
          Secretary Management
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Onboard secretaries with their Commun login name. They sign in with email and password
          like other users.
        </p>
      </motion.div>

      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-8">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card
            icon={UserPlus}
            title="Onboard secretary"
            description="Lowercase letters, numbers, hyphens, underscores (2–40 chars). New members choose this handle when signing up to join your Commun community."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="firstName">
                  First name <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="lastName">
                  Last name <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="phoneNumber">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="communName">
                  Commun name (unique) <span className="text-red-500">*</span>
                </label>
                <input
                  id="communName"
                  name="communName"
                  value={form.communName}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. priya_commun"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={inputClass}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={secretariesLoading}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] py-2.5 text-sm font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
            >
              {secretariesLoading ? 'Saving…' : 'Create secretary'}
            </button>
          </Card>
        </motion.form>

        <Card
          icon={Users}
          title="Secretaries"
          description={`${secretaries.length} account${secretaries.length !== 1 ? 's' : ''}`}
        >
          <div className="max-h-[480px] overflow-y-auto">
            {secretariesLoading && secretaries.length === 0 ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-purple-100 border-t-[var(--purple-primary)]" />
                <p className="text-sm text-[var(--text-secondary)]">Loading…</p>
              </div>
            ) : secretaries.length === 0 ? (
              <p className="py-10 text-center text-sm text-[var(--text-secondary)]">
                No secretaries yet.
              </p>
            ) : (
              <ul className="divide-y divide-purple-50">
                {secretaries.map((u) => (
                  <li
                    key={u._id}
                    className="flex flex-col gap-3 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <ProfileAvatar
                        user={u}
                        alt={getFullName(u)}
                        size="lg"
                        className="border border-[var(--purple-primary)]/20"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                          {getFullName(u)}
                        </p>
                        {editingId === u._id ? (
                          <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="grid w-full gap-2 sm:max-w-lg sm:grid-cols-3">
                              <input
                                type="text"
                                value={editValues.firstName}
                                onChange={(e) => setEditValues((p) => ({ ...p, firstName: e.target.value }))}
                                className={inputClass}
                                placeholder="First name"
                                disabled={savingId === u._id}
                              />
                              <input
                                type="text"
                                value={editValues.lastName}
                                onChange={(e) => setEditValues((p) => ({ ...p, lastName: e.target.value }))}
                                className={inputClass}
                                placeholder="Last name"
                                disabled={savingId === u._id}
                              />
                              <div className="relative sm:col-span-3">
                                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]/60" />
                                <input
                                  type="email"
                                  value={editValues.email}
                                  onChange={(e) => setEditValues((p) => ({ ...p, email: e.target.value }))}
                                  className={`${inputClass} pl-9`}
                                  placeholder="new-email@example.com"
                                  autoComplete="email"
                                  disabled={savingId === u._id}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => saveEdit(u)}
                                disabled={
                                  savingId === u._id ||
                                  !String(editValues.firstName || '').trim() ||
                                  !String(editValues.lastName || '').trim() ||
                                  !String(editValues.email || '').trim()
                                }
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Save className="h-4 w-4" />
                                {savingId === u._id ? 'Saving…' : 'Save'}
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                disabled={savingId === u._id}
                                className="inline-flex items-center gap-2 rounded-xl border border-purple-100 bg-white px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <X className="h-4 w-4" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-0.5 flex items-center gap-2">
                            <p className="truncate text-xs text-[var(--text-secondary)]">{u.email}</p>
                            <button
                              type="button"
                              onClick={() => startEdit(u)}
                              className="inline-flex items-center gap-1 rounded-lg border border-purple-100 bg-white px-2 py-1 text-[10px] font-semibold text-[var(--purple-primary)] transition-colors hover:bg-purple-50"
                              title="Edit secretary details"
                            >
                              <Pencil className="h-3 w-3" />
                              Edit
                            </button>
                          </div>
                        )}
                        {u.communName && (
                          <p className="truncate text-xs font-medium text-[var(--purple-primary)]">
                            {formatCommunDisplayName(u.communName)}
                          </p>
                        )}
                      </div>
                    </div>
                    <StatusBadge isActive={u.isActive} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SecretaryManagement;
