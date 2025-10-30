import React from 'react';
import { useNavigate } from 'react-router-dom';

const TopServiceCard = ({ service }) => {
  const navigate = useNavigate();

  const image = service?.portfolioImages?.[0]?.url;
  const title = service?.serviceCategory || 'Service';
  const description = service?.description || '';
  const keywords = Array.isArray(service?.keywords) ? service.keywords.slice(0, 4) : [];
  const providerName = service?.provider?.user?.name || 'Unknown Provider';

  const goToService = () => navigate(`/service/${service._id}`);

  return (
    <div
      onClick={goToService}
      className="bg-white border-2 border-black rounded-xl p-4 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group"
    >
      <div className="mb-4">
        <div className="w-full h-48 border-2 border-black rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          {image ? (
            <img src={image} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-black font-bold">No Image</div>
          )}
        </div>
      </div>

      <h3 className="text-2xl font-bold text-black mb-1">{title}</h3>
      <p className="text-sm text-gray-700 mb-2 line-clamp-2">{description}</p>

      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-gray-600">By {providerName}</div>
      </div>

      <div className="flex flex-wrap gap-2">
        {keywords.map((k, idx) => (
          <span
            key={idx}
            className="px-3 py-1 bg-black text-white text-xs font-semibold rounded-full border border-black hover:bg-white hover:text-black transition-all"
          >
            {k}
          </span>
        ))}
        {Array.isArray(service?.keywords) && service.keywords.length > 4 && (
          <span className="px-3 py-1 bg-white text-black text-xs font-semibold rounded-full border-2 border-black hover:bg-black hover:text-white transition-all">
            +{service.keywords.length - 4} more
          </span>
        )}
      </div>
    </div>
  );
};

export default TopServiceCard;


