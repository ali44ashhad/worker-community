import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProviders } from '../features/providerSlice';
import ServiceCard from '../components/service/ServiceCard';
import HomePageLoader from '../components/loaders/HomePageLoader';
import { HiOutlineSearch, HiOutlineRefresh } from 'react-icons/hi';
import { getFullName } from '../utils/userHelpers';

const Services = () => {
  const dispatch = useDispatch();
  const { allProviders, isFetchingAll, error } = useSelector((state) => state.provider);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [filteredServices, setFilteredServices] = useState([]);
  const [allServices, setAllServices] = useState([]);

  // Fetch providers on component mount
  useEffect(() => {
    dispatch(getAllProviders());
  }, [dispatch]);

  // Extract all services from providers
  useEffect(() => {
    const extractedServices = [];
    allProviders.forEach(provider => {
      if (provider?.serviceOfferings && Array.isArray(provider.serviceOfferings)) {
        provider.serviceOfferings.forEach(service => {
          // Add provider info to each service
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

  useEffect(() => {
    let filtered = [...allServices];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(service => {
        const servicename = service?.servicename?.toLowerCase() || '';
        const category = service?.serviceCategory?.toLowerCase() || '';
        const description = service?.description?.toLowerCase() || '';
        const keywords = (service?.keywords || []).map(k => k?.toLowerCase()).join(' ');
        const subCategories = (service?.subCategories || []).map(s => s?.toLowerCase()).join(' ');
        const providerName = getFullName(service?.provider?.user)?.toLowerCase() || '';
        
        const query = searchQuery.toLowerCase();
        return servicename.includes(query) ||
               category.includes(query) || 
               description.includes(query) || 
               keywords.includes(query) ||
               subCategories.includes(query) ||
               providerName.includes(query);
      });
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(service => {
        return service?.serviceCategory === selectedCategory;
      });
    }

    // Apply subcategory filter (only when category is selected)
    if (selectedCategory !== 'All' && selectedSubcategory !== 'All') {
      filtered = filtered.filter(service => {
        const subCategories = service?.subCategories || [];
        return subCategories.includes(selectedSubcategory);
      });
    }

    // Apply rating filter
    if (minRating > 0) {
      filtered = filtered.filter(service => {
        const rating = service?.averageRating || 0;
        return rating >= minRating;
      });
    }

    setFilteredServices(filtered);
  }, [searchQuery, selectedCategory, selectedSubcategory, minRating, allServices]);

  // Get unique categories from all services
  const getUniqueCategories = () => {
    const categories = new Set();
    allServices.forEach(service => {
      if (service?.serviceCategory) {
        categories.add(service.serviceCategory);
      }
    });
    return Array.from(categories).sort();
  };

  // Get unique subcategories for the selected category
  const getUniqueSubcategories = () => {
    if (selectedCategory === 'All') return [];
    
    const subcategories = new Set();
    allServices.forEach(service => {
      if (service?.serviceCategory === selectedCategory && service?.subCategories) {
        service.subCategories.forEach(subCat => {
          if (subCat) {
            subcategories.add(subCat);
          }
        });
      }
    });
    return Array.from(subcategories).sort();
  };

  const categories = getUniqueCategories();
  const subcategories = getUniqueSubcategories();

  // Reset subcategory when category changes
  useEffect(() => {
    setSelectedSubcategory('All');
  }, [selectedCategory]);

  const handleRefresh = () => {
    dispatch(getAllProviders());
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedSubcategory('All');
    setMinRating(0);
  };

  return (
    <div className='min-h-screen bg-gray-50 pb-16'>
      <div className='max-w-[1350px] mx-auto px-4 pt-24'>
        {/* Main Content: Filters on Left, Services on Right */}
        <div className='flex flex-col lg:flex-row gap-6'>
          {/* Left Sidebar - Everything */}
          <div className='lg:w-80 flex-shrink-0'>
            <div className='bg-white border border-gray-300 rounded-xl overflow-hidden sticky top-24 max-h-[calc(100vh-6rem)] flex flex-col'>
              {/* Fixed Top Section */}
              <div className='p-4 space-y-4 flex-shrink-0 border-b border-gray-200'>
                {/* Header */}
                <div className='mb-3'>
                  <h1 className='text-2xl font-bold text-black mb-1'>
                    All Services
                  </h1>
                  <p className='text-gray-600 text-xs leading-tight'>
                    Browse through all available services from our talented community providers. 
                    Find exactly what you need, from tutoring to baking, fitness to technology and more.
                  </p>
                </div>

                {/* Search Bar */}
                <div className='relative'>
                  <HiOutlineSearch className='absolute left-2 top-1/2 -translate-y-1/2 text-gray-400' size={16} />
                  <input
                    type='text'
                    placeholder='Search...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='w-full bg-white border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400'
                  />
                </div>
              </div>

              {/* Scrollable Filters Section */}
              <div className='p-4 space-y-4 overflow-y-auto flex-1'>
                <div>
                  <h2 className='text-base font-bold text-black mb-3'>Filters</h2>
                </div>

                {/* Category Filters */}
                <div className='space-y-2'>
                  <h3 className='text-xs font-semibold text-gray-700'>Categories</h3>
                  <div className='flex flex-wrap gap-1.5'>
                    <button
                      onClick={() => setSelectedCategory('All')}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
                        selectedCategory === 'All'
                          ? 'bg-gray-600 text-white border-gray-600'
                          : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      All
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                          selectedCategory === category
                            ? 'bg-gray-600 text-white border-gray-600'
                            : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subcategory Filters - Only show when a category is selected */}
                {selectedCategory !== 'All' && subcategories.length > 0 && (
                  <div className='space-y-2'>
                    <h3 className='text-xs font-semibold text-gray-700'>Subcategories</h3>
                    <div className='flex flex-wrap gap-1.5'>
                      <button
                        onClick={() => setSelectedSubcategory('All')}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
                          selectedSubcategory === 'All'
                            ? 'bg-gray-600 text-white border-gray-600'
                            : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        All
                      </button>
                      {subcategories.map((subcategory) => (
                        <button
                          key={subcategory}
                          onClick={() => setSelectedSubcategory(subcategory)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                            selectedSubcategory === subcategory
                              ? 'bg-gray-600 text-white border-gray-600'
                              : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {subcategory}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rating Filter */}
                <div className='space-y-2'>
                  <h3 className='text-xs font-semibold text-gray-700'>Minimum Rating</h3>
                  <div className='flex flex-wrap gap-1.5'>
                    <button
                      onClick={() => setMinRating(0)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
                        minRating === 0
                          ? 'bg-gray-600 text-white border-gray-600'
                          : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setMinRating(4)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                        minRating === 4
                          ? 'bg-gray-600 text-white border-gray-600'
                          : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      4+ ⭐
                    </button>
                    <button
                      onClick={() => setMinRating(3)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                        minRating === 3
                          ? 'bg-gray-600 text-white border-gray-600'
                          : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      3+ ⭐
                    </button>
                    <button
                      onClick={() => setMinRating(2)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                        minRating === 2
                          ? 'bg-gray-600 text-white border-gray-600'
                          : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      2+ ⭐
                    </button>
                    <button
                      onClick={() => setMinRating(1)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                        minRating === 1
                          ? 'bg-gray-600 text-white border-gray-600'
                          : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      1+ ⭐
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='space-y-1.5 pt-3 border-t border-gray-200'>
                  <button
                    onClick={handleRefresh}
                    className='w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-semibold hover:bg-gray-100 transition-all'
                  >
                    <HiOutlineRefresh size={14} />
                    Refresh
                  </button>
                  {(searchQuery || selectedCategory !== 'All' || selectedSubcategory !== 'All' || minRating > 0) && (
                    <button
                      onClick={handleClearFilters}
                      className='w-full px-3 py-1.5 bg-gray-600 text-white border border-gray-600 rounded text-xs font-semibold hover:bg-gray-700 transition-all'
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Services Grid */}
          <div className='flex-1'>

            {/* Loading State */}
            {isFetchingAll && (
              <div className='mt-12'>
                <HomePageLoader />
              </div>
            )}

            {/* Error State */}
            {error && !isFetchingAll && (
              <div className='text-center py-12'>
                <div className='bg-red-50 border-2 border-red-200 rounded-xl p-6 max-w-md mx-auto'>
                  <p className='text-red-600 font-semibold'>Error loading services</p>
                  <p className='text-gray-600 text-sm mt-2'>{error}</p>
                  <button
                    onClick={handleRefresh}
                    className='mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors'
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* No Results State */}
            {!isFetchingAll && !error && filteredServices.length === 0 && (
              <div className='text-center py-12'>
                <div className='bg-white border-2 border-black rounded-xl p-8 max-w-md mx-auto'>
                  <HiOutlineSearch className='mx-auto mb-4 text-gray-400' size={48} />
                  <p className='text-xl font-semibold text-black mb-2'>
                    No services found
                  </p>
                  <p className='text-gray-600 text-sm'>
                    {searchQuery || selectedCategory !== 'All' || selectedSubcategory !== 'All' || minRating > 0
                      ? 'Try adjusting your search or filter criteria.'
                      : 'No services available at the moment.'}
                  </p>
                  {(searchQuery || selectedCategory !== 'All' || selectedSubcategory !== 'All' || minRating > 0) && (
                    <button
                      onClick={handleClearFilters}
                      className='mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors'
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Services Grid */}
            {!isFetchingAll && !error && filteredServices.length > 0 && (
              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
                {filteredServices.map((service) => (
                  <ServiceCard key={service._id} service={service} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;