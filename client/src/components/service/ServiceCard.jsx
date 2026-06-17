import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight, Heart, ImageIcon, Star } from 'lucide-react';
import { addToWishlist, removeFromWishlist } from '../../features/wishlistSlice';
import { toast } from 'react-hot-toast';
import { getFullName } from '../../utils/userHelpers';
import ProfileAvatar from '../ProfileAvatar';

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const wishlistIds = useSelector((s) => s.wishlist.ids);
  const [imageError, setImageError] = useState(false);

  const serviceName = service?.servicename || '';
  const fullDescription = service?.description || 'No description available.';

  const portfolioImages = service?.portfolioImages || [];
  const mainImage = portfolioImages[0]?.url || '/CommuN-logo.png';

  const provider = service?.provider || {};
  const providerUser = provider?.user || {};
  const providerName = getFullName(providerUser) || 'Unknown Provider';

  const averageRating = service?.averageRating || 0;
  const reviewCount = service?.reviewCount || 0;

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      const filled = i < fullStars || (i === fullStars && hasHalfStar);
      stars.push(
        <Star
          key={i}
          className={`h-3 w-3 ${
            filled ? 'fill-amber-400 text-amber-400' : 'fill-purple-100 text-purple-100'
          }`}
          style={i === fullStars && hasHalfStar ? { opacity: 0.5 } : undefined}
        />
      );
    }
    return stars;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleCardClick = () => {
    navigate(`/service/${service._id}`);
  };

  const isInWishlist = wishlistIds?.includes(service._id);
  const onToggleWishlist = (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to add services to your wishlist');
      navigate('/login');
      return;
    }
    if (isInWishlist) {
      dispatch(removeFromWishlist(service._id));
    } else {
      dispatch(addToWishlist(service._id));
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-purple-100/50 bg-white/80 shadow-md shadow-purple-500/5 backdrop-blur-sm transition-all duration-200 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-500/10"
    >
      <div className="service-image-zoom relative h-44 shrink-0 overflow-hidden bg-gradient-to-br from-purple-50 to-fuchsia-50/50">
        <button
          type="button"
          onClick={onToggleWishlist}
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-purple-100 bg-white/90 shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:border-purple-200"
        >
          <Heart
            className={`h-4 w-4 ${
              isInWishlist ? 'fill-red-500 text-red-500' : 'text-[var(--purple-primary)]'
            }`}
          />
        </button>

        {mainImage && !imageError ? (
          <img
            src={mainImage}
            alt="Service portfolio"
            className="service-image-zoom__img h-full w-full object-contain p-3"
            onError={handleImageError}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-14 w-14 text-purple-200" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 line-clamp-1 min-h-[1.25rem] text-sm font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--purple-primary)]">
          {serviceName || service?.serviceCategory || 'Service'}
        </h3>

        <div className="mb-2 flex min-h-[1.25rem] items-center gap-1.5">
          <div className="flex items-center gap-0.5">{renderStars()}</div>
          <span className="text-xs font-semibold text-[var(--text-primary)]">
            {averageRating.toFixed(1)}
          </span>
          <span className="text-xs text-[var(--text-secondary)]">
            ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
          </span>
        </div>

        <p className="mb-3 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-[var(--text-secondary)]">
          {fullDescription}
        </p>

        <div className="mb-3 flex min-h-[1.75rem] items-center gap-2">
          <ProfileAvatar user={providerUser} size="smd" className="shrink-0" />
          <p className="min-w-0 truncate text-xs text-[var(--text-secondary)]">{providerName}</p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/service/${service._id}`);
          }}
          className="mt-auto flex w-full shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-3 py-2.5 text-xs font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90"
        >
          View Details
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;
