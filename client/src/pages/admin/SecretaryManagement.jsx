import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { getSecretariesAdmin, createSecretaryAdmin } from '../../features/adminSlice';
import { getFullName } from '../../utils/userHelpers';

const SecretaryManagement = () => {
  const dispatch = useDispatch();
  const { secretaries, secretariesLoading } = useSelector((state) => state.admin);
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
      setForm((prev) => ({ ...prev, phoneNumber: String(value || '').replace(/\D/g, '').slice(0, 15) }));
      return;
    }
    if (name === 'communName') {
      setForm((prev) => ({ ...prev, communName: String(value || '').toLowerCase().replace(/[^a-z0-9_-]/g, '') }));
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

  const inputClass =
    'w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-400';

  return (
    <motion.div
      className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Admin</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
          Secretary management
        </h1>
        <p className="mt-2 text-sm text-gray-600 sm:text-base">
          Onboard secretaries with their Commun login name. They sign in with email and password like other users.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <motion.form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-lg font-bold text-gray-900">Onboard secretary</h2>
          <p className="mt-1 text-xs text-gray-500">
            Lowercase letters, numbers, hyphens, underscores (2–40 chars). New members choose this same handle from a
            list when they sign up so they join your Commun community.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">First name *</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Last name *</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Phone *</label>
              <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} required />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Commun name (unique) *
              </label>
              <input name="communName" value={form.communName} onChange={handleChange} className={inputClass} placeholder="e.g. priya_commun" required />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Password *</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} className={inputClass} autoComplete="new-password" required />
            </div>
          </div>

          <button
            type="submit"
            disabled={secretariesLoading}
            className="mt-6 w-full rounded-lg bg-gray-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
          >
            {secretariesLoading ? 'Saving…' : 'Create secretary'}
          </button>
        </motion.form>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Secretaries</h2>
          <p className="mt-1 text-sm text-gray-600">{secretaries.length} account{secretaries.length !== 1 ? 's' : ''}</p>

          <div className="mt-4 max-h-[480px] overflow-y-auto">
            {secretariesLoading && secretaries.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">Loading…</p>
            ) : secretaries.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">No secretaries yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {secretaries.map((u) => (
                  <li key={u._id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{getFullName(u)}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                      {u.communName && (
                        <p className="text-xs font-medium text-indigo-600">{u.communName}</p>
                      )}
                    </div>
                    <span
                      className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.isActive ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SecretaryManagement;
