import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProviderById, clearSelectedProvider } from '../features/providerSlice';
import { HiOutlinePhotograph, HiArrowRight, HiArrowLeft } from 'react-icons/hi';
import ServiceCard from '../components/service/ServiceCard';

const SpecificProvider = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedProvider, isFetchingSelected } = useSelector((state) => state.provider);
  const scrollRef = useRef(null);
  
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    dispatch(getProviderById(id));
    return () => {
      dispatch(clearSelectedProvider());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (!selectedProvider?.serviceOfferings?.length) return;
    
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentCarouselIndex((prev) => (prev + 1) % selectedProvider.serviceOfferings.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, selectedProvider]);

  if (isFetchingSelected || !selectedProvider) {
    return (
      <div className='mt-20 max-w-[1350px] mx-auto px-4 flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4'></div>
          <p className='text-xl font-semibold'>Loading...</p>
        </div>
      </div>
    );
  }

  const providerName = selectedProvider?.user?.name || 'Unknown Provider';
  const profileImage = selectedProvider?.user?.profileImage;
  const providerPhoneNumber = selectedProvider?.user?.phoneNumber || '';
  const bio = selectedProvider?.bio || '';
  const services = selectedProvider?.serviceOfferings || [];

  // Get all images from all services for carousel
  const allCarouselImages = [];
  services.forEach(service => {
    if (service?.portfolioImages && Array.isArray(service.portfolioImages)) {
      service.portfolioImages.forEach(img => {
        allCarouselImages.push(img.url);
      });
    }
  });

  const goToSlide = (index) => {
    setCurrentCarouselIndex(index);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentCarouselIndex((prev) => (prev - 1 + allCarouselImages.length) % allCarouselImages.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentCarouselIndex((prev) => (prev + 1) % allCarouselImages.length);
    setIsAutoPlaying(false);
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  const handleContactNow = () => {
    if (providerPhoneNumber) {
      const cleanPhoneNumber = providerPhoneNumber.replace(/\D/g, '');
      const message = `Hi ${providerName}! I'd like to know more about your services. Could you please provide more details?`;
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`, '_blank');
    } else {
      navigate(`/contact`);
    }
  };

  return (
    <div className='mt-20 max-w-[1350px] mx-auto px-4 py-6'>
      {/* Carousel Section */}
      <div className='relative mb-6 group'>
        <div className='h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg relative bg-white border border-gray-300'>
          {/* Carousel Images */}
          {allCarouselImages.length > 0 ? (
            <div className='h-full relative'>
              {allCarouselImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Service ${index + 1}`}
                  className={`absolute inset-0 object-cover w-full h-full transition-opacity duration-700 ${
                    index === currentCarouselIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200'>
              <HiOutlinePhotograph className='w-32 h-32 text-gray-400' />
            </div>
          )}

          {/* Navigation Buttons */}
          {allCarouselImages.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className='absolute left-4 top-1/2 -translate-y-1/2 bg-gray-800/80 hover:bg-gray-800 text-white p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 border border-white'
              >
                <HiArrowLeft className='w-6 h-6' />
              </button>

              <button
                onClick={goToNext}
                className='absolute right-4 top-1/2 -translate-y-1/2 bg-gray-800/80 hover:bg-gray-800 text-white p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 border border-white'
              >
                <HiArrowRight className='w-6 h-6' />
              </button>
            </>
          )}

          {/* Indicators */}
          {allCarouselImages.length > 1 && (
            <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2'>
              {allCarouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentCarouselIndex
                      ? 'w-8 bg-white'
                      : 'w-2 bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Provider Info Overlay - Left Side */}
          <div className='absolute left-6 top-6 bg-white/95 backdrop-blur-sm px-6 py-4 rounded-xl border border-gray-300 shadow-lg'>
            <div className='flex items-center gap-4'>
              {/* Provider Image */}
              <div className='flex-shrink-0'>
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={providerName}
                    className='w-16 h-16 rounded-full border border-gray-300 object-cover'
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div
                  className='w-16 h-16 rounded-full border border-gray-300 bg-gray-700 text-white flex items-center justify-center font-bold text-2xl'
                  style={{ display: profileImage ? 'none' : 'flex' }}
                >
                  {providerName.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Provider Name */}
              <div>
                <h2 className='text-xl font-bold text-black'>
                  {providerName}
                </h2>
                {/* remove experience display here */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      {bio && (
        <div className='mb-6 bg-white border border-gray-300 rounded-xl p-6'>
          <h2 className='text-2xl font-bold text-black mb-3'>About</h2>
          <p className='text-gray-700 leading-relaxed'>
            {bio}
          </p>
        </div>
      )}

      {/* Services Section */}
      {services.length > 0 && (
        <div className='mb-6'>
          <h2 className='text-2xl font-bold text-black mb-4'>Services Offered</h2>
          <div className='relative'>
            {/* Scroll Left Button */}
            {services.length > 2 && (
              <button
                onClick={scrollLeft}
                className='absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 hover:text-white border border-gray-300 transition-all opacity-90 hover:opacity-100'
              >
                <HiArrowLeft className='w-6 h-6' />
              </button>
            )}

            {/* Services Grid */}
            <div
              ref={scrollRef}
              className='flex gap-4 overflow-x-auto scrollbar-hide pb-4'
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {services.map((service) => (
                <div key={service._id} className='flex-shrink-0 w-80 mt-3'>
                  <ServiceCard service={{ ...service, provider: selectedProvider }} />
                </div>
              ))}
            </div>

            {/* Scroll Right Button */}
            {services.length > 2 && (
              <button
                onClick={scrollRight}
                className='absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 hover:text-white border border-gray-300 transition-all opacity-90 hover:opacity-100'
              >
                <HiArrowRight className='w-6 h-6' />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Contact Now Button */}
      <button
        onClick={handleContactNow}
        className='w-full max-w-md mx-auto block bg-white text-gray-700 py-4 px-6 rounded-xl font-bold text-lg hover:bg-gray-100 hover:text-gray-900 border border-gray-300 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105'
      >
        Contact Now
        <HiArrowRight className='w-6 h-6' />
      </button>
    </div>
  );
};

export default SpecificProvider;