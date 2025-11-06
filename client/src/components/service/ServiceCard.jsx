import React, { useState } from 'react';
import { HiOutlinePhotograph, HiArrowRight } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const ServiceCard = ({ service }) => {

  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  // Get service information
  const fullDescription = service?.description || 'No description available.';

  const truncatedDescription = fullDescription.length > 100
  ? fullDescription.substring(0, 100) + '...'
  : fullDescription;

  // Get price
  const price = service?.price;

  console.log(service);
  
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
      className="bg-white border border-gray-300 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2  group"
    >
      {/* Portfolio Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {mainImage && !imageError ? (
          <img
            src={mainImage}
            alt="Service portfolio"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <HiOutlinePhotograph className="w-24 h-24 text-gray-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Service Description */}
        <div className="mb-4">
          <p className="text-sm text-gray-700 line-clamp-3">
            {truncatedDescription}
          </p>
        </div>

        {/* Price Display */}
        {price !== undefined && price !== null && (
          <div className="mb-4">
            <span className="text-2xl font-bold text-gray-900">
              ₹{typeof price === 'number' ? price.toFixed(2) : price}
            </span>
          </div>
        )}

        {/* Provider Info */}
        <div className="flex items-center gap-3">
          {/* Provider Profile Image */}
          <div className="flex-shrink-0">
            {profileImage ? (
              <img
                src={profileImage}
                alt={providerName}
                className="w-12 h-12 rounded-full border border-gray-300 object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div
              className="w-12 h-12 rounded-full border border-gray-300 bg-gray-700 text-white flex items-center justify-center font-bold text-lg"
              style={{ display: profileImage ? 'none' : 'flex' }}
            >
              {providerName.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Provider Name */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-black truncate">
              By {providerName}
            </h3>
          </div>


        </div>

        <button 
                  onClick={() => navigate(`/service/${service._id}`)}
                  className="w-full mt-7 bg-gray-800 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 hover:text-white border border-gray-300 hover:cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg"
                >
                  Order Now
                  <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

      </div>
    </div>
  );
};

export default ServiceCard;