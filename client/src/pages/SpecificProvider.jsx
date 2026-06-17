import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { getProviderById, clearSelectedProvider } from '../features/providerSlice';
import { MapPin, MessageCircle, Star } from 'lucide-react';
import ServiceCard from '../components/service/ServiceCard';
import CommunityCta from '../components/home/CommunityCta';
import axios from 'axios';
import { getFullName, getInitials, formatAddress } from '../utils/userHelpers';

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
  'px-3 py-1.5 bg-purple-50 text-[var(--text-secondary)] rounded-full text-sm font-medium border border-purple-100 hover:bg-purple-100 hover:border-purple-200 transition-colors';

const SpecificProvider = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedProvider, isFetchingSelected } = useSelector((state) => state.provider);
  const user = useSelector((s) => s.auth.user);

  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    dispatch(getProviderById(id));
    return () => {
      dispatch(clearSelectedProvider());
    };
  }, [dispatch, id]);

  const services = selectedProvider?.serviceOfferings || [];

  if (isFetchingSelected || !selectedProvider) {
    return (
      <div className="home-page min-h-screen bg-[var(--background-subtle)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-100 border-t-[var(--purple-primary)] mx-auto mb-4" />
          <p className="text-xl font-semibold text-[var(--text-secondary)]">Loading provider...</p>
        </div>
      </div>
    );
  }

  const providerName = getFullName(selectedProvider?.user) || 'Unknown Provider';
  const profileImage = selectedProvider?.user?.profileImage;
  const providerPhoneNumber = selectedProvider?.user?.phoneNumber || '';
  const providerAddress = formatAddress(selectedProvider?.user) || 'Address not provided';
  const bio = selectedProvider?.bio || '';
  const stats = selectedProvider?.stats || { averageRating: 0, totalReviews: 0 };
  const userCreatedAt = selectedProvider?.user?.createdAt;
  const averageRating = stats.averageRating || 0;
  const totalReviews = stats.totalReviews || 0;

  const allSkills = new Set();
  services.forEach((service) => {
    if (service?.keywords && Array.isArray(service.keywords)) {
      service.keywords.forEach((keyword) => allSkills.add(keyword));
    }
    if (service?.subCategories && Array.isArray(service.subCategories)) {
      service.subCategories.forEach((cat) => allSkills.add(cat));
    }
  });
  const skillsArray = Array.from(allSkills).slice(0, 10);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleContactNow = async () => {
    try {
      await axios.post(`${API_URL}/api/provider-profile/${id}/increment-count`);
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

  const getProviderLevel = () => {
    if (totalReviews >= 50 && averageRating >= 4.5) return { level: 2, diamonds: 2 };
    if (totalReviews >= 20 && averageRating >= 4.0) return { level: 1, diamonds: 1 };
    return { level: 0, diamonds: 0 };
  };

  const providerLevel = getProviderLevel();
  const bioPreview = bio.length > 200 ? `${bio.substring(0, 200)}...` : bio;
  const displayBio = showFullBio ? bio : bioPreview;

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
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-fuchsia-100 rounded-full mb-4">
            <span className="text-sm font-semibold bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent">
              Community Provider
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-br from-[var(--text-primary)] via-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent mb-2">
            {providerName}
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            Professional service provider in your neighbourhood
          </p>
        </div>
      </section>

      <section className="pb-16 bg-gradient-to-b from-white to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 sm:p-8">
                <div className="flex items-start gap-6">
                  <div className="relative shrink-0">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={providerName}
                        className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-[var(--purple-primary)] object-cover shadow-md shadow-purple-500/10"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-[var(--purple-primary)] bg-gradient-to-br from-[var(--purple-primary)] to-[var(--magenta)] text-white flex items-center justify-center font-bold text-3xl sm:text-4xl shadow-md shadow-purple-500/10"
                      style={{ display: profileImage ? 'none' : 'flex' }}
                    >
                      {getInitials(selectedProvider?.user)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{providerName}</h2>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-3">
                      {averageRating > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= Math.round(averageRating)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-purple-100 text-purple-100'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-[var(--text-primary)]">
                            {averageRating} ({totalReviews} reviews)
                          </span>
                        </div>
                      )}
                      {providerLevel.level > 0 && (
                        <div className="flex items-center gap-1 text-sm font-semibold text-[var(--purple-primary)]">
                          <span>Level {providerLevel.level}</span>
                          {[...Array(providerLevel.diamonds)].map((_, i) => (
                            <span key={i} className="text-base leading-none">
                              ◆
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 text-sm text-[var(--text-secondary)]">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[var(--purple-primary)] shrink-0" />
                        <span>{providerAddress}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-[var(--purple-primary)] shrink-0" />
                        <span>English, Hindi</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {bio && (
                <Card className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">About me</h2>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap mb-3">
                    {displayBio}
                  </p>
                  {bio.length > 200 && (
                    <button
                      type="button"
                      onClick={() => setShowFullBio(!showFullBio)}
                      className="text-sm text-[var(--purple-primary)] hover:text-[var(--magenta)] font-medium transition-colors"
                    >
                      {showFullBio ? 'Read less' : 'Read more'}
                    </button>
                  )}
                </Card>
              )}

              {skillsArray.length > 0 && (
                <Card className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {skillsArray.map((skill, index) => (
                      <span key={index} className={chipClass}>
                        {skill}
                      </span>
                    ))}
                    {allSkills.size > 10 && (
                      <span className={chipClass}>+{allSkills.size - 10}</span>
                    )}
                  </div>
                </Card>
              )}

              {services.length > 0 && (
                <Card className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Services Offered</h2>
                  <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
                    {services.map((service) => (
                      <ServiceCard key={service._id} service={{ ...service, provider: selectedProvider }} />
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-purple-100">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={providerName}
                      className="w-12 h-12 rounded-full border-2 border-[var(--purple-primary)] object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className="w-12 h-12 rounded-full border-2 border-[var(--purple-primary)] bg-gradient-to-br from-[var(--purple-primary)] to-[var(--magenta)] text-white flex items-center justify-center font-bold text-lg"
                    style={{ display: profileImage ? 'none' : 'flex' }}
                  >
                    {providerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-[var(--text-primary)] truncate">{providerName}</h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleContactNow}
                  className="w-full bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white py-3 px-4 rounded-xl font-semibold text-sm hover:opacity-90 transition-all mb-3 flex items-center justify-center gap-2 shadow-md shadow-purple-500/20"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact me
                </button>

                <button
                  type="button"
                  onClick={handleContactNow}
                  className="w-full bg-white text-[var(--text-primary)] py-3 px-4 rounded-xl font-semibold text-sm hover:bg-purple-50 border border-purple-100 transition-all mb-6 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5 text-[var(--purple-primary)]" />
                  Book a consultation
                </button>

                {userCreatedAt && (
                  <div className="pt-6 border-t border-purple-100 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Member since:</span>
                      <span className="text-[var(--text-primary)] font-medium">{formatDate(userCreatedAt)}</span>
                    </div>
                    {services.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Services:</span>
                        <span className="text-[var(--text-primary)] font-medium">{services.length}</span>
                      </div>
                    )}
                    {totalReviews > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Total reviews:</span>
                        <span className="text-[var(--text-primary)] font-medium">{totalReviews}</span>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>

      <CommunityCta />
    </motion.div>
  );
};

export default SpecificProvider;
