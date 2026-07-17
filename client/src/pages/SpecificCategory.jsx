import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { getAllPublicServices } from '../features/serviceSlice';
import ServiceCard from '../components/service/ServiceCard';
import HomePageLoader from '../components/loaders/HomePageLoader'; 
import { Search, RefreshCw, ArrowLeft } from 'lucide-react';
import { getActiveCategories } from '../features/adminSlice';
import { slugifyCategoryName } from '../utils/slug';
import { getCategoryDescription } from '../utils/categoryDisplay';
import { textIncludesSearch } from '../utils/searchText';
import { getFullName } from '../utils/userHelpers';

const chipClass = (active) =>
  `px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
    active
      ? 'bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white border-transparent shadow-sm'
      : 'bg-white text-[var(--text-secondary)] border-purple-100 hover:bg-purple-50 hover:border-purple-200'
  }`;

const rangeThumbClass =
  '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--purple-primary)] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--purple-primary)] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer';

const SpecificCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { services, isFetching, error } = useSelector((state) => state.services);
  const { activeCategories } = useSelector((state) => state.admin);

  const categorySlug = String(id || '').toLowerCase();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [selectedKeyword, setSelectedKeyword] = useState('All');
  const [priceSort, setPriceSort] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [filteredServices, setFilteredServices] = useState([]);

  useEffect(() => {
    if (!activeCategories || activeCategories.length === 0) {
      dispatch(getActiveCategories());
    }
  }, [dispatch, activeCategories?.length]);

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
    if (match?.name) return match.name;

    try {
      return decodeURIComponent(id);
    } catch {
      return String(id || '');
    }
  }, [activeCategories, categorySlug, id]);

  const categoryData = RULES[categoryName];

  useEffect(() => {
    dispatch(getAllPublicServices());
  }, [dispatch]);

  const allServices = useMemo(
    () => (services || []).filter((service) => service?.serviceCategory === categoryName),
    [services, categoryName]
  );

  const getPriceRange = () => {
    const prices = allServices
      .map((service) => service?.price)
      .filter((price) => price !== undefined && price !== null && !isNaN(price))
      .map((price) => (typeof price === 'number' ? price : parseFloat(price)));

    if (prices.length === 0) return [0, 0];

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return [Math.floor(min), Math.ceil(max)];
  };

  useEffect(() => {
    if (allServices.length > 0) {
      const [min, max] = getPriceRange();
      setPriceRange([min, max]);
    }
  }, [allServices]);

  useEffect(() => {
    let filtered = [...allServices];

    if (searchQuery.trim()) {
      filtered = filtered.filter((service) => {
        const servicename = service?.servicename || '';
        const description = service?.description || '';
        const keywords = (service?.keywords || []).join(' ');
        const subCategories = (service?.subCategories || []).join(' ');
        const providerName = getFullName(service?.provider?.user) || '';
        const query = searchQuery.trim();

        return (
          textIncludesSearch(servicename, query) ||
          textIncludesSearch(description, query) ||
          textIncludesSearch(keywords, query) ||
          textIncludesSearch(subCategories, query) ||
          textIncludesSearch(providerName, query)
        );
      });
    }

    if (selectedSubCategory !== 'All') {
      filtered = filtered.filter((service) =>
        (service?.subCategories || []).includes(selectedSubCategory)
      );
    }

    if (selectedKeyword !== 'All') {
      filtered = filtered.filter((service) =>
        (service?.keywords || []).includes(selectedKeyword)
      );
    }

    filtered = filtered.filter((service) => {
      const price = service?.price;
      if (price === undefined || price === null) return true;
      const numPrice = typeof price === 'number' ? price : parseFloat(price);
      if (isNaN(numPrice)) return true;
      return numPrice >= priceRange[0] && numPrice <= priceRange[1];
    });

    if (priceSort === 'Low to High') {
      filtered.sort((a, b) => {
        const priceA = typeof a?.price === 'number' ? a.price : parseFloat(a?.price) || 0;
        const priceB = typeof b?.price === 'number' ? b.price : parseFloat(b?.price) || 0;
        return priceA - priceB;
      });
    } else if (priceSort === 'High to Low') {
      filtered.sort((a, b) => {
        const priceA = typeof a?.price === 'number' ? a.price : parseFloat(a?.price) || 0;
        const priceB = typeof b?.price === 'number' ? b.price : parseFloat(b?.price) || 0;
        return priceB - priceA;
      });
    } else {
      // Default: most-clicked services first
      filtered.sort(
        (a, b) => (b?.serviceOfferingCount || 0) - (a?.serviceOfferingCount || 0)
      );
    }

    setFilteredServices(filtered);
  }, [searchQuery, selectedSubCategory, selectedKeyword, priceSort, priceRange, allServices]);

  const [minPrice, maxPrice] = useMemo(() => {
    if (allServices.length > 0) {
      return getPriceRange();
    }
    return [0, 0];
  }, [allServices]);

  const hasActiveFilters =
    searchQuery ||
    selectedSubCategory !== 'All' ||
    selectedKeyword !== 'All' ||
    priceSort !== 'All' ||
    priceRange[0] !== minPrice ||
    priceRange[1] !== maxPrice;

  const handleRefresh = () => {
    dispatch(getAllPublicServices());
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSubCategory('All');
    setSelectedKeyword('All');
    setPriceSort('All');
    if (allServices.length > 0) {
      const [min, max] = getPriceRange();
      setPriceRange([min, max]);
    }
  };

  const handleMinChange = (value) => {
    const numValue = parseInt(value) || minPrice;
    if (numValue < priceRange[1]) {
      setPriceRange([Math.max(minPrice, numValue), priceRange[1]]);
    }
  };

  const handleMaxChange = (value) => {
    const numValue = parseInt(value) || maxPrice;
    if (numValue > priceRange[0]) {
      setPriceRange([priceRange[0], Math.min(maxPrice, numValue)]);
    }
  };

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
                      Narrow down {categoryName} services by subcategory, keyword, or price.
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

                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wide">
                      Price Range
                    </h3>

                    <div className="flex gap-1.5">
                      {[
                        { label: 'All', value: 'All' },
                        { label: 'Low-High', value: 'Low to High' },
                        { label: 'High-Low', value: 'High to Low' },
                      ].map(({ label, value }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setPriceSort(value)}
                          className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                            priceSort === value
                              ? 'bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white border-transparent'
                              : 'bg-white text-[var(--text-secondary)] border-purple-100 hover:bg-purple-50'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="text-center">
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                      </span>
                    </div>

                    <div className="relative pt-3 pb-1">
                      <div className="relative h-2 bg-purple-100 rounded-lg">
                        {maxPrice > minPrice && (
                          <div
                            className="absolute h-2 bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] rounded-lg top-0 pointer-events-none"
                            style={{
                              left: `${((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                              width: `${((priceRange[1] - priceRange[0]) / (maxPrice - minPrice)) * 100}%`,
                            }}
                          />
                        )}
                        <input
                          type="range"
                          min={minPrice}
                          max={maxPrice}
                          value={priceRange[0]}
                          onChange={(e) => handleMinChange(e.target.value)}
                          className={`absolute w-full h-2 appearance-none bg-transparent pointer-events-none ${rangeThumbClass}`}
                          style={{
                            top: 0,
                            zIndex: priceRange[0] > maxPrice - (maxPrice - minPrice) * 0.1 ? 5 : 3,
                          }}
                        />
                        <input
                          type="range"
                          min={minPrice}
                          max={maxPrice}
                          value={priceRange[1]}
                          onChange={(e) => handleMaxChange(e.target.value)}
                          className={`absolute w-full h-2 appearance-none bg-transparent pointer-events-none ${rangeThumbClass}`}
                          style={{ top: 0, zIndex: 4 }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-[var(--text-secondary)] mt-1">
                        <span>₹{minPrice.toLocaleString()}</span>
                        <span>₹{maxPrice.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-end gap-1.5">
                      <div className="flex-1">
                        <label className="block text-[10px] text-[var(--text-secondary)] mb-0.5">Min</label>
                        <input
                          type="number"
                          min={minPrice}
                          max={maxPrice}
                          value={priceRange[0]}
                          onChange={(e) => handleMinChange(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-purple-100 rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/30 focus:border-[var(--purple-primary)]"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] text-[var(--text-secondary)] mb-0.5">Max</label>
                        <input
                          type="number"
                          min={minPrice}
                          max={maxPrice}
                          value={priceRange[1]}
                          onChange={(e) => handleMaxChange(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-purple-100 rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/30 focus:border-[var(--purple-primary)]"
                        />
                      </div>
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

              {!isFetching && !error && filteredServices.length === 0 && (
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

              {!isFetching && !error && filteredServices.length > 0 && (
                <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredServices.map((service) => (
                    <ServiceCard key={service._id} service={service} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
 
    </motion.div>
  );
};

export default SpecificCategory;
