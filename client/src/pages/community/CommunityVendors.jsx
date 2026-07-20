import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, Users2 } from 'lucide-react';
import { fetchCommunityVendors } from '../../features/communitySlice';
import { formatCommunDisplayName } from '../../utils/communName';

const cardClass =
  'rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm shadow-purple-500/5 backdrop-blur-sm sm:p-6';

const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-purple-100 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition-colors hover:bg-purple-50 disabled:opacity-60';

const VendorCard = ({ vendor }) => {
  const phoneHref = vendor.phone ? `tel:${vendor.phone}` : null;
  const mailHref = vendor.email ? `mailto:${vendor.email}` : null;

  return (
    <motion.div
      layout
      className="relative overflow-hidden rounded-2xl border border-purple-100/60 bg-white/90 p-5 shadow-sm shadow-purple-500/5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
    >
      <div className="absolute -right-24 -top-24 h-44 w-44 rounded-full bg-gradient-to-br from-purple-100 to-fuchsia-100 opacity-70 blur-2xl" />
      <div className="relative">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-[var(--text-primary)] sm:text-base">{vendor.name}</h3>
          <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">{vendor.service || vendor.category}</p>
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

const CommunityVendors = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { vendors, vendorsLoading, vendorsError, vendorsMeta } = useSelector((state) => state.community);
  const [selectedCategory, setSelectedCategory] = useState('');

  const userCommunityHandle = (user?.communityCommunName || '').trim().toLowerCase();

  useEffect(() => {
    if (userCommunityHandle) {
      dispatch(fetchCommunityVendors());
    }
  }, [dispatch, userCommunityHandle]);

  const vendorsByCategory = useMemo(() => vendors?.vendorsByCategory || {}, [vendors?.vendorsByCategory]);

  const scopedVendorsByCategory = useMemo(() => {
    if (!userCommunityHandle) return {};
    const scoped = {};
    Object.entries(vendorsByCategory).forEach(([category, list]) => {
      const filtered = (list || []).filter(
        (vendor) => String(vendor.communityCommunName || '').trim().toLowerCase() === userCommunityHandle
      );
      if (filtered.length) scoped[category] = filtered;
    });
    return scoped;
  }, [vendorsByCategory, userCommunityHandle]);

  const scopedCategories = useMemo(
    () => Object.keys(scopedVendorsByCategory).sort((a, b) => a.localeCompare(b)),
    [scopedVendorsByCategory]
  );

  const selectedVendors = useMemo(() => {
    if (!selectedCategory) return [];
    return scopedVendorsByCategory[selectedCategory] || [];
  }, [scopedVendorsByCategory, selectedCategory]);

  useEffect(() => {
    if (!selectedCategory && scopedCategories.length) setSelectedCategory(scopedCategories[0]);
    if (selectedCategory && !scopedCategories.includes(selectedCategory)) setSelectedCategory('');
  }, [scopedCategories, selectedCategory]);

  const communityLabel = userCommunityHandle
    ? formatCommunDisplayName(userCommunityHandle)
    : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
          <Users2 className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-[var(--text-primary)] sm:text-xl">Vendors</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {communityLabel
              ? `Showing vendors for ${communityLabel} only.`
              : 'Vendors are available only for your joined community.'}
          </p>
        </div>
      </div>

      {(vendorsMeta?.needsCommunity || !userCommunityHandle) && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          You are not part of a community yet, so vendors from other communities will not be shown.
        </div>
      )}

      {vendorsError && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{String(vendorsError)}</div>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className={cardClass}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">Categories</h2>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">Select your category to view vendors.</p>
            </div>
            <button type="button" className={btnGhost} onClick={() => dispatch(fetchCommunityVendors())} disabled={vendorsLoading}>
              Refresh
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {vendorsLoading && (
              <div className="col-span-full rounded-2xl border border-purple-100 bg-white/70 px-4 py-3 text-sm text-[var(--text-secondary)]">
                Loading…
              </div>
            )}
            {!vendorsLoading && scopedCategories.length === 0 && (
              <div className="col-span-full rounded-2xl border border-purple-100 bg-white/70 px-4 py-3 text-sm text-[var(--text-secondary)]">
                No vendors available in your community right now.
              </div>
            )}
            {scopedCategories.map((c) => {
              const count = (scopedVendorsByCategory[c] || []).length;
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
          <p className="mt-1 text-xs text-[var(--text-secondary)]">Tap Call / Email to contact directly.</p>

          <div className="mt-4">
            {!vendorsLoading && selectedCategory && selectedVendors.length === 0 && (
              <div className="rounded-2xl border border-purple-100 bg-white/70 px-4 py-3 text-sm text-[var(--text-secondary)]">
                No vendors in this category.
              </div>
            )}

            <AnimatePresence>
              {selectedCategory && (
                <motion.div layout className="grid grid-cols-1 gap-3">
                  {selectedVendors.map((v) => (
                    <VendorCard key={v._id} vendor={v} />
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

export default CommunityVendors;

