import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getAllProvidersAdmin, 
  updateProviderDetails, 
  updateProviderUserDetails,
  updateServiceDetails,
  deleteServiceImage
} from '../../features/adminSlice';
import { 
  HiOutlinePencil, 
  HiOutlineCheck, 
  HiOutlineX, 
  HiOutlineBriefcase, 
  HiOutlineTrash,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineDocumentText
} from 'react-icons/hi';
import { motion } from 'framer-motion';

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

const UpdateProviders = () => {
  const dispatch = useDispatch();
  const { providers, isLoading, error } = useSelector((state) => state.admin);
  const [editingProvider, setEditingProvider] = useState(null);
  const [editForm, setEditForm] = useState({
    bio: '',
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
  });
  const [selectedService, setSelectedService] = useState(null);
  const [serviceEditForm, setServiceEditForm] = useState({
    serviceCategory: '',
    subCategories: [],
    keywords: [],
    description: '',
    experience: 0,
    price: 0,
    newImages: []
  });

  useEffect(() => {
    dispatch(getAllProvidersAdmin());
  }, [dispatch]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedService) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedService]);

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setServiceEditForm({
      serviceCategory: service.serviceCategory || '',
      subCategories: Array.isArray(service.subCategories) ? service.subCategories : [],
      keywords: Array.isArray(service.keywords) ? service.keywords : [],
      description: service.description || '',
      experience: service.experience || 0,
      price: service.price || 0,
      newImages: []
    });
  };

  const handleCloseServiceModal = () => {
    setSelectedService(null);
    setServiceEditForm({
      serviceCategory: '',
      subCategories: [],
      keywords: [],
      description: '',
      experience: 0,
      price: 0,
      newImages: []
    });
  };

  const handleServiceSave = async () => {
    if (!selectedService) return;
    
    const formData = new FormData();
    
    if (serviceEditForm.serviceCategory) formData.append('serviceCategory', serviceEditForm.serviceCategory);
    if (serviceEditForm.subCategories.length > 0) {
      formData.append('subCategories', JSON.stringify(serviceEditForm.subCategories));
    }
    if (serviceEditForm.keywords.length > 0) {
      formData.append('keywords', JSON.stringify(serviceEditForm.keywords));
    }
    if (serviceEditForm.description !== undefined) formData.append('description', serviceEditForm.description);
    if (serviceEditForm.experience !== undefined) formData.append('experience', serviceEditForm.experience.toString());
    if (serviceEditForm.price !== undefined) formData.append('price', serviceEditForm.price.toString());

    // Add new images
    serviceEditForm.newImages.forEach((file) => {
      formData.append('portfolioImages', file);
    });

    await dispatch(updateServiceDetails({ serviceId: selectedService._id, formData }));
    handleCloseServiceModal();
    dispatch(getAllProvidersAdmin());
  };

  const handleDeleteServiceImage = async (imagePublicId) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      await dispatch(deleteServiceImage({ serviceId: selectedService._id, imagePublicId }));
      dispatch(getAllProvidersAdmin());
    }
  };

  const handleSubCategoryToggle = (subCategory) => {
    const current = serviceEditForm.subCategories || [];
    if (current.includes(subCategory)) {
      setServiceEditForm({
        ...serviceEditForm,
        subCategories: current.filter(s => s !== subCategory)
      });
    } else {
      setServiceEditForm({
        ...serviceEditForm,
        subCategories: [...current, subCategory]
      });
    }
  };

  const handleKeywordToggle = (keyword) => {
    const current = serviceEditForm.keywords || [];
    if (current.includes(keyword)) {
      setServiceEditForm({
        ...serviceEditForm,
        keywords: current.filter(k => k !== keyword)
      });
    } else {
      setServiceEditForm({
        ...serviceEditForm,
        keywords: [...current, keyword]
      });
    }
  };

  const handleServiceImageChange = (e) => {
    const files = Array.from(e.target.files);
    setServiceEditForm({
      ...serviceEditForm,
      newImages: files
    });
  };

  const getCurrentRules = () => {
    return SERVICE_RULES[serviceEditForm.serviceCategory] || { subCategories: [], keywords: [] };
  };

  const handleEdit = (provider) => {
    setEditingProvider(provider._id);
    setEditForm({
      bio: provider.bio || '',
      name: provider.user?.name || '',
      email: provider.user?.email || '',
      phoneNumber: provider.user?.phoneNumber || '',
      address: provider.user?.address || '',
    });
  };

  const handleCancel = () => {
    setEditingProvider(null);
    setEditForm({
      bio: '',
      name: '',
      email: '',
      phoneNumber: '',
      address: '',
    });
  };

  const handleSave = async (providerId) => {
    // Update provider bio
    if (editForm.bio !== undefined) {
      await dispatch(updateProviderDetails({ providerId, bio: editForm.bio }));
    }

    // Update user details
    await dispatch(
      updateProviderUserDetails({
        providerId,
        name: editForm.name,
        email: editForm.email,
        phoneNumber: editForm.phoneNumber,
        address: editForm.address,
      })
    );

    setEditingProvider(null);
    setEditForm({
      bio: '',
      name: '',
      email: '',
      phoneNumber: '',
      address: '',
    });

    // Refresh providers list
    dispatch(getAllProvidersAdmin());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-xl font-semibold text-black">Loading providers...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-red-600 text-xl font-semibold">Error: {error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="max-w-[1350px] mx-auto px-6 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-black mb-3 tracking-tight">Manage Providers</h1>
        <p className="text-gray-600 max-w-2xl">View and update provider information</p>
      </motion.div>

      {providers && providers.length > 0 ? (
        <div className="space-y-6">
          {providers.map((provider) => {
            const isEditing = editingProvider === provider._id;

            return (
              <motion.div
                key={provider._id}
                className="bg-white border border-gray-300 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center overflow-hidden">
                      {provider.user?.profileImage ? (
                        <img
                          src={provider.user.profileImage}
                          alt={provider.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-semibold text-xl">
                          {provider.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-black">
                        {provider.user?.name || 'Unknown Provider'}
                      </h3>
                      <p className="text-sm text-gray-600">{provider.user?.email || ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isEditing ? (
                      <button
                        onClick={() => handleEdit(provider)}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <HiOutlinePencil size={18} />
                        <span>Edit</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSave(provider._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <HiOutlineCheck size={18} />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex items-center gap-2 px-4 py-2 bg-white text-black border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <HiOutlineX size={18} />
                          <span>Cancel</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* User Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                        <HiOutlineUser className="text-gray-500" size={16} />
                        Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-300 bg-white text-black"
                        />
                      ) : (
                        <p className="text-black">{provider.user?.name || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                        <HiOutlineMail className="text-gray-500" size={16} />
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-300 bg-white text-black"
                        />
                      ) : (
                        <p className="text-black">{provider.user?.email || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                        <HiOutlinePhone className="text-gray-500" size={16} />
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.phoneNumber}
                          onChange={(e) =>
                            setEditForm({ ...editForm, phoneNumber: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-300 bg-white text-black"
                        />
                      ) : (
                        <p className="text-black">{provider.user?.phoneNumber || 'N/A'}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                        <HiOutlineLocationMarker className="text-gray-500" size={16} />
                        Address
                      </label>
                      {isEditing ? (
                        <textarea
                          value={editForm.address}
                          onChange={(e) =>
                            setEditForm({ ...editForm, address: e.target.value })
                          }
                          rows="2"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-300 bg-white text-black"
                          placeholder="Enter address"
                        />
                      ) : (
                        <p className="text-black">{provider.user?.address || 'N/A'}</p>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                      <HiOutlineDocumentText className="text-gray-500" size={16} />
                      Bio
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        rows="4"
                        maxLength={500}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-300 bg-white text-black"
                        placeholder="Provider bio..."
                      />
                    ) : (
                      <p className="text-black">{provider.bio || 'No bio provided'}</p>
                    )}
                    {isEditing && (
                      <p className="text-xs text-gray-500 mt-1">
                        {editForm.bio.length}/500 characters
                      </p>
                    )}
                  </div>

                  {/* Service Offerings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <HiOutlineBriefcase className="text-gray-500" size={16} />
                      Service Offerings
                    </label>
                    {provider.serviceOfferings && provider.serviceOfferings.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        {provider.serviceOfferings.map((service) => (
                          <div
                            key={service._id}
                            onClick={() => handleServiceClick(service)}
                            className="bg-gray-50 border border-gray-300 rounded-xl p-6 hover:bg-gray-100 cursor-pointer transition-all duration-300 group shadow-sm hover:shadow-md hover:-translate-y-1"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="bg-gray-200 border border-gray-300 group-hover:bg-gray-300 p-2 rounded-xl">
                                  <HiOutlineBriefcase className="text-black group-hover:text-black" size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-lg text-black">
                                    {service.servicename || service.serviceCategory || 'Service'}
                                  </h4>
                                  {service.servicename && service.serviceCategory && (
                                    <p className="text-sm text-gray-600 mt-0.5">
                                      {service.serviceCategory}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <HiOutlinePencil className="text-gray-500 group-hover:text-black" size={18} />
                            </div>
                            {service.description && (
                              <p className="text-sm text-gray-600 line-clamp-3 mb-3 min-h-[3.75rem]">
                                {service.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-3 mb-3">
                              {service.subCategories && service.subCategories.slice(0, 3).map((subCat, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold border border-gray-300"
                                >
                                  {subCat}
                                </span>
                              ))}
                              {service.subCategories && service.subCategories.length > 3 && (
                                <span className="px-3 py-1 bg-white text-gray-700 rounded-full text-xs font-semibold border border-gray-300">
                                  +{service.subCategories.length - 3}
                                </span>
                              )}
                            </div>
                            {service.portfolioImages && service.portfolioImages.length > 0 && (
                              <div className="mt-3 flex gap-2">
                                {service.portfolioImages.slice(0, 4).map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img.url}
                                    alt={`Service ${idx + 1}`}
                                    className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                                  />
                                ))}
                                {service.portfolioImages.length > 4 && (
                                  <div className="w-16 h-16 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center text-xs text-gray-600 font-semibold">
                                    +{service.portfolioImages.length - 4}
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="mt-4 pt-3 border-t border-gray-300 flex items-center justify-between">
                              <div className="text-sm text-gray-500">
                                <span className="font-semibold text-black">{service.serviceOfferingCount || 0}</span> clicks
                              </div>
                              {service.experience && (
                                <div className="text-sm text-gray-500">
                                  <span className="font-semibold text-black">{service.experience}</span> years exp.
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No services added yet</p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-gray-300 rounded-2xl p-12 text-center shadow-md">
          <p className="text-gray-600 text-lg">No providers found</p>
        </div>
      )}

      {/* Service Edit Modal */}
      {selectedService && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={handleCloseServiceModal}
        >
          <motion.div 
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-300"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-300 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-black tracking-tight">Edit Service</h2>
              <button
                onClick={handleCloseServiceModal}
                className="text-gray-500 hover:text-black transition-colors p-2 rounded-xl hover:bg-gray-50"
              >
                <HiOutlineX size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Service Category */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Service Category
                </label>
                <select
                  value={serviceEditForm.serviceCategory}
                  onChange={(e) => setServiceEditForm({ ...serviceEditForm, serviceCategory: e.target.value, subCategories: [], keywords: [] })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-300 bg-white text-black"
                >
                  <option value="">Select Category</option>
                  {Object.keys(SERVICE_RULES).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Subcategories */}
              {serviceEditForm.serviceCategory && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Subcategories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {getCurrentRules().subCategories.map((subCat) => (
                      <button
                        key={subCat}
                        type="button"
                        onClick={() => handleSubCategoryToggle(subCat)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold transition-all duration-300 ${
                          serviceEditForm.subCategories.includes(subCat)
                            ? 'bg-black text-white border border-black'
                            : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {subCat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords */}
              {serviceEditForm.serviceCategory && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Keywords
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                    {getCurrentRules().keywords.map((keyword) => (
                      <button
                        key={keyword}
                        type="button"
                        onClick={() => handleKeywordToggle(keyword)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold transition-all duration-300 ${
                          serviceEditForm.keywords.includes(keyword)
                            ? 'bg-black text-white border border-black'
                            : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Description
                </label>
                <textarea
                  value={serviceEditForm.description}
                  onChange={(e) => setServiceEditForm({ ...serviceEditForm, description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-300 bg-white text-black"
                  placeholder="Service description..."
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  value={serviceEditForm.experience}
                  onChange={(e) => setServiceEditForm({ ...serviceEditForm, experience: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-300 bg-white text-black"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Price (₹)
                </label>
                <input
                  type="number"
                  value={serviceEditForm.price}
                  onChange={(e) => setServiceEditForm({ ...serviceEditForm, price: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-300 bg-white text-black"
                />
              </div>

              {/* Portfolio Images */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Portfolio Images
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {selectedService.portfolioImages && selectedService.portfolioImages.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={img.url}
                        alt={`Portfolio ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-xl border border-gray-300"
                      />
                      <button
                        onClick={() => handleDeleteServiceImage(img.public_id)}
                        className="absolute top-2 right-2 bg-white text-black border border-gray-300 p-1.5 rounded-full hover:bg-gray-50 transition-all duration-300 shadow-md"
                      >
                        <HiOutlineTrash size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleServiceImageChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-300 bg-white text-black"
                />
                <p className="text-xs text-gray-500 mt-1">Select new images to add</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-300 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={handleCloseServiceModal}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <HiOutlineX size={18} />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleServiceSave}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <HiOutlineCheck size={18} />
                <span>Save Changes</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default UpdateProviders;
