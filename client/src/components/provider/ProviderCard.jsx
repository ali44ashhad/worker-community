import React, { useState } from 'react';
import { HiOutlineUserCircle, HiArrowRight } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const ProviderCard = ({ provider }) => {

    console.log(provider);

  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  
  // Get provider info
  const userName = provider?.user?.name || 'Unknown Provider';
  const profileImage = provider?.user?.profileImage;
  const bio = provider?.bio || 'No bio available.';
  const experience = provider?.experience || 0; 
  const services = provider?.serviceOfferings || [];
  const address = provider?.user?.address || '';
  
  // Get first service portfolio images
  const firstService = services[0];
  const portfolioImage = firstService?.portfolioImages?.[0]?.url;
  
  // Get all unique categories from services
  const categories = [...new Set(services.map(s => s.serviceCategory))];
  const primaryCategory = categories[0] || 'Provider';
  
  // Get some keywords from services
  const keywords = services
    .flatMap(s => s.keywords || [])
    .slice(0, 4);
  
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="bg-white border-2 border-black rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
      {/* Portfolio Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {portfolioImage && !imageError ? (
          <img
            src={portfolioImage}
            alt={`${userName}'s portfolio`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <HiOutlineUserCircle className="w-24 h-24 text-gray-400" />
          </div>
        )}
        
        {/* Experience Badge */}
        <div className="absolute top-3 right-3 bg-black text-white px-3 py-1.5 rounded-full font-semibold text-sm border-2 border-white">
          {experience}+ Years
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-white text-black px-3 py-1.5 rounded-full font-semibold text-sm border-2 border-black">
          {primaryCategory}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* User Info */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0">
            {profileImage ? (
              <img
                src={profileImage}
                alt={userName}
                className="w-12 h-12 rounded-full border-2 border-black object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="w-12 h-12 rounded-full border-2 border-black bg-black text-white flex items-center justify-center font-bold text-lg"
              style={{ display: profileImage ? 'none' : 'flex' }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-black truncate">
              {userName}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              {bio}
            </p>
            {address && (
              <p className="text-xs text-gray-500 truncate mt-1">
                {address}
              </p>
            )}
          </div>
        </div>

        {/* Services Count */}
        {services.length > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm font-semibold text-black">
              {services.length} {services.length === 1 ? 'Service' : 'Services'}
            </span>
          </div>
        )}

        {/* Keywords */}
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-black text-white text-xs font-semibold rounded-full border border-black hover:bg-white hover:text-black transition-all"
              >
                {keyword}
              </span>
            ))}
            {services.length > 0 && (
              <span className="px-3 py-1 bg-white text-black text-xs font-semibold rounded-full border-2 border-black hover:bg-black hover:text-white transition-all">
                +{services.length} more
              </span>
            )}
          </div>
        )}

        {/* Categories */}
        {categories.length > 0 && categories.length <= 3 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.slice(0, 3).map((category, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-white text-black text-xs font-semibold rounded-full border-2 border-gray-300"
              >
                {category}
              </span>
            ))}
          </div>
        )}

        {/* View Profile Button */}
        <button 
          onClick={() => navigate(`/provider/${provider._id}`)}
          className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-white hover:text-black border-2 border-black transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg"
        >
          View Profile
          <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default ProviderCard;