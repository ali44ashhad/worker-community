import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { 
  getAllServicesAdmin, 
  updateServiceDetails,
  deleteServiceImage 
} from '../../features/adminSlice';
import { 
  HiOutlinePencil, 
  HiOutlineCheck, 
  HiOutlineX, 
  HiOutlineTrash,
  HiOutlineTag,
  HiOutlineCollection,
  HiOutlineKey,
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlinePhotograph,
  HiOutlineCube,
  HiOutlineSearch
} from 'react-icons/hi';
import { getFullName } from '../../utils/userHelpers';

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

const AdminServices = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { services, isLoading, error } = useSelector((state) => state.admin);
  const [editingService, setEditingService] = useState(null);
  const [editForm, setEditForm] = useState({
    servicename: '',
    serviceCategory: '',
    subCategories: [],
    keywords: [],
    description: '',
    experience: 0,
    newImages: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const serviceRefs = useRef({});

  useEffect(() => {
    dispatch(getAllServicesAdmin());
  }, [dispatch]);

  const handleEdit = (service) => {
    setEditingService(service._id);
    setEditForm({
      servicename: service.servicename || '',
      serviceCategory: service.serviceCategory || '',
      subCategories: Array.isArray(service.subCategories) ? service.subCategories : [],
      keywords: Array.isArray(service.keywords) ? service.keywords : [],
      description: service.description || '',
      experience: service.experience || 0,
      newImages: []
    });
  };

  const handleCancel = () => {
    setEditingService(null);
    setEditForm({
      servicename: '',
      serviceCategory: '',
      subCategories: [],
      keywords: [],
      description: '',
      experience: 0,
      newImages: []
    });
  };

  const handleSave = async (serviceId) => {
    const formData = new FormData();
    
    // Always send servicename if it exists in the form (even if empty string)
    if (editForm.servicename !== undefined && editForm.servicename !== null) {
      formData.append('servicename', editForm.servicename);
    }
    if (editForm.serviceCategory) formData.append('serviceCategory', editForm.serviceCategory);
    if (editForm.subCategories.length > 0) {
      formData.append('subCategories', JSON.stringify(editForm.subCategories));
    }
    if (editForm.keywords.length > 0) {
      formData.append('keywords', JSON.stringify(editForm.keywords));
    }
    if (editForm.description !== undefined) formData.append('description', editForm.description);
    if (editForm.experience !== undefined) formData.append('experience', editForm.experience.toString());

    // Add new images
    editForm.newImages.forEach((file) => {
      formData.append('portfolioImages', file);
    });

    await dispatch(updateServiceDetails({ serviceId, formData }));
    handleCancel();
    dispatch(getAllServicesAdmin());
  };

  const handleDeleteImage = async (serviceId, imagePublicId) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      await dispatch(deleteServiceImage({ serviceId, imagePublicId }));
      dispatch(getAllServicesAdmin());
    }
  };

  const handleSubCategoryToggle = (subCategory) => {
    const current = editForm.subCategories || [];
    if (current.includes(subCategory)) {
      setEditForm({
        ...editForm,
        subCategories: current.filter(s => s !== subCategory)
      });
    } else {
      setEditForm({
        ...editForm,
        subCategories: [...current, subCategory]
      });
    }
  };

  const handleKeywordToggle = (keyword) => {
    const current = editForm.keywords || [];
    if (current.includes(keyword)) {
      setEditForm({
        ...editForm,
        keywords: current.filter(k => k !== keyword)
      });
    } else {
      setEditForm({
        ...editForm,
        keywords: [...current, keyword]
      });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setEditForm({
      ...editForm,
      newImages: files
    });
  };

  // Auto-open service if navigated from provider page
  useEffect(() => {
    if (location.state?.serviceId && services && services.length > 0) {
      const serviceId = location.state.serviceId;
      const service = services.find(s => s._id === serviceId);
      
      if (service) {
        // Set editing state
        handleEdit(service);
        
        // Scroll to the service after a short delay
        setTimeout(() => {
          const element = serviceRefs.current[serviceId];
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
        
        // Clear the location state
        window.history.replaceState({}, document.title);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, services]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading services...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-xl">Error: {error}</div>
      </div>
    );
  }

  const getCurrentRules = () => {
    return SERVICE_RULES[editForm.serviceCategory] || { subCategories: [], keywords: [] };
  };

  return (
    <div className="max-w-7xl p-6 py-8 mx-auto">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Services</h1>
            <p className="text-gray-600 mt-2">View and update service offerings</p>
          </div>
          <div className="flex-shrink-0">
            <div className="relative">
              <HiOutlineSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by service name, provider name, category, or keywords..."
                title="Search by service name, provider name, category, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-80 pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-300 bg-white text-black placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      {services && services.length > 0 ? (() => {
        // Filter services based on search term
        const filteredServices = services.filter((service) => {
          if (!searchTerm.trim()) return true;
          const searchLower = searchTerm.toLowerCase();
          const serviceName = service.servicename?.toLowerCase() || '';
          const providerName = getFullName(service.provider?.user)?.toLowerCase() || '';
          const category = service.serviceCategory?.toLowerCase() || '';
          const keywords = Array.isArray(service.keywords) 
            ? service.keywords.map(k => k?.toLowerCase() || '').join(' ')
            : '';
          return serviceName.includes(searchLower) || 
                 providerName.includes(searchLower) || 
                 category.includes(searchLower) ||
                 keywords.includes(searchLower);
        });

        return filteredServices.length > 0 ? (
          <div className="space-y-6">
            {filteredServices.map((service) => {
            const isEditing = editingService === service._id;
            
            const providerName = getFullName(service.provider?.user) || 'Unknown Provider';

            return (
              <div
                key={service._id}
                ref={(el) => (serviceRefs.current[service._id] = el)}
                className="bg-white border border-gray-300 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{service.servicename || 'N/A'}</h3>
                    {/* <p className="text-sm text-gray-600">{service.serviceCategory || 'N/A'}</p> */}
                    <p className="text-sm text-gray-600">Provider: {providerName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isEditing ? (
                      <button
                        onClick={() => handleEdit(service)}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <HiOutlinePencil size={18} />
                        <span>Edit</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSave(service._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <HiOutlineCheck size={18} />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <HiOutlineX size={18} />
                          <span>Cancel</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Service Name */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <HiOutlineCube size={18} />
                      Service Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.servicename}
                        onChange={(e) => setEditForm({ ...editForm, servicename: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                        placeholder="Enter service name"
                      />
                    ) : (
                      <p className="text-gray-900">{service.servicename || 'N/A'}</p>
                    )}
                  </div>

                  {/* Service Category */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <HiOutlineTag size={18} />
                      Service Category
                    </label>
                    {isEditing ? (
                      <select
                        value={editForm.serviceCategory}
                        onChange={(e) => setEditForm({ ...editForm, serviceCategory: e.target.value, subCategories: [], keywords: [] })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                      >
                        <option value="">Select Category</option>
                        {Object.keys(SERVICE_RULES).map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900">{service.serviceCategory || 'N/A'}</p>
                    )}
                  </div>

                  {/* Subcategories */}
                  {isEditing && editForm.serviceCategory && (
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <HiOutlineCollection size={18} />
                        Subcategories
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {getCurrentRules().subCategories.map((subCat) => (
                          <button
                            key={subCat}
                            type="button"
                            onClick={() => handleSubCategoryToggle(subCat)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              editForm.subCategories.includes(subCat)
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {subCat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isEditing && (
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <HiOutlineCollection size={18} />
                        Subcategories
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {service.subCategories && service.subCategories.length > 0 ? (
                          service.subCategories.map((subCat, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium"
                            >
                              {subCat}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500">No subcategories</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Keywords */}
                  {isEditing && editForm.serviceCategory && (
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <HiOutlineKey size={18} />
                        Keywords
                      </label>
                      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                        {getCurrentRules().keywords.map((keyword) => (
                          <button
                            key={keyword}
                            type="button"
                            onClick={() => handleKeywordToggle(keyword)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              editForm.keywords.includes(keyword)
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {keyword}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isEditing && (
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <HiOutlineKey size={18} />
                        Keywords
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {service.keywords && service.keywords.length > 0 ? (
                          service.keywords.map((keyword, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium"
                            >
                              {keyword}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500">No keywords</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <HiOutlineDocumentText size={18} />
                      Description
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                        placeholder="Service description..."
                      />
                    ) : (
                      <p className="text-gray-900">{service.description || 'No description provided'}</p>
                    )}
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <HiOutlineClock size={18} />
                      Experience (Years)
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.experience}
                        onChange={(e) => setEditForm({ ...editForm, experience: parseInt(e.target.value) || 0 })}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                      />
                    ) : (
                      <p className="text-gray-900">{service.experience || 0} years</p>
                    )}
                  </div>

                  {/* Portfolio Images */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <HiOutlinePhotograph size={18} />
                      Portfolio Images
                    </label>
                    {isEditing ? (
                      <div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {service.portfolioImages && service.portfolioImages.map((img, idx) => (
                            <div key={idx} className="relative">
                              <img
                                src={img.url}
                                alt={`Portfolio ${idx + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-300"
                              />
                              <button
                                onClick={() => handleDeleteImage(service._id, img.public_id)}
                                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
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
                          onChange={handleImageChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                        />
                        <p className="text-xs text-gray-500 mt-1">Select new images to add</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {service.portfolioImages && service.portfolioImages.length > 0 ? (
                          service.portfolioImages.map((img, idx) => (
                            <img
                              key={idx}
                              src={img.url}
                              alt={`Portfolio ${idx + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-300"
                            />
                          ))
                        ) : (
                          <p className="text-gray-500">No images</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        ) : (
          <div className="bg-white border border-gray-300 rounded-xl p-12 text-center">
            <p className="text-gray-600 text-lg">No services found matching your search</p>
          </div>
        );
      })() : (
        <div className="bg-white border border-gray-300 rounded-xl p-12 text-center">
          <p className="text-gray-600 text-lg">No services found</p>
        </div>
      )}
    </div>
  );
};

export default AdminServices;

