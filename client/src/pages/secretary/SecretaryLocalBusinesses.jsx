import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  Pencil,
  Plus,
  Power,
  Search,
  Trash2,
} from 'lucide-react';
import {
  deleteSecretaryLocalBusiness,
  fetchBusinessCategories,
  fetchSecretaryLocalBusinesses,
  updateSecretaryLocalBusinessStatus,
} from '../../features/secretarySlice';

const cardClass =
  'rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm shadow-purple-500/5 backdrop-blur-sm sm:p-6';
const inputBase =
  'w-full rounded-xl border border-purple-100 bg-white/90 px-3.5 py-2.5 text-sm text-[var(--text-primary)] shadow-sm outline-none transition focus:border-purple-300 focus:ring-2 focus:ring-purple-100';
const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90 disabled:opacity-60';
const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-purple-100 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition-colors hover:bg-purple-50 disabled:opacity-60';
const btnDelete =
  'inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60';

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString();
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
      status === 'active'
        ? 'border border-emerald-100 bg-emerald-50 text-emerald-700'
        : 'border border-red-100 bg-red-50 text-red-600'
    }`}
  >
    {status === 'active' ? 'Active' : 'Inactive'}
  </span>
);

const SecretaryLocalBusinesses = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    businessCategories,
    localBusinesses,
    localBusinessesLoading,
    localBusinessesError,
    localBusinessesMeta,
    localBusinessDeletingId,
    localBusinessStatusUpdatingId,
  } = useSelector((state) => state.secretary);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    dispatch(fetchBusinessCategories());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchSecretaryLocalBusinesses({ search, category, status }));
    }, 250);
    return () => clearTimeout(timer);
  }, [dispatch, search, category, status]);

  const categoryOptions = useMemo(
    () => (businessCategories || []).map((c) => c.name).filter(Boolean),
    [businessCategories]
  );

  const onToggleStatus = async (business) => {
    const next = business.status === 'active' ? 'inactive' : 'active';
    await dispatch(
      updateSecretaryLocalBusinessStatus({ businessId: business._id, status: next })
    );
  };

  const onDelete = async (businessId) => {
    if (!window.confirm('Delete this business listing? This cannot be undone.')) return;
    await dispatch(deleteSecretaryLocalBusiness(businessId));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <div className={`${cardClass} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)] sm:text-xl">Business List</h1>
            <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
              Onboard local businesses and manage community discount offers.
            </p>
          </div>
        </div>
        <Link to="/secretary/local-businesses/add" className={btnPrimary}>
          <Plus className="h-4 w-4" />
          Add Business
        </Link>
      </div>

      {localBusinessesMeta?.needsCommunName && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Set your Commun name on your profile before managing businesses.
        </div>
      )}

      <div className={`${cardClass} grid grid-cols-1 gap-3 md:grid-cols-3`}>
        <label className="block md:col-span-1">
          <span className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">Search</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              className={`${inputBase} pl-9`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, owner, phone, email…"
            />
          </div>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">Category</span>
          <select className={inputBase} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categoryOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">Status</span>
          <select className={inputBase} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </div>

      {localBusinessesError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {localBusinessesError}
        </div>
      )}

      {localBusinessesLoading ? (
        <div className={`${cardClass} text-sm text-[var(--text-secondary)]`}>Loading businesses…</div>
      ) : localBusinesses.length === 0 ? (
        <div className={`${cardClass} text-sm text-[var(--text-secondary)]`}>
          No businesses yet. Add the first local business to start offering community discounts.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {localBusinesses.map((business) => (
              <motion.div
                key={business._id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="overflow-hidden rounded-2xl border border-purple-100/60 bg-white/90 shadow-sm shadow-purple-500/5"
              >
                {business.bannerUrl ? (
                  <div className="aspect-video w-full overflow-hidden bg-purple-50">
                    <img src={business.bannerUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-gradient-to-r from-purple-50 to-fuchsia-50" />
                )}
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-purple-100 bg-purple-50"
                      style={{ borderRadius: '9999px' }}
                    >
                      {business.logoUrl ? (
                        <img
                          src={business.logoUrl}
                          alt=""
                          className="block h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[var(--purple-primary)]">
                          <Building2 className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-semibold text-[var(--text-primary)]">
                          {business.businessName}
                        </h3>
                        <StatusBadge status={business.status} />
                      </div>
                      <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                        {(business.businessCategories || []).join(' · ')}
                        {business.hasDiscount === false
                          ? ' · No discount'
                          : ` · ${business.discountPercentage}% off`}
                      </p> 
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={btnGhost}
                      onClick={() => navigate(`/secretary/local-businesses/${business._id}/edit`)}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      className={btnGhost}
                      disabled={localBusinessStatusUpdatingId === business._id}
                      onClick={() => onToggleStatus(business)}
                    >
                      <Power className="h-4 w-4" />
                      {business.status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      type="button"
                      className={btnDelete}
                      disabled={localBusinessDeletingId === business._id}
                      onClick={() => onDelete(business._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default SecretaryLocalBusinesses;
