import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaRegHeart } from "react-icons/fa6";
import { IoIosHeart } from "react-icons/io";
import { addToWishlist, removeFromWishlist } from '../../features/wishlistSlice';
import { toast } from 'react-hot-toast';
import { getFullName } from '../../utils/userHelpers';

const TopServiceCard = ({ service }) => {

  

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const wishlistIds = useSelector((s) => s.wishlist.ids);

  const image = service?.portfolioImages?.[0]?.url;
  const serviceName = service?.servicename || '';
  const serviceCategory = service?.serviceCategory || 'Service';
  const description = service?.description || '';
  const keywords = Array.isArray(service?.keywords) ? service.keywords.slice(0, 4) : [];
  const providerName = getFullName(service?.provider?.user) || 'Unknown Provider';
  const price = service?.price;
  console.log("service : ",service);

  const goToService = () => navigate(`/service/${service._id}`);

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
      onClick={goToService}
      className="relative bg-white hover:bg-gray-100 border border-gray-300 rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group"
    >
      {/* ❤️ Heart icon always visible */}
      <button
        onClick={onToggleWishlist}
        className="absolute right-6 top-6 w-10 h-10 rounded-full flex items-center justify-center bg-white border border-gray-300 shadow hover:scale-110 transition-all duration-200"
      >
        {isInWishlist ? (
          <IoIosHeart className="text-red-600" size={22} />
        ) : (
          <FaRegHeart className="text-red-600" size={20} />
        )}
      </button>

      <div className="mb-4">
        <div className="w-full h-48 border border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
          {image ? (
            <img src={image} alt={serviceName || serviceCategory} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-black font-bold">
              No Image
            </div>
          )}
        </div>
      </div>

      {/* Service Name */}
      <h3 className="text-xl font-bold text-black mb-1">{serviceName || 'Service'}</h3>
      <p className="text-sm text-gray-700 mb-2 line-clamp-2">{description}</p>

      {/* Price Display */}

      {price !== undefined && price !== null && (
        <div className="mb-2">
          <span className="text-xl font-bold text-gray-900">
            ₹{typeof price === 'number' ? price.toFixed(2) : price}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-gray-600">By {providerName}</div>
      </div>

      <div className="flex flex-wrap gap-2">
        {keywords.map((k, idx) => (
          <span
            key={idx}
            className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full border border-gray-300 hover:bg-gray-200 hover:border-gray-400 transition-all"
          >
            {k}
          </span>
        ))}
        {Array.isArray(service?.keywords) && service.keywords.length > 4 && (
          <span className="px-3 py-1 bg-white text-gray-700 text-xs font-semibold rounded-full border border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-all">
            +{service.keywords.length - 4} more
          </span>
        )}
      </div>
    </div>
  );
};

export default TopServiceCard;
