import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProviderById, clearSelectedProvider } from '../features/providerSlice';
import { HiLocationMarker, HiChatAlt2 } from 'react-icons/hi';
import { FaStar } from 'react-icons/fa';
import ServiceCard from '../components/service/ServiceCard';
import axios from 'axios';
import { getFullName, getInitials, formatAddress } from '../utils/userHelpers';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
axios.defaults.withCredentials = true;

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

  // Extract data safely (hooks must be called before any returns)
  const services = selectedProvider?.serviceOfferings || [];

  // Early return after all hooks
  if (isFetchingSelected || !selectedProvider) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-gray-900 mx-auto mb-4'></div>
          <p className='text-xl font-semibold text-gray-700'>Loading...</p>
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

  // Get all unique skills from services
  const allSkills = new Set();
  services.forEach(service => {
    if (service?.keywords && Array.isArray(service.keywords)) {
      service.keywords.forEach(keyword => allSkills.add(keyword));
    }
    if (service?.subCategories && Array.isArray(service.subCategories)) {
      service.subCategories.forEach(cat => allSkills.add(cat));
    }
  });
  const skillsArray = Array.from(allSkills).slice(0, 10);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };


  const handleContactNow = async () => {
    // Increment provider profile count
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
      navigate(`/contact`);
    }
  };

  const handleBookConsultation = () => {
    handleContactNow();
  };

  // Calculate provider level based on reviews and rating
  const getProviderLevel = () => {
    if (totalReviews >= 50 && averageRating >= 4.5) return { level: 2, diamonds: 2 };
    if (totalReviews >= 20 && averageRating >= 4.0) return { level: 1, diamonds: 1 };
    return { level: 0, diamonds: 0 };
  };

  const providerLevel = getProviderLevel();
  const bioPreview = bio.length > 200 ? bio.substring(0, 200) + '...' : bio;
  const displayBio = showFullBio ? bio : bioPreview;

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-[1350px] mx-auto px-4 pt-24 pb-12'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          
          {/* LEFT COLUMN - Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Profile Header */}
            <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
              <div className='flex items-start gap-6'>
                {/* Profile Picture */}
                <div className='relative flex-shrink-0'>
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={providerName}
                      className='w-32 h-32 rounded-full border-4 border-gray-900 object-cover'
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className='w-32 h-32 rounded-full border-4 border-gray-900 bg-gray-900 text-white flex items-center justify-center font-bold text-4xl'
                    style={{ display: profileImage ? 'none' : 'flex' }}
                  >
                    {getInitials(selectedProvider?.user)}
                  </div>
                </div>

                {/* Provider Info */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-3 mb-2'>
                    <h1 className='text-3xl font-bold text-gray-900'>{providerName}</h1>
                  </div>
                  
                  {/* Username/Handle */}
                  {/* <p className='text-sm text-gray-600 mb-3'>
                    @{providerName.toLowerCase().replace(/\s+/g, '_')}
                  </p> */}

                  {/* Rating and Level */}
                  <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-3'>
                    {averageRating > 0 && (
                      <div className='flex flex-wrap items-center gap-2'>
                        <div className='flex items-center gap-1'>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              className={`text-base ${
                                star <= Math.round(averageRating)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className='text-sm font-semibold text-gray-900'>
                          {averageRating} ({totalReviews} reviews)
                        </span>
                      </div>
                    )}
                    {providerLevel.level > 0 && (
                      <div className='flex items-center gap-1 text-sm font-semibold text-gray-900'>
                        <span>Level {providerLevel.level}</span>
                        {[...Array(providerLevel.diamonds)].map((_, i) => (
                          <span key={i} className='text-gray-600 text-base leading-none'>◆</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Professional Title */}
                  <p className='text-base text-gray-700 mb-4'>
                    Professional service provider
                  </p>

                  {/* Location and Languages */}
                  <div className='flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-6 text-sm text-gray-600 mb-4 w-full'>
                  <div className='flex items-center gap-2'>
                    <HiLocationMarker className='text-2xl sm:text-lg text-gray-700 flex-shrink-0' />
                    <span>{providerAddress}</span>
                  </div>
                    <div className='flex items-center gap-2'>
                      <HiChatAlt2 className='text-2xl sm:text-lg text-gray-700 flex-shrink-0' />
                      <span>English, Hindi</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className='flex gap-3'>
              {/* <button
                      onClick={() => navigate('/contact')}
                      className='px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold text-sm hover:bg-gray-50 border border-gray-300 transition-all'
              >
                      More about me
              </button> */}
                  </div>
                </div>
              </div>
            </div>

            {/* About Me Section */}
            {bio && (
              <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
                <h2 className='text-xl font-bold text-gray-900 mb-4'>About me</h2>
                <p className='text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-3'>
                  {displayBio}
                </p>
                {bio.length > 200 && (
              <button
                    onClick={() => setShowFullBio(!showFullBio)}
                    className='text-sm text-gray-600 hover:text-gray-900 font-medium'
              >
                    {showFullBio ? 'Read less' : 'Read more'}
              </button>
                )}
              </div>
            )}

            {/* Skills Section */}
            {skillsArray.length > 0 && (
              <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
                <h2 className='text-xl font-bold text-gray-900 mb-4'>Skills</h2>
                <div className='flex flex-wrap gap-2'>
                  {skillsArray.map((skill, index) => (
                    <span
                  key={index}
                      className='px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-200 hover:bg-gray-200 transition-colors cursor-pointer'
                    >
                      {skill}
                    </span>
                  ))}
                  {allSkills.size > 10 && (
                    <span className='px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-200'>
                      +{allSkills.size - 10}
                    </span>
                  )}
                </div>
            </div>
          )}

            {/* Services Section */}
            {services.length > 0 && (
              <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
                <h2 className='text-xl font-bold text-gray-900 mb-6'>Services Offered</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {services.map((service) => (
                    <ServiceCard key={service._id} service={{ ...service, provider: selectedProvider }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - Contact/Action Box */}
          <div className='lg:col-span-1'>
            <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm sticky top-24'>
              {/* Mini Profile */}
              <div className='flex items-center gap-3 mb-6 pb-6 border-b border-gray-200'>
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={providerName}
                    className='w-12 h-12 rounded-full border-2 border-gray-900 object-cover'
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div
                  className='w-12 h-12 rounded-full border-2 border-gray-900 bg-gray-900 text-white flex items-center justify-center font-bold text-lg'
                  style={{ display: profileImage ? 'none' : 'flex' }}
                >
                  {providerName.charAt(0).toUpperCase()}
                </div>
                <div className='flex-1 min-w-0'>
                  <h3 className='text-base font-bold text-gray-900 truncate'>{providerName}</h3>
                </div>
              </div>

              {/* Contact Button */}
              <button
                onClick={handleContactNow}
                className='w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-semibold text-sm hover:bg-gray-800 transition-all mb-3 flex items-center justify-center gap-2'
              >
                <HiChatAlt2 className='w-5 h-5' />
                Contact me
              </button>

              {/* Consultation Button */}
              <button
                onClick={handleBookConsultation}
                className='w-full bg-white text-gray-900 py-3 px-4 rounded-lg font-semibold text-sm hover:bg-gray-50 border border-gray-300 transition-all mb-6 flex items-center justify-center gap-2'
              >
                <HiChatAlt2 className='w-5 h-5' />
                Book a consultation
              </button>

              {/* Additional Info */}
              {userCreatedAt && (
                <div className='mt-6 pt-6 border-t border-gray-200 space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Member since:</span>
                    <span className='text-gray-900 font-medium'>{formatDate(userCreatedAt)}</span>
                  </div>
                  {services.length > 0 && (
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Services:</span>
                      <span className='text-gray-900 font-medium'>{services.length}</span>
                    </div>
                  )}
                  {totalReviews > 0 && (
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Total reviews:</span>
                      <span className='text-gray-900 font-medium'>{totalReviews}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecificProvider;
