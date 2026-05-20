import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getAllProvidersAdmin, 
  updateProviderDetails, 
  updateProviderUserDetails,
  updateServiceDetails,
  deleteServiceImage,
  deleteServicePDF,
  getActiveCategories
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
  HiOutlineDocumentText,
  HiOutlineDocument,
  HiOutlineSearch
} from 'react-icons/hi';
import { motion } from 'framer-motion';
import { getFullName, getInitials } from '../../utils/userHelpers';

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 font-normal focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all';
const labelClass =
  'mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500';
const sectionTitleClass =
  'mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500';
const providerCardClass =
  'overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm';
const btnPrimary =
  'inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50';
const btnSecondary =
  'inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50';

// Categories/subcategories/keywords are DB-driven via `activeCategories`.

const UpdateProviders = () => {
  const dispatch = useDispatch();
  const { providers, pagination, isLoading, error, activeCategories } = useSelector((state) => state.admin);
  const [editingProvider, setEditingProvider] = useState(null);
  const [editForm, setEditForm] = useState({
    bio: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
  });
  const [selectedService, setSelectedService] = useState(null);
  const [serviceEditForm, setServiceEditForm] = useState({
    servicename: '',
    serviceCategory: '',
    subCategories: [],
    keywords: [],
    description: '',
    experience: 0,
    // price: 0,
    newImages: [],
    newPDFs: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [imageToDelete, setImageToDelete] = useState(null);
  const [pdfToDelete, setPdfToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!activeCategories || activeCategories.length === 0) {
      dispatch(getActiveCategories());
    }
  }, [dispatch, activeCategories?.length]);

  const RULES = useMemo(() => {
    const rules = {};
    (activeCategories || []).forEach((c) => {
      rules[c.name] = { subCategories: c.subCategories || [], keywords: c.keywords || [] };
    });
    return rules;
  }, [activeCategories]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset to page 1 if current page exceeds total pages (e.g., after search)
  useEffect(() => {
    if (pagination && pagination.totalPages > 0 && currentPage > pagination.totalPages) {
      setCurrentPage(1);
    }
  }, [pagination, currentPage]);

  // Fetch providers when page or search changes
  useEffect(() => {
    dispatch(getAllProvidersAdmin({ page: currentPage, limit: pageSize, search: searchTerm }));
  }, [dispatch, currentPage, pageSize, searchTerm]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedService || imageToDelete || pdfToDelete) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedService, imageToDelete, pdfToDelete]);

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setServiceEditForm({
      servicename: service.servicename || '',
      serviceCategory: service.serviceCategory || '',
      subCategories: Array.isArray(service.subCategories) ? service.subCategories : [],
      keywords: Array.isArray(service.keywords) ? service.keywords : [],
      description: service.description || '',
      experience: service.experience || 0,
      // price: service.price || 0,
      newImages: [],
      newPDFs: []
    });
  };

  const handleCloseServiceModal = () => {
    setSelectedService(null);
    setServiceEditForm({
      servicename: '',
      serviceCategory: '',
      subCategories: [],
      keywords: [],
      description: '',
      experience: 0,
      // price: 0,
      newImages: [],
      newPDFs: []
    });
  };

  const handleServiceSave = async () => {
    if (!selectedService || isSaving) return;
    
    try {
      setIsSaving(true);
      const formData = new FormData();
      
      // Always send servicename if it exists in the form (even if empty string)
      if (serviceEditForm.servicename !== undefined && serviceEditForm.servicename !== null) {
        formData.append('servicename', serviceEditForm.servicename);
      }
      if (serviceEditForm.serviceCategory) formData.append('serviceCategory', serviceEditForm.serviceCategory);
      if (serviceEditForm.subCategories.length > 0) {
        formData.append('subCategories', JSON.stringify(serviceEditForm.subCategories));
      }
      if (serviceEditForm.keywords.length > 0) {
        formData.append('keywords', JSON.stringify(serviceEditForm.keywords));
      }
      if (serviceEditForm.description !== undefined) formData.append('description', serviceEditForm.description);
      if (serviceEditForm.experience !== undefined) formData.append('experience', serviceEditForm.experience.toString());
      // if (serviceEditForm.price !== undefined) formData.append('price', serviceEditForm.price.toString());

      // Add new images
      serviceEditForm.newImages.forEach((file) => {
        formData.append('portfolioImages', file);
      });

      // Add new PDFs
      serviceEditForm.newPDFs.forEach((file) => {
        formData.append('portfolioPDFs', file);
      });

      await dispatch(updateServiceDetails({ serviceId: selectedService._id, formData }));
      handleCloseServiceModal();
      dispatch(getAllProvidersAdmin({ page: currentPage, limit: pageSize, search: searchTerm }));
    } catch (error) {
      console.error('Error saving service:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteServiceImage = (imagePublicId) => {
    setImageToDelete({ serviceId: selectedService._id, imagePublicId });
  };

  const confirmDeleteImage = async () => {
    if (!imageToDelete || isDeleting) return;
    
    try {
      setIsDeleting(true);
      const result = await dispatch(deleteServiceImage({ 
        serviceId: imageToDelete.serviceId, 
        imagePublicId: imageToDelete.imagePublicId 
      }));
      
      // Update selectedService with the updated service from API
      if (result.payload?.service) {
        setSelectedService(result.payload.service);
      }
      
      setImageToDelete(null);
      dispatch(getAllProvidersAdmin({ page: currentPage, limit: pageSize, search: searchTerm }));
    } catch (error) {
      console.error('Error deleting image:', error);
    } finally {
      setIsDeleting(false);
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

  const handlePDFChange = (e) => {
    const files = Array.from(e.target.files);
    setServiceEditForm({
      ...serviceEditForm,
      newPDFs: files
    });
  };

  const handleDeletePDF = (pdfPublicId) => {
    setPdfToDelete({ serviceId: selectedService._id, pdfPublicId });
  };

  const confirmDeletePDF = async () => {
    if (!pdfToDelete || isDeleting) return;
    
    try {
      setIsDeleting(true);
      const result = await dispatch(deleteServicePDF({ 
        serviceId: pdfToDelete.serviceId, 
        pdfPublicId: pdfToDelete.pdfPublicId 
      }));
      
      // Update selectedService with the updated service from API
      if (result.payload?.service) {
        setSelectedService(result.payload.service);
      }
      
      setPdfToDelete(null);
      dispatch(getAllProvidersAdmin({ page: currentPage, limit: pageSize, search: searchTerm }));
    } catch (error) {
      console.error('Error deleting PDF:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getCurrentRules = () => {
    return RULES[serviceEditForm.serviceCategory] || { subCategories: [], keywords: [] };
  };

  const handleEdit = (provider) => {
    setEditingProvider(provider._id);
    setEditForm({
      bio: provider.bio || '',
      firstName: provider.user?.firstName || provider.user?.name?.split(' ')[0] || '',
      lastName: provider.user?.lastName || provider.user?.name?.split(' ').slice(1).join(' ') || '',
      email: provider.user?.email || '',
      phoneNumber: provider.user?.phoneNumber || '',
      addressLine1: provider.user?.addressLine1 || '',
      addressLine2: provider.user?.addressLine2 || '',
      city: provider.user?.city || '',
      state: provider.user?.state || '',
      zip: provider.user?.zip || '',
    });
  };

  const handleCancel = () => {
    setEditingProvider(null);
    setEditForm({
      bio: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zip: '',
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
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phoneNumber: editForm.phoneNumber,
        addressLine1: editForm.addressLine1,
        addressLine2: editForm.addressLine2,
        city: editForm.city,
        state: editForm.state,
        zip: editForm.zip,
      })
    );

    setEditingProvider(null);
    setEditForm({
      bio: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zip: '',
    });

    // Refresh providers list
    dispatch(getAllProvidersAdmin({ page: currentPage, limit: pageSize, search: searchTerm }));
  };

  if (isLoading && (!providers || providers.length === 0)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
          <p className="text-sm font-medium text-gray-600">Loading providers...</p>
        </motion.div>
      </div>
    );
  }

  if (error && (!providers || providers.length === 0)) {
    return (
      <motion.div
        className="mx-auto max-w-6xl px-4 py-12 sm:px-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
          <p className="font-semibold text-red-700">Could not load providers</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-600">Admin</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">Manage Providers</h1>
            <p className="mt-1 text-sm text-gray-600 sm:text-base">View and edit provider profiles, contact details, and services.</p>
            {pagination?.totalProviders != null && (
              <p className="mt-2 text-xs font-medium text-gray-500">
                {pagination.totalProviders} provider{pagination.totalProviders !== 1 ? 's' : ''} total
              </p>
            )}
          </div>
          <div className="relative w-full lg:max-w-sm">
              <HiOutlineSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className={`${inputClass} pl-10 w-full`}
              />
          </div>
        </div>
      </motion.div>

      {providers && providers.length > 0 ? (
          <div className="space-y-6">
            {providers.map((provider) => {
            const isEditing = editingProvider === provider._id;

            return (
              <motion.div
                key={provider._id}
                className={`${providerCardClass} ${isEditing ? 'ring-2 ring-gray-900/15' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex flex-col gap-4 border-b border-gray-100 bg-gray-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                      {provider.user?.profileImage ? (
                        <img
                          src={provider.user.profileImage}
                          alt={getFullName(provider.user)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-semibold text-xl">
                          {getInitials(provider.user)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {getFullName(provider.user) || 'Unknown Provider'}
                      </h3>
                      <p className="text-sm text-gray-500">{provider.user?.email || ''}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                    {!isEditing ? (
                      <button
                        onClick={() => handleEdit(provider)}
                        className={btnPrimary}
                      >
                        <HiOutlinePencil size={18} />
                        <span>Edit</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSave(provider._id)}
                          className={btnPrimary}
                        >
                          <HiOutlineCheck size={18} />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={handleCancel}
                          className={btnSecondary}
                        >
                          <HiOutlineX size={18} />
                          <span>Cancel</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-6 p-5 sm:p-6">
                  <div>
                    <p className={sectionTitleClass}>Contact & address</p>
                  <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>
                        <HiOutlineUser className="text-gray-500" size={16} />
                        First Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.firstName}
                          onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                          className={inputClass}
                        />
                      ) : (
                        <p className="text-sm text-gray-900">{provider.user?.firstName || provider.user?.name?.split(' ')[0] || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>
                        <HiOutlineUser className="text-gray-500" size={16} />
                        Last Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.lastName}
                          onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                          className={inputClass}
                        />
                      ) : (
                        <p className="text-sm text-gray-900">{provider.user?.lastName || provider.user?.name?.split(' ').slice(1).join(' ') || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>
                        <HiOutlineMail className="text-gray-500" size={16} />
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className={inputClass}
                        />
                      ) : (
                        <p className="text-sm text-gray-900">{provider.user?.email || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>
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
                          className={inputClass}
                        />
                      ) : (
                        <p className="text-sm text-gray-900">{provider.user?.phoneNumber || 'N/A'}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>
                        <HiOutlineLocationMarker className="text-gray-500" size={16} />
                        Address Line 1
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.addressLine1}
                          onChange={(e) =>
                            setEditForm({ ...editForm, addressLine1: e.target.value })
                          }
                          className={inputClass}
                          placeholder="Address Line 1"
                        />
                      ) : (
                        <p className="text-sm text-gray-900">{provider.user?.addressLine1 || 'N/A'}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>
                        <HiOutlineLocationMarker className="text-gray-500" size={16} />
                        Address Line 2
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.addressLine2}
                          onChange={(e) =>
                            setEditForm({ ...editForm, addressLine2: e.target.value })
                          }
                          className={inputClass}
                          placeholder="Address Line 2 (optional)"
                        />
                      ) : (
                        <p className="text-sm text-gray-900">{provider.user?.addressLine2 || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>
                        <HiOutlineLocationMarker className="text-gray-500" size={16} />
                        City
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.city}
                          onChange={(e) =>
                            setEditForm({ ...editForm, city: e.target.value })
                          }
                          className={inputClass}
                          placeholder="City"
                        />
                      ) : (
                        <p className="text-sm text-gray-900">{provider.user?.city || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>
                        <HiOutlineLocationMarker className="text-gray-500" size={16} />
                        State
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.state}
                          onChange={(e) =>
                            setEditForm({ ...editForm, state: e.target.value })
                          }
                          className={inputClass}
                          placeholder="State"
                        />
                      ) : (
                        <p className="text-sm text-gray-900">{provider.user?.state || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>
                        <HiOutlineLocationMarker className="text-gray-500" size={16} />
                        ZIP Code
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.zip}
                          onChange={(e) =>
                            setEditForm({ ...editForm, zip: e.target.value })
                          }
                          className={inputClass}
                          placeholder="ZIP Code"
                        />
                      ) : (
                        <p className="text-sm text-gray-900">{provider.user?.zip || 'N/A'}</p>
                      )}
                    </div>
                  </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <p className={sectionTitleClass}>Provider bio</p>
                    <label className={`${labelClass} mt-3 normal-case tracking-normal`}>
                      <HiOutlineDocumentText className="text-gray-400" size={16} />
                      Bio
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        rows="4"
                        maxLength={500}
                        className={inputClass}
                        placeholder="Provider bio..."
                      />
                    ) : (
                      <p className="text-sm leading-relaxed text-gray-700">{provider.bio || 'No bio provided'}</p>
                    )}
                    {isEditing && (
                      <p className="text-xs text-gray-500 mt-1">
                        {editForm.bio.length}/500 characters
                      </p>
                    )}
                  </div>

                  {/* Service Offerings */}
                  <div>
                    <p className={sectionTitleClass}>Service offerings</p>
                    {provider.serviceOfferings && provider.serviceOfferings.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        {provider.serviceOfferings.map((service) => (
                          <div
                            key={service._id}
                            onClick={() => handleServiceClick(service)}
                            className="group cursor-pointer rounded-xl border border-gray-200 bg-gray-50 p-5 transition-colors hover:border-gray-300 hover:bg-white"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-white p-2 ring-1 ring-gray-200 group-hover:ring-gray-300">
                                  <HiOutlineBriefcase className="text-gray-700" size={20} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-base font-semibold text-gray-900">
                                    {service.servicename || service.serviceCategory || 'Service'}
                                  </h4>
                                  {service.servicename && service.serviceCategory && (
                                    <p className="text-sm text-gray-600 mt-0.5">
                                      {service.serviceCategory}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <HiOutlinePencil className="text-gray-400 group-hover:text-gray-700" size={18} />
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
                                  className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-600"
                                >
                                  {subCat}
                                </span>
                              ))}
                              {service.subCategories && service.subCategories.length > 3 && (
                                <span className="rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
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
                            <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3">
                              <div className="text-xs text-gray-500">
                                <span className="font-semibold text-gray-900">{service.serviceOfferingCount || 0}</span> clicks
                              </div>
                              {service.experience && (
                                <div className="text-xs text-gray-500">
                                  <span className="font-semibold text-gray-900">{service.experience}</span> years exp.
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
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <p className="text-gray-600">No providers found{searchTerm ? ' matching your search' : ''}</p>
          </div>
        )}

      {/* Pagination Controls */}
      {providers && providers.length > 0 && pagination && pagination.totalPages > 1 && (
        <motion.div 
          className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-sm text-gray-600">
            Showing {(pagination.currentPage - 1) * pagination.limit + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalProviders)} of {pagination.totalProviders} providers
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrevPage || isLoading}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                !pagination.hasPrevPage || isLoading
                  ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400'
                  : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={isLoading}
                    className={`min-w-[2.25rem] rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      pagination.currentPage === pageNum
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
                    } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
              disabled={!pagination.hasNextPage || isLoading}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                !pagination.hasNextPage || isLoading
                  ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400'
                  : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
        </motion.div>
      )}

      {/* Service Edit Modal */}
      {selectedService && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={handleCloseServiceModal}
        >
          <motion.div 
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Service</h2>
              <button
                onClick={handleCloseServiceModal}
                className="text-gray-500 hover:text-black transition-colors p-2 rounded-xl hover:bg-gray-50"
              >
                <HiOutlineX size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Service Name */}
              <div>
                <label className={labelClass}>
                  Service Name
                </label>
                <input
                  type="text"
                  value={serviceEditForm.servicename}
                  onChange={(e) => setServiceEditForm({ ...serviceEditForm, servicename: e.target.value })}
                  className={inputClass}
                  placeholder="Enter service name"
                />
              </div>

              {/* Service Category */}
              <div>
                <label className={labelClass}>
                  Service Category
                </label>
                <select
                  value={serviceEditForm.serviceCategory}
                  onChange={(e) => setServiceEditForm({ ...serviceEditForm, serviceCategory: e.target.value, subCategories: [], keywords: [] })}
                  className={inputClass}
                >
                  <option value="">Select Category</option>
                  {(activeCategories || []).map((c) => c.name).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Subcategories */}
              {serviceEditForm.serviceCategory && (
                <div>
                  <label className={labelClass}>
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
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                  <label className={labelClass}>
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
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                <label className={labelClass}>
                  Description
                </label>
                <textarea
                  value={serviceEditForm.description}
                  onChange={(e) => setServiceEditForm({ ...serviceEditForm, description: e.target.value })}
                  rows="4"
                  className={inputClass}
                  placeholder="Service description..."
                />
              </div>

              {/* Experience */}
              <div>
                <label className={labelClass}>
                  Experience (Years)
                </label>
                <input
                  type="number"
                  value={serviceEditForm.experience}
                  onChange={(e) => setServiceEditForm({ ...serviceEditForm, experience: parseInt(e.target.value) || 0 })}
                  min="0"
                  className={inputClass}
                />
              </div>

              {/* Price */}
              {/* <div>
                <label className={labelClass}>
                  Price (₹)
                </label>
                <input
                  type="number"
                  value={serviceEditForm.price}
                  onChange={(e) => setServiceEditForm({ ...serviceEditForm, price: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  className={inputClass}
                />
              </div> */}

              {/* Portfolio Images */}
              <div>
                <label className={labelClass}>
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
                  className={inputClass}
                />
                <p className="text-xs text-gray-500 mt-1">Select new images to add</p>
              </div>

              {/* Portfolio PDFs */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                  <HiOutlineDocument className="text-gray-500" size={16} />
                  Service Related Documents
                </label>
                <div>
                  {selectedService.portfolioPDFs && selectedService.portfolioPDFs.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {selectedService.portfolioPDFs.map((pdf, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-300">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <HiOutlineDocument size={20} className="text-red-600 flex-shrink-0" />
                            <a
                              href={pdf.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 truncate flex-1"
                            >
                              PDF {idx + 1}
                            </a>
                          </div>
                          <button
                            onClick={() => handleDeletePDF(pdf.public_id)}
                            className="ml-3 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 flex-shrink-0 transition-all duration-300 shadow-md"
                            title="Delete PDF"
                          >
                            <HiOutlineTrash size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <input
                    type="file"
                    multiple
                    accept="application/pdf"
                    onChange={handlePDFChange}
                    className={inputClass}
                  />
                  <p className="text-xs text-gray-500 mt-1">Select new PDFs to add</p>
                  {serviceEditForm.newPDFs.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {serviceEditForm.newPDFs.map((file, idx) => (
                        <p key={idx} className="text-xs text-gray-600">• {file.name}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
              <button
                onClick={handleCloseServiceModal}
                disabled={isSaving}
                className={`${btnSecondary} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <HiOutlineX size={18} />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleServiceSave}
                disabled={isSaving}
                className={`${btnPrimary} ${isSaving ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' : ''}`}
              >
                <HiOutlineCheck size={18} />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Image Deletion Confirmation Modal */}
      {imageToDelete && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => !isDeleting && setImageToDelete(null)}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-black mb-3">Delete Image?</h2>
            <p className="text-gray-600 mb-6">
              This action will permanently delete this image. You won't be able to recover it later.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                onClick={() => setImageToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`w-full sm:w-auto px-5 py-3 rounded-xl font-semibold text-white transition ${
                  isDeleting
                    ? 'bg-red-300 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-500'
                }`}
                onClick={confirmDeleteImage}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* PDF Deletion Confirmation Modal */}
      {pdfToDelete && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => !isDeleting && setPdfToDelete(null)}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-black mb-3">Delete PDF?</h2>
            <p className="text-gray-600 mb-6">
              This action will permanently delete this PDF. You won't be able to recover it later.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                onClick={() => setPdfToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`w-full sm:w-auto px-5 py-3 rounded-xl font-semibold text-white transition ${
                  isDeleting
                    ? 'bg-red-300 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-500'
                }`}
                onClick={confirmDeletePDF}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default UpdateProviders;
