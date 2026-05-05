import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createCategoryAdmin,
  getAllCategoriesAdmin,
  updateCategoryAdmin,
  updateCategoryStatusAdmin,
} from '../../features/adminSlice';
import { HiOutlinePlus, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const splitCsv = (value) =>
  String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const CategoryManagement = () => {
  const dispatch = useDispatch();
  const { categoriesAdmin, categoriesAdminPagination, isLoading, error } = useSelector(
    (s) => s.admin
  );

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // category object or null

  const [form, setForm] = useState({
    name: '',
    subCategoriesCsv: '',
    keywordsCsv: '',
    description: '',
    isActive: true,
    imageFile: null,
    imagePreviewUrl: '',
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
        description: '',
        isActive: true,
        imageFile: null,
        imagePreviewUrl: '',
      });
      return;
    }
    setForm({
      name: editing.name || '',
      subCategoriesCsv: (editing.subCategories || []).join(', '),
      keywordsCsv: (editing.keywords || []).join(', '),
      description: editing.description || '',
      isActive: editing.isActive !== false,
      imageFile: null,
      imagePreviewUrl: editing.image?.url || '',
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
      description: form.description,
      isActive: Boolean(form.isActive),
      imageFile: form.imageFile || undefined,
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

  return (
    <div className="max-w-[1350px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-black tracking-tight">
            Category Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage categories, subcategories, and specializations (keywords).
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition-colors"
        >
          <HiOutlinePlus size={20} />
          Add Category
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search categories..."
            className="w-full sm:max-w-md h-12 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
          />
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold text-black">{categoriesAdminPagination.totalCategories || 0}</span>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm mb-3">Error: {error}</p>}

        {isLoading ? (
          <div className="py-10 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-3"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(categoriesAdmin || []).map((cat) => (
              <button
                key={cat._id}
                type="button"
                onClick={() => openEdit(cat)}
                className="text-left bg-white border border-gray-200 rounded-2xl p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-black truncate">{cat.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Subcategories: {(cat.subCategories || []).length} • Specializations: {(cat.keywords || []).length}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${
                        cat.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleActive(cat);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                      {cat.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {categoriesAdminPagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50"
            >
              Prev
            </button>
            <div className="text-sm text-gray-600">
              Page <span className="font-semibold text-black">{categoriesAdminPagination.currentPage}</span> of{' '}
              <span className="font-semibold text-black">{categoriesAdminPagination.totalPages}</span>
            </div>
            <button
              type="button"
              disabled={!categoriesAdminPagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="w-full max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-gray-200 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Category</p>
                  <p className="text-lg font-semibold text-black">{title}</p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <HiX size={20} />
                </button>
              </div>

              <form onSubmit={onSubmit} className="flex flex-col max-h-[80vh]">
                <div className="p-5 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="e.g. Consulting"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Subcategories (comma separated)
                  </label>
                  <input
                    value={form.subCategoriesCsv}
                    onChange={(e) => setForm((p) => ({ ...p, subCategoriesCsv: e.target.value }))}
                    className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Basic Services, Premium Services, Specialized Services"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Specializations / Keywords (comma separated)
                  </label>
                  <textarea
                    value={form.keywordsCsv}
                    onChange={(e) => setForm((p) => ({ ...p, keywordsCsv: e.target.value }))}
                    className="w-full min-h-[120px] px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Human Resource, Financial Planning, ..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    className="w-full min-h-[90px] px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Short description shown on category pages"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Category Image</label>
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                    <div className="w-32 h-20 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {form.imagePreviewUrl ? (
                        <img
                          src={form.imagePreviewUrl}
                          alt="Category preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-gray-500">No image</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          if (!file) return;
                          const preview = URL.createObjectURL(file);
                          setForm((p) => ({ ...p, imageFile: file, imagePreviewUrl: preview }));
                        }}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Upload a PNG/JPG. This will replace the existing image.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-end">
                  <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                      className="h-4 w-4"
                    />
                    Active
                  </label>
                </div>
                </div>

                <div className="px-5 py-4 border-t border-gray-200 bg-white sticky bottom-0 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="h-11 px-5 rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-11 px-5 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition-colors"
                  >
                    {editing ? 'Save Changes' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryManagement;

