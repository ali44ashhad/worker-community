import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getAllProviders } from '../features/providerSlice';
import { HiOutlinePhotograph, HiArrowRight, HiHeart, HiOutlineHeart, HiChevronLeft, HiChevronRight, HiOutlineClock, HiOutlineRefresh, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { FaStar } from 'react-icons/fa';
import Comment from '../components/Comment';
import { addToWishlist, removeFromWishlist, fetchWishlist } from '../features/wishlistSlice';
import { fetchCommentsByService } from '../features/commentSlice';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
axios.defaults.withCredentials = true;

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

  // Calculate average rating from comments
  const averageRating = comments.length > 0
    ? (comments.reduce((sum, c) => sum + (c.rating || 0), 0) / comments.length).toFixed(1)
    : null;
  const reviewCount = comments.length;

  // Fetch providers if not already loaded
  useEffect(() => {
    if (allProviders.length === 0) {
      dispatch(getAllProviders());
    }
  }, [dispatch, allProviders.length]);

  useEffect(() => {
    if (user) dispatch(fetchWishlist());
  }, [dispatch, user]);

  // Fetch comments for rating calculation
  useEffect(() => {
    if (id) {
      dispatch(fetchCommentsByService(id));
    }
  }, [dispatch, id]);

  // Find the service from allProviders
  useEffect(() => {
    const findService = () => {
      for (const provider of allProviders) {
        if (provider?.serviceOfferings && Array.isArray(provider.serviceOfferings)) {
          const foundService = provider.serviceOfferings.find(s => s._id === id);
          if (foundService) {
            setService({
              ...foundService,
              provider: {
                ...provider,
                user: provider.user,
                _id: provider._id,
                bio: provider.bio,
                experience: provider.experience
              }
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
      <div className='mt-20 max-w-[1350px] mx-auto px-6 flex items-center justify-center min-h-screen'>
        <motion.div 
          className='text-center'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className='animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-gray-900 mx-auto mb-4'
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className='text-xl font-semibold text-gray-700'>Loading...</p>
        </motion.div>
      </div>
    );
  }
  
  const portfolioImages = service?.portfolioImages || [];
  const currentImage = portfolioImages[selectedImageIndex]?.url;
  const providerName = service?.provider?.user?.name || 'Unknown Provider';
  const profileImage = service?.provider?.user?.profileImage;
  const providerPhoneNumber = service?.provider?.user?.phoneNumber || '';
  const serviceDescription = service?.description || 'No description available.';
  const serviceCategory = service?.serviceCategory || '';
  const subCategories = service?.subCategories || [];
  const keywords = service?.keywords || [];
  const price = service?.price || 0;
  const providerBio = service?.provider?.bio || '';
  const providerCreatedAt = service?.provider?.user?.createdAt;
  const serviceExperience = service?.experience || 0;
  const providerAddress = service?.provider?.user?.address || 'Address not provided';

  // Format date
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
    // Check if user is logged in
    if (!user) {
      toast.error('Please login to continue with your order');
      navigate('/login');
      return;
    }

    // Increment service offering count
    try {
      await axios.post(`${API_URL}/api/service-offering/${id}/increment-count`);
    } catch (error) {
      console.error('Failed to increment service offering count:', error);
      // Continue even if increment fails
    }

    // Redirect to WhatsApp with provider's phone number
    if (providerPhoneNumber) {
      // Clean the phone number - remove spaces, +, and special characters
      const cleanPhoneNumber = providerPhoneNumber.replace(/\D/g, '');
      
      // Create WhatsApp message
      const message = `Hi! I'm interested in your ${serviceCategory} service. Could you please provide more details?`;
      const encodedMessage = encodeURIComponent(message);
      
      // Open WhatsApp
      window.open(`https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`, '_blank');
    } else {
      // Fallback to contact page if no phone number
      navigate(`/contact`);
    }
  };

  const handleContactNow = () => {
    // Navigate to provider profile or contact
    navigate(`/provider/${service.provider._id}`);
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
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-[1350px] mx-auto px-4 pt-24 pb-12'>
        {/* Service Title Header */}
        <div className='mb-6'>
          <h1 className='text-2xl md:text-3xl font-bold text-gray-900 mb-2'>
            {service?.servicename || serviceCategory || 'Service'}
          </h1>
          {service?.servicename && serviceCategory && (
            <p className='text-lg text-gray-600 mb-2'>
              {serviceCategory}
            </p>
          )}
          {subCategories.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {subCategories.map((cat, idx) => (
                <span
                  key={idx}
                  className='text-sm text-gray-600'
                >
                  {cat}{idx < subCategories.length - 1 ? ',' : ''}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          
          {/* LEFT COLUMN - Provider Profile Section */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Image Carousel */}
            <div className='bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm'>
              <div className='relative'>
                {/* Main Image */}
                <div className='relative h-[500px] bg-gray-100'>
                  {currentImage && !imageError ? (
                    <img
                      src={currentImage}
                      alt={`Service portfolio ${selectedImageIndex + 1}`}
                      className='w-full h-full object-cover'
                      onError={handleImageError}
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100'>
                      <HiOutlinePhotograph className='w-24 h-24 text-gray-300' />
                    </div>
                  )}
                  
                  {/* Navigation Arrows */}
                  {portfolioImages.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className='absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border border-gray-200 rounded-full p-2 shadow-lg transition-all'
                      >
                        <HiChevronLeft className='w-5 h-5 text-gray-700' />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className='absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border border-gray-200 rounded-full p-2 shadow-lg transition-all'
                      >
                        <HiChevronRight className='w-5 h-5 text-gray-700' />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {portfolioImages.length > 1 && (
                  <div className='p-4 border-t border-gray-200'>
                    <div className='flex gap-2 overflow-x-auto scrollbar-hide'>
                      {portfolioImages.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedImageIndex(index);
                            setImageError(false);
                          }}
                          className={`flex-shrink-0 border-2 rounded-lg overflow-hidden transition-all ${
                            selectedImageIndex === index
                              ? 'border-gray-900'
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <div className='w-20 h-20'>
                            <img
                              src={img.url}
                              alt={`Thumbnail ${index + 1}`}
                              className='w-full h-full object-cover'
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Provider Profile Section */}
            <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
              <h2 className='text-xl font-bold text-gray-900 mb-4'>Get to know {providerName}</h2>
              
              {/* Provider Header */}
              <div className='flex items-start gap-4 mb-6'>
                {/* Profile Picture */}
                <div className='relative flex-shrink-0'>
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={providerName}
                      className='w-24 h-24 rounded-full border-4 border-gray-900 object-cover'
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className='w-24 h-24 rounded-full border-4 border-gray-900 bg-gray-900 text-white flex items-center justify-center font-bold text-2xl'
                    style={{ display: profileImage ? 'none' : 'flex' }}
                  >
                    {providerName.charAt(0).toUpperCase()}
                  </div>
                  {/* Online Badge */}
                  <div className='absolute bottom-0 right-0 w-6 h-6 bg-gray-600 border-2 border-white rounded-full'></div>
                </div>

                {/* Provider Info */}
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-2'>
                    <h3 className='text-xl font-bold text-gray-900'>{providerName}</h3>
                    {/* <span className='text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full'>
                      • Online
                    </span> */}
                  </div>
                  <p className='text-sm text-gray-600 mb-3'>
                    Professional {serviceCategory} service provider
                  </p>
                  
                  {/* Rating */}
                  {averageRating && (
                    <div className='flex items-center gap-2 mb-2'>
                      <div className='flex items-center gap-1'>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            className={`text-sm ${
                              star <= Math.round(parseFloat(averageRating))
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className='text-sm font-semibold text-gray-900'>
                        {averageRating} ({reviewCount} reviews )
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className='flex gap-3 mt-4'>
                    <button
                      onClick={handleContactNow}
                      className='flex-1 bg-white text-gray-900 py-2.5 px-4 rounded-lg font-semibold text-sm hover:bg-gray-50 border border-gray-300 transition-all'
                    >
                      Contact me
                    </button>
                    <button
                      onClick={handleOrderNow}
                      className='flex-1 bg-gray-900 text-white py-2.5 px-4 rounded-lg font-semibold text-sm hover:bg-gray-800 transition-all'
                    >
                      Request to order
                    </button>
                  </div>
                </div>
              </div>

              {/* Provider Details */}
              <div className='border-t border-gray-200 pt-4 space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>From:</span>
                  <span className='text-gray-900 font-medium text-right'>{providerAddress}</span>
                </div>
                {providerCreatedAt && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Member since:</span>
                    <span className='text-gray-900 font-medium'>{formatDate(providerCreatedAt)}</span>
                  </div>
                )}
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Experience:</span>
                  <span className='text-gray-900 font-medium'>{serviceExperience} year{serviceExperience !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Provider Bio */}
              {providerBio && (
                <div className='mt-6 pt-6 border-t border-gray-200'>
                  <p className='text-sm text-gray-700 leading-relaxed whitespace-pre-wrap'>
                    {providerBio}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - Pricing & Ordering */}
          <div className='lg:col-span-1'>
            <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm sticky top-24'>
              {/* Price */}
              <div className='mb-6'>
                <div className='flex items-baseline gap-2 mb-2'>
                  <span className='text-3xl font-bold text-gray-900'>
                    ₹{typeof price === 'number' ? price.toLocaleString('en-IN') : price}
                  </span>
                </div>
              </div>

              {/* Service Description */}
              <div className='mb-6'>
                <p className='text-sm text-gray-700 leading-relaxed mb-4'>
                  {serviceDescription}
                </p>
              </div>

              {/* Features */}
              <div className='space-y-3 mb-6'>
                <div className='flex items-center gap-2 text-sm text-gray-700'>
                  <HiOutlineClock className='w-5 h-5 text-gray-600' />
                  <span>Custom delivery time</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-gray-700'>
                  <HiOutlineRefresh className='w-5 h-5 text-gray-600' />
                  <span>Unlimited Revisions</span>
                </div>
              </div>

              {/* What's Included */}
              <div className='mb-6 border-t border-gray-200 pt-4'>
                <button
                  onClick={() => setShowWhatsIncluded(!showWhatsIncluded)}
                  className='w-full flex items-center justify-between text-sm font-semibold text-gray-900 hover:text-gray-700'
                >
                  <span>What's Included</span>
                  {showWhatsIncluded ? (
                    <HiChevronUp className='w-5 h-5' />
                  ) : (
                    <HiChevronDown className='w-5 h-5' />
                  )}
                </button>
                {showWhatsIncluded && (
                  <div className='mt-3 space-y-2 text-sm text-gray-700'>
                    <div className='flex items-start gap-2'>
                      <span className='text-gray-600'>•</span>
                      <span>Professional {serviceCategory} service</span>
                    </div>
                    {serviceExperience > 0 && (
                      <div className='flex items-start gap-2'>
                        <span className='text-gray-600'>•</span>
                        <span>{serviceExperience} year{serviceExperience !== 1 ? 's' : ''} of experience</span>
                      </div>
                    )}
                    {subCategories.length > 0 && (
                      <div className='flex items-start gap-2'>
                        <span className='text-gray-600'>•</span>
                        <span>Specialized in: {subCategories.join(', ')}</span>
                      </div>
                    )}
                    {keywords.length > 0 && (
                      <div className='flex items-start gap-2'>
                        <span className='text-gray-600'>•</span>
                        <span>Keywords: {keywords.slice(0, 3).join(', ')}{keywords.length > 3 ? '...' : ''}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className='space-y-3'>
                <button
                  onClick={handleOrderNow}
                  className='w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-semibold text-sm hover:bg-gray-800 transition-all'
                >
                  Request to order
                </button>
                <button
                  onClick={handleContactNow}
                  className='w-full bg-white text-gray-900 py-3 px-4 rounded-lg font-semibold text-sm hover:bg-gray-50 border border-gray-300 transition-all'
                >
                  Contact me
                </button>
              </div>

              {/* Wishlist Button */}
              <button
                onClick={onToggleWishlist}
                className='w-full mt-3 bg-gray-100 text-gray-900 py-2.5 px-4 rounded-lg font-medium text-sm hover:bg-gray-200 transition-all flex items-center justify-center gap-2'
              >
                {isInWishlist ? (
                  <>
                    <HiHeart className='w-4 h-4 text-red-500' />
                    Remove from Wishlist
                  </>
                ) : (
                  <>
                    <HiOutlineHeart className='w-4 h-4' />
                    Add to Wishlist
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className='mt-12'>
          <Comment serviceId={id} />
        </div>
      </div>
    </div>
  );
};

export default SpecificService;