import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi';

const AllCategory = () => {
  const navigate = useNavigate();

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

  const categories = Object.entries(SERVICE_RULES);

  const handleCategoryClick = (categoryName) => {
    navigate(`/category/${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className='min-h-screen bg-gray-50 pb-16'>
      <div className='max-w-[1350px] mx-auto px-4 pt-24'>
        {/* Header */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl md:text-5xl font-bold text-black mb-4'>
            All Categories
          </h1>
          <p className='text-gray-600 text-center max-w-3xl mx-auto text-base md:text-lg'>
            Explore all available service categories. Each category offers a variety of specialized services from talented community providers.
          </p>
        </div>

        {/* Categories Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {categories.map(([categoryName, categoryData]) => {
            const imagePath = categoryImages[categoryName];
            const displayedKeywords = categoryData.keywords.slice(0, 5);

            return (
              <div
                key={categoryName}
                onClick={() => handleCategoryClick(categoryName)}
                className='bg-white border-2 border-black rounded-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer'
              >
                {/* Image */}
                <div className='mb-4 flex justify-center'>
                  <div className='w-full h-48 border-2 border-black rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center'>
                    {imagePath ? (
                      <img
                        src={imagePath}
                        alt={categoryName}
                        className='w-full h-full object-cover'
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className='w-full h-full flex items-center justify-center text-black font-bold text-lg'
                      style={{ display: imagePath ? 'none' : 'flex' }}
                    >
                      {categoryName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Category Name */}
                <h3 className='text-2xl font-bold text-black text-center mb-3 group-hover:text-gray-700 transition-colors'>
                  {categoryName}
                </h3>

                {/* Description */}
                <div className='text-gray-600 text-center text-sm mb-4 min-h-[2.5rem] flex items-center justify-center'>
                  <p className='line-clamp-2'>
                    {categoryData.description}
                  </p>
                </div>

                {/* Keywords */}
                <div className='flex flex-wrap gap-2 justify-center mb-4'>
                  {displayedKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className='px-3 py-1 bg-black text-white text-xs font-semibold rounded-full border border-black hover:bg-white hover:text-black transition-all'
                    >
                      {keyword}
                    </span>
                  ))}
                  {categoryData.keywords.length > 5 && (
                    <span className='px-3 py-1 bg-white text-black text-xs font-semibold rounded-full border-2 border-black hover:bg-black hover:text-white transition-all'>
                      +{categoryData.keywords.length - 5} more
                    </span>
                  )}
                </div>

                {/* View Services Button */}
                <div className='mt-4 flex items-center justify-center gap-2 text-black group-hover:text-gray-700 transition-colors'>
                  <span className='font-semibold text-sm'>View Services</span>
                  <HiArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className='mt-12 text-center'>
          <div className='bg-white border-2 border-black rounded-xl p-6 max-w-2xl mx-auto'>
            <p className='text-gray-600 text-sm'>
              Can't find what you're looking for? Try browsing by{' '}
              <button
                onClick={() => navigate('/service')}
                className='text-black font-semibold underline hover:text-gray-700 transition-colors'
              >
                all services
              </button>
              {' '}or{' '}
              <button
                onClick={() => navigate('/provider')}
                className='text-black font-semibold underline hover:text-gray-700 transition-colors'
              >
                providers
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllCategory;
