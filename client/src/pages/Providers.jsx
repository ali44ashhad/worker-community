import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { getAllProviders } from '../features/providerSlice';
import ProviderCard from '../components/provider/ProviderCard';
import HomePageLoader from '../components/loaders/HomePageLoader';
import CommunityCta from '../components/home/CommunityCta';
import { Search, RefreshCw } from 'lucide-react';
import { getFullName } from '../utils/userHelpers';
import Pagination from '../components/Pagination';

const chipClass = (active) =>
  `px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
    active
      ? 'bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white border-transparent shadow-sm'
      : 'bg-white text-[var(--text-secondary)] border-purple-100 hover:bg-purple-50 hover:border-purple-200'
  }`;

const Providers = () => {
  const dispatch = useDispatch();
  const { allProviders, isFetchingAll, error, pagination } = useSelector((state) => state.provider);

  const ITEMS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredProviders, setFilteredProviders] = useState([]);

  useEffect(() => {
    dispatch(getAllProviders({ page: currentPage, limit: ITEMS_PER_PAGE }));
  }, [dispatch, currentPage]);

  useEffect(() => {
    let filtered = [...allProviders];

    if (searchQuery.trim()) {
      filtered = filtered.filter((provider) => {
        const userName = getFullName(provider?.user)?.toLowerCase() || '';
        const bio = provider?.bio?.toLowerCase() || '';
        const services = provider?.serviceOfferings || [];
        const categories = services.map((s) => s.serviceCategory?.toLowerCase()).join(' ');
        const keywords = services
          .flatMap((s) => s.keywords || [])
          .map((k) => k?.toLowerCase())
          .join(' ');

        const query = searchQuery.toLowerCase();
        return (
          userName.includes(query) ||
          bio.includes(query) ||
          categories.includes(query) ||
          keywords.includes(query)
        );
      });
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((provider) => {
        const services = provider?.serviceOfferings || [];
        return services.some((s) => s.serviceCategory === selectedCategory);
      });
    }

    setFilteredProviders(filtered);
  }, [searchQuery, selectedCategory, allProviders]);

  const getUniqueCategories = () => {
    const categories = new Set();
    allProviders.forEach((provider) => {
      provider?.serviceOfferings?.forEach((service) => {
        if (service?.serviceCategory) categories.add(service.serviceCategory);
      });
    });
    return Array.from(categories).sort();
  };

  const categories = getUniqueCategories();
  const hasActiveFilters = searchQuery || selectedCategory !== 'All';

  const handleRefresh = () => {
    dispatch(getAllProviders({ page: currentPage, limit: ITEMS_PER_PAGE }));
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  return (
    <motion.div
      className="home-page min-h-screen bg-[var(--background-subtle)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-12 lg:pt-32 lg:pb-14 bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(217,70,239,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(107,70,193,0.05),transparent_50%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-fuchsia-100 rounded-full mb-6">
              <span className="text-sm font-semibold bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent">
                Local Experts
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-br from-[var(--text-primary)] via-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent mb-4 leading-[1.1]">
              Our Providers
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              Meet talented people in your community — tutors, bakers, fitness coaches, and more,
              ready to help right in your neighbourhood.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <section className="pb-16 bg-gradient-to-b from-white to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Sidebar */}
            <div className="lg:w-80 shrink-0">
              <div className="bg-white/80 backdrop-blur-sm border border-purple-100/50 rounded-3xl overflow-hidden shadow-lg shadow-purple-500/5 sticky top-24 max-h-[calc(100vh-6rem)] flex flex-col">
                <div className="p-5 space-y-4 shrink-0 border-b border-purple-100">
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">Search &amp; Filter</h2>
                    <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
                      Find providers by name, bio, service category, or keyword.
                    </p>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                    <input
                      type="text"
                      placeholder="Search providers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-purple-100 rounded-xl pl-9 pr-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/30 focus:border-[var(--purple-primary)] transition-all"
                    />
                  </div>
                </div>

                <div className="p-5 space-y-5 overflow-y-auto flex-1">
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wide">
                      Categories
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedCategory('All')}
                        className={chipClass(selectedCategory === 'All')}
                      >
                        All
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setSelectedCategory(category)}
                          className={chipClass(selectedCategory === category)}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-purple-100">
                    <button
                      type="button"
                      onClick={handleRefresh}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-purple-100 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-purple-50 hover:border-purple-200 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Refresh
                    </button>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="w-full px-3 py-2.5 bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white rounded-xl text-xs font-semibold hover:shadow-lg transition-all"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Providers grid */}
            <div className="flex-1 min-w-0">
              {!isFetchingAll && !error && filteredProviders.length > 0 && (
                <p className="mb-5 text-sm font-medium text-[var(--text-secondary)]">
                  Showing{' '}
                  <span className="text-[var(--purple-primary)] font-semibold">
                    {filteredProviders.length}
                  </span>
                  {filteredProviders.length === 1 ? ' provider' : ' providers'}
                </p>
              )}

              {isFetchingAll && (
                <div className="mt-8">
                  <HomePageLoader />
                </div>
              )}

              {error && !isFetchingAll && (
                <div className="text-center py-12">
                  <div className="bg-red-50 border border-red-200 rounded-3xl p-8 max-w-md mx-auto">
                    <p className="text-red-600 font-semibold">Error loading providers</p>
                    <p className="text-[var(--text-secondary)] text-sm mt-2">{error}</p>
                    <button
                      type="button"
                      onClick={handleRefresh}
                      className="mt-5 px-6 py-2.5 bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {!isFetchingAll && !error && filteredProviders.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-white/80 backdrop-blur-sm border border-purple-100/50 rounded-3xl p-8 max-w-md mx-auto shadow-lg shadow-purple-500/5">
                    <Search className="mx-auto mb-4 w-12 h-12 text-purple-300" />
                    <p className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                      No providers found
                    </p>
                    <p className="text-[var(--text-secondary)] text-sm">
                      {hasActiveFilters
                        ? 'Try adjusting your search or filter criteria.'
                        : 'No providers available at the moment.'}
                    </p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="mt-5 px-6 py-2.5 bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>
              )}

              {!isFetchingAll && !error && filteredProviders.length > 0 && (
                <>
                  <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredProviders.map((provider) => (
                      <ProviderCard key={provider._id} provider={provider} />
                    ))}
                  </div>

                  <Pagination
                    totalItems={pagination?.total || filteredProviders.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    currentPage={pagination?.page || currentPage}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <CommunityCta />
    </motion.div>
  );
};

export default Providers;
