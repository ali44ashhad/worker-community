import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import ServiceCard from '../components/service/ServiceCard';
import HomePageLoader from '../components/loaders/HomePageLoader'; 
import { Search, RefreshCw } from 'lucide-react';
import { getFullName } from '../utils/userHelpers';
import Pagination from '../components/Pagination';
import { getAllPublicServices, getAllCommunityServices } from '../features/serviceSlice';
import { formatCommunDisplayName } from '../utils/communName';

const chipClass = (active) =>
  `px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
    active
      ? 'bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white border-transparent shadow-sm'
      : 'bg-white text-[var(--text-secondary)] border-purple-100 hover:bg-purple-50 hover:border-purple-200'
  }`;

const Services = ({ communityScope = false, compact = false, embedded = false }) => {
  const dispatch = useDispatch();
  const { services, isFetching, error, communityCommunName, needsCommunity } = useSelector(
    (state) => state.services
  );

  const ITEMS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    if (communityScope) {
      dispatch(getAllCommunityServices());
      return;
    }
    dispatch(getAllPublicServices());
  }, [dispatch, communityScope]);

  const allServices = services || [];

  const filteredServices = useMemo(() => {
    let filtered = [...allServices];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((service) => {
        const servicename = service?.servicename?.toLowerCase() || '';
        const category = service?.serviceCategory?.toLowerCase() || '';
        const description = service?.description?.toLowerCase() || '';
        const keywords = (service?.keywords || []).map((k) => k?.toLowerCase()).join(' ');
        const subCategories = (service?.subCategories || []).map((s) => s?.toLowerCase()).join(' ');
        const providerName = getFullName(service?.provider?.user)?.toLowerCase() || '';

        return (
          servicename.includes(query) ||
          category.includes(query) ||
          description.includes(query) ||
          keywords.includes(query) ||
          subCategories.includes(query) ||
          providerName.includes(query)
        );
      });
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((service) => service?.serviceCategory === selectedCategory);
    }

    if (selectedCategory !== 'All' && selectedSubcategory !== 'All') {
      filtered = filtered.filter((service) =>
        (service?.subCategories || []).includes(selectedSubcategory)
      );
    }

    if (minRating > 0) {
      filtered = filtered.filter((service) => (service?.averageRating || 0) >= minRating);
    }

    return filtered;
  }, [allServices, searchQuery, selectedCategory, selectedSubcategory, minRating]);

  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredServices.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredServices, currentPage, ITEMS_PER_PAGE]);

  const getUniqueCategories = () => {
    const categories = new Set();
    allServices.forEach((service) => {
      if (service?.serviceCategory) categories.add(service.serviceCategory);
    });
    return Array.from(categories).sort();
  };

  const getUniqueSubcategories = () => {
    if (selectedCategory === 'All') return [];

    const subcategories = new Set();
    allServices.forEach((service) => {
      if (service?.serviceCategory === selectedCategory && service?.subCategories) {
        service.subCategories.forEach((subCat) => {
          if (subCat) subcategories.add(subCat);
        });
      }
    });
    return Array.from(subcategories).sort();
  };

  const categories = getUniqueCategories();
  const subcategories = getUniqueSubcategories();
  const hasActiveFilters =
    searchQuery || selectedCategory !== 'All' || selectedSubcategory !== 'All' || minRating > 0;

  useEffect(() => {
    setSelectedSubcategory('All');
  }, [selectedCategory]);

  const handleRefresh = () => {
    if (communityScope) {
      dispatch(getAllCommunityServices());
      return;
    }
    dispatch(getAllPublicServices());
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedSubcategory('All');
    setMinRating(0);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedSubcategory, minRating]);

  return (
    <motion.div
      className={`home-page min-h-screen bg-[var(--background-subtle)] ${compact ? '' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {!compact && !embedded && (
      <section className="relative overflow-hidden pt-8 pb-12 lg:pt-10 lg:pb-14 bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20">
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
                {communityScope ? 'Community Services' : 'Find Local Help'}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-br from-[var(--text-primary)] via-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent mb-4 leading-[1.1]">
              {communityScope ? 'Your Community Services' : 'All Services'}
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              {communityScope ? (
                <>
                  Browse services from providers in your Commun community
                  {communityCommunName ? (
                    <span className="font-medium text-[var(--purple-primary)]">
                      {' '}
                      ({formatCommunDisplayName(communityCommunName)})
                    </span>
                  ) : null}
                  . Only categories enabled by your secretary are shown here.
                </>
              ) : (
                'Browse services from talented community providers — tutoring, baking, fitness, technology and more, right in your neighbourhood.'
              )}
            </p>
          </motion.div>
        </div>
      </section>
      )}

      {compact && communityScope && !embedded && (
        <section className="border-b border-purple-100/60 bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20 py-6 sm:py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--purple-primary)]">
              Community
            </p>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">Services</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Services from providers in your Commun community
              {communityCommunName ? (
                <span className="font-medium text-[var(--purple-primary)]">
                  {' '}
                  ({formatCommunDisplayName(communityCommunName)})
                </span>
              ) : null}
              . Only categories enabled by your secretary are shown.
            </p>
          </div>
        </section>
      )}

      {/* Main content */}
      <section className={`pb-16 bg-gradient-to-b from-white to-purple-50/30 ${compact || embedded ? 'pt-6' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Sidebar filters */}
            <div className="lg:w-80 shrink-0">
              <div className="bg-white/80 backdrop-blur-sm border border-purple-100/50 rounded-3xl overflow-hidden shadow-lg shadow-purple-500/5 sticky top-24 max-h-[calc(100vh-6rem)] flex flex-col">
                <div className="p-5 space-y-4 shrink-0 border-b border-purple-100">
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">Search &amp; Filter</h2>
                    <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
                      Narrow down services by category, rating, or keyword.
                    </p>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                    <input
                      type="text"
                      placeholder="Search services..."
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
                      <button type="button" onClick={() => setSelectedCategory('All')} className={chipClass(selectedCategory === 'All')}>
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

                  {selectedCategory !== 'All' && subcategories.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wide">
                        Subcategories
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        <button type="button" onClick={() => setSelectedSubcategory('All')} className={chipClass(selectedSubcategory === 'All')}>
                          All
                        </button>
                        {subcategories.map((subcategory) => (
                          <button
                            key={subcategory}
                            type="button"
                            onClick={() => setSelectedSubcategory(subcategory)}
                            className={chipClass(selectedSubcategory === subcategory)}
                          >
                            {subcategory}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wide">
                      Minimum Rating
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: 'All', value: 0 },
                        { label: '4+ ⭐', value: 4 },
                        { label: '3+ ⭐', value: 3 },
                        { label: '2+ ⭐', value: 2 },
                        { label: '1+ ⭐', value: 1 },
                      ].map(({ label, value }) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setMinRating(value)}
                          className={chipClass(minRating === value)}
                        >
                          {label}
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

            {/* Services grid */}
            <div className="flex-1 min-w-0">
              {!isFetching && !error && filteredServices.length > 0 && (
                <p className="mb-5 text-sm font-medium text-[var(--text-secondary)]">
                  Showing{' '}
                  <span className="text-[var(--purple-primary)] font-semibold">{filteredServices.length}</span>
                  {filteredServices.length === 1 ? ' service' : ' services'}
                </p>
              )}

              {isFetching && (
                <div className="mt-8">
                  <HomePageLoader />
                </div>
              )}

              {error && !isFetching && (
                <div className="text-center py-12">
                  <div className="bg-red-50 border border-red-200 rounded-3xl p-8 max-w-md mx-auto">
                    <p className="text-red-600 font-semibold">Error loading services</p>
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

              {needsCommunity && !isFetching && (
                <div className="text-center py-12">
                  <div className="bg-white/80 backdrop-blur-sm border border-purple-100/50 rounded-3xl p-8 max-w-md mx-auto shadow-lg shadow-purple-500/5">
                    <p className="text-xl font-semibold text-[var(--text-primary)] mb-2">No community linked</p>
                    <p className="text-[var(--text-secondary)] text-sm">
                      Join a Commun community to see local services here.
                    </p>
                  </div>
                </div>
              )}

              {!needsCommunity && !isFetching && !error && filteredServices.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-white/80 backdrop-blur-sm border border-purple-100/50 rounded-3xl p-8 max-w-md mx-auto shadow-lg shadow-purple-500/5">
                    <Search className="mx-auto mb-4 w-12 h-12 text-purple-300" />
                    <p className="text-xl font-semibold text-[var(--text-primary)] mb-2">No services found</p>
                    <p className="text-[var(--text-secondary)] text-sm">
                      {hasActiveFilters
                        ? 'Try adjusting your search or filter criteria.'
                        : communityScope
                          ? 'No enabled services in your community yet.'
                          : 'No services available at the moment.'}
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

              {!isFetching && !error && filteredServices.length > 0 && (
                <>
                  <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {paginatedServices.map((service) => (
                      <ServiceCard key={service._id} service={service} />
                    ))}
                  </div>

                  <Pagination
                    totalItems={filteredServices.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </section>
 
    </motion.div>
  );
};

export default Services;
