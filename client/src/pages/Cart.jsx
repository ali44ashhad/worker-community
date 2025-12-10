import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getAllProviders } from '../features/providerSlice'
import { fetchWishlist, removeFromWishlist } from '../features/wishlistSlice'
import { HiOutlinePhotograph, HiX, HiArrowRight } from 'react-icons/hi'
import { getFullName, getInitials } from '../utils/userHelpers'
import { toast } from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
axios.defaults.withCredentials = true;

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return wishlistServices.reduce((sum, service) => {
      // const price = service?.price;
      // if (price !== undefined && price !== null) {
      //   const numPrice = typeof price === 'number' ? price : parseFloat(price) || 0;
      //   return sum + numPrice;
      // }
      return sum;
    }, 0);
  }, [wishlistServices]);

  const handleRemove = async (serviceId, e) => {
    e.stopPropagation();
    await dispatch(removeFromWishlist(serviceId));
  };

  const handleServiceClick = (serviceId) => {
    navigate(`/service/${serviceId}`);
  };

  const handleContactProvider = async (serviceId, providerId, providerName, providerPhoneNumber) => {
    // Check if user is logged in
    if (!user) {
      toast.error('Please login to continue with your order');
      navigate('/login');
      return;
    }

    // Increment service offering count
    try {
      await axios.post(`${API_URL}/api/service-offering/${serviceId}/increment-count`);
    } catch (error) {
      console.error('Failed to increment service offering count:', error);
      // Continue even if increment fails
    }

    // Increment provider profile count
    try {
      await axios.post(`${API_URL}/api/provider-profile/${providerId}/increment-count`);
    } catch (error) {
      console.error('Failed to increment provider profile count:', error);
      // Continue even if increment fails
    }

    // Redirect to WhatsApp with provider's phone number
    if (providerPhoneNumber) {
      // Clean the phone number - remove spaces, +, and special characters
      const cleanPhoneNumber = providerPhoneNumber.replace(/\D/g, '');
      
      // Create WhatsApp message
      const loggedInUserName = getFullName(user);
      const message = `Hi ${providerName}, this is ${loggedInUserName}! I viewed your profile on Commun and would like to know more about your services. Could you please provide more details?`;
      const encodedMessage = encodeURIComponent(message);
      
      // Open WhatsApp
      window.open(`https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`, '_blank');
    } else {
      // Fallback to contact page if no phone number
      navigate(`/contact`);
    }
  };

  if (!user) {
    return (
      <div className='min-h-screen bg-gray-50 pt-24 pb-12'>
        <div className='max-w-[1350px] mx-auto px-4'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>Wishlist</h1>
          <p className='text-sm text-gray-600'>Please login to view your wishlist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 pt-24 pb-12'>
      <div className='max-w-[1350px] mx-auto px-4'>
        <h1 className='text-2xl font-bold text-gray-900 mb-6'>Your Wishlist ({wishlistServices.length})</h1>
        
      {isFetchingAll ? (
          <div className='relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-gray-50 to-indigo-50 p-10 text-center shadow-sm'>
            <div className='pointer-events-none absolute inset-0 opacity-30 blur-3xl bg-gradient-to-r from-indigo-100/80 via-pink-100/60 to-purple-100/80' />
            <p className='relative text-base font-semibold text-gray-900 tracking-tight'>Curating your wishlist experience...</p>
            <p className='relative mt-2 text-sm text-gray-600'>Hang tight while we load the best services for you.</p>
          </div>
      ) : wishlistServices.length === 0 ? (
          <div className='relative overflow-hidden rounded-2xl border border-gray-200 bg-white/90 p-12 text-center shadow-sm'>
            <div className='pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br from-indigo-100 via-pink-100 to-amber-100 opacity-70 blur-3xl' />
            <div className='pointer-events-none absolute -bottom-12 -left-10 w-40 h-40 rounded-full bg-gradient-to-br from-rose-100 via-purple-100 to-indigo-100 opacity-60 blur-3xl' />
            <div className='relative'>
              <p className='text-lg font-semibold text-gray-900 mb-2'>Your wishlist is feeling lonely</p>
              <p className='text-sm text-gray-600 mb-6'>Discover top-rated neighbours and add services you love to keep them handy.</p>
              <button
                onClick={() => navigate('/service')}
                className='inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800'
              >
                Explore Services
                <HiArrowRight className='w-4 h-4' />
              </button>
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            {/* Wishlist Items */}
            {wishlistServices.map((service) => {
              const image = service?.portfolioImages?.[0]?.url;
              const title = service?.servicename || service?.serviceCategory || 'Service';
              const description = service?.description || '';
              // const price = service?.price;
              const providerName = getFullName(service?.provider?.user) || 'Unknown Provider';
              const profileImage = service?.provider?.user?.profileImage;
              const providerPhoneNumber = service?.provider?.user?.phoneNumber || '';
              const providerId = service?.provider?._id;
              const truncatedDescription = description.length > 100 
                ? description.substring(0, 100) + '...' 
                : description;

              return (
                <div
                  key={service._id}
                  className='relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200'
                >
                  {/* Remove Button - Positioned absolutely in top right on mobile */}
                  <button
                    onClick={(e) => handleRemove(service._id, e)}
                    className='absolute top-4 right-4 sm:hidden flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors z-10'
                    title='Remove from wishlist'
                  >
                    <HiX className='w-5 h-5 text-gray-600' />
                  </button>

                  <div className='flex flex-col sm:flex-row gap-4'>
                    {/* Image */}
                    <div 
                      className='flex-shrink-0 w-32 h-32 bg-gray-100 rounded-lg overflow-hidden cursor-pointer'
                      onClick={() => handleServiceClick(service._id)}
                    >
                      {image ? (
                        <img 
                          src={image} 
                          alt={title} 
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center'>
                          <HiOutlinePhotograph className='w-8 h-8 text-gray-400' />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between gap-4'>
                        <div className='flex-1 min-w-0'>
                          <h3 
                            className='text-sm font-semibold text-gray-900 mb-1 cursor-pointer hover:text-gray-700 line-clamp-1'
                            onClick={() => handleServiceClick(service._id)}
                          >
                            {title}
                          </h3>
                          <p className='text-xs text-gray-600 mb-2 line-clamp-2'>
                            {truncatedDescription}
                          </p>
                          
                          {/* Provider Info */}
                          <div className='flex items-center gap-2 mb-2'>
                            {profileImage ? (
                              <img
                                src={profileImage}
                                alt={providerName}
                                className='w-5 h-5 rounded-full border border-gray-200 object-cover'
                              />
                            ) : (
                              <div className='w-5 h-5 rounded-full border border-gray-200 bg-gray-700 text-white flex items-center justify-center font-semibold text-[10px]'>
                                {getInitials(service?.provider?.user)}
                              </div>
                            )}
                            <span className='text-xs text-gray-600'>{providerName}</span>
                          </div>

                          {/* Contact Provider Button - Desktop */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContactProvider(service._id, providerId, providerName, providerPhoneNumber);
                            }}
                            className='hidden sm:block mt-8 w-auto bg-gray-900 text-white py-1.5 px-3 rounded-lg text-xs font-semibold hover:bg-gray-800 transition-all'
                          >
                            Contact Provider
                          </button>

                          {/* Price */}
                          {/* {price !== undefined && price !== null && (
                            <div className='mt-2'>
                              <span className='text-base font-semibold text-gray-900'>
                                ₹{typeof price === 'number' ? price.toLocaleString('en-IN') : price}
                              </span>
                            </div>
                          )} */}
                        </div>

                        {/* Remove Button - Desktop */}
                        <button
                          onClick={(e) => handleRemove(service._id, e)}
                          className='hidden sm:flex flex-shrink-0 w-8 h-8 items-center justify-center rounded-full hover:bg-gray-100 transition-colors'
                          title='Remove from wishlist'
                        >
                          <HiX className='w-5 h-5 text-gray-600' />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Contact Provider Button - Mobile (below image and description) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContactProvider(service._id, providerId, providerName, providerPhoneNumber);
                    }}
                    className='sm:hidden mt-4 w-full bg-gray-900 text-white py-2 px-4 rounded-lg text-xs font-semibold hover:bg-gray-800 transition-all'
                  >
                    Contact Provider
                  </button>
                </div>
              );
            })}

            {/* Continue Shopping Button */}
            <div className='pt-4'>
              <button
                onClick={() => navigate('/service')}
                className='w-full bg-gray-900 text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2'
              >
                Continue Shopping
                <HiArrowRight className='w-4 h-4' />
              </button>
            </div>
          </div>
      )}
      </div>
    </div>
  )
}

export default Cart