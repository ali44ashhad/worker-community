import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createCategoryAdmin,
  getAllCategoriesAdmin,
  updateCategoryAdmin,
  updateCategoryStatusAdmin,
} from '../../features/adminSlice';
import { Layers, Plus, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryIcon from '../../components/CategoryIcon';
import {
  CATEGORY_ICON_OPTIONS,
  DEFAULT_CATEGORY_ICON,
  resolveCategoryIconName,
} from '../../utils/categoryIcons';

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

const Section = ({ title, description, children, icon: Icon }) => (
  <div className="rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm shadow-purple-500/5 backdrop-blur-sm sm:p-6">
    {(title || description) && (
      <div className="mb-5 flex items-start gap-3">
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div className="min-w-0">
          {title && (
            <h2 className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">{title}</h2>
          )}
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">{description}</p>
          )}
        </div>
      </div>
    )}
    {children}
  </div>
);

const CategoryManagement = () => {
  const dispatch = useDispatch();
  const { categoriesAdmin, categoriesAdminPagination, isLoading, error } = useSelector(
    (s) => s.admin
  );

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: '',
    subCategoriesCsv: '',
    keywordsCsv: '',
    icon: DEFAULT_CATEGORY_ICON,
    isActive: true,
  });

  useEffect(() => {
    dispatch(getAllCategoriesAdmin({ page, limit: 50, search }));
  }, [dispatch, page, search]);

  useEffect(() => {
    if (!isModalOpen) return;
    if (!editing) {
      setForm({
        name: '',
        subCategoriesCsv: '',
        keywordsCsv: '',
        icon: DEFAULT_CATEGORY_ICON,
        isActive: true,
      });
      return;
    }
    setForm({
      name: editing.name || '',
      subCategoriesCsv: (editing.subCategories || []).join(', '),
      keywordsCsv: (editing.keywords || []).join(', '),
      icon: resolveCategoryIconName(editing.icon, editing.name),
      isActive: editing.isActive !== false,
    });
  }, [isModalOpen, editing]);

  const title = useMemo(() => (editing ? 'Edit Category' : 'Create Category'), [editing]);

  const openCreate = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      subCategories: splitCsv(form.subCategoriesCsv),
      keywords: splitCsv(form.keywordsCsv),
      icon: form.icon,
      isActive: Boolean(form.isActive),
    };

    if (!payload.name) return;

    if (!editing) {
      await dispatch(createCategoryAdmin(payload));
    } else {
      await dispatch(updateCategoryAdmin({ categoryId: editing._id, patch: payload }));
    }
    closeModal();
  };

  const toggleActive = (cat) => {
    dispatch(updateCategoryStatusAdmin({ categoryId: cat._id, isActive: !cat.isActive }));
  };

  const reload = () => {
    dispatch(getAllCategoriesAdmin({ page, limit: 50, search }));
  };

  if (isLoading && (!categoriesAdmin || categoriesAdmin.length === 0)) {
    return (
      <motion.div
        className="flex min-h-screen items-center justify-center bg-[var(--background-subtle)] px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-full max-w-sm rounded-2xl border border-purple-100/50 bg-white/80 p-8 text-center shadow-sm shadow-purple-500/5">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-purple-100 border-t-[var(--purple-primary)]" />
          <p className="text-sm font-medium text-[var(--text-primary)]">Loading categories…</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-[var(--background-subtle)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <section className="border-b border-purple-100/60 bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20 py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--purple-primary)]">
                Admin
              </p>
              <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
                Category Management
              </h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Manage categories, subcategories, and specializations (keywords).
              </p>
            </div>
            <button type="button" onClick={openCreate} className={`${btnPrimary} shrink-0`}>
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-5 px-4 py-8 sm:px-6 sm:py-10">
        <Section
          title="All categories"
          description={
            categoriesAdminPagination?.totalCategories != null
              ? `${categoriesAdminPagination.totalCategories} categor${categoriesAdminPagination.totalCategories !== 1 ? 'ies' : 'y'} · page ${categoriesAdminPagination.currentPage || page} of ${categoriesAdminPagination.totalPages || 1}`
              : 'Browse and edit service categories.'
          }
          icon={Layers}
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]/60" />
              <input
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                placeholder="Search categories…"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              Error: {error}
              <button
                type="button"
                onClick={reload}
                className="ml-2 font-semibold text-red-700 underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-purple-100 border-t-[var(--purple-primary)]" />
              <p className="text-sm text-[var(--text-secondary)]">Updating…</p>
            </div>
          ) : (categoriesAdmin || []).length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(categoriesAdmin || []).map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => openEdit(cat)}
                  className="group rounded-xl border border-purple-100/50 bg-purple-50/20 p-4 text-left transition-colors hover:border-purple-200 hover:bg-white"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
                      <CategoryIcon icon={cat.icon} name={cat.name} className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-[var(--text-primary)] group-hover:text-[var(--purple-primary)]">
                        {cat.name}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        {(cat.subCategories || []).length} subcategories · {(cat.keywords || []).length}{' '}
                        keywords
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-purple-100/60 pt-3">
                    <StatusBadge isActive={cat.isActive !== false} />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleActive(cat);
                      }}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        cat.isActive !== false
                          ? 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                          : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {cat.isActive !== false ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Layers className="mx-auto mb-3 h-10 w-10 text-purple-200" />
              <p className="text-sm text-[var(--text-secondary)]">
                No categories found{search ? ' matching your search' : ''}.
              </p>
              <button type="button" onClick={openCreate} className={`${btnPrimary} mt-4`}>
                <Plus className="h-4 w-4" />
                Add Category
              </button>
            </div>
          )}

          {categoriesAdminPagination?.totalPages > 1 && (
            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-purple-100/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[var(--text-secondary)]">
                Page {categoriesAdminPagination.currentPage} of {categoriesAdminPagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={btnSecondary}
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={!categoriesAdminPagination.hasNextPage || isLoading}
                  onClick={() => setPage((p) => p + 1)}
                  className={btnSecondary}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Section>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-purple-100/50 bg-white/95 shadow-xl shadow-purple-500/10 backdrop-blur-sm"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 border-b border-purple-100 px-5 py-4">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--purple-primary)]">
                    Category
                  </p>
                  <p className="text-lg font-semibold text-[var(--text-primary)]">{title}</p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl p-2 text-[var(--text-secondary)] transition-colors hover:bg-purple-50 hover:text-[var(--purple-primary)]"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={onSubmit} className="flex max-h-[calc(90vh-4rem)] flex-col">
                <div className="space-y-4 overflow-y-auto p-5">
                  <div>
                    <label className={labelClass} htmlFor="cat-name">
                      Name
                    </label>
                    <input
                      id="cat-name"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className={inputClass}
                      placeholder="e.g. Consulting"
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="cat-subcategories">
                      Subcategories (comma separated)
                    </label>
                    <input
                      id="cat-subcategories"
                      value={form.subCategoriesCsv}
                      onChange={(e) => setForm((p) => ({ ...p, subCategoriesCsv: e.target.value }))}
                      className={inputClass}
                      placeholder="Basic Services, Premium Services, Specialized Services"
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="cat-keywords">
                      Specializations / Keywords (comma separated)
                    </label>
                    <textarea
                      id="cat-keywords"
                      value={form.keywordsCsv}
                      onChange={(e) => setForm((p) => ({ ...p, keywordsCsv: e.target.value }))}
                      rows={4}
                      className={inputClass}
                      placeholder="Human Resource, Financial Planning, …"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Category icon</label>
                    <div className="grid max-h-48 grid-cols-6 gap-2 overflow-y-auto rounded-xl border border-purple-100 bg-purple-50/20 p-3 sm:grid-cols-8">
                      {CATEGORY_ICON_OPTIONS.map(({ name, Icon }) => {
                        const selected = form.icon === name;
                        return (
                          <button
                            key={name}
                            type="button"
                            title={name}
                            onClick={() => setForm((p) => ({ ...p, icon: name }))}
                            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                              selected
                                ? 'border-[var(--purple-primary)] bg-white text-[var(--purple-primary)] shadow-sm'
                                : 'border-transparent bg-white/80 text-[var(--text-secondary)] hover:border-purple-200 hover:text-[var(--purple-primary)]'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
                      Selected: <span className="font-medium text-[var(--text-primary)]">{form.icon}</span>
                    </p>
                  </div>

                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                      className="h-4 w-4 rounded border-purple-200 text-[var(--purple-primary)] focus:ring-[var(--purple-primary)]/25"
                    />
                    Active
                  </label>
                </div>

                <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-purple-100 bg-purple-50/30 px-5 py-4">
                  <button type="button" onClick={closeModal} className={btnSecondary}>
                    Cancel
                  </button>
                  <button type="submit" className={btnPrimary}>
                    {editing ? 'Save changes' : 'Create category'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CategoryManagement;
