import React from 'react';
import { useNavigate } from 'react-router-dom';

const TopCategoryCard = ({ category, data, image }) => {
  const navigate = useNavigate();
  // Get first 5 keywords
  const displayedKeywords = data.keywords.slice(0, 5);

  const handleClick = () => {
    navigate(`/category/${encodeURIComponent(category)}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white border-2 hover:cursor-pointer border-black rounded-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
    >
      {/* Image */}
      <div className="mb-4 flex justify-center">
        <div className="w-full h-48 border-2 border-black rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          <span className="text-black font-bold text-sm uppercase  text-center">
            <img src={image} alt="" />
          </span>
        </div>
      </div>

      {/* Category Name */}
      <h3 className="text-2xl font-bold text-black text-center mb-3">
        {category}
      </h3>

      {/* Description */}
      <div className="text-gray-600 text-center text-sm mb-4 min-h-[2.5rem] flex items-center justify-center">
        <p className="line-clamp-2">
          {data.description}
        </p>
      </div>

      {/* Keywords */}
      <div className="flex flex-wrap gap-2 justify-center">
        {displayedKeywords.map((keyword, index) => (
          <span 
            key={index}
            className="px-3 py-1 bg-black text-white text-xs font-semibold rounded-full border border-black hover:bg-white hover:text-black transition-all"
          >
            {keyword}
          </span>
        ))}
        {data.keywords.length > 5 && (
          <span className="px-3 py-1 bg-white text-black text-xs font-semibold rounded-full border-2 border-black hover:bg-black hover:text-white transition-all">
            +{data.keywords.length - 5} more
          </span>
        )}
      </div>
    </div>
  );
};

export default TopCategoryCard;