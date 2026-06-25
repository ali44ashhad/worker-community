import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getAllProviders } from '../features/providerSlice';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Heart,
  ImageIcon,
  ArrowRight,
  Star,
} from 'lucide-react';
import Comment from '../components/Comment'; 
import { addToWishlist, removeFromWishlist, fetchWishlist } from '../features/wishlistSlice';
import { fetchCommentsByService } from '../features/commentSlice';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { motion } from 'framer-motion';
import { getFullName, formatAddress } from '../utils/userHelpers';
import ProfileAvatar from '../components/ProfileAvatar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
axios.defaults.withCredentials = true;

const Card = ({ children, className = '' }) => (
  <div
    className={`bg-white/80 backdrop-blur-sm border border-purple-100/50 rounded-3xl shadow-lg shadow-purple-500/5 ${className}`}
  >
    {children}
  </div>
);

const chipClass =
  'px-2.5 py-1 bg-purple-50 text-[var(--text-secondary)] rounded-full text-xs font-medium border border-purple-100';

const SpecificService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { allProviders } = useSelector((state) => state.provider);
  const user = useSelector((s) => s.auth.user);
  const wishlistIds = useSelector((s) => s.wishlist.ids);
  const comments = useSelector((state) => state.comments.byServiceId[id] || []);

  const [service, setService] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [showWhatsIncluded, setShowWhatsIncluded] = useState(false);

  const averageRating =
    comments.length > 0
      ? (comments.reduce((sum, c) => sum + (c.rating || 0), 0) / comments.length).toFixed(1)
      : null;
  const reviewCount = comments.length;

  useEffect(() => {
    if (allProviders.length === 0) {
      dispatch(getAllProviders());
    }
  }, [dispatch, allProviders.length]);

  useEffect(() => {
    if (user) dispatch(fetchWishlist());
  }, [dispatch, user]);

  useEffect(() => {
    if (id) {
      dispatch(fetchCommentsByService(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    const findService = () => {
      for (const provider of allProviders) {
        if (provider?.serviceOfferings && Array.isArray(provider.serviceOfferings)) {
          const foundService = provider.serviceOfferings.find((s) => s._id === id);
          if (foundService) {
            setService({
              ...foundService,
              provider: {
                ...provider,
                user: provider.user,
                _id: provider._id,
                bio: provider.bio,
                experience: provider.experience,
              },
            });
            return;
          }
        }
      }
    };

    if (allProviders.length > 0) {
      findService();
    }
  }, [allProviders, id]);

  if (!service) {
    return (
      <div className="home-page min-h-screen bg-[var(--background-subtle)] flex items-center justify-center">
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-100 border-t-[var(--purple-primary)] mx-auto mb-4" />
          <p className="text-xl font-semibold text-[var(--text-secondary)]">Loading service...</p>
        </motion.div>
      </div>
    );
  }

  const portfolioImages = service?.portfolioImages || [];
  const portfolioPDFs = service?.portfolioPDFs || [];
  const currentImage = portfolioImages[selectedImageIndex]?.url;
  const providerName = getFullName(service?.provider?.user) || 'Unknown Provider';
  const providerPhoneNumber = service?.provider?.user?.phoneNumber || '';
  const serviceDescription = service?.description || 'No description available.';
  const serviceCategory = service?.serviceCategory || '';
  const subCategories = service?.subCategories || [];
  const keywords = service?.keywords || [];
  const providerBio = service?.provider?.bio || '';
  const providerCreatedAt = service?.provider?.user?.createdAt;
  const serviceExperience = service?.experience || 0;
  const providerAddress = formatAddress(service?.provider?.user) || 'Address not provided';

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleNextImage = () => {
    if (portfolioImages.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % portfolioImages.length);
      setImageError(false);
    }
  };

  const handlePrevImage = () => {
    if (portfolioImages.length > 0) {
      setSelectedImageIndex((prev) => (prev - 1 + portfolioImages.length) % portfolioImages.length);
      setImageError(false);
    }
  };

  const handleOrderNow = async () => {
    if (!user) {
      toast.error('Please login to continue with your order');
      navigate('/login');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/service-offering/${id}/increment-count`);
    } catch (error) {
      console.error('Failed to increment service offering count:', error);
    }

    try {
      await axios.post(`${API_URL}/api/provider-profile/${service.provider._id}/increment-count`);
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

  const isInWishlist = wishlistIds?.includes(id);
  const onToggleWishlist = async () => {
    if (!user) {
      toast.error('Please login to add services to your wishlist');
      navigate('/login');
      return;
    }
    if (isInWishlist) {
      await dispatch(removeFromWishlist(id));
    } else {
      await dispatch(addToWishlist(id));
    }
  };

  return (
    <motion.div
      className="home-page min-h-screen bg-[var(--background-subtle)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-8 lg:pt-32 bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(217,70,239,0.05),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {serviceCategory && (
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-fuchsia-100 rounded-full mb-4">
              <span className="text-sm font-semibold bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent">
                {serviceCategory}
              </span>
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-br from-[var(--text-primary)] via-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent mb-3 leading-tight">
            {service?.servicename || serviceCategory || 'Service'}
          </h1>
          {subCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {subCategories.map((cat) => (
                <span key={cat} className={chipClass}>
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pb-16 bg-gradient-to-b from-white to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden">
                <div className="relative">
                  <div className="service-image-zoom relative h-[400px] sm:h-[500px] bg-gradient-to-br from-purple-50 to-fuchsia-50/50">
                    {currentImage && !imageError ? (
                      <img
                        src={currentImage}
                        alt={`Service portfolio ${selectedImageIndex + 1}`}
                        className="service-image-zoom__img h-full w-full object-contain p-4"
                        onError={handleImageError}
                      />
                    ) : (
                      <ImageIcon className="w-24 h-24 text-purple-200" />
                    )}

                    {portfolioImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border border-purple-100 rounded-full p-2 shadow-lg shadow-purple-500/10 transition-all"
                        >
                          <ChevronLeft className="w-5 h-5 text-[var(--purple-primary)]" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border border-purple-100 rounded-full p-2 shadow-lg shadow-purple-500/10 transition-all"
                        >
                          <ChevronRight className="w-5 h-5 text-[var(--purple-primary)]" />
                        </button>
                      </>
                    )}
                  </div>

                  {portfolioImages.length > 1 && (
                    <div className="p-4 border-t border-purple-100">
                      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                        {portfolioImages.map((img, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setSelectedImageIndex(index);
                              setImageError(false);
                            }}
                            className={`shrink-0 border-2 rounded-xl overflow-hidden transition-all ${
                              selectedImageIndex === index
                                ? 'border-[var(--purple-primary)] shadow-md shadow-purple-500/10'
                                : 'border-purple-100 hover:border-purple-300'
                            }`}
                          >
                            <div className="service-image-zoom h-20 w-20">
                              <img
                                src={img.url}
                                alt={`Thumbnail ${index + 1}`}
                                className="service-image-zoom__img h-full w-full object-cover"
                              />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {portfolioPDFs.length > 0 && (
                <Card className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[var(--purple-primary)]" />
                    Service related Documents
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {portfolioPDFs.map((pdf, index) => {
                      const pdfName = pdf.url.split('/').pop() || `Document ${index + 1}`;
                      return (
                        <a
                          key={index}
                          href={pdf.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 border border-purple-100 rounded-2xl hover:border-[var(--purple-primary)]/40 hover:bg-purple-50/50 transition-all group"
                        >
                          <div className="shrink-0 w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                            <FileText className="w-6 h-6 text-[var(--purple-primary)]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                              {pdfName}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)] mt-1">Click to view PDF</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-purple-300 group-hover:text-[var(--purple-primary)] transition-colors shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                </Card>
              )}

              <Card className="p-6 sm:p-8">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
                  Get to know {providerName}
                </h2>

                <div className="flex items-start gap-4 mb-6">
                  <div className="relative shrink-0">
                    <ProfileAvatar
                      user={service?.provider?.user}
                      size="2xl"
                      alt={providerName}
                      className="border-4 border-[var(--purple-primary)]"
                    />
                    <div className="absolute bottom-0 right-0 h-5 w-5 rounded-full border-2 border-white bg-emerald-500" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">{providerName}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-3">
                      Professional {serviceCategory} service provider
                    </p>

                    {averageRating && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.round(parseFloat(averageRating))
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-purple-100 text-purple-100'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                          {averageRating} ({reviewCount} reviews)
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleOrderNow}
                      className="w-full sm:w-auto bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white py-2.5 px-6 rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-md shadow-purple-500/20"
                    >
                      I&apos;m interested
                    </button>
                  </div>
                </div>

                <div className="border-t border-purple-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm gap-4">
                    <span className="text-[var(--text-secondary)] shrink-0">From:</span>
                    <span className="text-[var(--text-primary)] font-medium text-right">{providerAddress}</span>
                  </div>
                  {providerCreatedAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">Member since:</span>
                      <span className="text-[var(--text-primary)] font-medium">
                        {formatDate(providerCreatedAt)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Experience:</span>
                    <span className="text-[var(--text-primary)] font-medium">
                      {serviceExperience} year{serviceExperience !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {providerBio && (
                  <div className="mt-6 pt-6 border-t border-purple-100">
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                      {providerBio}
                    </p>
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <div className="mb-6">
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{serviceDescription}</p>
                </div>

                <div className="mb-6 border-t border-purple-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowWhatsIncluded(!showWhatsIncluded)}
                    className="w-full flex items-center justify-between text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--purple-primary)] transition-colors"
                  >
                    <span>What&apos;s Included</span>
                    {showWhatsIncluded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  {showWhatsIncluded && (
                    <div className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
                      <div className="flex items-start gap-2">
                        <span className="text-[var(--purple-primary)]">•</span>
                        <span>Professional {serviceCategory} service</span>
                      </div>
                      {serviceExperience > 0 && (
                        <div className="flex items-start gap-2">
                          <span className="text-[var(--purple-primary)]">•</span>
                          <span>
                            {serviceExperience} year{serviceExperience !== 1 ? 's' : ''} of experience
                          </span>
                        </div>
                      )}
                      {subCategories.length > 0 && (
                        <div className="flex items-start gap-2">
                          <span className="text-[var(--purple-primary)]">•</span>
                          <span>Specialized in: {subCategories.join(', ')}</span>
                        </div>
                      )}
                      {keywords.length > 0 && (
                        <div className="flex items-start gap-2">
                          <span className="text-[var(--purple-primary)]">•</span>
                          <span>
                            Keywords: {keywords.slice(0, 3).join(', ')}
                            {keywords.length > 3 ? '...' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleOrderNow}
                  className="w-full bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white py-3 px-4 rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-md shadow-purple-500/20"
                >
                  I&apos;m interested
                </button>

                <button
                  type="button"
                  onClick={onToggleWishlist}
                  className="w-full mt-3 bg-purple-50 text-[var(--text-primary)] py-2.5 px-4 rounded-xl font-medium text-sm hover:bg-purple-100 border border-purple-100 transition-all flex items-center justify-center gap-2"
                >
                  <Heart
                    className={`w-4 h-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-[var(--purple-primary)]'}`}
                  />
                  {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </button>
              </Card>
            </div>
          </div>

          <div className="mt-12">
            <Comment serviceId={id} />
          </div>
        </div>
      </section>
 
    </motion.div>
  );
};

export default SpecificService;
