import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAllServicesAdmin,
  updateServiceDetails,
  deleteServiceImage,
  setServiceCoverImage,
  deleteServicePDF,
  getActiveCategories,
} from '../../features/adminSlice';
import {
  Briefcase,
  Check,
  ChevronDown,
  Clock,
  File,
  FileText,
  ImageIcon,
  Key,
  Layers,
  Package,
  Pencil,
  Search,
  Star,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { getFullName } from '../../utils/userHelpers';

const inputClass =
  'w-full px-3.5 py-2.5 text-sm border border-purple-100 rounded-xl bg-white text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/70 focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/25 focus:border-[var(--purple-primary)] transition-all';
const labelClass =
  'mb-1.5 flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]';
const serviceCardClass =
  'overflow-hidden rounded-2xl border border-purple-100/50 bg-white/80 shadow-sm shadow-purple-500/5 backdrop-blur-sm';
const btnPrimary =
  'inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
const btnSecondary =
  'inline-flex items-center gap-2 rounded-xl border border-purple-100 bg-white px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50';
const chipSelected =
  'border-[var(--purple-primary)] bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white';
const chipUnselected =
  'border-purple-100 bg-purple-50/50 text-[var(--text-primary)] hover:bg-purple-50';

const emptyEditForm = {
  servicename: '',
  serviceCategory: '',
  subCategories: [],
  keywords: [],
  description: '',
  experience: 0,
  newImages: [],
  newPDFs: [],
};

// Categories/subcategories/keywords are DB-driven via `activeCategories`.

const AdminServices = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { services, servicesPagination, isLoading, error, activeCategories } = useSelector((state) => state.admin);
  const [editingService, setEditingService] = useState(null);
  const [editForm, setEditForm] = useState({
    servicename: '',
    serviceCategory: '',
    subCategories: [],
    keywords: [],
    description: '',
    experience: 0,
    newImages: [],
    newPDFs: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const serviceRefs = useRef({});
  const [pdfToDelete, setPdfToDelete] = useState(null);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [savingServiceId, setSavingServiceId] = useState(null);
  const [coverSettingId, setCoverSettingId] = useState(null);
  const [expandedServices, setExpandedServices] = useState(new Set());

  useEffect(() => {
    if (!activeCategories || activeCategories.length === 0) {
      dispatch(getActiveCategories());
    }
  }, [dispatch, activeCategories]);

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
    if (servicesPagination && servicesPagination.totalPages > 0 && currentPage > servicesPagination.totalPages) {
      setCurrentPage(1);
    }
  }, [servicesPagination, currentPage]);

  // Fetch services when page or search changes
  useEffect(() => {
    dispatch(getAllServicesAdmin({ page: currentPage, limit: pageSize, search: searchTerm }));
  }, [dispatch, currentPage, pageSize, searchTerm]);

  useEffect(() => {
    setExpandedServices(new Set());
    setEditingService(null);
    setEditForm(emptyEditForm);
  }, [currentPage, searchTerm]);

  const toggleService = (serviceId) => {
    const isOpen = expandedServices.has(serviceId);
    if (isOpen && editingService === serviceId) {
      handleCancel();
    }
    setExpandedServices((prev) => {
      const next = new Set(prev);
      if (isOpen) {
        next.delete(serviceId);
      } else {
        next.add(serviceId);
      }
      return next;
    });
  };

  const handleEdit = (service) => {
    setEditingService(service._id);
    setEditForm({
      servicename: service.servicename || '',
      serviceCategory: service.serviceCategory || '',
      subCategories: Array.isArray(service.subCategories) ? service.subCategories : [],
      keywords: Array.isArray(service.keywords) ? service.keywords : [],
      description: service.description || '',
      experience: service.experience || 0,
      newImages: [],
      newPDFs: []
    });
  };

  const handleCancel = () => {
    setEditingService(null);
    setEditForm(emptyEditForm);
  };

  const handleSave = async (serviceId) => {
    if (savingServiceId) return; // Prevent multiple simultaneous saves
    
    try {
      setSavingServiceId(serviceId);
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

      // Add new PDFs
      editForm.newPDFs.forEach((file) => {
        formData.append('portfolioPDFs', file);
      });

      await dispatch(updateServiceDetails({ serviceId, formData }));
      handleCancel();
      dispatch(getAllServicesAdmin({ page: currentPage, limit: pageSize, search: searchTerm }));
    } catch (error) {
      console.error('Error saving service:', error);
    } finally {
      setSavingServiceId(null);
    }
  };

  const handleDeleteImage = (serviceId, imagePublicId) => {
    setImageToDelete({ serviceId, imagePublicId });
  };

  const handleSetCoverImage = async (serviceId, imagePublicId) => {
    if (!imagePublicId || coverSettingId) return;
    const key = `${serviceId}:${imagePublicId}`;
    try {
      setCoverSettingId(key);
      await dispatch(setServiceCoverImage({ serviceId, publicId: imagePublicId })).unwrap();
    } catch (error) {
      console.error('Error setting cover image:', error);
    } finally {
      setCoverSettingId(null);
    }
  };

  const handleDeletePDF = (serviceId, pdfPublicId) => {
    setPdfToDelete({ serviceId, pdfPublicId });
  };

  const confirmDeleteImage = async () => {
    if (!imageToDelete || isDeleting) return;
    
    try {
      setIsDeleting(true);
      await dispatch(deleteServiceImage({ 
        serviceId: imageToDelete.serviceId, 
        imagePublicId: imageToDelete.imagePublicId 
      }));
      dispatch(getAllServicesAdmin({ page: currentPage, limit: pageSize, search: searchTerm }));
      setImageToDelete(null);
    } catch (error) {
      console.error('Error deleting image:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDeletePDF = async () => {
    if (!pdfToDelete || isDeleting) return;
    
    try {
      setIsDeleting(true);
      await dispatch(deleteServicePDF({ 
        serviceId: pdfToDelete.serviceId, 
        pdfPublicId: pdfToDelete.pdfPublicId 
      }));
      dispatch(getAllServicesAdmin({ page: currentPage, limit: pageSize, search: searchTerm }));
      setPdfToDelete(null);
    } catch (error) {
      console.error('Error deleting PDF:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (pdfToDelete || imageToDelete) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [pdfToDelete, imageToDelete]);

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

  const handlePDFChange = (e) => {
    const files = Array.from(e.target.files);
    setEditForm({
      ...editForm,
      newPDFs: files
    });
  };

  // Auto-open service if navigated from provider page
  useEffect(() => {
    if (location.state?.serviceId && services && services.length > 0) {
      const serviceId = location.state.serviceId;
      const service = services.find(s => s._id === serviceId);
      
      if (service) {
        setExpandedServices((prev) => new Set(prev).add(serviceId));
        handleEdit(service);

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
  }, [location.state, services]);

  const reload = () => {
    dispatch(getAllServicesAdmin({ page: currentPage, limit: pageSize, search: searchTerm }));
  };

  const renderPortfolioImages = (service, isEditing) => {
    const images = (service.portfolioImages || []).filter((img) => img?.url && img?.public_id);
    if (images.length === 0) {
      return <p className="text-sm text-[var(--text-secondary)]">No images</p>;
    }

    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {images.map((img, idx) => {
          const isCover = idx === 0;
          const canSetCover = Boolean(img.public_id);
          const isSetting =
            coverSettingId === `${service._id}:${img.public_id}`;

          return (
            <div
              key={img.public_id || img.url || idx}
              className={`relative overflow-hidden rounded-xl border-2 ${
                isCover ? 'border-[var(--purple-primary)]' : 'border-purple-100'
              }`}
            >
              <img
                src={img.url}
                alt={`Portfolio ${idx + 1}`}
                className="aspect-[4/3] w-full object-cover"
              />
              {isCover && (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-[var(--purple-primary)] px-2 py-0.5 text-[10px] font-semibold text-white">
                  <Star className="h-3 w-3 fill-current" />
                  Cover
                </span>
              )}
              <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
                {canSetCover && !isCover && (
                  <button
                    type="button"
                    onClick={() => handleSetCoverImage(service._id, img.public_id)}
                    disabled={Boolean(coverSettingId)}
                    className="rounded-lg bg-white/95 px-2 py-1 text-[10px] font-semibold text-[var(--purple-primary)] shadow-sm transition hover:bg-white disabled:opacity-60"
                  >
                    {isSetting ? 'Setting…' : 'Set as cover'}
                  </button>
                )}
                {isEditing && img.public_id && (
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(service._id, img.public_id)}
                    className="ml-auto rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                    title="Delete image"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading && (!services || services.length === 0)) {
    return (
      <motion.div
        className="flex min-h-screen items-center justify-center bg-[var(--background-subtle)] px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-full max-w-sm rounded-2xl border border-purple-100/50 bg-white/80 p-8 text-center shadow-sm shadow-purple-500/5">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-purple-100 border-t-[var(--purple-primary)]" />
          <p className="text-sm font-medium text-[var(--text-primary)]">Loading services…</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">Fetching service records.</p>
        </div>
      </motion.div>
    );
  }

  if (error && (!services || services.length === 0)) {
    return (
      <motion.div
        className="flex min-h-screen items-center justify-center bg-[var(--background-subtle)] px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-full max-w-sm rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-sm font-semibold text-red-600">Error: {error}</p>
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

  const getCurrentRules = () => {
    return RULES[editForm.serviceCategory] || { subCategories: [], keywords: [] };
  };

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
            Manage Services
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            View and update service offerings.
            {servicesPagination?.totalServices != null && (
              <span className="text-[var(--text-secondary)]/80">
                {' '}
                · {servicesPagination.totalServices} service
                {servicesPagination.totalServices !== 1 ? 's' : ''} total
              </span>
            )}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-5 px-4 py-8 sm:px-6 sm:py-10">
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]/60" />
          <input
            type="text"
            placeholder="Search by service, provider, category, or keywords…"
            title="Search by service name, provider name, category, or keywords"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={`${inputClass} w-full pl-9`}
          />
        </div>

      {services && services.length > 0 ? (
        <div className={serviceCardClass}>
          <div className="divide-y divide-purple-50">
            {services.map((service, index) => {
            const isExpanded = expandedServices.has(service._id);
            const isEditing = editingService === service._id;
            const providerName = getFullName(service.provider?.user) || 'Unknown Provider';
            const serviceTitle = service.servicename || service.serviceCategory || 'Unnamed Service';

            return (
              <div
                key={service._id}
                ref={(el) => {
                  serviceRefs.current[service._id] = el;
                }}
              >
                <motion.button
                  type="button"
                  className="w-full px-4 py-3.5 text-left transition-colors hover:bg-purple-50/40 sm:px-5"
                  onClick={() => toggleService(service._id)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--text-primary)] sm:text-base">
                        {serviceTitle}
                      </p>
                      <p className="truncate text-xs text-[var(--text-secondary)] sm:text-sm">
                        {providerName}
                        {service.serviceCategory ? ` · ${service.serviceCategory}` : ''}
                      </p>
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
                  className={`space-y-4 border-t border-purple-100/60 p-5 sm:p-6 ${
                    isEditing ? 'ring-2 ring-inset ring-[var(--purple-primary)]/25' : ''
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(service);
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
                            handleSave(service._id);
                          }}
                          disabled={savingServiceId === service._id}
                          className={btnPrimary}
                        >
                          <Check className="h-4 w-4" />
                          <span>{savingServiceId === service._id ? 'Saving…' : 'Save'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancel();
                          }}
                          disabled={savingServiceId === service._id}
                          className={btnSecondary}
                        >
                          <X className="h-4 w-4" />
                          <span>Cancel</span>
                        </button>
                      </>
                    )}
                  </div>

                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>
                      <Package className="h-4 w-4 text-[var(--text-secondary)]/70" />
                      Service Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.servicename}
                        onChange={(e) => setEditForm({ ...editForm, servicename: e.target.value })}
                        className={inputClass}
                        placeholder="Enter service name"
                      />
                    ) : (
                      <p className="text-sm text-[var(--text-primary)]">{service.servicename || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Tag className="h-4 w-4 text-[var(--text-secondary)]/70" />
                      Service Category
                    </label>
                    {isEditing ? (
                      <select
                        value={editForm.serviceCategory}
                        onChange={(e) => setEditForm({ ...editForm, serviceCategory: e.target.value, subCategories: [], keywords: [] })}
                        className={inputClass}
                      >
                        <option value="">Select Category</option>
                        {Object.keys(RULES).map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-[var(--text-primary)]">{service.serviceCategory || 'N/A'}</p>
                    )}
                  </div>

                  {/* Subcategories */}
                  {isEditing && editForm.serviceCategory && (
                    <div>
                      <label className={labelClass}>
                        <Layers className="h-4 w-4 text-[var(--text-secondary)]/70" />
                        Subcategories
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {getCurrentRules().subCategories.map((subCat) => (
                          <button
                            key={subCat}
                            type="button"
                            onClick={() => handleSubCategoryToggle(subCat)}
                            className={`rounded-full border px-3 py-1 text-sm font-medium transition-all ${
                              editForm.subCategories.includes(subCat) ? chipSelected : chipUnselected
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
                      <label className={labelClass}>
                        <Layers className="h-4 w-4 text-[var(--text-secondary)]/70" />
                        Subcategories
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {service.subCategories && service.subCategories.length > 0 ? (
                          service.subCategories.map((subCat, idx) => (
                            <span
                              key={idx}
                              className="rounded-full border border-purple-100 bg-purple-50/50 px-3 py-1 text-sm font-medium text-[var(--text-primary)]"
                            >
                              {subCat}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-[var(--text-secondary)]">No subcategories</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Keywords */}
                  {isEditing && editForm.serviceCategory && (
                    <div>
                      <label className={labelClass}>
                        <Key className="h-4 w-4 text-[var(--text-secondary)]/70" />
                        Keywords
                      </label>
                      <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
                        {getCurrentRules().keywords.map((keyword) => (
                          <button
                            key={keyword}
                            type="button"
                            onClick={() => handleKeywordToggle(keyword)}
                            className={`rounded-full border px-3 py-1 text-sm font-medium transition-all ${
                              editForm.keywords.includes(keyword) ? chipSelected : chipUnselected
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
                      <label className={labelClass}>
                        <Key className="h-4 w-4 text-[var(--text-secondary)]/70" />
                        Keywords
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {service.keywords && service.keywords.length > 0 ? (
                          service.keywords.map((keyword, idx) => (
                            <span
                              key={idx}
                              className="rounded-full border border-purple-100 bg-purple-50/50 px-3 py-1 text-sm font-medium text-[var(--text-primary)]"
                            >
                              {keyword}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-[var(--text-secondary)]">No keywords</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className={labelClass}>
                      <FileText className="h-4 w-4 text-[var(--text-secondary)]/70" />
                      Description
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows="4"
                        className={inputClass}
                        placeholder="Service description..."
                      />
                    ) : (
                      <p className="text-sm text-[var(--text-primary)]">{service.description || 'No description provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Clock className="h-4 w-4 text-[var(--text-secondary)]/70" />
                      Experience (Years)
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.experience}
                        onChange={(e) => setEditForm({ ...editForm, experience: parseInt(e.target.value) || 0 })}
                        min="0"
                        className={inputClass}
                      />
                    ) : (
                      <p className="text-sm text-[var(--text-primary)]">{service.experience || 0} years</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>
                      <ImageIcon className="h-4 w-4 text-[var(--text-secondary)]/70" />
                      Portfolio Images
                    </label>
                    <p className="mb-3 text-xs text-[var(--text-secondary)]">
                      The image marked <strong>Cover</strong> appears on service cards and listings. Use
                      &quot;Set as cover&quot; to choose which photo shows first.
                    </p>
                    {isEditing ? (
                      <div>
                        {renderPortfolioImages(service, true)}
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className={`${inputClass} mt-4`}
                        />
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">Select new images to add</p>
                      </div>
                    ) : (
                      renderPortfolioImages(service, false)
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>
                      <File className="h-4 w-4 text-[var(--text-secondary)]/70" />
                      Service related Documents
                    </label>
                    {isEditing ? (
                      <div>
                        {service.portfolioPDFs && service.portfolioPDFs.length > 0 && (
                          <div className="space-y-2 mb-4">
                            {service.portfolioPDFs.map((pdf, idx) => (
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
                                  type="button"
                                  onClick={() => handleDeletePDF(service._id, pdf.public_id)}
                                  className="ml-3 shrink-0 rounded-full bg-red-600 p-1.5 text-white hover:bg-red-700"
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
                        {editForm.newPDFs.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {editForm.newPDFs.map((file, idx) => (
                              <p key={idx} className="text-xs text-[var(--text-secondary)]">• {file.name}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {service.portfolioPDFs && service.portfolioPDFs.length > 0 ? (
                          service.portfolioPDFs.map((pdf, idx) => (
                            <div key={idx} className="flex items-center gap-3 rounded-xl border border-purple-100 bg-purple-50/30 p-3">
                              <File className="h-5 w-5 text-red-500" />
                              <a
                                href={pdf.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-[var(--purple-primary)] hover:text-[var(--magenta)]"
                              >
                                PDF {idx + 1}
                              </a>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-[var(--text-secondary)]">No PDFs attached</p>
                        )}
                      </div>
                    )}
                  </div>
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
            <Briefcase className="mx-auto mb-3 h-10 w-10 text-purple-200" />
            <p className="text-sm text-[var(--text-secondary)]">
              No services found{searchTerm ? ' matching your search' : ''}
            </p>
          </div>
        )}

      {services && services.length > 0 && servicesPagination && servicesPagination.totalPages > 1 && (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--text-secondary)]">
            Showing {(servicesPagination.currentPage - 1) * servicesPagination.limit + 1} to{' '}
            {Math.min(servicesPagination.currentPage * servicesPagination.limit, servicesPagination.totalServices)} of{' '}
            {servicesPagination.totalServices} services
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={!servicesPagination.hasPrevPage || isLoading}
              className="rounded-xl border border-purple-100 px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, servicesPagination.totalPages) }, (_, i) => {
                let pageNum;
                if (servicesPagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (servicesPagination.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (servicesPagination.currentPage >= servicesPagination.totalPages - 2) {
                  pageNum = servicesPagination.totalPages - 4 + i;
                } else {
                  pageNum = servicesPagination.currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={isLoading}
                    className={`min-w-[2.25rem] rounded-xl border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      servicesPagination.currentPage === pageNum
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
              onClick={() => setCurrentPage((prev) => Math.min(servicesPagination.totalPages, prev + 1))}
              disabled={!servicesPagination.hasNextPage || isLoading}
              className="rounded-xl border border-purple-100 px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {pdfToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
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
              <button type="button" className={btnSecondary} onClick={() => setPdfToDelete(null)} disabled={isDeleting}>
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

      {imageToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
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
              <button type="button" className={btnSecondary} onClick={() => setImageToDelete(null)} disabled={isDeleting}>
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
      </div>
    </motion.div>
  );
};

export default AdminServices;

