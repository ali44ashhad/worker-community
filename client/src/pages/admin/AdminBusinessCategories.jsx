import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Layers, Plus, Search, X } from 'lucide-react';
import {
  createAdminBusinessCategory,
  fetchAdminBusinessCategories,
  updateAdminBusinessCategory,
  updateAdminBusinessCategoryStatus,
} from '../../features/adminSlice';

const inputClass =
  'w-full px-3.5 py-2.5 text-sm border border-purple-100 rounded-xl bg-white text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/70 focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/25 focus:border-[var(--purple-primary)] transition-all';
const labelClass = 'mb-1.5 block text-xs font-medium text-[var(--text-secondary)]';
const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
const btnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-purple-100 bg-white px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50';

const splitCsv = (value) =>
  String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const StatusBadge = ({ isActive }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
      isActive
        ? 'border border-emerald-100 bg-emerald-50 text-emerald-700'
        : 'border border-red-100 bg-red-50 text-red-600'
    }`}
  >
    {isActive ? 'Active' : 'Inactive'}
  </span>
);

const AdminBusinessCategories = () => {
  const dispatch = useDispatch();
  const {
    businessCategoriesAdmin,
    businessCategoriesAdminLoading,
    businessCategoriesAdminError,
    businessCategorySaving,
  } = useSelector((s) => s.admin);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    subCategoriesCsv: '',
    sortOrder: '0',
    isActive: true,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchAdminBusinessCategories({ search }));
    }, 250);
    return () => clearTimeout(timer);
  }, [dispatch, search]);

  useEffect(() => {
    if (!isModalOpen) return;
    if (!editing) {
      setForm({ name: '', subCategoriesCsv: '', sortOrder: '0', isActive: true });
      return;
    }
    setForm({
      name: editing.name || '',
      subCategoriesCsv: (editing.subCategories || []).join(', '),
      sortOrder: String(editing.sortOrder ?? 0),
      isActive: Boolean(editing.isActive),
    });
  }, [isModalOpen, editing]);

  const openCreate = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setIsModalOpen(true);
  };

  const onSave = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      subCategories: splitCsv(form.subCategoriesCsv),
      sortOrder: Number(form.sortOrder) || 0,
      isActive: Boolean(form.isActive),
    };

    const action = editing
      ? await dispatch(updateAdminBusinessCategory({ categoryId: editing._id, ...payload }))
      : await dispatch(createAdminBusinessCategory(payload));

    if (action.meta.requestStatus === 'fulfilled') {
      setIsModalOpen(false);
      setEditing(null);
    }
  };

  const onToggle = async (category) => {
    await dispatch(
      updateAdminBusinessCategoryStatus({
        categoryId: category._id,
        isActive: !category.isActive,
      })
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div className="rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[var(--text-primary)]">Business Categories</h1>
              <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                Master list for local business types and discountable services.
              </p>
            </div>
          </div>
          <button type="button" className={btnPrimary} onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            className={`${inputClass} pl-9`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories…"
          />
        </div>
      </div>

      {businessCategoriesAdminError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {businessCategoriesAdminError}
        </div>
      ) : null}

      {businessCategoriesAdminLoading ? (
        <div className="rounded-2xl border border-purple-100/50 bg-white/80 p-5 text-sm text-[var(--text-secondary)]">
          Loading…
        </div>
      ) : (
        <div className="space-y-3">
          {(businessCategoriesAdmin || []).map((category) => (
            <div
              key={category._id}
              className="rounded-2xl border border-purple-100/60 bg-white/90 p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">
                      {category.name}
                    </h3>
                    <StatusBadge isActive={category.isActive} />
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    Sort {category.sortOrder ?? 0} · {(category.subCategories || []).length} services
                  </p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    {(category.subCategories || []).join(', ') || 'No sub-categories'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={btnSecondary} onClick={() => openEdit(category)}>
                    Edit
                  </button>
                  <button type="button" className={btnSecondary} onClick={() => onToggle(category)}>
                    {category.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-purple-100 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                {editing ? 'Edit Category' : 'Add Category'}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} aria-label="Close">
                <X className="h-5 w-5 text-[var(--text-secondary)]" />
              </button>
            </div>
            <form onSubmit={onSave} className="space-y-4">
              <label className="block">
                <span className={labelClass}>Name</span>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </label>
              <label className="block">
                <span className={labelClass}>Sub-categories (comma separated)</span>
                <textarea
                  rows={3}
                  className={inputClass}
                  value={form.subCategoriesCsv}
                  onChange={(e) => setForm((p) => ({ ...p, subCategoriesCsv: e.target.value }))}
                  placeholder="Hair Cutting, Beard Trim, Facial"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className={labelClass}>Sort order</span>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.sortOrder}
                    onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
                  />
                </label>
                <label className="flex items-end gap-2 pb-2 text-sm text-[var(--text-primary)]">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                  />
                  Active
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className={btnSecondary} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={btnPrimary} disabled={businessCategorySaving}>
                  {businessCategorySaving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminBusinessCategories;
