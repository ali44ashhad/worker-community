import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getActiveCategories } from '../features/adminSlice';
import { getAllPublicServices } from '../features/serviceSlice';
import { HiOutlineSearch } from 'react-icons/hi';
import { FiTrendingUp } from 'react-icons/fi';
import { getFullName } from '../utils/userHelpers';
import { slugifyCategoryName } from '../utils/slug';
import ServiceCover from './service/ServiceCover';

const SearchDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { services, isFetching } = useSelector((state) => state.services);
  const { activeCategories } = useSelector((state) => state.admin);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Fetch DB-driven categories once (used for category list)
  useEffect(() => {
    if (isOpen && (!activeCategories || activeCategories.length === 0)) {
      dispatch(getActiveCategories());
    }
  }, [isOpen, activeCategories?.length, dispatch]);

  // Fetch all services for search (not paginated)
  useEffect(() => {
    if (isOpen && (!services || services.length === 0)) {
      dispatch(getAllPublicServices());
    }
  }, [isOpen, services?.length, dispatch]);

  // Reset search query when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  const allServices = services || [];

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
    <div
      ref={dropdownRef}
      className="flex w-full max-w-xl max-h-[min(600px,calc(100vh-6rem))] flex-col overflow-hidden rounded-2xl border border-purple-100/50 bg-white shadow-2xl shadow-purple-500/10"
    >
      {/* Search Input */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search for services"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 text-black text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        </div>
      </div>

        {/* Content */}
      <div className="overflow-y-auto flex-1">
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

        {showServices && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Services ({filteredServices.length})
            </h3>
            {isFetching && allServices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">Loading services...</p>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No services found matching "{searchQuery}"</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredServices.map((service) => {
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
                      <div className="service-image-zoom h-16 w-16 shrink-0 overflow-hidden rounded-md border border-gray-300">
                        <ServiceCover
                          service={service}
                          size="xs"
                          imageClassName="service-image-zoom__img h-full w-full object-cover"
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
      </div>
    </div>
  );
};

export default SearchDropdown;