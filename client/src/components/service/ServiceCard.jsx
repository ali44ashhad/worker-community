import React, { useState } from 'react';
import { HiOutlinePhotograph, HiArrowRight } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const ServiceCard = ({ service }) => {

  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  // Get service information
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
  const providerName = providerUser?.name || 'Unknown Provider';
  const profileImage = providerUser?.profileImage;
//   const providerId = provider?._id;

  const handleImageError = () => {
    setImageError(true);
  };

//   const handleCardClick = () => {
//     if (providerId) {
//       navigate(`/provider/${providerId}`);
//     }
//   };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 group"
    >
      {/* Portfolio Image */}
      <div className="relative h-36 bg-gray-100 overflow-hidden">
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
                {providerName.charAt(0).toUpperCase()}
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
          onClick={() => navigate(`/service/${service._id}`)}
          className="w-full mt-3 bg-gray-900 text-white py-2 px-3 rounded-md text-xs font-medium hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-1.5"
        >
          Order Now
          <HiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;