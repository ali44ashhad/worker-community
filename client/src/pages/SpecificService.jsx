import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getAllProviders } from '../features/providerSlice';
import { HiOutlinePhotograph, HiArrowRight } from 'react-icons/hi';
import Comment from '../components/Comment';
// import { useSelector, useDispatch } from 'react-redux';
import { addToWishlist, removeFromWishlist, fetchWishlist } from '../features/wishlistSlice';

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
      <div className='mt-20 max-w-[1350px] mx-auto px-4 flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4'></div>
          <p className='text-xl font-semibold'>Loading...</p>
        </div>
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

  const handleOrderNow = () => {
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
      navigate('/login');
      return;
    }
    if (isInWishlist) {
      await dispatch(removeFromWishlist(id));
    } else {
      await dispatch(addToWishlist(id));
    }
  };

  console.log(service);

  return (
    <div className='mt-20 max-w-[1350px] mx-auto px-4 py-6'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        
        {/* LEFT SIDE - Image Gallery */}
        <div className='space-y-4'>
          {/* Main Image */}
          <div className='relative bg-white border-4 border-black rounded-xl overflow-hidden h-[380px]'>
            {currentImage && !imageError ? (
              <img
                src={currentImage}
                alt={`Service portfolio ${selectedImageIndex + 1}`}
                className='w-full h-full object-cover'
                onError={handleImageError}
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200'>
                <HiOutlinePhotograph className='w-24 h-24 text-gray-400' />
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {portfolioImages.length > 1 && (
            <div className='flex gap-3 overflow-x-auto pb-2'>
              {portfolioImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedImageIndex(index);
                    setImageError(false);
                  }}
                  className={`flex-shrink-0 border-2 rounded-lg overflow-hidden transition-all ${
                    selectedImageIndex === index
                      ? 'border-black ring-4 ring-black ring-opacity-20'
                      : 'border-gray-300 hover:border-black'
                  }`}
                >
                  <div className='w-16 h-16 bg-white'>
                    <img
                      src={img.url}
                      alt={`Thumbnail ${index + 1}`}
                      className='w-full h-full object-cover'
                    />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Order Now Button */}
          <button
            onClick={handleOrderNow}
            className='w-full bg-black text-white py-3 px-6 rounded-xl font-bold text-lg hover:bg-white hover:text-black border-4 border-black transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl hover:scale-105'
          >
            Order Now
            <HiArrowRight className='w-5 h-5' />
          </button>
        </div>

        {/* RIGHT SIDE - Service Details */}
        <div className='space-y-4'>
          {/* Service Name */}
          <div>
            <h1 className='text-3xl font-bold text-black mb-2'>
              {serviceCategory}
            </h1>
            {/* Show service-level experience (years) if present */}
            {service.experience !== undefined && service.experience !== null && service.experience !== '' && (
              <div className="mb-2 text-black font-medium text-base">
                {service.experience} year{(Number(service.experience) === 1 ? '' : 's')} of experience
              </div>
            )}
            
            {subCategories.length > 0 && (
              <div className='flex flex-wrap gap-2 mb-2'>
                {subCategories.map((cat, idx) => (
                  <span
                    key={idx}
                    className='bg-black text-white px-3 py-1 rounded-full text-xs font-semibold'
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Keywords */}
          {keywords.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className='bg-white border-2 border-black text-black px-2 py-1 rounded-full text-xs font-medium'
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}

          {/* Bio/Description */}
          <div className='bg-white border-4 border-black rounded-xl p-4'>
            <h2 className='text-xl font-bold text-black mb-2'>About This Service</h2>
            <p className='text-gray-700 leading-relaxed text-sm whitespace-pre-wrap line-clamp-4'>
              {serviceDescription}
            </p>
          </div>

          {/* Provider Info */}
          <div className='bg-white border-4 border-black rounded-xl p-4'>
            <h2 className='text-xl font-bold text-black mb-3'>Provider</h2>
            <div className='flex items-center gap-3'>
              {/* Provider Image */}
              <div className='flex-shrink-0'>
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={providerName}
                    className='w-16 h-16 rounded-full border-4 border-black object-cover'
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div
                  className='w-16 h-16 rounded-full border-4 border-black bg-black text-white flex items-center justify-center font-bold text-2xl'
                  style={{ display: profileImage ? 'none' : 'flex' }}
                >
                  {providerName.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Provider Name */}
              <div className='flex-1 min-w-0'>
                <h3 className='text-xl font-bold text-black truncate'>
                  {providerName}
                </h3>
                {service?.experience && (
                  <p className='text-gray-600 text-xs mt-0.5'>
                    {service.experience} years of experience
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Wishlist + Contact Buttons */}
          <button
            onClick={handleContactNow}
            className='w-full bg-white text-black py-3 px-6 rounded-xl font-bold text-lg hover:bg-black hover:text-white border-4 border-black transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl hover:scale-105'
          >
            Contact Now
            <HiArrowRight className='w-5 h-5' />
          </button>

          <button
            onClick={onToggleWishlist}
            className='w-full bg-black text-white py-3 px-6 rounded-xl font-bold text-lg hover:bg-white hover:text-black border-4 border-black transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl hover:scale-105'
          >
            {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          </button>
        </div>

      </div>

      <Comment serviceId={id} />
    </div>
  );
};

export default SpecificService;