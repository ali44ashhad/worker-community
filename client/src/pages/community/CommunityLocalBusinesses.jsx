import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Percent, Search } from 'lucide-react';
import { fetchCommunityLocalBusinesses } from '../../features/communitySlice';
import { formatCommunDisplayName } from '../../utils/communName';

const cardClass =
  'rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm shadow-purple-500/5 backdrop-blur-sm sm:p-6';
const inputBase =
  'w-full rounded-xl border border-purple-100 bg-white/90 px-3.5 py-2.5 text-sm text-[var(--text-primary)] shadow-sm outline-none transition focus:border-purple-300 focus:ring-2 focus:ring-purple-100';

const CommunityLocalBusinesses = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const {
    localBusinesses,
    localBusinessesLoading,
    localBusinessesError,
    localBusinessesMeta,
  } = useSelector((state) => state.community);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const userCommunityHandle = (user?.communityCommunName || '').trim().toLowerCase();

  useEffect(() => {
    if (!userCommunityHandle) return;
    const timer = setTimeout(() => {
      dispatch(fetchCommunityLocalBusinesses({ search, category }));
    }, 250);
    return () => clearTimeout(timer);
  }, [dispatch, userCommunityHandle, search, category]);

  const scopedBusinesses = useMemo(() => {
    if (!userCommunityHandle) return [];
    return (localBusinesses || [])
      .filter(
        (b) => String(b.communityCommunName || '').trim().toLowerCase() === userCommunityHandle
      )
      .sort((a, b) => {
        const pctA = Number(a.discountPercentage) || 0;
        const pctB = Number(b.discountPercentage) || 0;
        if (pctB !== pctA) return pctB - pctA;
        if (Boolean(a.discountActive) !== Boolean(b.discountActive)) {
          return a.discountActive ? -1 : 1;
        }
        return String(a.businessName || '').localeCompare(String(b.businessName || ''));
      });
  }, [localBusinesses, userCommunityHandle]);

  const categoryOptions = useMemo(() => {
    const set = new Set();
    scopedBusinesses.forEach((b) => (b.businessCategories || []).forEach((c) => set.add(c)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [scopedBusinesses]);

  if (!userCommunityHandle) {
    return (
      <div className="mx-auto max-w-4xl p-4 sm:p-6">
        <div className={cardClass}>
          <p className="text-sm text-[var(--text-secondary)]">
            Join a community to browse local business offers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <div className={cardClass}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)] sm:text-xl">
              Local Business Listing
            </h1>
            <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
              Exclusive community offers in {formatCommunDisplayName(userCommunityHandle)}.
            </p>
          </div>
        </div>
      </div>

      <div className={`${cardClass} grid grid-cols-1 gap-3 md:grid-cols-2`}>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">Search</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              className={`${inputBase} pl-9`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search businesses…"
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
      </div>

      {localBusinessesError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {localBusinessesError}
        </div>
      ) : null}

      {localBusinessesLoading ? (
        <div className={`${cardClass} text-sm text-[var(--text-secondary)]`}>Loading businesses…</div>
      ) : scopedBusinesses.length === 0 ? (
        <div className={`${cardClass} text-sm text-[var(--text-secondary)]`}>
          {localBusinessesMeta?.needsCommunity
            ? 'No community assigned yet.'
            : 'No participating businesses right now.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {scopedBusinesses.map((business) => (
              <motion.div
                key={business._id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="overflow-hidden rounded-2xl border border-purple-100/60 bg-white/90 shadow-sm"
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
                      <h3 className="truncate text-base font-semibold text-[var(--text-primary)]">
                        {business.businessName}
                      </h3>
                      <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                        {(business.businessCategories || []).join(' · ')}
                      </p>
                      {business.discountActive ? (
                        <p className="mt-2 inline-flex items-center gap-1 rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                          <Percent className="h-3.5 w-3.5" />
                          Community Offer · {business.discountPercentage}% Off
                        </p>
                      ) : (
                        <p className="mt-2 text-xs text-[var(--text-secondary)]">Offer not active currently</p>
                      )}
                    </div>
                  </div>
                  <Link
                    to={`/community/local-businesses/${business._id}`}
                    className="mt-4 inline-flex text-sm font-semibold text-[var(--purple-primary)] hover:underline"
                  >
                    View details & eligibility
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default CommunityLocalBusinesses;
