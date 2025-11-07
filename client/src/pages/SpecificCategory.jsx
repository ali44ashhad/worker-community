import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProviders } from '../features/providerSlice';
import ServiceCard from '../components/service/ServiceCard';
import HomePageLoader from '../components/loaders/HomePageLoader';
import { HiOutlineSearch, HiOutlineRefresh, HiArrowLeft } from 'react-icons/hi';

const SpecificCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { allProviders, isFetchingAll, error } = useSelector((state) => state.provider);

  const categoryName = decodeURIComponent(id);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [selectedKeyword, setSelectedKeyword] = useState('All');
  const [priceSort, setPriceSort] = useState('All'); // 'All', 'Low to High', 'High to Low'
  const [priceRange, setPriceRange] = useState([0, 100000]); // [min, max]
  const [filteredServices, setFilteredServices] = useState([]);
  const [allServices, setAllServices] = useState([]);

  const SERVICE_RULES = {
    "Academics": {
      description: "Tuition and educational support for various subjects and levels.",
      subCategories: ["Home Tuitions", "Tuition Center", "School", "College"],
      keywords: ["Maths", "Science", "Language", "English", "Hindi", "Sanskrit", "Spanish", "French", "German", "Mandarin", "Italian", "Accounts", "Economics", "Physics", "Chemistry"]
    },
    "Music": {
      description: "Lessons and classes for a variety of musical instruments and vocals.",
      subCategories: ["Home Classes", "Academy"],
      keywords: ["Home Classes", "Guitar", "Academy", "Piano", "Drums", "Violin", "Flute", "Vocals", "Singing", "Saxophone"]
    },
    "Dance": {
      description: "Instruction in popular dance styles for all skill levels.",
      subCategories: ["Home Classes", "Academy"],
      keywords: ["Zumba", "Bhangra", "Salsa", "Jiving", "Freestyle", "Breakdance"]
    },
    "Fitness & Sports": {
      description: "Personal training, group classes, and coaching for various fitness activities and sports.",
      subCategories: ["Home Classes", "Academy"],
      keywords: ["Yoga", "Pilates", "Fitness", "Zumba", "Skateboarding", "Skating", "Cricket", "Football", "Pickle Ball", "Badminston", "Tennis", "Table Tennis", "Chess", "Padel", "Gym", "Strength Training", "Core", "Strength", "Weight Training", "Weights", "Sudoku", "Puzzle"]
    },
    "Home Cooking": {
      description: "Fresh, homemade meals prepared in your community.",
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Food", "Cook", "Italian", "Indian", "Mexican", "Rajasthani", "Gujrati", "Bengali", "Chinese", "Burgers", "Pizza", "Asian", "Sushi", "Dimsums", "Sushi Cake", "Salads", "Ramen", "Pasta", "Biryani"]
    },
    "Home Catering": {
      description: "Catering services for your events and gatherings.",
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Food", "Cook", "Italian", "Indian", "Mexican", "Rajasthani", "Gujrati", "Bengali", "Chinese", "Burgers", "Pizza", "Asian", "Sushi", "Dimsums", "Sushi Cake", "Salads", "Ramen", "Pasta", "Biryani"]
    },
    "Home Baker": {
      description: "Custom baked goods for celebrations, everyday treats, and special dietary needs.",
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Cakes", "Pastry", "Brownie", "Muffins", "Tarts", "Eggless", "Quiche", "Fondant", "Chocolate", "Protein Bar", "Granola", "Bread"]
    },
    "Catering": {
      description: "Professional catering services for all occasions.",
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Food", "Cook", "Italian", "Indian", "Mexican", "Rajasthani", "Gujrati", "Bengali", "Chinese", "Burgers", "Pizza", "Asian", "Sushi", "Dimsums", "Sushi Cake", "Salads", "Ramen", "Pasta", "Biryani"]
    },
    "Professional Baker": {
      description: "Professional baking services for commercial and special events.",
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Cakes", "Pastry", "Brownie", "Muffins", "Tarts", "Eggless", "Quiche", "Fondant"]
    },
    "Workshops": {
      description: "Interactive learning sessions and workshops for various skills.",
      subCategories: ["Home Workshops", "Online Workshops"],
      keywords: ["Summer", "Winter", "Story Telling", "Book Reading", "Cooking", "Baking", "Workshop"]
    },
    "Photography": {
      description: "Professional photography services for your special moments.",
      subCategories: ["Academy"],
      keywords: ["Lens", "Camera", "Video", "Wedding", "Birthday"]
    },
    "Technology": {
      description: "Services related to AI, coding, digital marketing, and tech consulting.",
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["AI", "Python", "Automation", "Coding", "Image Creation", "Digital Marketing", "Designing", "Scratch", "Prompt", "Chat GPT", "LLM", "Java", "Clone", "Video Generaion"]
    },
    "Consulting": {
      description: "Expert consulting services for various business and personal needs.",
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Financial Planning", "Tax Consultancy", "CA", "Chartered Accountant", "Returns", "Landscaping", "Garden", "Flowers"]
    },
    "Finance": {
      description: "Financial planning, investment advice, and accounting services.",
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Financial Planning", "Tax Planning", "Accounting", "Investments", "Mutual Finds", "Stocks", "Broker", "Money", "Bonds", "Crypto"]
    },
    "Groceries": {
      description: "Fresh groceries and daily essentials delivered to your door.",
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Kitchen", "Grocery", "Vegetables", "Fruits", "Sauce", "Milk", "Bread"]
    },
    "Home Products": {
      description: "Quality home products and decorative items for your living spaces.",
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Candles", "Handicrafts", "Bathroom Products", "Artefacts", "Sculptures", "Show Piece", "Garden", "Furniture", "Flooring", "Marble", "Wooden", "Carpenter", "Electrical", "Plumbing", "Solar", "Gate", "Light", "Paint", "Wall"]
    },
    "Apparels & Footwear": {
      description: "Fashionable clothing and footwear for all occasions.",
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Fashion", "Shoes", "Chappals", "Sandals", "Suits", "Shirts", "Kurti", "Indo western", "Coord Sets"]
    },
    "Law": {
      description: "Legal services and consultation from qualified professionals.",
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Tax", "Civil", "Criminal", "Corporate", "Arbitration", "High Court", "Court", "Supreme Court", "District Court", "Judge", "Lawyer", "Advocate", "Bail"]
    },
    "Medical": {
      description: "Healthcare services and medical equipment.",
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Doctor", "Nurse", "Medical Equipment"]
    },
    "Art & Craft": {
      description: "Creative art classes and handmade craft items.",
      subCategories: ["Home Classes", "Academy"],
      keywords: ["Origami", "Painting", "Drawing", "Colouring"]
    },
    "Home Interiors": {
      description: "Interior design and decoration services.",
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Interiros", "Designing"]
    },
    "Construction": {
      description: "Construction and renovation services for homes and buildings.",
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["House", "Farm House", "Flat", "Floor", "Marble", "Stone", "Wall"]
    },
    "Real Estate": {
      description: "Real estate consulting and property services.",
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Real Estate Consultant", "Property", "Buy", "Sell"]
    },
    "Event Planner": {
      description: "Complete event planning services for all occasions.",
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Birthday", "Decor", "Wedding", "Anniversary", "Balloon", "Props", "Corporate Event", "Rides"]
    },
    "Gifting": {
      description: "Thoughtful gift sets and corporate gifting solutions.",
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Corporate", "Gift Set"]
    },
    "Other": {
      description: "Other unique services and offerings.",
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: []
    }
  };

  const categoryData = SERVICE_RULES[categoryName];

  // Fetch providers on component mount
  useEffect(() => {
    dispatch(getAllProviders());
  }, [dispatch]);

  // Extract services for this category
  useEffect(() => {
    const extractedServices = [];
    allProviders.forEach(provider => {
      if (provider?.serviceOfferings && Array.isArray(provider.serviceOfferings)) {
        provider.serviceOfferings.forEach(service => {
          if (service?.serviceCategory === categoryName) {
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
          }
        });
      }
    });
    setAllServices(extractedServices);
  }, [allProviders, categoryName]);

  // Calculate min and max price from all services
  const getPriceRange = () => {
    const prices = allServices
      .map(service => service?.price)
      .filter(price => price !== undefined && price !== null && !isNaN(price))
      .map(price => typeof price === 'number' ? price : parseFloat(price));
    
    if (prices.length === 0) return [0, 100000];
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return [Math.floor(min), Math.ceil(max)];
  };

  // Initialize price range when services are loaded
  useEffect(() => {
    if (allServices.length > 0) {
      const [min, max] = getPriceRange();
      setPriceRange([min, max]);
    }
  }, [allServices]);

  // Filter services based on search, subcategory, keyword, and price
  useEffect(() => {
    let filtered = [...allServices];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(service => {
        const description = service?.description?.toLowerCase() || '';
        const keywords = (service?.keywords || []).map(k => k?.toLowerCase()).join(' ');
        const subCategories = (service?.subCategories || []).map(s => s?.toLowerCase()).join(' ');
        const providerName = service?.provider?.user?.name?.toLowerCase() || '';
        
        const query = searchQuery.toLowerCase();
        return description.includes(query) || 
               keywords.includes(query) ||
               subCategories.includes(query) ||
               providerName.includes(query);
      });
    }

    // Apply subcategory filter
    if (selectedSubCategory !== 'All') {
      filtered = filtered.filter(service => {
        return (service?.subCategories || []).includes(selectedSubCategory);
      });
    }

    // Apply keyword filter
    if (selectedKeyword !== 'All') {
      filtered = filtered.filter(service => {
        return (service?.keywords || []).includes(selectedKeyword);
      });
    }

    // Apply price range filter
    filtered = filtered.filter(service => {
      const price = service?.price;
      if (price === undefined || price === null) return false;
      const numPrice = typeof price === 'number' ? price : parseFloat(price);
      if (isNaN(numPrice)) return false;
      return numPrice >= priceRange[0] && numPrice <= priceRange[1];
    });

    // Apply price sorting
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
    }

    setFilteredServices(filtered);
  }, [searchQuery, selectedSubCategory, selectedKeyword, priceSort, priceRange, allServices]);

  const handleRefresh = () => {
    dispatch(getAllProviders());
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

  const [minPrice, maxPrice] = useMemo(() => {
    if (allServices.length > 0) {
      return getPriceRange();
    }
    return [0, 100000];
  }, [allServices]);

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
      <div className='min-h-screen bg-gray-50 pb-16'>
        <div className='max-w-[1350px] mx-auto px-4 pt-24'>
          <div className='text-center py-12'>
            <div className='bg-white border-2 border-black rounded-xl p-8 max-w-md mx-auto'>
              <p className='text-xl font-semibold text-black mb-2'>
                Category Not Found
              </p>
              <p className='text-gray-600 text-sm mb-4'>
                The category you're looking for doesn't exist.
              </p>
              <button
                onClick={() => navigate('/category')}
                className='mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 mx-auto'
              >
                <HiArrowLeft className='w-5 h-5' />
                Back to Categories
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        {/* Back Button */}
        <button
          onClick={() => navigate('/category')}
                  className='flex items-center gap-1 text-black hover:text-gray-700 transition-colors font-semibold text-sm mb-2'
        >
                  <HiArrowLeft className='w-4 h-4' />
          Back to All Categories
        </button>

        {/* Header */}
                <div className='mb-3'>
                  <h1 className='text-2xl font-bold text-black mb-1'>
            {categoryName}
          </h1>
                  <p className='text-gray-600 text-xs leading-tight'>
            {categoryData.description}
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

          {/* Subcategory Filters */}
          {categoryData.subCategories && categoryData.subCategories.length > 0 && (
                <div className='space-y-2'>
                  <h3 className='text-xs font-semibold text-gray-700'>Sub-Categories</h3>
                  <div className='flex flex-wrap gap-1.5'>
              <button
                onClick={() => setSelectedSubCategory('All')}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
                  selectedSubCategory === 'All'
                    ? 'bg-gray-600 text-white border-gray-600'
                    : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              {categoryData.subCategories.map((subCat) => (
                <button
                  key={subCat}
                  onClick={() => setSelectedSubCategory(subCat)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                    selectedSubCategory === subCat
                      ? 'bg-gray-600 text-white border-gray-600'
                      : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {subCat}
                </button>
              ))}
                  </div>
            </div>
          )}

          {/* Keyword Filters */}
          {categoryData.keywords && categoryData.keywords.length > 0 && (
                <div className='space-y-2'>
                  <h3 className='text-xs font-semibold text-gray-700'>Keywords</h3>
                  <div className='flex flex-wrap gap-1.5 max-h-40 overflow-y-auto'>
              <button
                onClick={() => setSelectedKeyword('All')}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
                  selectedKeyword === 'All'
                    ? 'bg-gray-600 text-white border-gray-600'
                    : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                }`}
              >
                All
              </button>
                    {categoryData.keywords.map((keyword) => (
                <button
                  key={keyword}
                  onClick={() => setSelectedKeyword(keyword)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                    selectedKeyword === keyword
                      ? 'bg-gray-600 text-white border-gray-600'
                      : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {keyword}
                </button>
              ))}
                  </div>
                </div>
              )}

              {/* Price Filter with Range Slider */}
              <div className='space-y-3'>
                <h3 className='text-xs font-semibold text-gray-700'>Price Range</h3>
                
                {/* Price Sort Options */}
                <div className='flex gap-1.5'>
                  <button
                    onClick={() => setPriceSort('All')}
                    className={`flex-1 px-2 py-1.5 rounded text-xs font-semibold transition-all border ${
                      priceSort === 'All'
                        ? 'bg-gray-600 text-white border-gray-600'
                        : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setPriceSort('Low to High')}
                    className={`flex-1 px-2 py-1.5 rounded text-xs font-semibold transition-all border ${
                      priceSort === 'Low to High'
                        ? 'bg-gray-600 text-white border-gray-600'
                        : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    Low-High
                  </button>
                  <button
                    onClick={() => setPriceSort('High to Low')}
                    className={`flex-1 px-2 py-1.5 rounded text-xs font-semibold transition-all border ${
                      priceSort === 'High to Low'
                        ? 'bg-gray-600 text-white border-gray-600'
                        : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    High-Low
                  </button>
                </div>

                {/* Price Range Display */}
                <div className='text-center'>
                  <span className='text-xs font-bold text-black'>
                    ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                  </span>
                </div>

                {/* Dual Range Slider */}
                <div className='relative pt-3 pb-1'>
                  <div className='relative h-2 bg-gray-200 rounded-lg'>
                    {/* Active range track */}
                    {maxPrice > minPrice && (
                      <div
                        className='absolute h-2 bg-gray-600 rounded-lg top-0 pointer-events-none'
                        style={{
                          left: `${((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                          width: `${((priceRange[1] - priceRange[0]) / (maxPrice - minPrice)) * 100}%`
                        }}
                      />
                    )}
                    {/* Min range input */}
                    <input
                      type='range'
                      min={minPrice}
                      max={maxPrice}
                      value={priceRange[0]}
                      onChange={(e) => handleMinChange(e.target.value)}
                      className='absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gray-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer'
                      style={{ top: 0, zIndex: priceRange[0] > maxPrice - (maxPrice - minPrice) * 0.1 ? 5 : 3 }}
                    />
                    {/* Max range input */}
                    <input
                      type='range'
                      min={minPrice}
                      max={maxPrice}
                      value={priceRange[1]}
                      onChange={(e) => handleMaxChange(e.target.value)}
                      className='absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gray-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer'
                      style={{ top: 0, zIndex: 4 }}
                    />
                  </div>
                  {/* Price Range Labels */}
                  <div className='flex justify-between text-[10px] text-gray-600 mt-1'>
                    <span>₹{minPrice.toLocaleString()}</span>
                    <span>₹{maxPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Min/Max Input Fields */}
                <div className='flex items-end gap-1.5'>
                  <div className='flex-1'>
                    <label className='block text-[10px] text-gray-600 mb-0.5'>Min</label>
                    <input
                      type='number'
                      min={minPrice}
                      max={maxPrice}
                      value={priceRange[0]}
                      onChange={(e) => handleMinChange(e.target.value)}
                      className='w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400'
                    />
                  </div>
                  <div className='flex-1'>
                    <label className='block text-[10px] text-gray-600 mb-0.5'>Max</label>
                    <input
                      type='number'
                      min={minPrice}
                      max={maxPrice}
                      value={priceRange[1]}
                      onChange={(e) => handleMaxChange(e.target.value)}
                      className='w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400'
                    />
                  </div>
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
                {(searchQuery || selectedSubCategory !== 'All' || selectedKeyword !== 'All' || priceSort !== 'All' || priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
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
                    {searchQuery || selectedSubCategory !== 'All' || selectedKeyword !== 'All' || priceSort !== 'All' || priceRange[0] !== minPrice || priceRange[1] !== maxPrice
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No services available in this category at the moment.'}
              </p>
                  {(searchQuery || selectedSubCategory !== 'All' || selectedKeyword !== 'All' || priceSort !== 'All' || priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
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

export default SpecificCategory;
