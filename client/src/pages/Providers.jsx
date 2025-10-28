import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProviders } from '../features/providerSlice';
import ProviderCard from '../components/provider/ProviderCard';
import HomePageLoader from '../components/loaders/HomePageLoader';
import { HiOutlineSearch, HiOutlineRefresh } from 'react-icons/hi';

const Providers = () => {
  const dispatch = useDispatch();
  const { allProviders, isFetchingAll, error } = useSelector((state) => state.provider);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredProviders, setFilteredProviders] = useState([]);

  // Fetch providers on component mount
  useEffect(() => {
    dispatch(getAllProviders());
  }, [dispatch]);

  // Filter providers based on search and category
  useEffect(() => {
    let filtered = [...allProviders];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(provider => {
        const userName = provider?.user?.name?.toLowerCase() || '';
        const bio = provider?.bio?.toLowerCase() || '';
        const services = provider?.serviceOfferings || [];
        const categories = services.map(s => s.serviceCategory?.toLowerCase()).join(' ');
        const keywords = services.flatMap(s => s.keywords || []).map(k => k?.toLowerCase()).join(' ');
        
        const query = searchQuery.toLowerCase();
        return userName.includes(query) || 
               bio.includes(query) || 
               categories.includes(query) ||
               keywords.includes(query);
      });
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(provider => {
        const services = provider?.serviceOfferings || [];
        return services.some(s => s.serviceCategory === selectedCategory);
      });
    }

    setFilteredProviders(filtered);
  }, [searchQuery, selectedCategory, allProviders]);

  // Get unique categories from all providers
  const getUniqueCategories = () => {
    const categories = new Set();
    allProviders.forEach(provider => {
      provider?.serviceOfferings?.forEach(service => {
        if (service?.serviceCategory) {
          categories.add(service.serviceCategory);
        }
      });
    });
    return Array.from(categories).sort();
  };

  const categories = getUniqueCategories();

  const handleRefresh = () => {
    dispatch(getAllProviders());
  };

  return (
    <div className='min-h-screen bg-gray-50 pb-16'>
      <div className='max-w-[1350px] mx-auto px-3 pt-24'>
        {/* Header */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl md:text-5xl font-bold text-black mb-4'>
            Our Providers
          </h1>
          <p className='text-gray-600 text-center max-w-3xl mx-auto text-base md:text-lg'>
            Meet the talented individuals in your community ready to help! Browse profiles to find 
            trusted local providers for a variety of services, from tutoring and baking to crafts and more.
          </p>
        </div>

        {/* Filters and Search */}
        <div className='mb-8 space-y-4'>
          {/* Search Bar */}
          <div className='relative max-w-2xl mx-auto'>
            <HiOutlineSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' size={20} />
            <input
              type='text'
              placeholder='Search by name, service, or keyword...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full bg-white border-2 border-black rounded-lg pl-12 pr-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-black'
            />
          </div>

          {/* Category Filters */}
          <div className='flex flex-wrap gap-3 justify-center items-center'>
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-5 py-2 rounded-full font-semibold transition-all border-2 ${
                selectedCategory === 'All'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-black hover:bg-gray-100'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 rounded-full font-semibold transition-all border-2 ${
                  selectedCategory === category
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-black hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <div className='flex justify-center'>
            <button
              onClick={handleRefresh}
              className='flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded-lg font-semibold hover:bg-gray-100 transition-all'
            >
              <HiOutlineRefresh size={18} />
              Refresh
            </button>
          </div>
        </div>

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
              <p className='text-red-600 font-semibold'>Error loading providers</p>
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
        {!isFetchingAll && !error && filteredProviders.length === 0 && (
          <div className='text-center py-12'>
            <div className='bg-white border-2 border-black rounded-xl p-8 max-w-md mx-auto'>
              <HiOutlineSearch className='mx-auto mb-4 text-gray-400' size={48} />
              <p className='text-xl font-semibold text-black mb-2'>
                No providers found
              </p>
              <p className='text-gray-600 text-sm'>
                {searchQuery || selectedCategory !== 'All'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No providers available at the moment.'}
              </p>
              {(searchQuery || selectedCategory !== 'All') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className='mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors'
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Providers Grid */}
        {!isFetchingAll && !error && filteredProviders.length > 0 && (
          <>
            <div className='mb-6 text-gray-600 text-center'>
              Showing {filteredProviders.length} {filteredProviders.length === 1 ? 'provider' : 'providers'}
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredProviders.map((provider) => (
                <ProviderCard key={provider._id} provider={provider} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Providers;