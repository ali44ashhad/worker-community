import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getAllProviders } from '../features/providerSlice';
import { HiOutlinePhotograph, HiArrowRight, HiHeart, HiOutlineHeart } from 'react-icons/hi';
import Comment from '../components/Comment';
import { addToWishlist, removeFromWishlist, fetchWishlist } from '../features/wishlistSlice';
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
  
  const [service, setService] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Fetch providers if not already loaded
  useEffect(() => {
    if (allProviders.length === 0) {
      dispatch(getAllProviders());
    }
  }, [dispatch, allProviders.length]);

  useEffect(() => {
    if (user) dispatch(fetchWishlist());
  }, [dispatch, user]);

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

  const handleImageError = () => {
    setImageError(true);
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
    <motion.div 
      className='mt-24 max-w-[1350px] mx-auto px-6 py-8'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        
        {/* LEFT SIDE - Image Gallery */}
        <motion.div 
          className='space-y-6'
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Main Image */}
          <div className='relative bg-white border border-gray-200 rounded-2xl overflow-hidden h-[400px] shadow-lg'>
            {currentImage && !imageError ? (
              <motion.img
                src={currentImage}
                alt={`Service portfolio ${selectedImageIndex + 1}`}
                className='w-full h-full object-cover'
                onError={handleImageError}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100'>
                <HiOutlinePhotograph className='w-24 h-24 text-gray-300' />
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {portfolioImages.length > 1 && (
            <div className='flex gap-3 overflow-x-auto pb-2 scrollbar-hide'>
              {portfolioImages.map((img, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    setSelectedImageIndex(index);
                    setImageError(false);
                  }}
                  className={`flex-shrink-0 border-2 rounded-xl overflow-hidden transition-all duration-300 ${
                    selectedImageIndex === index
                      ? 'border-gray-900 ring-2 ring-gray-400 ring-opacity-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className='w-20 h-20 bg-white'>
                    <img
                      src={img.url}
                      alt={`Thumbnail ${index + 1}`}
                      className='w-full h-full object-cover'
                    />
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Order Now Button */}
          <motion.button
            onClick={handleOrderNow}
            className='w-full bg-gray-900 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg'
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Order Now
            <HiArrowRight className='w-5 h-5' />
          </motion.button>
        </motion.div>

        {/* RIGHT SIDE - Service Details */}
        <motion.div 
          className='space-y-6'
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Service Name */}
          <div>
            <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight'>
              {serviceCategory}
            </h1>
            {/* Show service-level experience (years) if present */}
            {service.experience !== undefined && service.experience !== null && service.experience !== '' && (
              <div className="mb-4 text-gray-600 font-medium text-base">
                {service.experience} year{(Number(service.experience) === 1 ? '' : 's')} of experience
              </div>
            )}
            
            {subCategories.length > 0 && (
              <div className='flex flex-wrap gap-2 mb-4'>
                {subCategories.map((cat, idx) => (
                  <motion.span
                    key={idx}
                    className='bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium border border-gray-200'
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + idx * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {cat}
                  </motion.span>
                ))}
              </div>
            )}
          </div>

          {/* Keywords */}
          {keywords.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {keywords.map((keyword, idx) => (
                <motion.span
                  key={idx}
                  className='bg-gray-50 text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200'
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + idx * 0.03 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {keyword}
                </motion.span>
              ))}
            </div>
          )}

          {/* Bio/Description */}
          <motion.div 
            className='bg-white border border-gray-200 rounded-2xl p-6 shadow-lg'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className='text-2xl font-bold text-gray-900 mb-4 tracking-tight'>About This Service</h2>
            <p className='text-gray-600 leading-relaxed whitespace-pre-wrap'>
              {serviceDescription}
            </p>
          </motion.div>

          {/* Provider Info */}
          <motion.div 
            className='bg-white border border-gray-200 rounded-2xl p-6 shadow-lg'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className='text-2xl font-bold text-gray-900 mb-4 tracking-tight'>Provider</h2>
            <div className='flex items-center gap-4'>
              {/* Provider Image */}
              <div className='flex-shrink-0'>
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={providerName}
                    className='w-16 h-16 rounded-full border-2 border-gray-200 object-cover'
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div
                  className='w-16 h-16 rounded-full border-2 border-gray-200 bg-gray-900 text-white flex items-center justify-center font-semibold text-xl'
                  style={{ display: profileImage ? 'none' : 'flex' }}
                >
                  {providerName.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Provider Name */}
              <div className='flex-1 min-w-0'>
                <h3 className='text-xl font-semibold text-gray-900 truncate mb-1'>
                  {providerName}
                </h3>
                {service?.provider?.experience && (
                  <p className='text-gray-600 text-sm'>
                    {service.provider.experience} years of experience
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Wishlist + Contact Buttons */}
          <div className='space-y-3'>
            <motion.button
              onClick={handleContactNow}
              className='w-full bg-white text-gray-900 py-3.5 px-6 rounded-xl font-semibold text-base hover:bg-gray-50 border-2 border-gray-200 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg'
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Contact Now
              <HiArrowRight className='w-5 h-5' />
            </motion.button>

            <motion.button
              onClick={onToggleWishlist}
              className='w-full bg-gray-900 text-white py-3.5 px-6 rounded-xl font-semibold text-base hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg'
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isInWishlist ? (
                <>
                  <HiHeart className='w-5 h-5' />
                  Remove from Wishlist
                </>
              ) : (
                <>
                  <HiOutlineHeart className='w-5 h-5' />
                  Add to Wishlist
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

      </div>

      <Comment serviceId={id} />
    </motion.div>
  );
};

export default SpecificService;