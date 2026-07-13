import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Phone, Plus, Trash2, Users2 } from 'lucide-react';
import {
  createSecretaryVendor,
  deleteSecretaryVendor,
  fetchSecretaryVendors,
  fetchVendorCategories,
} from '../../features/secretarySlice';

const cardClass =
  'rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm shadow-purple-500/5 backdrop-blur-sm sm:p-6';

const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90 disabled:opacity-60';
const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-purple-100 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition-colors hover:bg-purple-50 disabled:opacity-60';
const btnDelete =
  'inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60';

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">{label}</span>
    {children}
  </label>
);

const inputBase =
  'w-full rounded-xl border border-purple-100 bg-white/90 px-3.5 py-2.5 text-sm text-[var(--text-primary)] shadow-sm outline-none transition focus:border-purple-300 focus:ring-2 focus:ring-purple-100';

const VendorCard = ({ vendor, onDelete, deleting }) => {
  const phoneHref = vendor.phone ? `tel:${vendor.phone}` : null;
  const mailHref = vendor.email ? `mailto:${vendor.email}` : null;

  return (
    <motion.div
      layout
      className="group relative overflow-hidden rounded-2xl border border-purple-100/60 bg-white/90 p-5 shadow-sm shadow-purple-500/5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
    >
      <div className="absolute -right-24 -top-24 h-44 w-44 rounded-full bg-gradient-to-br from-purple-100 to-fuchsia-100 opacity-70 blur-2xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-[var(--text-primary)] sm:text-base">{vendor.name}</h3>
            <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">
              {vendor.service || vendor.category}
            </p>
          </div>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className={btnDelete}
            aria-label="Delete vendor"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">{deleting ? 'Deleting…' : 'Delete'}</span>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-purple-100/70 bg-white/70 px-3.5 py-2.5">
            <p className="text-[11px] font-semibold text-[var(--text-secondary)]">Phone</p>
            <p className="mt-0.5 truncate text-sm font-medium text-[var(--text-primary)]">{vendor.phone || '—'}</p>
          </div>
          <div className="rounded-xl border border-purple-100/70 bg-white/70 px-3.5 py-2.5">
            <p className="text-[11px] font-semibold text-[var(--text-secondary)]">Email</p>
            <p className="mt-0.5 truncate text-sm font-medium text-[var(--text-primary)]">{vendor.email || '—'}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={phoneHref || undefined}
            className={`${btnGhost} ${phoneHref ? '' : 'pointer-events-none opacity-50'}`}
          >
            <Phone className="h-4 w-4 text-[var(--purple-primary)]" />
            Call
          </a>
          <a
            href={mailHref || undefined}
            className={`${btnGhost} ${mailHref ? '' : 'pointer-events-none opacity-50'}`}
          >
            <Mail className="h-4 w-4 text-[var(--purple-primary)]" />
            Email
          </a>
        </div>
      </div>
    </motion.div>
  );
};

