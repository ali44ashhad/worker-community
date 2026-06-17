import React, { useState } from 'react';
import { ArrowRight, ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getFullName, formatAddress } from '../../utils/userHelpers';
import ProfileAvatar from '../ProfileAvatar';

const chipClass =
  'rounded-full border border-purple-100 bg-purple-50/50 px-2.5 py-1 text-xs font-medium text-[var(--purple-primary)]';

const ProviderCard = ({ provider }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const userName = getFullName(provider?.user) || 'Unknown Provider';
  const bio = provider?.bio || 'No bio available.';
  const experience = provider?.experience || 0;
  const services = provider?.serviceOfferings || [];
  const address = formatAddress(provider?.user) || '';

  const firstService = services[0];
  const portfolioImage = firstService?.portfolioImages?.[0]?.url;

  const categories = [...new Set(services.map((s) => s.serviceCategory))];
  const primaryCategory = categories[0] || 'Provider';

  const keywords = services.flatMap((s) => s.keywords || []).slice(0, 4);

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-purple-100/50 bg-white/80 shadow-md shadow-purple-500/5 backdrop-blur-sm transition-all duration-200 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-500/10">
      <div className="relative flex h-44 shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 to-fuchsia-50/50 p-3">
        {portfolioImage && !imageError ? (
          <img
            src={portfolioImage}
            alt={`${userName}'s portfolio`}
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            onError={() => setImageError(true)}
          />
        ) : (
          <ImageIcon className="h-14 w-14 text-purple-200" />
        )}

        {experience > 0 && (
          <div className="absolute right-3 top-3 rounded-full border border-purple-100/80 bg-white/95 px-3 py-1 text-xs font-semibold text-[var(--purple-primary)] shadow-sm backdrop-blur-sm">
            {experience}+ Years
          </div>
        )}

        <div className="absolute left-3 top-3 max-w-[calc(100%-6rem)] truncate rounded-full border border-purple-100/80 bg-white/95 px-3 py-1 text-xs font-semibold text-[var(--text-primary)] shadow-sm backdrop-blur-sm">
          {primaryCategory}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-4 flex min-h-[4.5rem] items-start gap-3">
          <ProfileAvatar user={provider?.user} size="lg" className="shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--purple-primary)]">
              {userName}
            </h3>
            <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm leading-snug text-[var(--text-secondary)]">
              {bio}
            </p>
            <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">{address || '\u00A0'}</p>
          </div>
        </div>

        <p className="mb-3 min-h-[1.25rem] text-sm font-medium text-[var(--text-primary)]">
          {services.length > 0
            ? `${services.length} ${services.length === 1 ? 'Service' : 'Services'}`
            : '\u00A0'}
        </p>

        <div className="mb-3 flex min-h-[3.25rem] flex-wrap content-start gap-1.5">
          {keywords.map((keyword, index) => (
            <span key={`${keyword}-${index}`} className={chipClass}>
              {keyword}
            </span>
          ))}
          {services.length > 0 && keywords.length > 0 && (
            <span className="rounded-full border border-purple-100/60 bg-white px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
              +{services.length} more
            </span>
          )}
        </div>

        <div className="mb-4 flex min-h-[1.75rem] flex-wrap gap-1.5">
          {categories.slice(0, 3).map((category) => (
            <span
              key={category}
              className="rounded-full border border-purple-100/60 bg-white px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]"
            >
              {category}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => navigate(`/provider/${provider._id}`)}
          className="mt-auto flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90"
        >
          View Profile
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};

export default ProviderCard;
