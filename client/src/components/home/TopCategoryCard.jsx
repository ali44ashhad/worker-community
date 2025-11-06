import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

const TopCategoryCard = ({ category, data, image }) => {
  const navigate = useNavigate();
  // Get first 5 keywords - with null safety
  const keywords = Array.isArray(data?.keywords) ? data.keywords : [];
  const displayedKeywords = keywords.slice(0, 5);
  const averageRating = data?.averageRating || 0;
  const reviewCount = data?.reviewCount || 0;
  const serviceCount = data?.serviceCount || 0;
  const description = data?.description || '';

  const handleClick = () => {
    navigate(`/category/${encodeURIComponent(category)}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white border shadow-md hover:bg-gray-100 hover:cursor-pointer border-gray-300 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
    >
      {/* Image */}
      <div className="mb-4 flex justify-center">
        <div className="w-full h-48 border border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
          {image && image !== "DefaultCategoryImage" ? (
            <img 
              src={image} 
              alt={category} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div 
            className="w-full h-full flex items-center justify-center text-gray-400"
            style={{ display: (image && image !== "DefaultCategoryImage") ? 'none' : 'flex' }}
          >
            <span className="text-xs font-medium text-gray-500">{category}</span>
          </div>
        </div>
      </div>

      {/* Category Name */}
      <h3 className="text-2xl font-bold text-black text-center mb-3">
        {category}
      </h3>

      {/* Rating and Stats */}
      {(averageRating > 0 || reviewCount > 0 || serviceCount > 0) && (
        <div className="flex items-center justify-center gap-4 mb-3">
          {averageRating > 0 && (
            <div className="flex items-center gap-1">
              <FaStar className="text-yellow-400" size={14} />
              <span className="text-sm font-semibold text-gray-900">
                {averageRating.toFixed(1)}
              </span>
            </div>
          )}
          {reviewCount > 0 && (
            <span className="text-xs text-gray-600">
              {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </span>
          )}
          {serviceCount > 0 && (
            <span className="text-xs text-gray-600">
              {serviceCount} {serviceCount === 1 ? 'service' : 'services'}
            </span>
          )}
        </div>
      )}

      {/* Description */}
      <div className="text-gray-600 text-center text-sm mb-4 min-h-[2.5rem] flex items-center justify-center">
        <p className="line-clamp-2">
          {description}
        </p>
      </div>

      {/* Keywords */}
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {displayedKeywords.map((keyword, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full border border-gray-300 hover:bg-gray-200 hover:border-gray-400 transition-all"
            >
              {keyword}
            </span>
          ))}
          {keywords.length > 5 && (
            <span className="px-3 py-1 bg-white text-gray-700 text-xs font-semibold rounded-full border border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-all">
              +{keywords.length - 5} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TopCategoryCard;