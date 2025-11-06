import React, { useState, useEffect } from 'react';
import { X, Plus, Upload, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { getMyProviderProfile } from '../features/providerSlice';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const UpdateServices = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myProviderProfile, isFetchingMyProfile } = useSelector((state) => state.provider);
  const { user } = useSelector((state) => state.auth);

  // State for provider bio
  const [providerBio, setProviderBio] = useState('');

  // State for services - initially empty, will be populated from existing services
  const [services, setServices] = useState([]);

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

  // Fetch provider profile on component mount
  useEffect(() => {
    if (user && user.role === 'provider') {
      dispatch(getMyProviderProfile());
    }
  }, [dispatch, user]);

  // Populate form when profile is fetched
  useEffect(() => {
    if (myProviderProfile) {
      setProviderBio(myProviderProfile.bio || '');
      
      // Convert existing services to the form format
      const existingServices = (myProviderProfile.serviceOfferings || []).map((service, index) => ({
        id: service._id || Date.now() + index,
        _id: service._id, // Keep original ID for updates
        category: service.serviceCategory || '',
        subCategories: service.subCategories || [],
        keywords: service.keywords || [],
        bio: service.description || '',
        experience: service.experience || '',
        price: service.price || '',
        // For existing images from database
        existingImages: service.portfolioImages || [],
        // For new images to be uploaded
        images: [],
        imagePreviews: []
      }));
      
      setServices(existingServices.length > 0 ? existingServices : [{
        id: Date.now(),
        category: '',
        subCategories: [],
        keywords: [],
        images: [],
        imagePreviews: [],
        bio: '',
        experience: '',
        price: ''
      }]);
    }
  }, [myProviderProfile]);

  const handleCategoryChange = (serviceId, category) => {
    setServices(services.map(service =>
      service.id === serviceId
        ? { ...service, category, subCategories: [], keywords: [] }
        : service
    ));
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
            images: [...service.images, ...files],
            imagePreviews: [...service.imagePreviews, ...imageUrls]
          }
        : service
    ));
    if (errors[`service-${serviceId}-images`]) {
      setErrors(prev => ({ ...prev, [`service-${serviceId}-images`]: null }));
    }
  };

  const handleRemoveImage = (serviceId, imageIndex, isExisting = false) => {
    if (isExisting) {
      // Remove existing image from database
      setServices(services.map(service =>
        service.id === serviceId
          ? {
              ...service,
              existingImages: service.existingImages.filter((_, i) => i !== imageIndex),
              imagesToDelete: [...(service.imagesToDelete || []), imageIndex]
            }
          : service
      ));
    } else {
      // Calculate the actual index for newly uploaded images
      const existingCount = services.find(s => s.id === serviceId)?.existingImages?.length || 0;
      const newIndex = imageIndex - existingCount;
      
      // Remove newly uploaded image
      setServices(services.map(service =>
        service.id === serviceId
          ? { 
              ...service, 
              images: service.images.filter((_, i) => i !== newIndex),
              imagePreviews: service.imagePreviews.filter((_, i) => i !== newIndex)
            }
          : service
      ));
    }
  };

  const handleInputChange = (serviceId, field, value) => {
    setServices(services.map(service =>
      service.id === serviceId
        ? { ...service, [field]: value }
        : service
    ));
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

    if (!providerBio.trim()) {
      newErrors['providerBio'] = "Provider bio is required.";
      hasErrors = true;
    }

    services.forEach((service) => {
      const serviceId = service.id;

      if (!service.category) {
        newErrors[`service-${serviceId}-category`] = "Please select a category.";
        hasErrors = true;
      }

      if (service.category && SERVICE_RULES[service.category].subCategories.length > 0 && service.subCategories.length === 0) {
        newErrors[`service-${serviceId}-subCategories`] = "Please select at least one sub-category.";
        hasErrors = true;
      }

      if (service.category && SERVICE_RULES[service.category].keywords.length > 0 && service.keywords.length === 0) {
        newErrors[`service-${serviceId}-keywords`] = "Please select at least one keyword.";
        hasErrors = true;
      }

      if (!service.bio.trim()) {
        newErrors[`service-${serviceId}-bio`] = "Bio/Description is required.";
        hasErrors = true;
      }

      if (service.experience === '') {
        newErrors[`service-${serviceId}-experience`] = "Experience is required.";
        hasErrors = true;
      }

      if (service.price === '' || service.price === null || service.price === undefined) {
        newErrors[`service-${serviceId}-price`] = "Price is required.";
        hasErrors = true;
      } else if (parseFloat(service.price) < 0) {
        newErrors[`service-${serviceId}-price`] = "Price cannot be negative.";
        hasErrors = true;
      }

      // For existing services, at least one image must exist (either existing or new)
      const totalImages = (service.existingImages?.length || 0) + (service.imagePreviews?.length || 0);
      if (totalImages === 0) {
        newErrors[`service-${serviceId}-images`] = "Please upload at least one work image.";
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // First, update the provider bio WITHOUT experience
      if (myProviderProfile) {
        await fetch(`${API_URL}/api/provider-profile/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            bio: providerBio
          })
        });
      }

      // Update each service
      for (const service of services) {
        const formData = new FormData();
        
        formData.append('serviceCategory', service.category);
        formData.append('subCategories', JSON.stringify(service.subCategories));
        formData.append('keywords', JSON.stringify(service.keywords));
        formData.append('description', service.bio);
        formData.append('experience', service.experience);
        formData.append('price', service.price);
        
        // Add new images if any
        service.images.forEach((file) => {
          if (file instanceof File) {
            formData.append('portfolioImages', file);
          }
        });

        if (service._id) {
          // Update existing service
          await fetch(`${API_URL}/api/provider-profile/service/${service._id}`, {
            method: 'PUT',
            body: formData,
            credentials: 'include'
          });
        } else {
          // Add new service
          await fetch(`${API_URL}/api/provider-profile/service`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
          });
        }
      }

      toast.success('Services updated successfully!');
      setIsSubmitting(false);
      
      // Redirect to home page after a short delay
        navigate('/');
      
    } catch (error) {
      console.error('Error updating services:', error);
      toast.error('An error occurred while updating services.');
      setIsSubmitting(false);
    }
  };

  if (isFetchingMyProfile) {
    return (
      <div className='mt-20 max-w-[1350px] mx-auto px-6 flex items-center justify-center min-h-screen'>
        <motion.div 
          className='text-center'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className='animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-gray-900 mx-auto mb-4'
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className='text-xl font-semibold text-gray-700'>Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!user || user.role !== 'provider') {
    return (
      <motion.div 
        className='mt-20 max-w-[1350px] mx-auto px-6 py-12'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className='text-center'>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-500 text-lg">You need to be a provider to access this page.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className='max-w-[1350px] mx-auto mt-24 px-6 pb-20'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-4 tracking-tight">
          Update Services
        </h1>
        <p className="text-gray-500 text-lg">Edit your profile and services</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Provider Bio Section */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6 hover:shadow-xl transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ scale: 1.01 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">
            About You
          </h2>
          
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3 tracking-wide">
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
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent outline-none resize-none font-medium transition-all duration-300 ${
                errors['providerBio'] 
                  ? 'border-red-300 focus:ring-red-400 bg-red-50' 
                  : 'border-gray-200 focus:ring-gray-400 focus:bg-white'
              }`}
            />
            {errors['providerBio'] && (
              <motion.p 
                className="text-red-500 text-sm mt-2 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {errors['providerBio']}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Services Section */}
        <AnimatePresence>
          {services.map((service, index) => (
            <motion.div 
              key={service.id} 
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 relative hover:shadow-xl transition-all duration-300 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
            >
              {services.length > 1 && (
                <motion.button
                  type="button"
                  onClick={() => removeService(service.id)}
                  className="absolute top-6 right-6 text-gray-400 bg-gray-50 hover:bg-red-50 hover:text-red-500 transition-all duration-300 rounded-full p-2 border border-gray-200 hover:border-red-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
              )}

              <div className="flex items-center gap-4 mb-8">
                <div className="bg-gray-900 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg">
                  {index + 1}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                  Service {service._id ? '(Existing)' : '(New)'}
                </h2>
              </div>

            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3 tracking-wide">
                Select Category *
              </label>
              <select
                value={service.category}
                onChange={(e) => handleCategoryChange(service.id, e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all duration-300 font-medium ${
                  errors[`service-${service.id}-category`] 
                    ? 'border-red-300 focus:ring-red-400 bg-red-50' 
                    : 'border-gray-200 focus:ring-gray-400 focus:bg-white'
                }`}
              >
                <option value="">Choose a category</option>
                {Object.keys(SERVICE_RULES).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors[`service-${service.id}-category`] && (
                <motion.p 
                  className="text-red-500 text-sm mt-2 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errors[`service-${service.id}-category`]}
                </motion.p>
              )}
            </div>

            {/* Sub-categories */}
            {service.category && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3 tracking-wide">
                  Select Sub-Categories *
                </label>
                <div className="flex flex-wrap gap-3">
                  {SERVICE_RULES[service.category].subCategories.map(subCat => (
                    <motion.button
                      key={subCat}
                      type="button"
                      onClick={() => handleSubCategoryToggle(service.id, subCat)}
                      className={`px-5 py-2.5 rounded-xl border font-semibold transition-all duration-300 ${
                        service.subCategories.includes(subCat)
                          ? 'bg-gray-900 text-white border-gray-900 shadow-lg'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {subCat}
                    </motion.button>
                  ))}
                </div>
                {errors[`service-${service.id}-subCategories`] && (
                  <motion.p 
                    className="text-red-500 text-sm mt-2 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors[`service-${service.id}-subCategories`]}
                  </motion.p>
                )}
              </div>
            )}

            {/* Keywords */}
            {service.category && SERVICE_RULES[service.category].keywords.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3 tracking-wide">
                  Select Keywords/Specializations *
                </label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_RULES[service.category].keywords.map(keyword => (
                    <motion.button
                      key={keyword}
                      type="button"
                      onClick={() => handleKeywordToggle(service.id, keyword)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-300 ${
                        service.keywords.includes(keyword)
                          ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {keyword}
                    </motion.button>
                  ))}
                </div>
                {errors[`service-${service.id}-keywords`] && (
                  <motion.p 
                    className="text-red-500 text-sm mt-2 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors[`service-${service.id}-keywords`]}
                  </motion.p>
                )}
              </div>
            )}

            {/* Bio */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3 tracking-wide">
                Bio/Description *
              </label>
              <textarea
                value={service.bio}
                onChange={(e) => handleInputChange(service.id, 'bio', e.target.value)}
                placeholder="Tell us about your service..."
                rows="4"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent outline-none resize-none font-medium transition-all duration-300 ${
                  errors[`service-${service.id}-bio`] 
                    ? 'border-red-300 focus:ring-red-400 bg-red-50' 
                    : 'border-gray-200 focus:ring-gray-400 focus:bg-white'
                }`}
              />
              {errors[`service-${service.id}-bio`] && (
                <motion.p 
                  className="text-red-500 text-sm mt-2 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errors[`service-${service.id}-bio`]}
                </motion.p>
              )}
            </div>

            {/* Experience */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3 tracking-wide">
                Experience (in years) *
              </label>
              <input
                type="number"
                value={service.experience}
                onChange={(e) => handleInputChange(service.id, 'experience', e.target.value)}
                placeholder="e.g., 5"
                min="0"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all duration-300 font-medium ${
                  errors[`service-${service.id}-experience`] 
                    ? 'border-red-300 focus:ring-red-400 bg-red-50' 
                    : 'border-gray-200 focus:ring-gray-400 focus:bg-white'
                }`}
              />
              {errors[`service-${service.id}-experience`] && (
                <motion.p 
                  className="text-red-500 text-sm mt-2 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errors[`service-${service.id}-experience`]}
                </motion.p>
              )}
            </div>

            {/* Price */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3 tracking-wide">
                Price (in ₹) *
              </label>
              <input
                type="number"
                value={service.price}
                onChange={(e) => handleInputChange(service.id, 'price', e.target.value)}
                placeholder="e.g., 500"
                min="0"
                step="0.01"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all duration-300 font-medium ${
                  errors[`service-${service.id}-price`] 
                    ? 'border-red-300 focus:ring-red-400 bg-red-50' 
                    : 'border-gray-200 focus:ring-gray-400 focus:bg-white'
                }`}
              />
              {errors[`service-${service.id}-price`] && (
                <motion.p 
                  className="text-red-500 text-sm mt-2 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errors[`service-${service.id}-price`]}
                </motion.p>
              )}
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3 tracking-wide">
                Upload Work Images *
              </label>
              <motion.div 
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                  errors[`service-${service.id}-images`] 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.01 }}
              >
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
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Upload className="text-gray-400 mb-4" size={48} />
                  </motion.div>
                  <span className="text-gray-900 font-semibold text-lg mb-2">Click to upload images</span>
                  <span className="text-sm text-gray-500">PNG, JPG up to 10MB</span>
                </label>
              </motion.div>
              {errors[`service-${service.id}-images`] && (
                <motion.p 
                  className="text-red-500 text-sm mt-2 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errors[`service-${service.id}-images`]}
                </motion.p>
              )}

              {/* Image Preview */}
              {((service.existingImages && service.existingImages.length > 0) || (service.imagePreviews && service.imagePreviews.length > 0)) && (
                <motion.div 
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Show all images together - existing first, then new */}
                  {[
                    ...(service.existingImages || []).map((img, idx) => ({ ...img, isExisting: true, index: idx })),
                    ...(service.imagePreviews || []).map((img, idx) => ({ url: img, isExisting: false, index: idx }))
                  ].map((imgObj, displayIndex) => (
                    <motion.div 
                      key={`img-${displayIndex}`} 
                      className="relative group border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: displayIndex * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <img
                        src={imgObj.url}
                        alt={`Image ${displayIndex + 1}`}
                        className="w-full h-40 object-cover"
                      />
                      <motion.button
                        type="button"
                        onClick={() => handleRemoveImage(service.id, imgObj.index, imgObj.isExisting)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Another Service Button */}
        <motion.button
          type="button"
          onClick={addNewService}
          className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-700 font-semibold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 flex items-center justify-center gap-3 group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            animate={{ rotate: 0 }}
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.3 }}
          >
            <Plus size={24} />
          </motion.div>
          Add Another Service
        </motion.button>

        {/* Submit Button */}
        <motion.div 
          className="flex justify-end mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-4 bg-gray-900 text-white font-semibold text-lg rounded-xl transition-all duration-300 shadow-lg tracking-wide ${
              isSubmitting 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-gray-800 hover:shadow-xl'
            }`}
            whileHover={!isSubmitting ? { scale: 1.02 } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
            ) : (
              'Update Services'
            )}
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default UpdateServices;