const SecretaryVendors = () => {
  const dispatch = useDispatch();
  const {
    vendorCategories,
    vendorCategoriesLoading,
    vendorCategoriesError,
    vendorCategoriesMeta,
    vendors,
    vendorsLoading,
    vendorsError,
    vendorCreating,
    vendorDeletingId,
  } = useSelector((state) => state.secretary);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [form, setForm] = useState({ category: '', name: '', phone: '', email: '', service: '' });

  useEffect(() => {
    dispatch(fetchVendorCategories());
    dispatch(fetchSecretaryVendors());
  }, [dispatch]);

  const categoriesForCards = useMemo(() => {
    const fromVendors = (vendors || []).reduce((acc, v) => {
      const key = v.category || '';
      if (key && !acc.includes(key)) acc.push(key);
      return acc;
    }, []);
    const all = Array.from(new Set([...(vendorCategories || []), ...fromVendors])).filter(Boolean);
    all.sort((a, b) => String(a).localeCompare(String(b)));
    return all;
  }, [vendorCategories, vendors]);

  const vendorsForSelectedCategory = useMemo(() => {
    if (!selectedCategory) return [];
    return (vendors || []).filter((v) => v.category === selectedCategory);
  }, [vendors, selectedCategory]);

  const onPickCategoryFromDropdown = (value) => {
    if (value === '__add__') {
      setShowAddCategory(true);
      setForm((prev) => ({ ...prev, category: '' }));
      return;
    }
    setShowAddCategory(false);
    setNewCategory('');
    setForm((prev) => ({ ...prev, category: value }));
  };

  const resolvedCategory = showAddCategory ? newCategory.trim() : form.category.trim();

  const handleCreate = async (e) => {
    e.preventDefault();
    const payload = {
      category: resolvedCategory,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      service: form.service.trim(),
    };

    const created = await dispatch(createSecretaryVendor(payload)).unwrap().catch(() => null);
    if (!created) return;

    setSelectedCategory(created.category || selectedCategory);
    setShowAddCategory(false);
    setNewCategory('');
    setForm({ category: created.category || '', name: '', phone: '', email: '', service: '' });
    dispatch(fetchVendorCategories());
  };

  const handleDelete = async (vendorId) => {
    await dispatch(deleteSecretaryVendor(vendorId)).unwrap().catch(() => null);
    dispatch(fetchVendorCategories());
  };

  const needsCommunName = Boolean(vendorCategoriesMeta?.needsCommunName);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
          <Users2 className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-[var(--text-primary)] sm:text-xl">Vendors</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Create visiting-card style vendor contacts for your community.
          </p>
        </div>
      </div>

      <div className={`${cardClass} mb-7`}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">Add vendor</h2>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              Category/type dropdown shows already created categories. You can add a new category too.
            </p>
          </div>
          <button
            type="button"
            onClick={() => dispatch(fetchSecretaryVendors())}
            className={btnGhost}
            disabled={vendorsLoading}
          >
            Refresh
          </button>
        </div>

        {needsCommunName && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Your secretary account has no Commun handle set. Ask admin to set `communName` on your account.
          </div>
        )}

        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Category / Type">
            <select
              className={inputBase}
              value={showAddCategory ? '__add__' : form.category}
              onChange={(e) => onPickCategoryFromDropdown(e.target.value)}
              disabled={vendorCategoriesLoading || needsCommunName}
            >
              <option value="">Select category</option>
              {(vendorCategories || []).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="__add__">+ Add new category</option>
            </select>
            {vendorCategoriesError && (
              <p className="mt-1 text-xs font-medium text-red-600">{String(vendorCategoriesError)}</p>
            )}
          </Field>

          <AnimatePresence>
            {showAddCategory && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18 }}
              >
                <Field label="New category name">
                  <input
                    className={inputBase}
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. Plumber"
                    disabled={needsCommunName}
                  />
                </Field>
              </motion.div>
            )}
          </AnimatePresence>

          <Field label="Vendor name">
            <input
              className={inputBase}
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Ramesh Kumar"
              disabled={needsCommunName}
            />
          </Field>

          <Field label="Service (optional)">
            <input
              className={inputBase}
              value={form.service}
              onChange={(e) => setForm((p) => ({ ...p, service: e.target.value }))}
              placeholder="e.g. Plumbing & repairs"
              disabled={needsCommunName}
            />
          </Field>

          <Field label="Phone (phone/email required)">
            <input
              className={inputBase}
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="e.g. 9876543210"
              disabled={needsCommunName}
            />
          </Field>

          <Field label="Email (phone/email required)">
            <input
              type="email"
              className={inputBase}
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="e.g. vendor@gmail.com"
              disabled={needsCommunName}
            />
          </Field>

          <div className="md:col-span-2">
            <button type="submit" className={btnPrimary} disabled={vendorCreating || needsCommunName}>
              <Plus className="h-4 w-4" />
              {vendorCreating ? 'Saving…' : 'Create vendor'}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className={cardClass}>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">Categories</h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            First choose a category card, then you’ll see vendor visiting cards.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {categoriesForCards.length === 0 && (
              <div className="col-span-full rounded-2xl border border-purple-100 bg-white/70 px-4 py-3 text-sm text-[var(--text-secondary)]">
                No vendor categories yet. Create the first vendor above.
              </div>
            )}
            {categoriesForCards.map((c) => {
              const count = (vendors || []).filter((v) => v.category === c).length;
              const active = selectedCategory === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCategory(c)}
                  className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                    active
                      ? 'border-transparent bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white shadow-sm shadow-purple-500/20'
                      : 'border-purple-100/60 bg-white/80 text-[var(--text-primary)] hover:bg-purple-50'
                  }`}
                >
                  <p className="truncate text-sm font-semibold">{c}</p>
                  <p className={`mt-1 text-xs ${active ? 'text-white/80' : 'text-[var(--text-secondary)]'}`}>
                    {count} vendor{count === 1 ? '' : 's'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className={cardClass}>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">
            {selectedCategory ? `${selectedCategory} vendors` : 'Vendors'}
          </h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            {selectedCategory ? 'Tap Call / Email to contact directly.' : 'Select a category to view vendors.'}
          </p>

          {vendorsError && <p className="mt-3 text-sm font-medium text-red-600">{String(vendorsError)}</p>}

          <div className="mt-4">
            {vendorsLoading && (
              <div className="rounded-2xl border border-purple-100 bg-white/70 px-4 py-3 text-sm text-[var(--text-secondary)]">
                Loading vendors…
              </div>
            )}

            {!vendorsLoading && selectedCategory && vendorsForSelectedCategory.length === 0 && (
              <div className="rounded-2xl border border-purple-100 bg-white/70 px-4 py-3 text-sm text-[var(--text-secondary)]">
                No vendors in this category yet.
              </div>
            )}

            <AnimatePresence>
              {selectedCategory && (
                <motion.div layout className="grid grid-cols-1 gap-3">
                  {vendorsForSelectedCategory.map((v) => (
                    <VendorCard
                      key={v._id}
                      vendor={v}
                      deleting={vendorDeletingId === v._id}
                      onDelete={() => handleDelete(v._id)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretaryVendors;