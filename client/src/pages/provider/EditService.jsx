import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Pencil, Save, Trash2, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

import { getMyProviderProfile } from '../../features/providerSlice';
import { getActiveCategories } from '../../features/adminSlice';
import { getApiBase } from '../../utils/apiBase';

const inputBase =
  'w-full rounded-xl border bg-white px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/70 transition-all focus:outline-none focus:ring-2';
const inputOk = `${inputBase} border-purple-100 focus:border-[var(--purple-primary)] focus:ring-[var(--purple-primary)]/25`;
const inputErr = `${inputBase} border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-400/25`;
const labelClass = 'mb-2 block text-xs font-medium text-[var(--text-secondary)]';
const cardClass =
  'rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm shadow-purple-500/5 backdrop-blur-sm sm:p-8';
const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-8 py-3.5 text-sm font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';

const buildServiceState = (service) => ({
  id: service?._id || Date.now(),
  _id: service?._id,
  servicename: service?.servicename || '',
  category: service?.serviceCategory || '',
  subCategories: service?.subCategories || [],
  keywords: service?.keywords || [],
  bio: service?.description || '',
  experience: service?.experience ?? '',
  existingImages: service?.portfolioImages || [],
  images: [],
  imagePreviews: [],
  existingPDFs: service?.portfolioPDFs || [],
  pdfs: [],
  pdfPreviews: [],
});

const EditService = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const { myProviderProfile, isFetchingMyProfile } = useSelector((state) => state.provider);
  const { activeCategories } = useSelector((state) => state.admin);

  const [serviceForm, setServiceForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getMyProviderProfile());
  }, [dispatch]);

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

  const targetService = useMemo(() => {
    return myProviderProfile?.serviceOfferings?.find((service) => service._id === serviceId);
  }, [myProviderProfile, serviceId]);

  useEffect(() => {
    if (targetService) {
      setServiceForm(buildServiceState(targetService));
    }
  }, [targetService]);

  const handleCategoryChange = (category) => {
    setServiceForm((prev) => ({
      ...prev,
      category,
      subCategories: [],
      keywords: [],
    }));
    setErrors((prev) => ({ ...prev, category: null }));
  };

  const handleToggleValue = (key, value) => {
    setServiceForm((prev) => {
      const current = prev[key] || [];
      const exists = current.includes(value);
      const updated = exists ? current.filter((item) => item !== value) : [...current, value];
      return { ...prev, [key]: updated };
    });
    setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleInputChange = (field, value) => {
    setServiceForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const previews = files.map((file) => URL.createObjectURL(file));
    setServiceForm((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
      imagePreviews: [...prev.imagePreviews, ...previews],
    }));
    setErrors((prev) => ({ ...prev, images: null }));
  };

  const handlePDFUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const previews = files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));
    setServiceForm((prev) => ({
      ...prev,
      pdfs: [...prev.pdfs, ...files],
      pdfPreviews: [...prev.pdfPreviews, ...previews],
    }));
    setErrors((prev) => ({ ...prev, pdfs: null }));
  };

  const handleRemoveImage = (index, isExisting = false) => {
    if (isExisting) {
      setServiceForm((prev) => ({
        ...prev,
        existingImages: prev.existingImages.filter((_, i) => i !== index),
      }));
    } else {
      setServiceForm((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
        imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
      }));
    }
  };

  const handleRemovePDF = (index, isExisting = false) => {
    if (isExisting) {
      setServiceForm((prev) => ({
        ...prev,
        existingPDFs: prev.existingPDFs.filter((_, i) => i !== index),
      }));
    } else {
      setServiceForm((prev) => ({
        ...prev,
        pdfs: prev.pdfs.filter((_, i) => i !== index),
        pdfPreviews: prev.pdfPreviews.filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let hasErrors = false;

    if (!serviceForm?.servicename || !serviceForm.servicename.trim()) {
      newErrors.servicename = 'Service name is required.';
      hasErrors = true;
    }

    if (!serviceForm?.category) {
      newErrors.category = 'Select a category.';
      hasErrors = true;
    }

    if (
      serviceForm?.category &&
      (RULES[serviceForm.category]?.subCategories?.length || 0) > 0 &&
      !serviceForm.subCategories.length
    ) {
      newErrors.subCategories = 'Pick at least one sub-category.';
      hasErrors = true;
    }

    if (
      serviceForm?.category &&
      (RULES[serviceForm.category]?.keywords?.length || 0) > 0 &&
      !serviceForm.keywords.length
    ) {
      newErrors.keywords = 'Select at least one keyword.';
      hasErrors = true;
    }

    if (!serviceForm?.bio?.trim()) {
      newErrors.bio = 'Description is required.';
      hasErrors = true;
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!serviceForm || !validateForm()) {
      toast.error('Fix the highlighted fields before saving.');
      return;
    }

    try {
      setIsSubmitting(true);
      const base = getApiBase();

      const formData = new FormData();
      formData.append('servicename', serviceForm.servicename);
      formData.append('serviceCategory', serviceForm.category);
      formData.append('subCategories', JSON.stringify(serviceForm.subCategories || []));
      formData.append('keywords', JSON.stringify(serviceForm.keywords || []));
      formData.append('description', serviceForm.bio || '');
      if (serviceForm.experience !== undefined && serviceForm.experience !== '') {
        formData.append('experience', String(serviceForm.experience));
      }
      formData.append('existingImages', JSON.stringify(serviceForm.existingImages || []));
      formData.append('existingPDFs', JSON.stringify(serviceForm.existingPDFs || []));
      (serviceForm.images || []).forEach((file) => {
        if (file instanceof File) formData.append('portfolioImages', file);
      });
      (serviceForm.pdfs || []).forEach((file) => {
        if (file instanceof File) formData.append('portfolioPDFs', file);
      });

      const response = await fetch(`${base || ''}/api/provider-profile/service/${serviceForm._id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      const rawText = await response.text();
      const data = rawText
        ? (() => {
            try {
              return JSON.parse(rawText);
            } catch {
              return null;
            }
          })()
        : null;
      if (!response.ok) {
        const message =
          data?.message ||
          (response.status === 401
            ? 'Session expired. Please login again and retry.'
            : response.status === 413
              ? 'Upload too large. Please keep each file under 50MB.'
              : `Failed to update service (${response.status}).`);
        throw new Error(message);
      }

      toast.success('Service updated successfully.');
      navigate('/provider/manage-services');
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error(error.message || 'Unable to update service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderChips = (items = [], key) => (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const selected = serviceForm?.[key]?.includes(item);
        return (
          <motion.button
            key={item}
            type="button"
            onClick={() => handleToggleValue(key, item)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
              selected
                ? 'border-transparent bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white shadow-sm shadow-purple-500/20'
                : 'border-purple-100 bg-white text-[var(--text-secondary)] hover:bg-purple-50 hover:text-[var(--purple-primary)]'
            }`}
            whileTap={{ scale: 0.97 }}
          >
            {item}
          </motion.button>
        );
      })}
    </div>
  );

  if (isFetchingMyProfile) {
    return (
      <motion.div
        className="flex min-h-screen items-center justify-center bg-[var(--background-subtle)] px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-full max-w-sm rounded-2xl border border-purple-100/50 bg-white/80 p-8 text-center shadow-sm shadow-purple-500/5">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-purple-100 border-t-[var(--purple-primary)]" />
          <p className="text-sm font-medium text-[var(--text-primary)]">Loading service details…</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">Fetching your service offering.</p>
        </div>
      </motion.div>
    );
  }

  if (!targetService) {
    return (
      <motion.div
        className="flex min-h-screen items-center justify-center bg-[var(--background-subtle)] px-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-full max-w-md rounded-2xl border border-purple-100/50 bg-white/80 p-8 text-center shadow-sm shadow-purple-500/5">
          <h1 className="text-lg font-semibold text-[var(--text-primary)] sm:text-xl">Service not found</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            We couldn&apos;t find the service you&apos;re trying to edit. It might have been removed.
          </p>
          <button
            type="button"
            onClick={() => navigate('/provider/manage-services')}
            className={`mt-6 ${btnPrimary}`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Manage Services
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
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate('/provider/manage-services')}
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--purple-primary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Manage Services
          </button>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--purple-primary)]">
            Provider
          </p>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">Edit Service</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Update details for{' '}
            <span className="font-medium text-[var(--purple-primary)]">
              {targetService?.servicename || targetService?.serviceCategory}
            </span>
          </p>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 sm:py-10"
      >
        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
              <Pencil className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">
                Service details
              </h2>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                Update name, category, description, and portfolio files.
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className={labelClass} htmlFor="servicename">
              Service Name *
            </label>
            <input
              id="servicename"
              type="text"
              value={serviceForm?.servicename || ''}
              onChange={(event) => handleInputChange('servicename', event.target.value)}
              placeholder="Enter a name for your service"
              className={errors.servicename ? inputErr : inputOk}
            />
            {errors.servicename && (
              <p className="mt-2 text-sm font-medium text-red-600">{errors.servicename}</p>
            )}
          </div>

          <div className="mb-6">
            <label className={labelClass} htmlFor="category">
              Category *
            </label>
            <select
              id="category"
              value={serviceForm?.category}
              onChange={(event) => handleCategoryChange(event.target.value)}
              className={errors.category ? inputErr : inputOk}
            >
              <option value="">Choose a category</option>
              {Object.keys(RULES).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-2 text-sm font-medium text-red-600">{errors.category}</p>
            )}
          </div>

          {serviceForm?.category && (
            <div className="mb-6">
              <label className={labelClass}>Sub-categories *</label>
              {renderChips(RULES[serviceForm.category]?.subCategories || [], 'subCategories')}
              {errors.subCategories && (
                <p className="mt-2 text-sm font-medium text-red-600">{errors.subCategories}</p>
              )}
            </div>
          )}

          {serviceForm?.category && (RULES[serviceForm.category]?.keywords?.length || 0) > 0 && (
            <div className="mb-6">
              <label className={labelClass}>Keywords *</label>
              {renderChips(RULES[serviceForm.category]?.keywords || [], 'keywords')}
              {errors.keywords && (
                <p className="mt-2 text-sm font-medium text-red-600">{errors.keywords}</p>
              )}
            </div>
          )}

          <div className="mb-6">
            <label className={labelClass} htmlFor="bio">
              Description *
            </label>
            <textarea
              id="bio"
              value={serviceForm?.bio}
              onChange={(event) => handleInputChange('bio', event.target.value)}
              rows="4"
              placeholder="Describe your service..."
              className={`${errors.bio ? inputErr : inputOk} resize-none`}
            />
            {errors.bio && <p className="mt-2 text-sm font-medium text-red-600">{errors.bio}</p>}
          </div>

          <div>
            <label className={labelClass} htmlFor="experience">
              Experience (years){' '}
              <span className="text-[var(--text-secondary)]/70">(optional)</span>
            </label>
            <input
              id="experience"
              type="number"
              min="0"
              value={serviceForm?.experience}
              onChange={(event) => handleInputChange('experience', event.target.value)}
              className={errors.experience ? inputErr : inputOk}
            />
            {errors.experience && (
              <p className="mt-2 text-sm font-medium text-red-600">{errors.experience}</p>
            )}
          </div>

          <div className="mt-8">
            <label className={labelClass}>
              Upload Work Images — max 5 images, up to 10 MB each{' '}
              <span className="text-[var(--text-secondary)]/70">(optional)</span>
            </label>
            <div
              className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors sm:p-10 ${
                errors.images
                  ? 'border-red-300 bg-red-50'
                  : 'border-purple-100 bg-purple-50/20 hover:border-purple-200'
              }`}
            >
              <input
                id="edit-service-images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label
                htmlFor="edit-service-images"
                className="flex cursor-pointer flex-col items-center"
              >
                <Upload className="mb-3 h-10 w-10 text-[var(--purple-primary)]" />
                <span className="font-semibold text-[var(--text-primary)]">Click to upload images</span>
                <span className="mt-1 text-xs text-[var(--text-secondary)]">PNG, JPG up to 10MB</span>
              </label>
            </div>
            {errors.images && (
              <p className="mt-2 text-sm font-medium text-red-600">{errors.images}</p>
            )}

            {(serviceForm?.existingImages?.length || serviceForm?.imagePreviews?.length) > 0 && (
              <div className="mt-6 columns-2 gap-4 [column-fill:_balance] md:columns-3">
                {[
                  ...(serviceForm.existingImages || []).map((img, idx) => ({
                    url: img.url,
                    isExisting: true,
                    index: idx,
                  })),
                  ...(serviceForm.imagePreviews || []).map((preview, idx) => ({
                    url: preview,
                    isExisting: false,
                    index: idx,
                  })),
                ].map((imgObj, displayIdx) => (
                  <motion.div
                    key={`img-${displayIdx}-${imgObj.url}`}
                    className="relative mb-4 break-inside-avoid overflow-hidden rounded-xl border border-purple-100/50"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <img src={imgObj.url} alt="Portfolio" className="block h-auto w-full object-contain" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(imgObj.index, imgObj.isExisting)}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white shadow-md transition hover:bg-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8">
            <label className={labelClass}>
              Upload PDFs — max 1 file, up to 20 MB{' '}
              <span className="text-[var(--text-secondary)]/70">(optional)</span>
            </label>
            <div
              className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors sm:p-10 ${
                errors.pdfs
                  ? 'border-red-300 bg-red-50'
                  : 'border-purple-100 bg-purple-50/20 hover:border-purple-200'
              }`}
            >
              <input
                id="edit-service-pdfs"
                type="file"
                multiple
                accept="application/pdf"
                onChange={handlePDFUpload}
                className="hidden"
              />
              <label htmlFor="edit-service-pdfs" className="flex cursor-pointer flex-col items-center">
                <FileText className="mb-3 h-10 w-10 text-[var(--purple-primary)]" />
                <span className="font-semibold text-[var(--text-primary)]">Click to upload PDF</span>
                <span className="mt-1 text-xs text-[var(--text-secondary)]">PDF files up to 20MB</span>
              </label>
            </div>
            {errors.pdfs && <p className="mt-2 text-sm font-medium text-red-600">{errors.pdfs}</p>}

            {((serviceForm?.existingPDFs && serviceForm.existingPDFs.length > 0) ||
              (serviceForm?.pdfPreviews && serviceForm.pdfPreviews.length > 0)) && (
              <div className="mt-6 flex flex-wrap gap-4">
                {[
                  ...(serviceForm.existingPDFs || []).map((pdf, idx) => ({
                    name: pdf.url.split('/').pop() || 'PDF',
                    url: pdf.url,
                    isExisting: true,
                    index: idx,
                  })),
                  ...(serviceForm.pdfPreviews || []).map((preview, idx) => ({
                    name: preview.name,
                    url: preview.url,
                    isExisting: false,
                    index: idx,
                  })),
                ].map((pdfObj, displayIdx) => (
                  <motion.div
                    key={`pdf-${displayIdx}-${pdfObj.url}`}
                    className="relative flex min-w-[200px] items-center gap-3 rounded-xl border border-purple-100/50 bg-purple-50/20 p-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <FileText className="h-6 w-6 shrink-0 text-[var(--purple-primary)]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                        {pdfObj.name}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePDF(pdfObj.index, pdfObj.isExisting)}
                      className="rounded-full bg-red-500 p-1.5 text-white shadow-md transition hover:bg-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          className="flex justify-end"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button type="submit" disabled={isSubmitting} className={btnPrimary}>
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default EditService;
