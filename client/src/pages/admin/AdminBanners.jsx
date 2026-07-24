import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ImagePlus, Trash2, Upload } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createAdminBanner,
  deleteAdminBanner,
  fetchAdminBanners,
  updateAdminBannerStatus,
} from '../../features/adminSlice';

const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
const btnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-purple-100 bg-white px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50';

const AdminBanners = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const {
    banners,
    bannersLoading,
    bannersError,
    bannerUploading,
    bannerDeletingId,
  } = useSelector((state) => state.admin);

  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminBanners());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onPickFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearSelection = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const onUpload = async () => {
    if (!selectedFile) return;
    const result = await dispatch(createAdminBanner(selectedFile));
    if (createAdminBanner.fulfilled.match(result)) {
      clearSelection();
    }
  };

  const onToggleStatus = (banner) => {
    dispatch(
      updateAdminBannerStatus({
        bannerId: banner._id,
        isActive: !banner.isActive,
      })
    );
  };

  const confirmDelete = async () => {
    if (!deleteTarget?._id) return;
    const result = await dispatch(deleteAdminBanner(deleteTarget._id));
    if (deleteAdminBanner.fulfilled.match(result)) {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--purple-primary)]">
          Admin
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
          Banner Management
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Upload banner images for the mobile app. Active banners are returned by the public banners API.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm shadow-purple-500/5 sm:p-6"
      >
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
            <ImagePlus className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">
              Upload banner
            </h2>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              Image only — stored on S3 under <code className="text-[11px]">banners/</code>
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPickFile}
        />

        <div className="rounded-xl border-2 border-dashed border-purple-100 bg-purple-50/20 p-6 text-center">
          {previewUrl ? (
            <div className="mx-auto max-w-xl">
              <img
                src={previewUrl}
                alt="Banner preview"
                className="mx-auto max-h-56 w-full rounded-xl object-contain"
              />
              <p className="mt-3 truncate text-xs text-[var(--text-secondary)]">
                {selectedFile?.name}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button type="button" onClick={clearSelection} className={btnSecondary}>
                  Clear
                </button>
                <button
                  type="button"
                  onClick={onUpload}
                  disabled={bannerUploading}
                  className={btnPrimary}
                >
                  <Upload className="h-4 w-4" />
                  {bannerUploading ? 'Uploading…' : 'Upload to S3'}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mx-auto flex flex-col items-center"
            >
              <Upload className="mb-3 h-10 w-10 text-[var(--purple-primary)]" />
              <span className="font-semibold text-[var(--text-primary)]">Click to choose image</span>
              <span className="mt-1 text-xs text-[var(--text-secondary)]">PNG, JPG, WEBP</span>
            </button>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm shadow-purple-500/5 sm:p-6"
      >
        <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)] sm:text-base">
          All banners {banners.length ? `(${banners.length})` : ''}
        </h2>

        {bannersError && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {bannersError}
          </p>
        )}

        {bannersLoading && banners.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--text-secondary)]">Loading…</p>
        ) : banners.length === 0 ? (
          <p className="rounded-xl border border-dashed border-purple-100 bg-purple-50/30 py-10 text-center text-sm text-[var(--text-secondary)]">
            No banners yet. Upload one above.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {banners.map((banner) => (
              <li
                key={banner._id}
                className="overflow-hidden rounded-xl border border-purple-100/60 bg-white/70"
              >
                <div className="bg-purple-50/40 p-3">
                  <img
                    src={banner.imageUrl}
                    alt="Banner"
                    className="mx-auto max-h-40 w-full object-contain"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-purple-50 px-3 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      banner.isActive
                        ? 'border border-emerald-100 bg-emerald-50 text-emerald-700'
                        : 'border border-red-100 bg-red-50 text-red-600'
                    }`}
                  >
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(banner)}
                      className={btnSecondary}
                    >
                      {banner.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(banner)}
                      disabled={bannerDeletingId === banner._id}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </motion.div>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border border-purple-100 bg-white p-6 shadow-xl"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
            >
              <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">Delete banner?</h2>
              <p className="text-sm text-[var(--text-secondary)]">
                This removes the banner from the database and deletes the image from S3.
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className={btnSecondary}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={Boolean(bannerDeletingId)}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {bannerDeletingId ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBanners;
