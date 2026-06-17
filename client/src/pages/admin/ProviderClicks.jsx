import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProviderClicks } from '../../features/adminSlice';
import { BarChart3, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullName } from '../../utils/userHelpers';

const PAGE_SIZE = 10;

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

const ProviderClicks = () => {
  const dispatch = useDispatch();
  const { providerClicks, providerClicksPagination, isLoading, error } = useSelector(
    (state) => state.admin
  );
  const [expandedProviders, setExpandedProviders] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(getProviderClicks({ page: currentPage, limit: PAGE_SIZE }));
  }, [dispatch, currentPage]);

  useEffect(() => {
    setExpandedProviders(new Set());
  }, [currentPage]);

  const toggleProvider = (providerId) => {
    setExpandedProviders((prev) => {
      const next = new Set(prev);
      if (next.has(providerId)) {
        next.delete(providerId);
      } else {
        next.add(providerId);
      }
      return next;
    });
  };

  const pagination = providerClicksPagination || {
    currentPage: 1,
    totalPages: 1,
    totalProviders: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: PAGE_SIZE,
  };

  if (isLoading && providerClicks.length === 0) {
    return (
      <motion.div
        className="flex min-h-screen items-center justify-center bg-[var(--background-subtle)] px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-full max-w-sm rounded-2xl border border-purple-100/50 bg-white/80 p-8 text-center shadow-sm shadow-purple-500/5">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-purple-100 border-t-[var(--purple-primary)]" />
          <p className="text-sm font-medium text-[var(--text-primary)]">Loading provider clicks…</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">Fetching analytics data.</p>
        </div>
      </motion.div>
    );
  }

  if (error && providerClicks.length === 0) {
    return (
      <motion.div
        className="flex min-h-screen items-center justify-center bg-[var(--background-subtle)] px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-full max-w-sm rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-sm font-semibold text-red-600">Error: {error}</p>
          <button
            type="button"
            onClick={() => dispatch(getProviderClicks({ page: currentPage, limit: PAGE_SIZE }))}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all"
          >
            Try again
          </button>
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
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--purple-primary)]">
            Admin analytics
          </p>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
            Provider Clicks
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Cumulative profile and service clicks per provider. Click a row to expand services.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-5 px-4 py-8 sm:px-6 sm:py-10">
        <Section
          title="Click breakdown"
          description={
            pagination.totalProviders > 0
              ? `${pagination.totalProviders} provider${pagination.totalProviders !== 1 ? 's' : ''} tracked · page ${pagination.currentPage} of ${pagination.totalPages}`
              : 'No provider data yet.'
          }
          icon={BarChart3}
        >
          <div className="overflow-hidden rounded-xl border border-purple-100/50">
            <div className="hidden border-b border-purple-100 bg-purple-50/40 px-4 py-3 md:block sm:px-5">
              <div className="grid grid-cols-12 items-center gap-4">
                <div className="col-span-5 text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                  Provider
                </div>
                <div className="col-span-2 text-center text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                  Total clicks
                </div>
                <div className="col-span-2 text-center text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                  Services
                </div>
                <div className="col-span-3" />
              </div>
            </div>

            <div className="divide-y divide-purple-50">
              {isLoading ? (
                <div className="px-4 py-12 text-center sm:px-5">
                  <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-purple-100 border-t-[var(--purple-primary)]" />
                  <p className="text-sm text-[var(--text-secondary)]">Updating…</p>
                </div>
              ) : providerClicks.length > 0 ? (
                providerClicks.map((providerData, index) => {
                  const providerId = providerData.provider._id;
                  const isExpanded = expandedProviders.has(providerId);
                  const providerName = getFullName(providerData.provider.user);

                  return (
                    <div key={providerId}>
                      <motion.button
                        type="button"
                        className="w-full px-4 py-3 text-left transition-colors hover:bg-purple-50/40 sm:px-5 sm:py-3.5"
                        onClick={() => toggleProvider(providerId)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                      >
                        <div className="flex items-center justify-between gap-3 md:hidden">
                          <p className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--text-primary)]">
                            {providerName}
                          </p>
                          <div className="flex shrink-0 items-center gap-4">
                            <div className="text-right">
                              <p className="text-[10px] text-[var(--text-secondary)]">Clicks</p>
                              <p className="text-sm font-semibold text-[var(--purple-primary)]">
                                {providerData.totalClicks || 0}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-[var(--text-secondary)]">Services</p>
                              <p className="text-sm text-[var(--text-primary)]">
                                {providerData.serviceCount || 0}
                              </p>
                            </div>
                            <ChevronDown
                              className={`h-4 w-4 text-[var(--text-secondary)] transition-transform ${
                                isExpanded ? 'rotate-180' : '-rotate-90'
                              }`}
                            />
                          </div>
                        </div>

                        <div className="hidden grid-cols-12 items-center gap-4 md:grid">
                          <div className="col-span-5">
                            <p className="text-sm font-medium text-[var(--text-primary)]">{providerName}</p>
                          </div>
                          <div className="col-span-2 text-center">
                            <p className="text-base font-semibold text-[var(--purple-primary)]">
                              {providerData.totalClicks || 0}
                            </p>
                          </div>
                          <div className="col-span-2 text-center text-sm text-[var(--text-secondary)]">
                            {providerData.serviceCount || 0}
                          </div>
                          <div className="col-span-3 flex justify-end">
                            <ChevronDown
                              className={`h-4 w-4 text-[var(--text-secondary)] transition-transform ${
                                isExpanded ? 'rotate-180' : '-rotate-90'
                              }`}
                            />
                          </div>
                        </div>
                      </motion.button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden bg-purple-50/30"
                          >
                            <div className="px-4 py-4 sm:px-5">
                              {providerData.services?.length > 0 ? (
                                <>
                                  <div className="space-y-2 md:hidden">
                                    {providerData.services.map((service) => (
                                      <div
                                        key={service._id}
                                        className="rounded-xl border border-purple-100/50 bg-white p-3"
                                      >
                                        <div className="flex items-start justify-between gap-3">
                                          <p className="flex-1 text-sm font-medium text-[var(--text-primary)]">
                                            {service.servicename || 'Unnamed Service'}
                                          </p>
                                          <span className="shrink-0 text-sm font-semibold text-[var(--purple-primary)]">
                                            {service.serviceOfferingCount || 0}
                                          </span>
                                        </div>
                                        <p className="mt-1 text-xs text-[var(--text-secondary)]">
                                          {service.serviceCategory || 'Uncategorized'}
                                        </p>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="hidden md:block ml-5 border-l-2 border-purple-200 pl-5">
                                    <div className="mb-2 grid grid-cols-12 gap-4 border-b border-purple-100 pb-2">
                                      <div className="col-span-5 text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                                        Service
                                      </div>
                                      <div className="col-span-2 text-center text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                                        Clicks
                                      </div>
                                      <div className="col-span-5 text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                                        Category
                                      </div>
                                    </div>
                                    {providerData.services.map((service) => (
                                      <div
                                        key={service._id}
                                        className="grid grid-cols-12 gap-4 rounded-lg px-2 py-2 hover:bg-white/60"
                                      >
                                        <div className="col-span-5 text-sm text-[var(--text-primary)]">
                                          {service.servicename || 'Unnamed Service'}
                                        </div>
                                        <div className="col-span-2 text-center text-sm font-semibold text-[var(--purple-primary)]">
                                          {service.serviceOfferingCount || 0}
                                        </div>
                                        <div className="col-span-5 text-sm text-[var(--text-secondary)]">
                                          {service.serviceCategory || 'Uncategorized'}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              ) : (
                                <p className="text-sm italic text-[var(--text-secondary)] md:ml-5 md:border-l-2 md:border-purple-200 md:pl-5">
                                  No services found for this provider.
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-12 text-center text-sm text-[var(--text-secondary)] sm:px-5">
                  No provider data available.
                </div>
              )}
            </div>
          </div>
        </Section>

        {pagination.totalProviders > 0 && (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[var(--text-secondary)]">
              Showing page {pagination.currentPage} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage || isLoading}
                className="inline-flex items-center gap-1 rounded-xl border border-purple-100 px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!pagination.hasNextPage || isLoading}
                className="inline-flex items-center gap-1 rounded-xl border border-purple-100 px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProviderClicks;
