import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Pencil, Plus, Trash2 } from 'lucide-react';
import { getMyProviderProfile } from '../../features/providerSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
const btnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-purple-100 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50';
const btnDanger =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50';

const chipClass =
  'rounded-full border border-purple-100 bg-purple-50/50 px-2.5 py-1 text-xs font-medium text-[var(--purple-primary)]';

const ManageServices = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myProviderProfile, isFetchingMyProfile } = useSelector((state) => state.provider);
  const [deletingId, setDeletingId] = useState(null);
  const [serviceToRemove, setServiceToRemove] = useState(null);

  useEffect(() => {
    dispatch(getMyProviderProfile());
  }, [dispatch]);

  const services = useMemo(() => myProviderProfile?.serviceOfferings || [], [myProviderProfile]);

  const handleDelete = async () => {
    if (!serviceToRemove || deletingId) return;
    const serviceId = serviceToRemove._id;

    try {
      setDeletingId(serviceId);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/provider-profile/service/${serviceId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const rawText = await response.text();
      const data = rawText
        ? (() => {
            try {
              return JSON.parse(rawText);
            } catch {
              return null;
            }
          })()
        : null;
      if (!response.ok) {
        const message = 
          data?.message ||
          (response.status === 401
            ? 'Session expired. Please login again and retry.'
            : `Failed to delete service (${response.status}).`);
        throw new Error(message);
      }

      toast.success('Service removed successfully.');
      await dispatch(getMyProviderProfile());
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error(error.message || 'Unable to delete service');
    } finally {
      setDeletingId(null);
      setServiceToRemove(null);
    }
  };

  const handleUpdate = (serviceId) => {
    navigate(`/provider/manage-services/${serviceId}/edit`);
  };

  const handleAddService = () => {
    navigate('/provider/manage-services/new');
  };

  if (isFetchingMyProfile) {
    return (
      <motion.div
        className="flex min-h-screen items-center justify-center bg-[var(--background-subtle)] px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-full max-w-sm rounded-2xl border border-purple-100/50 bg-white/80 p-8 text-center shadow-sm shadow-purple-500/5">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-purple-100 border-t-[var(--purple-primary)]" />
          <p className="text-sm font-medium text-[var(--text-primary)]">Loading your services…</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">Fetching your service offerings.</p>
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--purple-primary)]">
                Provider
              </p>
              <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
                Manage Services
              </h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Review, update, or remove your services. Keep them up to date to attract more customers.
              </p>
            </div>
            <button type="button" onClick={handleAddService} className={btnPrimary}>
              <Plus className="h-4 w-4" />
              Add new service
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {!services.length ? (
          <motion.div
            className="rounded-2xl border border-dashed border-purple-100 bg-white/80 px-6 py-16 text-center shadow-sm shadow-purple-500/5 backdrop-blur-sm"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
              <Briefcase className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">No services yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--text-secondary)]">
              You have not added any services yet. Create your first service to start receiving bookings.
            </p>
            <button type="button" onClick={handleAddService} className={`mt-6 ${btnPrimary}`}>
              <Plus className="h-4 w-4" />
              Add service
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service, index) => {
              const coverImage = service.portfolioImages?.[0]?.url;
              return (
                <motion.div
                  key={service._id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-purple-100/50 bg-white/80 shadow-sm shadow-purple-500/5 backdrop-blur-sm transition-all hover:border-purple-200/80 hover:shadow-md hover:shadow-purple-500/10"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div className="flex items-center justify-center overflow-hidden bg-purple-50/30 p-4">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={service.serviceCategory}
                        className="max-h-52 w-auto max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <img
                        src="/CommuN-logo.png"
                        alt="Default service"
                        className="max-h-40 w-auto max-w-full object-contain"
                        loading="lazy"
                      />
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                      {service.servicename || service.serviceCategory || 'Service'}
                    </h3>
                    <span className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--purple-primary)]">
                      {service.serviceCategory || 'Uncategorized'}
                    </span>
                    <p className="mt-2 line-clamp-3 text-sm text-[var(--text-secondary)]">
                      {service.description || 'No description provided.'}
                    </p>

                    {service.subCategories?.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-xs font-medium text-[var(--text-secondary)]">
                          Sub-categories
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {service.subCategories.map((sub) => (
                            <span key={sub} className={chipClass}>
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {service.keywords?.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-xs font-medium text-[var(--text-secondary)]">Keywords</p>
                        <div className="flex flex-wrap gap-1.5">
                          {service.keywords.map((keyword) => (
                            <span
                              key={keyword}
                              className="rounded-full border border-purple-100/60 bg-white px-2 py-1 text-xs text-[var(--text-secondary)]"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-5 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdate(service._id)}
                        className={btnPrimary}
                      >
                        <Pencil className="h-4 w-4" />
                        Update
                      </button>
                      <button
                        type="button"
                        onClick={() => setServiceToRemove(service)}
                        disabled={deletingId === service._id}
                        className={btnDanger}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {serviceToRemove && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !deletingId && setServiceToRemove(null)}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border border-purple-100/50 bg-white/95 p-6 shadow-xl shadow-purple-500/10 backdrop-blur-sm sm:p-8"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-[var(--text-primary)] sm:text-xl">
                Remove this service?
              </h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                This action will permanently delete{' '}
                <span className="font-semibold text-[var(--text-primary)]">
                  {serviceToRemove.serviceCategory}
                </span>
                . You won&apos;t be able to recover it later.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className={btnSecondary}
                  onClick={() => setServiceToRemove(null)}
                  disabled={deletingId === serviceToRemove._id}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`${btnDanger} sm:min-w-[8rem] ${
                    deletingId === serviceToRemove._id ? 'opacity-50' : ''
                  }`}
                  onClick={handleDelete}
                  disabled={deletingId === serviceToRemove._id}
                >
                  {deletingId === serviceToRemove._id ? 'Removing…' : 'Yes, remove'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ManageServices;
