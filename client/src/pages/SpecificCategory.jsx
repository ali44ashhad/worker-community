import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { getPublicServices } from '../features/serviceSlice';
import ServiceCard from '../components/service/ServiceCard';
import Pagination from '../components/Pagination';
import HomePageLoader from '../components/loaders/HomePageLoader'; 
import { Search, RefreshCw, ArrowLeft } from 'lucide-react';
import { getActiveCategories } from '../features/adminSlice';
import { slugifyCategoryName } from '../utils/slug';
import { getCategoryDescription } from '../utils/categoryDisplay';

const chipClass = (active) =>
  `px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
    active
      ? 'bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white border-transparent shadow-sm'
      : 'bg-white text-[var(--text-secondary)] border-purple-100 hover:bg-purple-50 hover:border-purple-200'
  }`;

const SpecificCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { services, isFetching, error, pagination } = useSelector(
    (state) => state.services.publicCatalog || { services: [], isFetching: false, error: null, pagination: null }
  );
  const { activeCategories, activeCategoriesStatus } = useSelector((state) => state.admin);

  const categorySlug = String(id || '').toLowerCase();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [selectedKeyword, setSelectedKeyword] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    if (!activeCategories || activeCategories.length === 0) {
      dispatch(getActiveCategories());
    }
  }, [dispatch, activeCategories]);

  const RULES = useMemo(() => {
    const rules = {};
    (activeCategories || []).forEach((c) => {
      rules[c.name] = {
        subCategories: c.subCategories || [],
        keywords: c.keywords || [],
      };
    });
    return rules;
  }, [activeCategories]);

  const categoryName = useMemo(() => {
    const match = (activeCategories || []).find((c) => slugifyCategoryName(c.name) === categorySlug);
    return match?.name || '';
  }, [activeCategories, categorySlug]);

  const categoryData = RULES[categoryName];

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filterKey = `${categoryName}|${debouncedSearch}|${selectedSubCategory}|${selectedKeyword}`;
  const [appliedFilterKey, setAppliedFilterKey] = useState(filterKey);
  if (appliedFilterKey !== filterKey) {
    setAppliedFilterKey(filterKey);
    setCurrentPage(1);
  }

  useEffect(() => {
    if (!categoryName) return;
    dispatch(
      getPublicServices({
        page: currentPage,
        limit: 12,
        category: categoryName,
        search: debouncedSearch,
        subcategory: selectedSubCategory !== 'All' ? selectedSubCategory : '',
        keyword: selectedKeyword !== 'All' ? selectedKeyword : '',
        sort: 'clicks',
      })
    );
  }, [
    dispatch,
    categoryName,
    currentPage,
    debouncedSearch,
    selectedSubCategory,
    selectedKeyword,
    refreshToken,
  ]);

  const hasActiveFilters =
    searchQuery || selectedSubCategory !== 'All' || selectedKeyword !== 'All';

  const handleRefresh = () => {
    setRefreshToken((value) => value + 1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSubCategory('All');
    setSelectedKeyword('All');
  };

  const waitingForCategories =
    !categoryName &&
    activeCategoriesStatus !== 'succeeded' &&
    activeCategoriesStatus !== 'failed';

  if (activeCategoriesStatus === 'failed' && !categoryName) {
    return (
      <motion.div
        className="home-page min-h-screen bg-[var(--background-subtle)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <section className="pt-8 pb-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center px-4">
            <div className="bg-white/80 backdrop-blur-sm border border-purple-100/50 rounded-3xl p-8 max-w-md mx-auto shadow-lg shadow-purple-500/5">
              <p className="text-xl font-semibold text-[var(--text-primary)] mb-2">Could not load categories</p>
              <p className="text-[var(--text-secondary)] text-sm mb-6">
                Check your connection and try again.
              </p>
              <button
                type="button"
                onClick={() => dispatch(getActiveCategories())}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Try again
              </button>
            </div>
          </div>
        </section>
      </motion.div>
    );
  }

  if (waitingForCategories) {
    return (
      <div className="home-page min-h-screen bg-[var(--background-subtle)] pt-8">
        <HomePageLoader label="Loading category…" sublabel="Fetching category details." />
      </div>
    );
  }

  if (!categoryData) {
    return (
      <motion.div
        className="home-page min-h-screen bg-[var(--background-subtle)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <section className="pt-8 pb-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center px-4">
            <div className="bg-white/80 backdrop-blur-sm border border-purple-100/50 rounded-3xl p-8 max-w-md mx-auto shadow-lg shadow-purple-500/5">
              <p className="text-xl font-semibold text-[var(--text-primary)] mb-2">Category Not Found</p>
              <p className="text-[var(--text-secondary)] text-sm mb-6">
                The category you&apos;re looking for doesn&apos;t exist.
              </p>
              <button
                type="button"
                onClick={() => navigate('/category')}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Categories
              </button>
            </div>
          </div>
        </section>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="home-page min-h-screen bg-[var(--background-subtle)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero */}
      <section className="relative overflow-hidden pt-8 pb-12 lg:pt-10 lg:pb-14 bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(217,70,239,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(107,70,193,0.05),transparent_50%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <button
            type="button"
            onClick={() => navigate('/category')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--purple-primary)] hover:text-[var(--magenta)] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Categories
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-fuchsia-100 rounded-full mb-4">
              <span className="text-sm font-semibold bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent">
                Category
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-br from-[var(--text-primary)] via-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent mb-4 leading-[1.1]">
              {categoryName}
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              {getCategoryDescription(categoryData)}
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
                      Narrow down {categoryName} services by subcategory or keyword.
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
                  {categoryData.subCategories?.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wide">
                        Sub-Categories
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedSubCategory('All')}
                          className={chipClass(selectedSubCategory === 'All')}
                        >
                          All
                        </button>
                        {categoryData.subCategories.map((subCat) => (
                          <button
                            key={subCat}
                            type="button"
                            onClick={() => setSelectedSubCategory(subCat)}
                            className={chipClass(selectedSubCategory === subCat)}
                          >
                            {subCat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {categoryData.keywords?.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wide">
                        Keywords
                      </h3>
                      <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => setSelectedKeyword('All')}
                          className={chipClass(selectedKeyword === 'All')}
                        >
                          All
                        </button>
                        {categoryData.keywords.map((keyword) => (
                          <button
                            key={keyword}
                            type="button"
                            onClick={() => setSelectedKeyword(keyword)}
                            className={chipClass(selectedKeyword === keyword)}
                          >
                            {keyword}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

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

              {!isFetching && !error && services.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-white/80 backdrop-blur-sm border border-purple-100/50 rounded-3xl p-8 max-w-md mx-auto shadow-lg shadow-purple-500/5">
                    <Search className="mx-auto mb-4 w-12 h-12 text-purple-300" />
                    <p className="text-xl font-semibold text-[var(--text-primary)] mb-2">No services found</p>
                    <p className="text-[var(--text-secondary)] text-sm">
                      {hasActiveFilters
                        ? 'Try adjusting your search or filter criteria.'
                        : `No services available in ${categoryName} at the moment.`}
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

              {!isFetching && !error && services.length > 0 && (
                <>
                  <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {services.map((service) => (
                      <ServiceCard key={service._id} service={service} />
                    ))}
                  </div>
                  <Pagination
                    totalItems={pagination?.total || 0}
                    itemsPerPage={pagination?.limit || 12}
                    currentPage={pagination?.page || currentPage}
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

export default SpecificCategory;
