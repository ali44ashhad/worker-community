import React, { useState } from 'react';
import { X, Plus, Upload, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const BecomeProvider = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([{
    id: Date.now(),
    category: '',
    subCategories: [],
    keywords: [],
    images: [], // Will store File objects for upload
    imagePreviews: [], // Will store blob URLs for preview
    bio: '',
    experience: ''
  }]);

  // State for provider bio
  const [providerBio, setProviderBio] = useState('');

  // New state to hold validation errors
  const [errors, setErrors] = useState({});

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    // Clear related error when changing
    if (errors[`service-${serviceId}-category`]) {
      setErrors(prev => ({ ...prev, [`service-${serviceId}-category`]: null }));
    }
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
    // Clear related error when toggling
    if (errors[`service-${serviceId}-subCategories`]) {
      setErrors(prev => ({ ...prev, [`service-${serviceId}-subCategories`]: null }));
    }
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
    // Clear related error when toggling
    if (errors[`service-${serviceId}-keywords`]) {
      setErrors(prev => ({ ...prev, [`service-${serviceId}-keywords`]: null }));
    }
  };

  const handleImageUpload = (serviceId, e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));

    setServices(services.map(service =>
      service.id === serviceId
        ? { 
            ...service, 
            images: [...service.images, ...files], // Store File objects
            imagePreviews: [...service.imagePreviews, ...imageUrls] // Store preview URLs
          }
        : service
    ));
    // Clear related error when uploading
    if (errors[`service-${serviceId}-images`]) {
      setErrors(prev => ({ ...prev, [`service-${serviceId}-images`]: null }));
    }
  };

  const handleRemoveImage = (serviceId, imageIndex) => {
    setServices(services.map(service =>
      service.id === serviceId
        ? { 
            ...service, 
            images: service.images.filter((_, i) => i !== imageIndex),
            imagePreviews: service.imagePreviews.filter((_, i) => i !== imageIndex)
          }
        : service
    ));
  };

  const handleInputChange = (serviceId, field, value) => {
    setServices(services.map(service =>
      service.id === serviceId
        ? { ...service, [field]: value }
        : service
    ));
    // Clear related error when typing
    if (errors[`service-${serviceId}-${field}`]) {
      setErrors(prev => ({ ...prev, [`service-${serviceId}-${field}`]: null }));
    }
  };

  const addNewService = () => {
    setServices([...services, {
      id: Date.now(),
      category: '',
      subCategories: [],
      keywords: [],
      images: [],
      imagePreviews: [],
      bio: '',
      experience: ''
    }]);
  };

  const removeService = (serviceId) => {
    if (services.length > 1) {
      setServices(services.filter(service => service.id !== serviceId));
      // Also remove errors associated with this service
      setErrors(prev => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach(key => {
          if (key.startsWith(`service-${serviceId}`)) {
            delete newErrors[key];
          }
        });
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let hasErrors = false;

    // Validate provider bio
    if (!providerBio.trim()) {
      newErrors['providerBio'] = "Provider bio is required.";
      hasErrors = true;
    }

    services.forEach((service) => {
      const serviceId = service.id;

      // 1. Category
      if (!service.category) {
        newErrors[`service-${serviceId}-category`] = "Please select a category.";
        hasErrors = true;
      }

      // 2. Sub-Categories (only if category is selected and subcategories exist)
      if (service.category && SERVICE_RULES[service.category].subCategories.length > 0 && service.subCategories.length === 0) {
        newErrors[`service-${serviceId}-subCategories`] = "Please select at least one sub-category.";
        hasErrors = true;
      }

      // 3. Keywords (only if category is selected AND keywords exist for it)
      if (service.category && SERVICE_RULES[service.category].keywords.length > 0 && service.keywords.length === 0) {
        newErrors[`service-${serviceId}-keywords`] = "Please select at least one keyword.";
        hasErrors = true;
      }

      // 4. Bio
      if (!service.bio.trim()) {
        newErrors[`service-${serviceId}-bio`] = "Bio/Description is required.";
        hasErrors = true;
      }

      // 5. Experience
      if (service.experience === '') { // Check for empty string, allowing "0"
        newErrors[`service-${serviceId}-experience`] = "Experience is required.";
        hasErrors = true;
      }

      // 6. Images
      if (service.images.length === 0) {
        newErrors[`service-${serviceId}-images`] = "Please upload at least one work image.";
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors; // Return true if valid, false if errors exist
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare FormData
      const formData = new FormData();
      
      // Add provider bio
      formData.append('providerBio', providerBio);
      
      // Add services as JSON
      formData.append('services', JSON.stringify(services));
      
      // Add images with proper fieldnames - images array contains File objects
      services.forEach((service, index) => {
        if (service.images && service.images.length > 0) {
          service.images.forEach((file) => {
            if (file instanceof File) {
              formData.append(`service_${index}_images`, file);
            }
          });
        }
      });

      // Get API URL from environment
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${API_URL}/api/provider-profile/become-provider-multi`, {
        method: 'POST',
        body: formData,
        credentials: 'include' // Include cookies for JWT authentication
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || 'Provider registration submitted successfully!');
        
        // Reset form
        setServices([{
          id: Date.now(),
          category: '',
          subCategories: [],
          keywords: [],
          images: [],
          imagePreviews: [],
          bio: '',
          experience: ''
        }]);
        setProviderBio('');
        setErrors({});
        setIsSubmitting(false);
        
        // Redirect to login page after a short delay
          navigate('/');
      } else {
        toast.error(data.message || 'Failed to submit provider registration.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred while submitting the form. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className='max-w-[1350px] mx-auto mt-20 px-4 pb-12'>
      <div className=" mb-5">
        <h1 className="text-4xl md:text-5xl font-bold text-black leading-tight">
          Become a Provider
        </h1>
        <p className=" text-gray-600">Share your expertise with our community</p>
      </div>

      {/* Changed to a <form> element */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Provider Bio Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-300 p-8 mb-8 hover:shadow-xl transition-shadow">
          <h2 className="text-3xl font-bold text-black mb-6">
            About You
          </h2>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wide">
              Provider Bio *
            </label>
            <textarea
              value={providerBio}
              onChange={(e) => {
                setProviderBio(e.target.value);
                if (errors['providerBio']) {
                  setErrors(prev => ({ ...prev, ['providerBio']: null }));
                }
              }}
              placeholder="Tell us about yourself and your background..."
              rows="4"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none resize-none font-medium transition-all ${
                errors['providerBio'] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-400'
              }`}
            />
            {errors['providerBio'] && (
              <p className="text-red-600 text-sm mt-2 font-medium">{errors['providerBio']}</p>
            )}
          </div>
        </div>

        {/* Services Section */}
        {services.map((service, index) => (
          <div key={service.id} className="bg-white rounded-xl shadow-lg border border-gray-300 p-8 relative hover:shadow-xl transition-shadow">
            {services.length > 1 && (
              <button
                type="button"
                onClick={() => removeService(service.id)}
                className="absolute top-4 right-4 text-white bg-black hover:bg-gray-800 transition-all rounded-full p-2 border border-gray-300"
              >
                <X size={20} />
              </button>
            )}

            <div className="flex items-center gap-3 mb-8">
              <div className="bg-black text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                {index + 1}
              </div>
              <h2 className="text-3xl font-bold text-black">
                Service 
              </h2>
            </div>

            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wide">
                Select Category *
              </label>
              <select
                value={service.category}
                onChange={(e) => handleCategoryChange(service.id, e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all font-medium ${
                  errors[`service-${service.id}-category`] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-400'
                }`}
              >
                <option value="">Choose a category</option>
                {Object.keys(SERVICE_RULES).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors[`service-${service.id}-category`] && (
                <p className="text-red-600 text-sm mt-2 font-medium">{errors[`service-${service.id}-category`]}</p>
              )}
            </div>

            {/* Sub-categories */}
            {service.category && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wide">
                  Select Sub-Categories *
                </label>
                <div className="flex flex-wrap gap-3">
                  {SERVICE_RULES[service.category].subCategories.map(subCat => (
                    <button
                      key={subCat}
                      type="button"
                      onClick={() => handleSubCategoryToggle(service.id, subCat)}
                      className={`px-5 py-2.5 rounded-lg border font-semibold transition-all ${
                        service.subCategories.includes(subCat)
                          ? 'bg-gray-800 text-white border-gray-300 shadow-md'
                          : 'bg-white text-black border-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-md'
                      }`}
                    >
                      {subCat}
                    </button>
                  ))}
                </div>
                {errors[`service-${service.id}-subCategories`] && (
                  <p className="text-red-600 text-sm mt-2 font-medium">{errors[`service-${service.id}-subCategories`]}</p>
                )}
              </div>
            )}

            {/* Keywords */}
            {service.category && SERVICE_RULES[service.category].keywords.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wide">
                  Select Keywords/Specializations *
                </label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_RULES[service.category].keywords.map(keyword => (
                    <button
                      key={keyword}
                      type="button"
                      onClick={() => handleKeywordToggle(service.id, keyword)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                        service.keywords.includes(keyword)
                          ? 'bg-gray-800 text-white border-gray-300 shadow-md'
                          : 'bg-white text-black border-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-md'
                      }`}
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
                {errors[`service-${service.id}-keywords`] && (
                  <p className="text-red-600 text-sm mt-2 font-medium">{errors[`service-${service.id}-keywords`]}</p>
                )}
              </div>
            )}

            {/* Bio */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wide">
                Bio/Description *
              </label>
              <textarea
                value={service.bio}
                onChange={(e) => handleInputChange(service.id, 'bio', e.target.value)}
                placeholder="Tell us about your service..."
                rows="4"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none resize-none font-medium transition-all ${
                  errors[`service-${service.id}-bio`] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-400'
                }`}
              />
              {errors[`service-${service.id}-bio`] && (
                <p className="text-red-600 text-sm mt-2 font-medium">{errors[`service-${service.id}-bio`]}</p>
              )}
            </div>

            {/* Experience */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wide">
                Experience (in years) *
              </label>
              <input
                type="number"
                value={service.experience}
                onChange={(e) => handleInputChange(service.id, 'experience', e.target.value)}
                placeholder="e.g., 5"
                min="0"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all font-medium ${
                  errors[`service-${service.id}-experience`] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-400'
                }`}
              />
              {errors[`service-${service.id}-experience`] && (
                <p className="text-red-600 text-sm mt-2 font-medium">{errors[`service-${service.id}-experience`]}</p>
              )}
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wide">
                Upload Work Images *
              </label>
              <div className={`border border-dashed rounded-lg p-8 text-center transition-all hover:shadow-lg ${
                  errors[`service-${service.id}-images`] ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:bg-gray-50'
                }`}>
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
                  <Upload className="text-black mb-3" size={48} />
                  <span className="text-black font-bold text-lg mb-1">Click to upload images</span>
                  <span className="text-sm text-gray-600">PNG, JPG up to 10MB</span>
                </label>
              </div>
              {errors[`service-${service.id}-images`] && (
                <p className="text-red-600 text-sm mt-2 font-medium">{errors[`service-${service.id}-images`]}</p>
              )}

              {/* Image Preview */}
              {service.imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {service.imagePreviews.map((img, imgIndex) => (
                    <div key={imgIndex} className="relative group border border-gray-300 rounded-lg overflow-hidden">
                      <img
                        src={img}
                        alt={`Upload ${imgIndex + 1}`}
                        className="w-full h-40 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(service.id, imgIndex)}
                        className="absolute top-2 right-2 bg-black text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all border-2 border-white"
                      >
                        <Trash2 size={18} />
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
          className="w-full py-4 border border-dashed border-gray-300 rounded-xl text-black font-bold text-lg hover:bg-gray-800 hover:text-white transition-all flex items-center justify-center gap-3 group"
        >
          <Plus size={24} className="group-hover:rotate-90 transition-transform" />
          Add Another Service
        </button>

        {/* Submit Button */}
        <div className="flex justify-end mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 bg-black text-white font-bold text-lg rounded-xl transition-all shadow-xl tracking-wide ${
              isSubmitting 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-gray-800 hover:shadow-2xl'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Registration'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BecomeProvider;