import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  Building2,
  Check,
  Globe,
  Mail,
  MapPin,
  Phone,
  X,
} from 'lucide-react';
import { fetchCommunityLocalBusinessById } from '../../features/communitySlice';

const cardClass =
  'rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm shadow-purple-500/5 backdrop-blur-sm sm:p-6';
const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-purple-100 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition-colors hover:bg-purple-50 disabled:opacity-60';

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString();
};

const CommunityLocalBusinessDetail = () => {
  const { businessId } = useParams();
  const dispatch = useDispatch();
  const {
    localBusinessDetail: business,
    localBusinessDetailLoading,
    localBusinessDetailError,
  } = useSelector((state) => state.community);

  useEffect(() => {
    if (businessId) dispatch(fetchCommunityLocalBusinessById(businessId));
  }, [dispatch, businessId]);

  if (localBusinessDetailLoading) {
    return <div className="p-6 text-sm text-[var(--text-secondary)]">Loading business…</div>;
  }

  if (localBusinessDetailError || !business) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {localBusinessDetailError || 'Business not found.'}
        </div>
        <Link to="/community/local-businesses" className={btnGhost}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>
    );
  }

  const phoneHref = business.contactNumber ? `tel:${business.contactNumber}` : null;
  const mailHref = business.email ? `mailto:${business.email}` : null;
  const mapsHref = business.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <Link to="/community/local-businesses" className={btnGhost}>
        <ArrowLeft className="h-4 w-4" />
        Back to listing
      </Link>

      <div className="overflow-hidden rounded-2xl border border-purple-100/60 bg-white/90 shadow-sm">
        {business.bannerUrl ? (
          <img src={business.bannerUrl} alt="" className="h-40 w-full object-cover sm:h-52" />
        ) : (
          <div className="h-28 bg-gradient-to-r from-purple-50 to-fuchsia-50" />
        )}
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt=""
                className="h-14 w-14 rounded-xl border border-purple-100 object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-50 text-[var(--purple-primary)]">
                <Building2 className="h-6 w-6" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-[var(--text-primary)]">{business.businessName}</h1>
              <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                {(business.businessCategories || []).join(' · ')}
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--purple-primary)]">Community Offer</p>
            </div>
          </div>

          {business.description ? (
            <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">{business.description}</p>
          ) : null}
        </div>
      </div>

      <section className={cardClass}>
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Discount eligibility</h2>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Valid {formatDate(business.discountStartDate)} – {formatDate(business.discountEndDate)}
          {business.discountActive ? '' : ' · currently not active'}
        </p>
        <div className="mt-4 space-y-2">
          {(business.offerEligibility || []).map((item) => (
            <div
              key={`${item.name}-${item.eligible}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-purple-100/70 bg-white/70 px-3.5 py-2.5"
            >
              <span className="inline-flex items-center gap-2 text-sm text-[var(--text-primary)]">
                {item.eligible ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                {item.name}
              </span>
              <span
                className={`text-xs font-semibold ${
                  item.eligible ? 'text-emerald-700' : 'text-[var(--text-secondary)]'
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
          {!business.offerEligibility?.length ? (
            <p className="text-sm text-[var(--text-secondary)]">No service eligibility configured.</p>
          ) : null}
        </div>
      </section>

      <section className={`${cardClass} space-y-3`}>
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Contact & location</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-purple-100/70 bg-white/70 px-3.5 py-2.5">
            <p className="text-[11px] font-semibold text-[var(--text-secondary)]">Owner</p>
            <p className="mt-0.5 text-sm font-medium text-[var(--text-primary)]">{business.ownerName}</p>
          </div>
          <div className="rounded-xl border border-purple-100/70 bg-white/70 px-3.5 py-2.5">
            <p className="text-[11px] font-semibold text-[var(--text-secondary)]">Phone</p>
            <p className="mt-0.5 text-sm font-medium text-[var(--text-primary)]">
              {business.contactNumber || '—'}
            </p>
          </div>
          <div className="rounded-xl border border-purple-100/70 bg-white/70 px-3.5 py-2.5 sm:col-span-2">
            <p className="text-[11px] font-semibold text-[var(--text-secondary)]">Address</p>
            <p className="mt-0.5 text-sm font-medium text-[var(--text-primary)]">{business.address}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <a href={phoneHref || undefined} className={`${btnGhost} ${phoneHref ? '' : 'pointer-events-none opacity-50'}`}>
            <Phone className="h-4 w-4 text-[var(--purple-primary)]" />
            Call
          </a>
          <a href={mailHref || undefined} className={`${btnGhost} ${mailHref ? '' : 'pointer-events-none opacity-50'}`}>
            <Mail className="h-4 w-4 text-[var(--purple-primary)]" />
            Email
          </a>
          <a
            href={mapsHref || undefined}
            target="_blank"
            rel="noreferrer"
            className={`${btnGhost} ${mapsHref ? '' : 'pointer-events-none opacity-50'}`}
          >
            <MapPin className="h-4 w-4 text-[var(--purple-primary)]" />
            Location
          </a>
          {business.website ? (
            <a href={business.website} target="_blank" rel="noreferrer" className={btnGhost}>
              <Globe className="h-4 w-4 text-[var(--purple-primary)]" />
              Website
            </a>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default CommunityLocalBusinessDetail;
