import React, { useState } from 'react';
import { X, Plus, Upload, Trash2 } from 'lucide-react';

const BecomeProvider = () => {
  const [services, setServices] = useState([{
    id: Date.now(),
    category: '',
    subCategories: [],
    keywords: [],
    images: [],
    bio: '',
    experience: ''
  }]);

  const SERVICE_RULES = {
    "Academics": {
      subCategories: ["Home Tuitions", "Tuition Center", "School", "College"],
      keywords: ["Maths", "Science", "Language", "English", "Hindi", "Sanskrit", "Spanish", "French", "German", "Mandarin", "Italian", "Accounts", "Economics", "Physics", "Chemistry"]
    },
    "Music": {
      subCategories: ["Home Classes", "Academy"],
      keywords: ["Home Classes", "Guitar", "Academy", "Piano", "Drums", "Violin", "Flute", "Vocals", "Singing", "Saxophone"]
    },
    "Dance": {
      subCategories: ["Home Classes", "Academy"],
      keywords: ["Zumba", "Bhangra", "Salsa", "Jiving", "Freestyle", "Breakdance"]
    },
    "Fitness & Sports": {
      subCategories: ["Home Classes", "Academy"],
      keywords: ["Yoga", "Pilates", "Fitness", "Zumba", "Skateboarding", "Skating", "Cricket", "Football", "Pickle Ball", "Badminston", "Tennis", "Table Tennis", "Chess", "Padel", "Gym", "Strength Training", "Core", "Strength", "Weight Training", "Weights", "Sudoku", "Puzzle"]
    },
    "Home Cooking": {
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Food", "Cook", "Italian", "Indian", "Mexican", "Rajasthani", "Gujrati", "Bengali", "Chinese", "Burgers", "Pizza", "Asian", "Sushi", "Dimsums", "Sushi Cake", "Salads", "Ramen", "Pasta", "Biryani"]
    },
    "Home Catering": {
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Food", "Cook", "Italian", "Indian", "Mexican", "Rajasthani", "Gujrati", "Bengali", "Chinese", "Burgers", "Pizza", "Asian", "Sushi", "Dimsums", "Sushi Cake", "Salads", "Ramen", "Pasta", "Biryani"]
    },
    "Home Baker": {
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Cakes", "Pastry", "Brownie", "Muffins", "Tarts", "Eggless", "Quiche", "Fondant", "Chocolate", "Protein Bar", "Granola", "Bread"]
    },
    "Catering": {
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Food", "Cook", "Italian", "Indian", "Mexican", "Rajasthani", "Gujrati", "Bengali", "Chinese", "Burgers", "Pizza", "Asian", "Sushi", "Dimsums", "Sushi Cake", "Salads", "Ramen", "Pasta", "Biryani"]
    },
    "Professional Baker": {
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Cakes", "Pastry", "Brownie", "Muffins", "Tarts", "Eggless", "Quiche", "Fondant"]
    },
    "Workshops": {
      subCategories: ["Home Workshops", "Online Workshops"],
      keywords: ["Summer", "Winter", "Story Telling", "Book Reading", "Cooking", "Baking", "Workshop"]
    },
    "Photography": {
      subCategories: ["Academy"],
      keywords: ["Lens", "Camera", "Video", "Wedding", "Birthday"]
    },
    "Technology": {
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["AI", "Python", "Automation", "Coding", "Image Creation", "Digital Marketing", "Designing", "Scratch", "Prompt", "Chat GPT", "LLM", "Java", "Clone", "Video Generaion"]
    },
    "Consulting": {
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Financial Planning", "Tax Consultancy", "CA", "Chartered Accountant", "Returns", "Landscaping", "Garden", "Flowers"]
    },
    "Finance": {
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Financial Planning", "Tax Planning", "Accounting", "Investments", "Mutual Finds", "Stocks", "Broker", "Money", "Bonds", "Crypto"]
    },
    "Groceries": {
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Kitchen", "Grocery", "Vegetables", "Fruits", "Sauce", "Milk", "Bread"]
    },
    "Home Products": {
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Candles", "Handicrafts", "Bathroom Products", "Artefacts", "Sculptures", "Show Piece", "Garden", "Furniture", "Flooring", "Marble", "Wooden", "Carpenter", "Electrical", "Plumbing", "Solar", "Gate", "Light", "Paint", "Wall"]
    },
    "Apparels & Footwear": {
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Fashion", "Shoes", "Chappals", "Sandals", "Suits", "Shirts", "Kurti", "Indo western", "Coord Sets"]
    },
    "Law": {
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Tax", "Civil", "Criminal", "Corporate", "Arbitration", "High Court", "Court", "Supreme Court", "District Court", "Judge", "Lawyer", "Advocate", "Bail"]
    },
    "Medical": {
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Doctor", "Nurse", "Medical Equipment"]
    },
    "Art & Craft": {
      subCategories: ["Home Classes", "Academy"],
      keywords: ["Origami", "Painting", "Drawing", "Colouring"]
    },
    "Home Interiors": {
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Interiros", "Designing"]
    },
    "Construction": {
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["House", "Farm House", "Flat", "Floor", "Marble", "Stone", "Wall"]
    },
    "Real Estate": {
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Real Estate Consultant", "Property", "Buy", "Sell"]
    },
    "Event Planner": {
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Birthday", "Decor", "Wedding", "Anniversary", "Balloon", "Props", "Corporate Event", "Rides"]
    },
    "Gifting": {
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: ["Corporate", "Gift Set"]
    },
    "Other": {
      subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
      keywords: []
    }
  };

  const handleCategoryChange = (serviceId, category) => {
    setServices(services.map(service => 
      service.id === serviceId 
        ? { ...service, category, subCategories: [], keywords: [] }
        : service
    ));
  };

  const handleSubCategoryToggle = (serviceId, subCategory) => {
    setServices(services.map(service => {
      if (service.id === serviceId) {
        const isSelected = service.subCategories.includes(subCategory);
        return {
          ...service,
          subCategories: isSelected
            ? service.subCategories.filter(sc => sc !== subCategory)
            : [...service.subCategories, subCategory]
        };
      }
      return service;
    }));
  };

  const handleKeywordToggle = (serviceId, keyword) => {
    setServices(services.map(service => {
      if (service.id === serviceId) {
        const isSelected = service.keywords.includes(keyword);
        return {
          ...service,
          keywords: isSelected
            ? service.keywords.filter(k => k !== keyword)
            : [...service.keywords, keyword]
        };
      }
      return service;
    }));
  };

  const handleImageUpload = (serviceId, e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    
    setServices(services.map(service =>
      service.id === serviceId
        ? { ...service, images: [...service.images, ...imageUrls] }
        : service
    ));
  };

  const handleRemoveImage = (serviceId, imageIndex) => {
    setServices(services.map(service =>
      service.id === serviceId
        ? { ...service, images: service.images.filter((_, i) => i !== imageIndex) }
        : service
    ));
  };

  const handleInputChange = (serviceId, field, value) => {
    setServices(services.map(service =>
      service.id === serviceId
        ? { ...service, [field]: value }
        : service
    ));
  };

  const addNewService = () => {
    setServices([...services, {
      id: Date.now(),
      category: '',
      subCategories: [],
      keywords: [],
      images: [],
      bio: '',
      experience: ''
    }]);
  };

  const removeService = (serviceId) => {
    if (services.length > 1) {
      setServices(services.filter(service => service.id !== serviceId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Services submitted:', services);
    alert('Provider registration submitted successfully!');
  };

  return (
    <div className='max-w-[1350px] mx-auto mt-20 px-4 pb-12'>
      <h1 className="text-3xl md:text-4xl md:pl-2 font-bold text-gray-800 leading-tight mb-8">
        Become a Provider
      </h1>

      <div className="space-y-8">
        {services.map((service, index) => (
          <div key={service.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 relative">
            {services.length > 1 && (
              <button
                type="button"
                onClick={() => removeService(service.id)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors"
              >
                <X size={24} />
              </button>
            )}

            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Service {index + 1}
            </h2>

            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Category *
              </label>
              <select
                value={service.category}
                onChange={(e) => handleCategoryChange(service.id, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              >
                <option value="">Choose a category</option>
                {Object.keys(SERVICE_RULES).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Sub-categories */}
            {service.category && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Sub-Categories *
                </label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_RULES[service.category].subCategories.map(subCat => (
                    <button
                      key={subCat}
                      type="button"
                      onClick={() => handleSubCategoryToggle(service.id, subCat)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        service.subCategories.includes(subCat)
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                      }`}
                    >
                      {subCat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords */}
            {service.category && SERVICE_RULES[service.category].keywords.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Keywords/Specializations
                </label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_RULES[service.category].keywords.map(keyword => (
                    <button
                      key={keyword}
                      type="button"
                      onClick={() => handleKeywordToggle(service.id, keyword)}
                      className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
                        service.keywords.includes(keyword)
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio/Description *
              </label>
              <textarea
                value={service.bio}
                onChange={(e) => handleInputChange(service.id, 'bio', e.target.value)}
                placeholder="Tell us about your service..."
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                required
              />
            </div>

            {/* Experience */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience (in years) *
              </label>
              <input
                type="number"
                value={service.experience}
                onChange={(e) => handleInputChange(service.id, 'experience', e.target.value)}
                placeholder="e.g., 5"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Work Images
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  id={`images-${service.id}`}
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(service.id, e)}
                  className="hidden"
                />
                <label
                  htmlFor={`images-${service.id}`}
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="text-gray-400 mb-2" size={40} />
                  <span className="text-gray-600">Click to upload images</span>
                  <span className="text-sm text-gray-400 mt-1">PNG, JPG up to 10MB</span>
                </label>
              </div>

              {/* Image Preview */}
              {service.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {service.images.map((img, imgIndex) => (
                    <div key={imgIndex} className="relative group">
                      <img
                        src={img}
                        alt={`Upload ${imgIndex + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(service.id, imgIndex)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add Another Service Button */}
        <button
          type="button"
          onClick={addNewService}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add Another Service
        </button>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Submit Registration
          </button>
        </div>
      </div>
    </div>
  );
};

export default BecomeProvider;