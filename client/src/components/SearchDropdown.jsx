import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getAllProviders } from '../features/providerSlice';
import { getActiveCategories } from '../features/adminSlice';
import { HiOutlineSearch } from 'react-icons/hi';
import { FiTrendingUp } from 'react-icons/fi'; // Added this icon
import { getFullName, getInitials } from '../utils/userHelpers';
import { slugifyCategoryName } from '../utils/slug';

// Map categories to their images (No longer used in the 'showCategories' block, but kept for your reference)

//   "Academics": "/AcademicsCategoryImage.png",
//   "Music": "/MusicCategoryImage.png",
//   "Dance": "/DanceCategoryImage.png",
//   "Fitness & Sports": "/fitnessCategoryImage1.png",
//   "Home Baker": "/HomeBakerCategoryImage.png",
//   "Technology": "/TechnologyCategoryImage.png",
//   "Home Cooking": "/cooking.png",
//   "Home Catering": "/cookingIcon.png",
//   "Catering": "/cookingIcon1.png",
//   "Professional Baker": "/HomeBakerCategoryImage.png",
//   "Workshops": "/tutor.png",
//   "Photography": "/photographyIcon.png",
//   "Consulting": "/eventPlannerIcon.png",
//   "Finance": "/eventPlannerIcon.png",
//   "Groceries": "/groceryIcon.png",
//   "Home Products": "/art.png",
//   "Apparels & Footwear": "/art.png",
//   "Law": "/eventPlannerIcon.png",
//   "Medical": "/eventPlannerIcon.png",
//   "Art & Craft": "/artIcon.png",
//   "Home Interiors": "/art.png",
//   "Construction": "/art.png",
//   "Real Estate": "/eventPlannerIcon.png",
//   "Event Planner": "/eventPlannerIcon.png",
//   "Gifting": "/eventPlannerIcon.png",
//   "Other": "/eventPlannerIcon.png"
// };

const SearchDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { allProviders } = useSelector((state) => state.provider);
  const { activeCategories } = useSelector((state) => state.admin);
  const [searchQuery, setSearchQuery] = useState('');
  const [allServices, setAllServices] = useState([]);
  const dropdownRef = useRef(null);

  // Fetch DB-driven categories once (used for category list)
  useEffect(() => {
    if (isOpen && (!activeCategories || activeCategories.length === 0)) {
      dispatch(getActiveCategories());
    }
  }, [isOpen, activeCategories?.length, dispatch]);

  // Fetch providers if not already loaded
  useEffect(() => {
    if (isOpen && (!allProviders || allProviders.length === 0)) {
      dispatch(getAllProviders());
    }
  }, [isOpen, allProviders.length, dispatch]);

  // Reset search query when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Extract all services from providers
  useEffect(() => {
    const extractedServices = [];
    allProviders.forEach(provider => {
      if (provider?.serviceOfferings && Array.isArray(provider.serviceOfferings)) {
        provider.serviceOfferings.forEach(service => {
          extractedServices.push({
            ...service,
            provider: {
              ...provider,
              user: provider.user,
              _id: provider._id,
              bio: provider.bio,
              experience: provider.experience
            }
          });
        });
      }
    });
    setAllServices(extractedServices);
  }, [allProviders]);

  // Filter services based on search query
  const filteredServices = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return allServices.filter(service => {
      const servicename = service?.servicename?.toLowerCase() || '';
      const category = service?.serviceCategory?.toLowerCase() || '';
      const description = service?.description?.toLowerCase() || '';
      const keywords = (service?.keywords || []).map(k => k?.toLowerCase()).join(' ');
      const subCategories = (service?.subCategories || []).map(s => s?.toLowerCase()).join(' ');
      const providerName = getFullName(service?.provider?.user)?.toLowerCase() || '';
      
      return servicename.includes(query) ||
             category.includes(query) || 
             description.includes(query) || 
             keywords.includes(query) ||
             subCategories.includes(query) ||
             providerName.includes(query);
    }).slice(0, 10); // Limit to 10 results
  }, [searchQuery, allServices]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Get categories
  const categories =
    activeCategories && activeCategories.length > 0
      ? activeCategories.map((c) => [c.name, c])
      : [];

  const handleCategoryClick = (categoryName) => {
    navigate(`/category/${slugifyCategoryName(categoryName)}`);
    setSearchQuery('');
    onClose();
  };

  const handleServiceClick = (serviceId) => {
    navigate(`/service/${serviceId}`);
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  const showCategories = !searchQuery.trim();
  const showServices = searchQuery.trim().length > 0;

  return (
    <div ref={dropdownRef} className="absolute top-full left-0 mt-2 w-[26rem] bg-white border border-gray-300 rounded-lg shadow-2xl z-50 max-h-[600px] overflow-hidden flex flex-col">
      {/* Search Input */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search for services" // Updated placeholder
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 text-black text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto flex-1">
        
        {/* ====================================================== */}
        {/* MODIFIED CATEGORIES BLOCK - START */}
        {/* ====================================================== */}
        {showCategories && (
          <div className="p-4">
            <h3 className="text-base font-semibold text-gray-800 mb-4">
              Trending searches
            </h3>
            <div className="flex flex-wrap gap-3">
              {categories.map(([categoryName]) => {
                return (
                  <div
                    key={categoryName}
                    onClick={() => handleCategoryClick(categoryName)}
                    className="flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-all"
                  >
                    <FiTrendingUp className="text-gray-500" size={16} />
                    <span className="font-medium">{categoryName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* ====================================================== */}
        {/* MODIFIED CATEGORIES BLOCK - END */}
        {/* ====================================================== */}


        {/* ====================================================== */}
        {/* UNCHANGED SERVICES BLOCK - START */}
        {/* ====================================================== */}
        {showServices && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Services ({filteredServices.length})
            </h3>
            {filteredServices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No services found matching "{searchQuery}"</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredServices.map((service) => {
                  const portfolioImages = service?.portfolioImages || [];
                  const mainImage = portfolioImages[0]?.url || '/logo2.png';
                  const providerName = getFullName(service?.provider?.user) || 'Unknown Provider';
                  const description = service?.description || 'No description available.';
                  const truncatedDescription = description.length > 80
                    ? description.substring(0, 80) + '...'
                    : description;

                  return (
                    <div
                      key={service._id}
                      onClick={() => handleServiceClick(service._id)}
                      className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all cursor-pointer group"
                    >
                      {/* Service Image */}
                      <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-200 border border-gray-300">
                        <img
                          src={mainImage}
                          alt="Service"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Service Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-black group-hover:text-gray-700 transition-colors line-clamp-1">
                          {service?.servicename || service?.serviceCategory || 'Service'}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {truncatedDescription}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          By {providerName}
                        </p>
                        {service?.serviceCategory && service?.servicename && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-black text-white text-xs rounded-full">
                            {service.serviceCategory}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {/* ====================================================== */}
        {/* UNCHANGED SERVICES BLOCK - END */}
        {/* ====================================================== */}
      </div>
    </div>
  );
};

export default SearchDropdown;