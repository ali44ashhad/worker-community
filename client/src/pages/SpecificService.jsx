import React, { useState, useEffect, useMemo } from 'react';
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
  ArrowRight,
  Star,
  MapPin,
  Phone,
  Send,
  Check,
  Briefcase,
  Clock,
} from 'lucide-react';
import Comment from '../components/Comment';
import { addToWishlist, removeFromWishlist, fetchWishlist } from '../features/wishlistSlice';
import { fetchCommentsByService } from '../features/commentSlice';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { motion } from 'framer-motion';
import { getFullName, formatAddress } from '../utils/userHelpers';
import ProfileAvatar from '../components/ProfileAvatar';
import ServiceCover from '../components/service/ServiceCover';
import { getServiceDisplayImages } from '../utils/serviceImage';
import { usePageBreadcrumbs } from '../context/BreadcrumbContext';
import { slugifyCategoryName } from '../utils/slug';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
axios.defaults.withCredentials = true;

const TABS = [
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'location', label: 'Location' },
];

const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-purple-100/60 rounded-2xl shadow-sm ${className}`}>
    {children}
  </div>
);

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
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  const averageRating =
    comments.length > 0
      ? (comments.reduce((sum, c) => sum + (c.rating || 0), 0) / comments.length).toFixed(1)
      : null;
  const reviewCount = comments.length;

  const breadcrumbItems = useMemo(() => {
    if (!service) return null;
    const category = service?.serviceCategory;
    const name = service?.servicename || category || 'Service';
    const items = [];
    if (category) {
      items.push({ to: `/category/${slugifyCategoryName(category)}`, label: category });
    }
    items.push({ label: name });
    return items;
  }, [service]);

  usePageBreadcrumbs(breadcrumbItems);

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

  useEffect(() => {
    const fetchServiceById = async () => {
      if (!id) return;
      // If it wasn't found in the first providers page, fetch directly.
      if (service) return;
      try {
        const res = await axios.get(`${API_URL}/api/service-offering/${id}`);
        if (res?.data?.service) {
          setService(res.data.service);
        }
      } catch (error) {
        // Keep the loading state, but surface a helpful error.
        console.error('Failed to fetch service offering by id:', error);
        toast.error(error?.response?.data?.message || 'Service not found');
      }
    };

    fetchServiceById();
  }, [API_URL, id, service]);

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

  const portfolioImages = getServiceDisplayImages(service);
  const portfolioPDFs = service?.portfolioPDFs || [];
  const currentImage = portfolioImages[selectedImageIndex]?.url;
  const providerName = getFullName(service?.provider?.user) || 'Unknown Provider';
  const providerPhoneNumber = service?.provider?.user?.phoneNumber || '';
  const serviceDescription = service?.description || 'No description available.';
  const serviceCategory = service?.serviceCategory || '';
  const serviceName = service?.servicename || serviceCategory || 'Service';
  const subCategories = service?.subCategories || [];
  const keywords = service?.keywords || [];
  const providerBio = service?.provider?.bio || '';
  const providerCreatedAt = service?.provider?.user?.createdAt;
  const serviceExperience = service?.experience || 0;
  const providerAddress = formatAddress(service?.provider?.user) || 'Address not provided';
  const descriptionIsLong = serviceDescription.length > 220;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const trackInterest = async () => {
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
  };

  const handleOrderNow = async () => {
    if (!user) {
      toast.error('Please login to continue with your order');
      navigate('/login');
      return;
    }

    await trackInterest();

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

  const handleCallNow = async () => {
    if (!user) {
      toast.error('Please login to contact the provider');
      navigate('/login');
      return;
    }
    if (!providerPhoneNumber) {
      toast.error('Phone number not available');
      return;
    }
    await trackInterest();
    window.open(`tel:${providerPhoneNumber}`, '_self');
  };

  const handleImageError = () => setImageError(true);

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

  const whatsIncludedItems = [
    serviceCategory && `Professional ${serviceCategory} service`,
    serviceExperience > 0 && `${serviceExperience} year${serviceExperience !== 1 ? 's' : ''} of experience`,
    subCategories.length > 0 && `Specialized in: ${subCategories.join(', ')}`,
    keywords.length > 0 &&
      `Keywords: ${keywords.slice(0, 5).join(', ')}${keywords.length > 5 ? '...' : ''}`,
  ].filter(Boolean);

  const heroChips = [
    ...subCategories.slice(0, 2).map((cat) => ({ label: cat, icon: Briefcase })),
    serviceExperience > 0 && {
      label: `${serviceExperience}+ Year${serviceExperience !== 1 ? 's' : ''} Experience`,
      icon: Clock,
    },
  ].filter(Boolean);

  const reviewsTabLabel =
    reviewCount > 0 ? `Reviews (${reviewCount})` : 'Reviews';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">About This Business</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                {serviceDescription}
              </p>
              {whatsIncludedItems.length > 0 && (
                <ul className="mt-6 space-y-3">
                  {whatsIncludedItems.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100">
                        <Check className="h-3 w-3 text-[var(--purple-primary)]" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-purple-100 pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
                Get to know {providerName}
              </h2>
              <div className="flex items-start gap-4">
                <ProfileAvatar
                  user={service?.provider?.user}
                  size="2xl"
                  alt={providerName}
                  className="border-2 border-[var(--purple-primary)]"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">{providerName}</h3>
                  {serviceCategory && (
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      Professional {serviceCategory} service provider
                    </p>
                  )}
                  {providerBio && (
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-3 whitespace-pre-wrap">
                      {providerBio}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {portfolioPDFs.length > 0 && (
              <div className="border-t border-purple-100 pt-8">
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
                        className="flex items-center gap-3 p-4 border border-purple-100 rounded-xl hover:border-[var(--purple-primary)]/40 hover:bg-purple-50/50 transition-all group"
                      >
                        <div className="shrink-0 w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-[var(--purple-primary)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{pdfName}</p>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Click to view PDF</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-purple-300 group-hover:text-[var(--purple-primary)] shrink-0" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );

      case 'services':
        return (
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Our Services</h2>
            {subCategories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subCategories.map((cat) => (
                  <div
                    key={cat}
                    className="p-4 rounded-xl border border-purple-100 bg-purple-50/30 hover:border-purple-200 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
                      <Briefcase className="w-5 h-5 text-[var(--purple-primary)]" />
                    </div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{cat}</h3>
                    {serviceCategory && (
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{serviceCategory}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">No sub-categories listed for this service.</p>
            )}
            {keywords.length > 0 && (
              <div className="mt-8 pt-6 border-t border-purple-100">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-3 py-1 bg-purple-50 text-[var(--text-secondary)] rounded-full text-xs font-medium border border-purple-100"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'gallery':
        return (
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Gallery</h2>
            {portfolioImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {portfolioImages.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setImageError(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-[var(--purple-primary)]'
                        : 'border-purple-100 hover:border-purple-300'
                    }`}
                  >
                    <img src={img.url} alt={`Gallery ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="aspect-[4/3] max-w-md overflow-hidden rounded-2xl border border-purple-100">
                <ServiceCover service={service} size="lg" imageClassName="h-full w-full object-cover" />
              </div>
            )}
          </div>
        );

      case 'reviews':
        return <Comment serviceId={id} />;

      case 'location':
        return (
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Location</h2>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-50/50 border border-purple-100">
              <MapPin className="w-5 h-5 text-[var(--purple-primary)] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{providerAddress}</p>
                {providerAddress !== 'Address not provided' && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(providerAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-[var(--purple-primary)] font-medium mt-2 hover:underline"
                  >
                    View on Map
                    <ArrowRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className="home-page min-h-screen bg-[var(--background-subtle)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="pt-6 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero: gallery + service summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Image gallery */}
            <div>
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-50 to-fuchsia-50/50 border border-purple-100">
                <div className="relative aspect-[4/3] sm:aspect-[16/10]">
                  {portfolioImages.length > 0 && currentImage && !imageError ? (
                    <img
                      src={currentImage}
                      alt={`${serviceName} - ${selectedImageIndex + 1}`}
                      className="h-full w-full object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <ServiceCover service={service} size="xl" imageClassName="h-full w-full object-cover" />
                  )}

                  {portfolioImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border border-purple-100 rounded-full p-2 shadow-md transition-all"
                      >
                        <ChevronLeft className="w-5 h-5 text-[var(--purple-primary)]" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border border-purple-100 rounded-full p-2 shadow-md transition-all"
                      >
                        <ChevronRight className="w-5 h-5 text-[var(--purple-primary)]" />
                      </button>
                    </>
                  )}

                  {portfolioImages.length > 0 && (
                    <span className="absolute top-3 right-3 px-3 py-1 bg-black/50 text-white text-xs font-medium rounded-full">
                      {portfolioImages.length} Photo{portfolioImages.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              {portfolioImages.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
                  {portfolioImages.slice(0, 6).map((img, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setSelectedImageIndex(index);
                        setImageError(false);
                      }}
                      className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? 'border-[var(--purple-primary)]'
                          : 'border-purple-100 hover:border-purple-300'
                      }`}
                    >
                      <img src={img.url} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                  {portfolioImages.length > 6 && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('gallery');
                      }}
                      className="shrink-0 w-20 h-16 rounded-lg border-2 border-purple-100 bg-purple-50 flex items-center justify-center text-sm font-semibold text-[var(--purple-primary)]"
                    >
                      +{portfolioImages.length - 6}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Service header info */}
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] leading-tight">
                {serviceName}
              </h1>

              {averageRating && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-lg font-bold text-[var(--text-primary)]">{averageRating}</span>
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
                  <button
                    type="button"
                    onClick={() => setActiveTab('reviews')}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--purple-primary)]"
                  >
                    ({reviewCount} Review{reviewCount !== 1 ? 's' : ''})
                  </button>
                </div>
              )}

              {serviceCategory && (
                <p className="text-sm font-medium text-[var(--purple-primary)] mt-2 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  {serviceCategory}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-[var(--text-secondary)]">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[var(--purple-primary)]" />
                  {providerAddress}
                </span>
                {serviceExperience > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[var(--purple-primary)]" />
                    {serviceExperience} year{serviceExperience !== 1 ? 's' : ''} experience
                  </span>
                )}
              </div>

              {heroChips.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-5">
                  {heroChips.map((chip) => {
                    const Icon = chip.icon;
                    return (
                      <div
                        key={chip.label}
                        className="flex items-center gap-2 p-3 rounded-xl bg-purple-50/60 border border-purple-100"
                      >
                        <Icon className="w-4 h-4 text-[var(--purple-primary)] shrink-0" />
                        <span className="text-xs font-medium text-[var(--text-secondary)] leading-tight">
                          {chip.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-5">
                <p
                  className={`text-sm text-[var(--text-secondary)] leading-relaxed ${
                    !showFullDescription && descriptionIsLong ? 'line-clamp-3' : ''
                  }`}
                >
                  {serviceDescription}
                </p>
                {descriptionIsLong && (
                  <button
                    type="button"
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-1 text-sm font-medium text-[var(--purple-primary)] flex items-center gap-1 hover:underline"
                  >
                    {showFullDescription ? 'Read Less' : 'Read More'}
                    {showFullDescription ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main content + sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="border-b border-purple-100 mb-6 overflow-x-auto scrollbar-hide">
                <div className="flex gap-1 min-w-max">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-[var(--purple-primary)] text-[var(--purple-primary)]'
                          : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {tab.id === 'reviews' ? reviewsTabLabel : tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <Card className="p-6 sm:p-8">{renderTabContent()}</Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-5">
              <Card className="p-6 sticky top-24">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Get in Touch</h3>

                <button
                  type="button"
                  onClick={handleOrderNow}
                  className="w-full bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white py-3 px-4 rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  I&apos;m Interested
                </button>

                {providerPhoneNumber && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <button
                      type="button"
                      onClick={handleOrderNow}
                      className="py-2.5 px-3 rounded-xl font-medium text-sm border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 transition-all"
                    >
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={handleCallNow}
                      className="py-2.5 px-3 rounded-xl font-medium text-sm border-2 border-[var(--purple-primary)] text-[var(--purple-primary)] hover:bg-purple-50 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-4 h-4" />
                      Call Now
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onToggleWishlist}
                  className="w-full mt-3 py-2.5 px-4 rounded-xl font-medium text-sm border border-purple-100 hover:bg-purple-50 transition-all flex items-center justify-center gap-2 text-[var(--text-primary)]"
                >
                  <Heart
                    className={`w-4 h-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-[var(--purple-primary)]'}`}
                  />
                  {isInWishlist ? 'Saved' : 'Save'}
                </button>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Business Information</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-[var(--text-secondary)] shrink-0">Owner</dt>
                    <dd className="text-[var(--text-primary)] font-medium text-right">{providerName}</dd>
                  </div>
                  {providerCreatedAt && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-[var(--text-secondary)] shrink-0">Member Since</dt>
                      <dd className="text-[var(--text-primary)] font-medium">{formatDate(providerCreatedAt)}</dd>
                    </div>
                  )}
                  {serviceExperience > 0 && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-[var(--text-secondary)] shrink-0">Experience</dt>
                      <dd className="text-[var(--text-primary)] font-medium">
                        {serviceExperience} year{serviceExperience !== 1 ? 's' : ''}
                      </dd>
                    </div>
                  )}
                </dl>
              </Card>

              {whatsIncludedItems.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">What&apos;s Included</h3>
                  <ul className="space-y-3">
                    {whatsIncludedItems.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                        <Check className="w-4 h-4 text-[var(--purple-primary)] shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              <Card className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">Location</h3>
                  {providerAddress !== 'Address not provided' && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(providerAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-[var(--purple-primary)] hover:underline"
                    >
                      View on Map
                    </a>
                  )}
                </div>
                <p className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[var(--purple-primary)] shrink-0 mt-0.5" />
                  {providerAddress}
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SpecificService;
