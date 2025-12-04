import React, { useState } from 'react';
import { HiOutlinePhotograph, HiArrowRight } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaRegHeart } from "react-icons/fa6";
import { IoIosHeart } from "react-icons/io";
import { FaStar } from 'react-icons/fa';
import { addToWishlist, removeFromWishlist } from '../../features/wishlistSlice';
import { toast } from 'react-hot-toast';
import { getFullName, getInitials } from '../../utils/userHelpers';

const ServiceCard = ({ service }) => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const wishlistIds = useSelector((s) => s.wishlist.ids);
  const [imageError, setImageError] = useState(false);

  // Get service information
  const serviceName = service?.servicename || '';
  const fullDescription = service?.description || 'No description available.';

  const truncatedDescription = fullDescription.length > 80
  ? fullDescription.substring(0, 80) + '...'
  : fullDescription;

  // Get price
  const price = service?.price;

  // Get portfolio images
  const portfolioImages = service?.portfolioImages || [];
  const mainImage = portfolioImages[0]?.url;

  // Get provider information
  const provider = service?.provider || {};
  const providerUser = provider?.user || {};
  const providerName = getFullName(providerUser) || 'Unknown Provider';
  const profileImage = providerUser?.profileImage;
//   const providerId = provider?._id;

  // Get rating information
  const averageRating = service?.averageRating || 0;
  const reviewCount = service?.reviewCount || 0;
  
  // Debug: Log service data to check ratings

  
  // Render stars for rating
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" size={12} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-yellow-400" size={12} style={{ opacity: 0.5 }} />);
      } else {
        stars.push(<FaStar key={i} className="text-gray-300" size={12} />);
      }
    }
    return stars;
  };

  const handleImageError = () => {
    setImageError(true);
  };

//   const handleCardClick = () => {
//     if (providerId) {
//       navigate(`/provider/${providerId}`);
//     }
//   };

  const handleCardClick = () => {
    navigate(`/service/${service._id}`);
  };

  const isInWishlist = wishlistIds?.includes(service._id);
  const onToggleWishlist = (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to add services to your wishlist');
      navigate('/login');
      return;
    }
    if (isInWishlist) {
      dispatch(removeFromWishlist(service._id));
    } else {
      dispatch(addToWishlist(service._id));
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 group cursor-pointer"
    >
      {/* Portfolio Image */}
      <div className="relative h-36 bg-gray-100 overflow-hidden">
        {/* Heart Icon */}
        <button
          onClick={onToggleWishlist}
          className="absolute right-2 top-2 w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-300 shadow-md hover:scale-110 transition-all duration-200 z-10"
        >
          {isInWishlist ? (
            <IoIosHeart className="text-red-600" size={18} />
          ) : (
            <FaRegHeart className="text-red-600" size={16} />
          )}
        </button>
        
        {mainImage && !imageError ? (
          <img
            src={mainImage}
            alt="Service portfolio"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <HiOutlinePhotograph className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Service Name */}
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
            {serviceName || service?.serviceCategory || 'Service'}
          </h3>
        </div>

        {/* Rating Display */}
        {averageRating > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center gap-0.5">
              {renderStars()}
            </div>
            <span className="text-xs font-semibold text-gray-700">
              {averageRating.toFixed(1)}
            </span>
            {reviewCount > 0 && (
              <span className="text-xs text-gray-500">
                ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            )}
          </div>
        )}

        {/* Service Description */}
        <div className="mb-3">
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {truncatedDescription}
          </p>
        </div>

        {/* Price and Provider Row */}
        <div className="flex items-center justify-between gap-3 mb-3">
          {/* Price Display */}
          {price !== undefined && price !== null && (
            <span className="text-base font-semibold text-gray-900">
              ₹{typeof price === 'number' ? price.toLocaleString('en-IN') : price}
            </span>
          )}

          {/* Provider Info */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Provider Profile Image */}
            <div className="flex-shrink-0">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={providerName}
                  className="w-7 h-7 rounded-full border border-gray-200 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div
                className="w-7 h-7 rounded-full border border-gray-200 bg-gray-700 text-white flex items-center justify-center font-semibold text-xs"
                style={{ display: profileImage ? 'none' : 'flex' }}
              >
                {getInitials(providerUser)}
              </div>
            </div>

            {/* Provider Name */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 truncate">
                {providerName}
              </p>
            </div>
          </div>
        </div>

        {/* Order Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/service/${service._id}`);
          }}
          className="w-full mt-3 bg-gray-900 text-white py-2 px-3 rounded-md text-xs font-medium hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-1.5"
        >
          View Details
          <HiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;