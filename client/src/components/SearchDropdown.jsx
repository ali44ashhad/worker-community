import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getAllProviders } from '../features/providerSlice';
import { HiOutlineSearch } from 'react-icons/hi';

// SERVICE_RULES from AllCategory component
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

// Map categories to their images
const categoryImages = {
  "Academics": "/AcademicsCategoryImage.png",
  "Music": "/MusicCategoryImage.png",
  "Dance": "/DanceCategoryImage.png",
  "Fitness & Sports": "/fitnessCategoryImage1.png",
  "Home Baker": "/HomeBakerCategoryImage.png",
  "Technology": "/TechnologyCategoryImage.png",
  "Home Cooking": "/cooking.png",
  "Home Catering": "/cookingIcon.png",
  "Catering": "/cookingIcon1.png",
  "Professional Baker": "/HomeBakerCategoryImage.png",
  "Workshops": "/tutor.png",
  "Photography": "/photographyIcon.png",
  "Consulting": "/eventPlannerIcon.png",
  "Finance": "/eventPlannerIcon.png",
  "Groceries": "/groceryIcon.png",
  "Home Products": "/art.png",
  "Apparels & Footwear": "/art.png",
  "Law": "/eventPlannerIcon.png",
  "Medical": "/eventPlannerIcon.png",
  "Art & Craft": "/artIcon.png",
  "Home Interiors": "/art.png",
  "Construction": "/art.png",
  "Real Estate": "/eventPlannerIcon.png",
  "Event Planner": "/eventPlannerIcon.png",
  "Gifting": "/eventPlannerIcon.png",
  "Other": "/eventPlannerIcon.png"
};

const SearchDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { allProviders } = useSelector((state) => state.provider);
  const [searchQuery, setSearchQuery] = useState('');
  const [allServices, setAllServices] = useState([]);
  const dropdownRef = useRef(null);

  // Fetch providers if not already loaded
  useEffect(() => {
    if (isOpen && (!allProviders || allProviders.length === 0)) {
      dispatch(getAllProviders());
    }
  }, [isOpen, allProviders, dispatch]);

  // Reset search query when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Extract all services from providers
  useEffect(() => {
    const extractedServices = [];
    allProviders.forEach(provider => {
      if (provider?.serviceOfferings && Array.isArray(provider.serviceOfferings)) {
        provider.serviceOfferings.forEach(service => {
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

  // Filter services based on search query
  const filteredServices = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return allServices.filter(service => {
      const category = service?.serviceCategory?.toLowerCase() || '';
      const description = service?.description?.toLowerCase() || '';
      const keywords = (service?.keywords || []).map(k => k?.toLowerCase()).join(' ');
      const subCategories = (service?.subCategories || []).map(s => s?.toLowerCase()).join(' ');
      const providerName = service?.provider?.user?.name?.toLowerCase() || '';
      
      return category.includes(query) || 
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
  const categories = Object.entries(SERVICE_RULES);

  const handleCategoryClick = (categoryName) => {
    navigate(`/category/${encodeURIComponent(categoryName)}`);
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
    <div ref={dropdownRef} className="absolute top-full left-0 mt-2 w-[26rem] bg-white border border-gray-300 rounded-lg shadow-2xl z-50 max-h-[600px] overflow-hidden flex flex-col">
      {/* Search Input */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search services..."
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
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              All Categories
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {categories.map(([categoryName, categoryData]) => {
                const imagePath = categoryImages[categoryName];
                
                return (
                  <div
                    key={categoryName}
                    onClick={() => handleCategoryClick(categoryName)}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 hover:shadow-md transition-all cursor-pointer group"
                  >
                    {/* Image */}
                    <div className="mb-2 flex justify-center">
                      <div className="w-full h-20 border border-gray-300 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                        {imagePath ? (
                          <img
                            src={imagePath}
                            alt={categoryName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className="w-full h-full flex items-center justify-center text-gray-600 font-bold text-sm"
                          style={{ display: imagePath ? 'none' : 'flex' }}
                        >
                          {categoryName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Category Name */}
                    <h4 className="text-sm font-semibold text-black text-center group-hover:text-gray-700 transition-colors line-clamp-1">
                      {categoryName}
                    </h4>
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
            {filteredServices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No services found matching "{searchQuery}"</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredServices.map((service) => {
                  const portfolioImages = service?.portfolioImages || [];
                  const mainImage = portfolioImages[0]?.url;
                  const providerName = service?.provider?.user?.name || 'Unknown Provider';
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
                      {/* Service Image */}
                      <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-200 border border-gray-300">
                        {mainImage ? (
                          <img
                            src={mainImage}
                            alt="Service"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </div>

                      {/* Service Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-black group-hover:text-gray-700 transition-colors line-clamp-1">
                          {truncatedDescription}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          By {providerName}
                        </p>
                        {service?.serviceCategory && (
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

