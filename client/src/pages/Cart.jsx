import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllProviders } from '../features/providerSlice';
import { fetchWishlist, removeFromWishlist } from '../features/wishlistSlice';
import { ArrowRight, Heart, ImageIcon, MessageCircle, X } from 'lucide-react';
import { getFullName, getInitials } from '../utils/userHelpers';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
axios.defaults.withCredentials = true;

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isPanelRoute = location.pathname.startsWith('/community/');
  const { allProviders, isFetchingAll } = useSelector((s) => s.provider);
  const wishlistIds = useSelector((s) => s.wishlist.ids);
  const user = useSelector((s) => s.auth.user);

  useEffect(() => {
    if (allProviders.length === 0) dispatch(getAllProviders());
  }, [dispatch, allProviders.length]);

  useEffect(() => {
    if (user) dispatch(fetchWishlist());
  }, [dispatch, user]);

  const wishlistServices = useMemo(() => {
    const out = [];
    for (const provider of allProviders || []) {
      for (const offering of provider?.serviceOfferings || []) {
        if (wishlistIds.includes(offering._id)) {
          out.push({ ...offering, provider });
        }
      }
    }
    return out;
  }, [allProviders, wishlistIds]);

  const handleRemove = async (serviceId, e) => {
    e.stopPropagation();
    await dispatch(removeFromWishlist(serviceId));
  };

  const handleServiceClick = (serviceId) => {
    navigate(`/service/${serviceId}`);
  };

  const handleContactProvider = async (
    serviceId,
    providerId,
    providerName,
    providerPhoneNumber
  ) => {
    if (!user) {
      toast.error('Please login to continue with your order');
      navigate('/login');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/service-offering/${serviceId}/increment-count`);
    } catch (error) {
      console.error('Failed to increment service offering count:', error);
    }

    try {
      await axios.post(`${API_URL}/api/provider-profile/${providerId}/increment-count`);
    } catch (error) {
      console.error('Failed to increment provider profile count:', error);
    }

    if (providerPhoneNumber) {
      const cleanPhoneNumber = providerPhoneNumber.replace(/\D/g, '');
      const loggedInUserName = getFullName(user);
      const message = `Hi ${providerName}, this is ${loggedInUserName}! I viewed your profile on Commun and would like to know more about your services. Could you please provide more details?`;
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`, '_blank');
    } else {
      navigate('/contact');
    }
  };

  if (!user) {
    return (
      <div className="home-page flex min-h-screen items-center justify-center bg-[var(--background-subtle)] px-4 pt-20">
        <div className="w-full max-w-sm rounded-2xl border border-purple-100/50 bg-white/80 p-8 text-center shadow-lg shadow-purple-500/5">
          <Heart className="mx-auto mb-4 h-10 w-10 text-purple-300" />
          <h1 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">Wishlist</h1>
          <p className="mb-6 text-sm text-[var(--text-secondary)]">
            Please sign in to view your saved services.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="home-page min-h-screen bg-[var(--background-subtle)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <section
        className={`border-b border-purple-100/60 bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20 pb-8 ${
          isPanelRoute ? 'pt-6' : 'pt-24 sm:pt-28'
        }`}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-2 inline-block rounded-full bg-gradient-to-r from-purple-100 to-fuchsia-100 px-3 py-1.5">
            <span className="text-xs font-semibold bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent">
              Saved for later
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
            Your Wishlist
            {!isFetchingAll && (
              <span className="ml-2 text-lg font-medium text-[var(--purple-primary)]">
                ({wishlistServices.length})
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Services you&apos;ve saved — reach out to providers when you&apos;re ready.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        {isFetchingAll ? (
          <div className="rounded-2xl border border-purple-100/50 bg-white/80 p-10 text-center shadow-sm shadow-purple-500/5">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-purple-100 border-t-[var(--purple-primary)]" />
            <p className="text-sm font-medium text-[var(--text-primary)]">Loading your wishlist…</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Fetching your saved services.
            </p>
          </div>
        ) : wishlistServices.length === 0 ? (
          <div className="rounded-2xl border border-purple-100/50 bg-white/80 p-10 text-center shadow-lg shadow-purple-500/5 sm:p-12">
            <Heart className="mx-auto mb-4 h-12 w-12 text-purple-200" />
            <p className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
              Your wishlist is empty
            </p>
            <p className="mb-6 text-sm text-[var(--text-secondary)]">
              Browse local services and tap the heart to save ones you like.
            </p>
            <button
              type="button"
              onClick={() => navigate('/service')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-purple-500/20 hover:opacity-90 transition-all"
            >
              Explore Services
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {wishlistServices.map((service) => {
              const image = service?.portfolioImages?.[0]?.url;
              const title = service?.servicename || service?.serviceCategory || 'Service';
              const description = service?.description || '';
              const providerName = getFullName(service?.provider?.user) || 'Unknown Provider';
              const profileImage = service?.provider?.user?.profileImage;
              const providerPhoneNumber = service?.provider?.user?.phoneNumber || '';
              const providerId = service?.provider?._id;
              const truncatedDescription =
                description.length > 100 ? `${description.substring(0, 100)}...` : description;

              return (
                <div
                  key={service._id}
                  className="relative rounded-2xl border border-purple-100/50 bg-white/80 p-4 shadow-sm shadow-purple-500/5 transition-all hover:border-purple-200 hover:shadow-md sm:p-5"
                >
                  <button
                    type="button"
                    onClick={(e) => handleRemove(service._id, e)}
                    className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-purple-100 bg-white text-[var(--text-secondary)] transition-colors hover:bg-red-50 hover:text-red-500 sm:right-4 sm:top-4"
                    title="Remove from wishlist"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="flex flex-col gap-4 sm:flex-row sm:pr-10">
                    <button
                      type="button"
                      onClick={() => handleServiceClick(service._id)}
                      className="service-image-zoom h-28 w-full shrink-0 rounded-xl bg-gradient-to-br from-purple-50 to-fuchsia-50/50 sm:h-32 sm:w-32"
                    >
                      {image ? (
                        <img src={image} alt={title} className="service-image-zoom__img h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-purple-200" />
                        </div>
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => handleServiceClick(service._id)}
                        className="mb-1 line-clamp-1 text-left text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--purple-primary)] transition-colors"
                      >
                        {title}
                      </button>
                      <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                        {truncatedDescription}
                      </p>

                      <div className="mb-4 flex items-center gap-2">
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt={providerName}
                            className="h-6 w-6 rounded-full border border-[var(--purple-primary)]/30 object-cover"
                          />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[var(--purple-primary)] to-[var(--magenta)] text-[10px] font-semibold text-white">
                            {getInitials(service?.provider?.user)}
                          </div>
                        )}
                        <span className="truncate text-xs text-[var(--text-secondary)]">
                          {providerName}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContactProvider(
                            service._id,
                            providerId,
                            providerName,
                            providerPhoneNumber
                          );
                        }}
                        className="hidden w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] py-2 px-4 text-xs font-semibold text-white shadow-sm shadow-purple-500/20 hover:opacity-90 transition-all sm:inline-flex sm:w-auto"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Contact Provider
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContactProvider(
                        service._id,
                        providerId,
                        providerName,
                        providerPhoneNumber
                      );
                    }}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] py-2.5 px-4 text-xs font-semibold text-white shadow-sm shadow-purple-500/20 hover:opacity-90 transition-all sm:hidden"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Contact Provider
                  </button>
                </div>
              );
            })}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/service')}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-100 bg-white py-2.5 px-4 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-purple-50"
              >
                Continue browsing
                <ArrowRight className="h-4 w-4 text-[var(--purple-primary)]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Cart;
