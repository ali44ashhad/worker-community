import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProviders } from '../features/providerSlice';
import ServiceCard from '../components/service/ServiceCard';
import HomePageLoader from '../components/loaders/HomePageLoader';
import { HiOutlineSearch, HiOutlineRefresh } from 'react-icons/hi';

const Services = () => {
  const dispatch = useDispatch();
  const { allProviders, isFetchingAll, error } = useSelector((state) => state.provider);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
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

  // Filter services based on search and category
  useEffect(() => {
    let filtered = [...allServices];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(service => {
        const category = service?.serviceCategory?.toLowerCase() || '';
        const description = service?.description?.toLowerCase() || '';
        const keywords = (service?.keywords || []).map(k => k?.toLowerCase()).join(' ');
        const subCategories = (service?.subCategories || []).map(s => s?.toLowerCase()).join(' ');
        const providerName = service?.provider?.user?.name?.toLowerCase() || '';
        
        const query = searchQuery.toLowerCase();
        return category.includes(query) || 
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

    setFilteredServices(filtered);
  }, [searchQuery, selectedCategory, allServices]);

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
            All Services
          </h1>
          <p className='text-gray-600 text-center max-w-3xl mx-auto text-base md:text-lg'>
            Browse through all available services from our talented community providers. 
            Find exactly what you need, from tutoring to baking, fitness to technology and more.
          </p>
        </div>

        {/* Stats */}
        {!isFetchingAll && allServices.length > 0 && (
          <div className='mb-8 text-center'>
            <div className='inline-flex items-center gap-6 px-6 py-3 bg-white border-2 border-black rounded-full'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-black'>{allServices.length}</p>
                <p className='text-sm text-gray-600'>Total Services</p>
              </div>
              <div className='w-px h-12 bg-gray-300'></div>
              <div className='text-center'>
                <p className='text-2xl font-bold text-black'>{categories.length}</p>
                <p className='text-sm text-gray-600'>Categories</p>
              </div>
              <div className='w-px h-12 bg-gray-300'></div>
              <div className='text-center'>
                <p className='text-2xl font-bold text-black'>{allProviders.length}</p>
                <p className='text-sm text-gray-600'>Providers</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className='mb-8 space-y-4'>
          {/* Search Bar */}
          <div className='relative max-w-2xl mx-auto'>
            <HiOutlineSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' size={20} />
            <input
              type='text'
              placeholder='Search by category, keyword, or description...'
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
                {searchQuery || selectedCategory !== 'All'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No services available at the moment.'}
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

        {/* Services Grid */}
        {!isFetchingAll && !error && filteredServices.length > 0 && (
          <>
            <div className='mb-6 text-gray-600 text-center'>
              Showing {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'}
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredServices.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Services;