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
  Briefcase,
  Check,
  ChevronDown,
  File,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Search,
  Trash2,
  User,
  UserCog,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullName } from '../../utils/userHelpers';
import ProfileAvatar from '../../components/ProfileAvatar';

const inputClass =
  'w-full px-3.5 py-2.5 text-sm border border-purple-100 rounded-xl bg-white text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/70 focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/25 focus:border-[var(--purple-primary)] transition-all';
const labelClass =
  'mb-1.5 flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]';
const sectionTitleClass =
  'mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--purple-primary)]';
const providerCardClass =
  'overflow-hidden rounded-2xl border border-purple-100/50 bg-white/80 shadow-sm shadow-purple-500/5 backdrop-blur-sm';
const btnPrimary =
  'inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
const btnSecondary =
  'inline-flex items-center gap-2 rounded-xl border border-purple-100 bg-white px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50';
const chipSelected =
  'border-[var(--purple-primary)] bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white';
const chipUnselected =
  'border-purple-100 bg-purple-50/50 text-[var(--text-primary)] hover:bg-purple-50';
 
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
  const [expandedProviders, setExpandedProviders] = useState(new Set());

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

  useEffect(() => {
    setExpandedProviders(new Set());
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
  }, [currentPage, searchTerm]);

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

  const toggleProvider = (providerId) => {
    const isOpen = expandedProviders.has(providerId);
    if (isOpen && editingProvider === providerId) {
      handleCancel();
    }
    setExpandedProviders((prev) => {
      const next = new Set(prev);
      if (isOpen) {
        next.delete(providerId);
      } else {
        next.add(providerId);
      }
      return next;
    });
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

  const reload = () => {
    dispatch(getAllProvidersAdmin({ page: currentPage, limit: pageSize, search: searchTerm }));
  };

  if (isLoading && (!providers || providers.length === 0)) {
    return (
      <motion.div
        className="flex min-h-screen items-center justify-center bg-[var(--background-subtle)] px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-full max-w-sm rounded-2xl border border-purple-100/50 bg-white/80 p-8 text-center shadow-sm shadow-purple-500/5">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-purple-100 border-t-[var(--purple-primary)]" />
          <p className="text-sm font-medium text-[var(--text-primary)]">Loading providers…</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">Fetching provider records.</p>
        </div>
      </motion.div>
    );
  }

  if (error && (!providers || providers.length === 0)) {
    return (
      <motion.div
        className="flex min-h-screen items-center justify-center bg-[var(--background-subtle)] px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-full max-w-sm rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-sm font-semibold text-red-600">Could not load providers</p>
          <p className="mt-1 text-sm text-red-500">{error}</p>
          <button
            type="button"
            onClick={reload}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all"
          >
            Try again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-[var(--background-subtle)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <section className="border-b border-purple-100/60 bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20 py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--purple-primary)]">
            Admin
          </p>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
            Manage Providers
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            View and edit provider profiles, contact details, and services.
            {pagination?.totalProviders != null && (
              <span className="text-[var(--text-secondary)]/80">
                {' '}
                · {pagination.totalProviders} provider{pagination.totalProviders !== 1 ? 's' : ''} total
              </span>
            )}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-5 px-4 py-8 sm:px-6 sm:py-10">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]/60" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={`${inputClass} w-full pl-9`}
          />
        </div>

      {providers && providers.length > 0 ? (
        <div className={`${providerCardClass} overflow-hidden`}>
          <div className="divide-y divide-purple-50">
            {providers.map((provider, index) => {
            const isExpanded = expandedProviders.has(provider._id);
            const isEditing = editingProvider === provider._id;
            const serviceCount = provider.serviceOfferings?.length || 0;
            const providerName = getFullName(provider.user) || 'Unknown Provider';

            return (
              <div key={provider._id}>
                <motion.button
                  type="button"
                  className="w-full px-4 py-3.5 text-left transition-colors hover:bg-purple-50/40 sm:px-5"
                  onClick={() => toggleProvider(provider._id)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <div className="flex items-center gap-3">
                    <ProfileAvatar user={provider.user} size="lg" className="shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--text-primary)] sm:text-base">
                        {providerName}
                      </p>
                      <p className="truncate text-xs text-[var(--text-secondary)] sm:text-sm">
                        {provider.user?.email || ''}
                      </p>
                    </div>
                    <div className="hidden shrink-0 text-right sm:block">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                        Services
                      </p>
                      <p className="text-sm font-semibold text-[var(--purple-primary)]">{serviceCount}</p>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-[var(--text-secondary)] transition-transform ${
                        isExpanded ? 'rotate-180' : '-rotate-90'
                      }`}
                    />
                  </div>
                </motion.button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden bg-purple-50/20"
                    >
                <div
                  className={`space-y-6 border-t border-purple-100/60 p-5 sm:p-6 ${
                    isEditing ? 'ring-2 ring-inset ring-[var(--purple-primary)]/25' : ''
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 sm:hidden">
                      <span className="text-xs text-[var(--text-secondary)]">
                        <span className="font-semibold text-[var(--purple-primary)]">{serviceCount}</span> service
                        {serviceCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                      {!isEditing ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(provider);
                          }}
                          className={btnPrimary}
                        >
                          <Pencil className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSave(provider._id);
                            }}
                            className={btnPrimary}
                          >
                            <Check className="h-4 w-4" />
                            <span>Save</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancel();
                            }}
                            className={btnSecondary}
                          >
                            <X className="h-4 w-4" />
                            <span>Cancel</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className={sectionTitleClass}>Contact & address</p>
                  <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>
                        <User className="h-4 w-4 text-[var(--text-secondary)]/70" />
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
                        <p className="text-sm text-[var(--text-primary)]">{provider.user?.firstName || provider.user?.name?.split(' ')[0] || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>
                        <User className="h-4 w-4 text-[var(--text-secondary)]/70" />
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
                        <p className="text-sm text-[var(--text-primary)]">{provider.user?.lastName || provider.user?.name?.split(' ').slice(1).join(' ') || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>
                        <Mail className="h-4 w-4 text-[var(--text-secondary)]/70" />
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
                        <p className="text-sm text-[var(--text-primary)]">{provider.user?.email || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>
                        <Phone className="h-4 w-4 text-[var(--text-secondary)]/70" />
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
                        <p className="text-sm text-[var(--text-primary)]">{provider.user?.phoneNumber || 'N/A'}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>
                        <MapPin className="h-4 w-4 text-[var(--text-secondary)]/70" />
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
                        <p className="text-sm text-[var(--text-primary)]">{provider.user?.addressLine1 || 'N/A'}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>
                        <MapPin className="h-4 w-4 text-[var(--text-secondary)]/70" />
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
                        <p className="text-sm text-[var(--text-primary)]">{provider.user?.addressLine2 || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>
                        <MapPin className="h-4 w-4 text-[var(--text-secondary)]/70" />
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
                        <p className="text-sm text-[var(--text-primary)]">{provider.user?.city || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>
                        <MapPin className="h-4 w-4 text-[var(--text-secondary)]/70" />
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
                        <p className="text-sm text-[var(--text-primary)]">{provider.user?.state || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>
                        <MapPin className="h-4 w-4 text-[var(--text-secondary)]/70" />
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
                        <p className="text-sm text-[var(--text-primary)]">{provider.user?.zip || 'N/A'}</p>
                      )}
                    </div>
                  </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <p className={sectionTitleClass}>Provider bio</p>
                    <label className={`${labelClass} mt-3 normal-case tracking-normal`}>
                      <FileText className="h-4 w-4 text-[var(--text-secondary)]/70" />
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
                      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{provider.bio || 'No bio provided'}</p>
                    )}
                    {isEditing && (
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
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
                            className="group cursor-pointer rounded-xl border border-purple-100/50 bg-purple-50/20 p-5 transition-colors hover:border-purple-200 hover:bg-white"
                          >
                            <div className="mb-3 flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-white p-2 ring-1 ring-purple-100 group-hover:ring-purple-200">
                                  <Briefcase className="h-5 w-5 text-[var(--purple-primary)]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-base font-semibold text-[var(--text-primary)]">
                                    {service.servicename || service.serviceCategory || 'Service'}
                                  </h4>
                                  {service.servicename && service.serviceCategory && (
                                    <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                                      {service.serviceCategory}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Pencil className="h-4 w-4 text-[var(--text-secondary)]/50 group-hover:text-[var(--purple-primary)]" />
                            </div>
                            {service.description && (
                              <p className="mb-3 line-clamp-3 min-h-[3.75rem] text-sm text-[var(--text-secondary)]">
                                {service.description}
                              </p>
                            )}
                            <div className="mb-3 mt-3 flex flex-wrap gap-2">
                              {service.subCategories && service.subCategories.slice(0, 3).map((subCat, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-full border border-purple-100 bg-white px-2.5 py-0.5 text-xs font-medium text-[var(--text-secondary)]"
                                >
                                  {subCat}
                                </span>
                              ))}
                              {service.subCategories && service.subCategories.length > 3 && (
                                <span className="rounded-full border border-purple-100 bg-purple-50/50 px-2.5 py-0.5 text-xs font-medium text-[var(--text-secondary)]">
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
                                    className="h-16 w-16 rounded-lg border border-purple-100 object-cover"
                                  />
                                ))}
                                {service.portfolioImages.length > 4 && (
                                  <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-purple-100 bg-purple-50 text-xs font-semibold text-[var(--text-secondary)]">
                                    +{service.portfolioImages.length - 4}
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="mt-4 flex items-center justify-between border-t border-purple-100 pt-3">
                              <div className="text-xs text-[var(--text-secondary)]">
                                <span className="font-semibold text-[var(--purple-primary)]">{service.serviceOfferingCount || 0}</span> clicks
                              </div>
                              {service.experience && (
                                <div className="text-xs text-[var(--text-secondary)]">
                                  <span className="font-semibold text-[var(--text-primary)]">{service.experience}</span> years exp.
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--text-secondary)]">No services added yet</p>
                    )}
                  </div>
                </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
            })}
          </div>
        </div>
        ) : (
          <div className="rounded-2xl border border-purple-100/50 bg-white/80 p-12 text-center shadow-sm shadow-purple-500/5">
            <UserCog className="mx-auto mb-3 h-10 w-10 text-purple-200" />
            <p className="text-sm text-[var(--text-secondary)]">
              No providers found{searchTerm ? ' matching your search' : ''}
            </p>
          </div>
        )}

      {providers && providers.length > 0 && pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--text-secondary)]">
            Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.limit, pagination.totalProviders)} of{' '}
            {pagination.totalProviders} providers
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrevPage || isLoading}
              className="rounded-xl border border-purple-100 px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={isLoading}
                    className={`min-w-[2.25rem] rounded-xl border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      pagination.currentPage === pageNum
                        ? 'border-[var(--purple-primary)] bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white'
                        : 'border-purple-100 bg-white text-[var(--text-primary)] hover:bg-purple-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
              disabled={!pagination.hasNextPage || isLoading}
              className="rounded-xl border border-purple-100 px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          onClick={handleCloseServiceModal}
        >
          <motion.div
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-purple-100/50 bg-white/95 shadow-xl shadow-purple-500/10 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-purple-100 bg-white/95 px-6 py-4 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Edit Service</h2>
              <button
                type="button"
                onClick={handleCloseServiceModal}
                className="rounded-xl p-2 text-[var(--text-secondary)] transition-colors hover:bg-purple-50 hover:text-[var(--purple-primary)]"
              >
                <X className="h-5 w-5" />
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
                        className={`rounded-full px-3 py-1 text-sm font-medium transition-all ${
                          serviceEditForm.subCategories.includes(subCat) ? chipSelected : chipUnselected
                        } border`}
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
                        className={`rounded-full px-3 py-1 text-sm font-medium transition-all ${
                          serviceEditForm.keywords.includes(keyword) ? chipSelected : chipUnselected
                        } border`}
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
                        className="h-32 w-full rounded-xl border border-purple-100 object-cover"
                      />
                      <button
                        onClick={() => handleDeleteServiceImage(img.public_id)}
                        className="absolute right-2 top-2 rounded-full border border-purple-100 bg-white p-1.5 text-red-500 shadow-md transition-colors hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
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
                <p className="mt-1 text-xs text-[var(--text-secondary)]">Select new images to add</p>
              </div>

              {/* Portfolio PDFs */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
                  <File className="h-4 w-4 text-[var(--text-secondary)]/70" />
                  Service Related Documents
                </label>
                <div>
                  {selectedService.portfolioPDFs && selectedService.portfolioPDFs.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {selectedService.portfolioPDFs.map((pdf, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-xl border border-purple-100 bg-purple-50/30 p-3">
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <File className="h-5 w-5 shrink-0 text-red-500" />
                            <a
                              href={pdf.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 truncate text-[var(--purple-primary)] hover:text-[var(--magenta)]"
                            >
                              PDF {idx + 1}
                            </a>
                          </div>
                          <button
                            onClick={() => handleDeletePDF(pdf.public_id)}
                            className="ml-3 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 flex-shrink-0 transition-all duration-300 shadow-md"
                            title="Delete PDF"
                          >
                            <Trash2 className="h-4 w-4" />
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
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">Select new PDFs to add</p>
                  {serviceEditForm.newPDFs.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {serviceEditForm.newPDFs.map((file, idx) => (
                        <p key={idx} className="text-xs text-[var(--text-secondary)]">• {file.name}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-purple-100 bg-purple-50/30 px-6 py-4">
              <button
                type="button"
                onClick={handleCloseServiceModal}
                disabled={isSaving}
                className={btnSecondary}
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleServiceSave}
                disabled={isSaving}
                className={btnPrimary}
              >
                <Check className="h-4 w-4" />
                <span>{isSaving ? 'Saving…' : 'Save changes'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {imageToDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => !isDeleting && setImageToDelete(null)}
        >
          <motion.div
            className="w-full max-w-md rounded-2xl border border-purple-100/50 bg-white p-8 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">Delete image?</h2>
            <p className="mb-6 text-sm text-[var(--text-secondary)]">
              This action will permanently delete this image. You won&apos;t be able to recover it later.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className={btnSecondary}
                onClick={() => setImageToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition ${
                  isDeleting ? 'cursor-not-allowed bg-red-300' : 'bg-red-600 hover:bg-red-500'
                }`}
                onClick={confirmDeleteImage}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {pdfToDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => !isDeleting && setPdfToDelete(null)}
        >
          <motion.div
            className="w-full max-w-md rounded-2xl border border-purple-100/50 bg-white p-8 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">Delete PDF?</h2>
            <p className="mb-6 text-sm text-[var(--text-secondary)]">
              This action will permanently delete this PDF. You won&apos;t be able to recover it later.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className={btnSecondary}
                onClick={() => setPdfToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition ${
                  isDeleting ? 'cursor-not-allowed bg-red-300' : 'bg-red-600 hover:bg-red-500'
                }`}
                onClick={confirmDeletePDF}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </div>
    </motion.div>
  );
};

export default UpdateProviders;
