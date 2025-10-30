import React, { useEffect, useState } from 'react';
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

  // Filter services based on search, subcategory, and keyword
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

    setFilteredServices(filtered);
  }, [searchQuery, selectedSubCategory, selectedKeyword, allServices]);

  const handleRefresh = () => {
    dispatch(getAllProviders());
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSubCategory('All');
    setSelectedKeyword('All');
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
        {/* Back Button */}
        <button
          onClick={() => navigate('/category')}
          className='mb-6 flex items-center gap-2 text-black hover:text-gray-700 transition-colors font-semibold'
        >
          <HiArrowLeft className='w-5 h-5' />
          Back to All Categories
        </button>

        {/* Header */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl md:text-5xl font-bold text-black mb-4'>
            {categoryName}
          </h1>
          <p className='text-gray-600 text-center max-w-3xl mx-auto text-base md:text-lg mb-6'>
            {categoryData.description}
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
                <p className='text-2xl font-bold text-black'>{filteredServices.length}</p>
                <p className='text-sm text-gray-600'>Showing</p>
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
              placeholder='Search services, keywords, or provider names...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full bg-white border-2 border-black rounded-lg pl-12 pr-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-black'
            />
          </div>

          {/* Subcategory Filters */}
          {categoryData.subCategories && categoryData.subCategories.length > 0 && (
            <div className='flex flex-wrap gap-3 justify-center items-center'>
              <span className='text-sm font-semibold text-gray-700 mr-2'>Sub-Categories:</span>
              <button
                onClick={() => setSelectedSubCategory('All')}
                className={`px-5 py-2 rounded-full font-semibold transition-all border-2 ${
                  selectedSubCategory === 'All'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-black hover:bg-gray-100'
                }`}
              >
                All
              </button>
              {categoryData.subCategories.map((subCat) => (
                <button
                  key={subCat}
                  onClick={() => setSelectedSubCategory(subCat)}
                  className={`px-5 py-2 rounded-full font-semibold transition-all border-2 ${
                    selectedSubCategory === subCat
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-black hover:bg-gray-100'
                  }`}
                >
                  {subCat}
                </button>
              ))}
            </div>
          )}

          {/* Keyword Filters */}
          {categoryData.keywords && categoryData.keywords.length > 0 && (
            <div className='flex flex-wrap gap-2 justify-center items-center'>
              <span className='text-sm font-semibold text-gray-700 mr-2 w-full text-center mb-2 md:w-auto md:mb-0'>Keywords:</span>
              <button
                onClick={() => setSelectedKeyword('All')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border-2 ${
                  selectedKeyword === 'All'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-black hover:bg-gray-100'
                }`}
              >
                All
              </button>
              {categoryData.keywords.slice(0, 10).map((keyword) => (
                <button
                  key={keyword}
                  onClick={() => setSelectedKeyword(keyword)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2 ${
                    selectedKeyword === keyword
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-black hover:bg-gray-100'
                  }`}
                >
                  {keyword}
                </button>
              ))}
              {categoryData.keywords.length > 10 && (
                <span className='px-4 py-2 text-sm text-gray-600 font-medium'>
                  +{categoryData.keywords.length - 10} more
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex justify-center gap-3'>
            <button
              onClick={handleRefresh}
              className='flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded-lg font-semibold hover:bg-gray-100 transition-all'
            >
              <HiOutlineRefresh size={18} />
              Refresh
            </button>
            {(searchQuery || selectedSubCategory !== 'All' || selectedKeyword !== 'All') && (
              <button
                onClick={handleClearFilters}
                className='px-4 py-2 bg-black text-white border-2 border-black rounded-lg font-semibold hover:bg-gray-800 transition-all'
              >
                Clear Filters
              </button>
            )}
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
                {searchQuery || selectedSubCategory !== 'All' || selectedKeyword !== 'All'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No services available in this category at the moment.'}
              </p>
              {(searchQuery || selectedSubCategory !== 'All' || selectedKeyword !== 'All') && (
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

export default SpecificCategory;
