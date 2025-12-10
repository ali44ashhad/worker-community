import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Upload, Trash2, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

import { getMyProviderProfile } from '../../features/providerSlice';
import SERVICE_RULES from '../../constants/serviceRules';

const buildServiceState = (service) => ({
  id: service?._id || Date.now(),
  _id: service?._id,
  servicename: service?.servicename || '',
  category: service?.serviceCategory || '',
  subCategories: service?.subCategories || [],
  keywords: service?.keywords || [],
  bio: service?.description || '',
  experience: service?.experience ?? '',
  // price: service?.price ?? '',
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

  const [serviceForm, setServiceForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getMyProviderProfile());
  }, [dispatch]);

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
      SERVICE_RULES[serviceForm.category]?.subCategories?.length > 0 &&
      !serviceForm.subCategories.length
    ) {
      newErrors.subCategories = 'Pick at least one sub-category.';
      hasErrors = true;
    }

    if (
      serviceForm?.category &&
      SERVICE_RULES[serviceForm.category]?.keywords?.length > 0 &&
      !serviceForm.keywords.length
    ) {
      newErrors.keywords = 'Select at least one keyword.';
      hasErrors = true;
    }

    if (!serviceForm?.bio?.trim()) {
      newErrors.bio = 'Description is required.';
      hasErrors = true;
    }

    if (serviceForm?.experience === '') {
      newErrors.experience = 'Experience is required.';
      hasErrors = true;
    }

    /* if (serviceForm?.price === '' || serviceForm?.price === null || serviceForm?.price === undefined) {
      newErrors.price = 'Price is required.';
      hasErrors = true;
    } else if (parseFloat(serviceForm.price) < 0) {
      newErrors.price = 'Price cannot be negative.';
      hasErrors = true;
    } */

    const totalImages =
      (serviceForm?.existingImages?.length || 0) + (serviceForm?.imagePreviews?.length || 0);
    const totalPDFs =
      (serviceForm?.existingPDFs?.length || 0) + (serviceForm?.pdfPreviews?.length || 0);
    if (totalImages === 0 && totalPDFs === 0) {
      newErrors.images = 'Upload at least one work image or PDF.';
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
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const formData = new FormData();

      formData.append('servicename', serviceForm.servicename);
      formData.append('serviceCategory', serviceForm.category);
      formData.append('subCategories', JSON.stringify(serviceForm.subCategories));
      formData.append('keywords', JSON.stringify(serviceForm.keywords));
      formData.append('description', serviceForm.bio);
      formData.append('experience', serviceForm.experience);
      // formData.append('price', serviceForm.price);

      serviceForm.images.forEach((file) => {
        if (file instanceof File) {
          formData.append('portfolioImages', file);
        }
      });

      serviceForm.pdfs.forEach((file) => {
        if (file instanceof File) {
          formData.append('portfolioPDFs', file);
        }
      });

      const response = await fetch(`${API_URL}/api/provider-profile/service/${serviceForm._id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to update service.');
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
      {items.map((item) => (
        <motion.button
          key={item}
          type="button"
          onClick={() => handleToggleValue(key, item)}
          className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-300 ${
            serviceForm?.[key]?.includes(item)
              ? 'bg-gray-900 text-white border-gray-900 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {item}
        </motion.button>
      ))}
    </div>
  );

  if (isFetchingMyProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-xl font-semibold text-black">Loading service details...</p>
        </motion.div>
      </div>
    );
  }

  if (!targetService) {
    return (
      <motion.div
        className="max-w-3xl mx-auto text-center py-24"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-black mb-4">Service not found</h1>
        <p className="text-gray-500 mb-8">
          We couldn’t find the service you’re trying to edit. It might have been removed.
        </p>
        <button
          onClick={() => navigate('/provider/manage-services')}
          className="px-5 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-900 transition"
        >
          Back to Manage Services
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto mt-10 mb-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="mb-10">
        <button
          type="button"
          onClick={() => navigate('/provider/manage-services')}
          className="text-sm font-semibold text-gray-600 hover:text-black transition"
        >
          ← Back to Manage Services
        </button>
        <h1 className="text-4xl font-bold text-black tracking-tight mt-4 mb-2">Edit Service</h1>
        <p className="text-gray-600">
          Update details for <span className="font-semibold">{targetService?.serviceCategory}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <motion.div
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Service Name *</label>
            <input
              type="text"
              value={serviceForm?.servicename || ''}
              onChange={(event) => handleInputChange('servicename', event.target.value)}
              placeholder="Enter a name for your service"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all duration-300 font-medium ${
                errors.servicename
                  ? 'border-red-300 focus:ring-red-400 bg-red-50'
                  : 'border-gray-200 focus:ring-gray-400 focus:bg-white'
              }`}
            />
            {errors.servicename && (
              <p className="text-red-500 text-sm mt-2 font-medium">{errors.servicename}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Category *</label>
            <select
              value={serviceForm?.category}
              onChange={(event) => handleCategoryChange(event.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all duration-300 font-medium ${
                errors.category
                  ? 'border-red-300 focus:ring-red-400 bg-red-50'
                  : 'border-gray-200 focus:ring-gray-400 focus:bg-white'
              }`}
            >
              <option value="">Choose a category</option>
              {Object.keys(SERVICE_RULES).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-2 font-medium">{errors.category}</p>
            )}
          </div>

          {serviceForm?.category && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Sub-categories *
              </label>
              {renderChips(SERVICE_RULES[serviceForm.category]?.subCategories || [], 'subCategories')}
              {errors.subCategories && (
                <p className="text-red-500 text-sm mt-2 font-medium">{errors.subCategories}</p>
              )}
            </div>
          )}

          {serviceForm?.category && SERVICE_RULES[serviceForm.category]?.keywords?.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Keywords *</label>
              {renderChips(SERVICE_RULES[serviceForm.category]?.keywords || [], 'keywords')}
              {errors.keywords && (
                <p className="text-red-500 text-sm mt-2 font-medium">{errors.keywords}</p>
              )}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Description *</label>
            <textarea
              value={serviceForm?.bio}
              onChange={(event) => handleInputChange('bio', event.target.value)}
              rows="4"
              placeholder="Describe your service..."
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent outline-none resize-none font-medium transition-all duration-300 ${
                errors.bio
                  ? 'border-red-300 focus:ring-red-400 bg-red-50'
                  : 'border-gray-200 focus:ring-gray-400 focus:bg-white'
              }`}
            />
            {errors.bio && <p className="text-red-500 text-sm mt-2 font-medium">{errors.bio}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Experience (years) *
              </label>
              <input
                type="number"
                min="0"
                value={serviceForm?.experience}
                onChange={(event) => handleInputChange('experience', event.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all duration-300 font-medium ${
                  errors.experience
                    ? 'border-red-300 focus:ring-red-400 bg-red-50'
                    : 'border-gray-200 focus:ring-gray-400 focus:bg-white'
                }`}
              />
              {errors.experience && (
                <p className="text-red-500 text-sm mt-2 font-medium">{errors.experience}</p>
              )}
            </div>
            {/* <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Price (₹) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={serviceForm?.price}
                onChange={(event) => handleInputChange('price', event.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all duration-300 font-medium ${
                  errors.price
                    ? 'border-red-300 focus:ring-red-400 bg-red-50'
                    : 'border-gray-200 focus:ring-gray-400 focus:bg-white'
                }`}
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-2 font-medium">{errors.price}</p>
              )}
            </div> */}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Upload Work Images *
            </label>
            <motion.div
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
                errors.images ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              whileHover={{ scale: 1.01 }}
            >
              <input
                id="edit-service-images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label htmlFor="edit-service-images" className="cursor-pointer flex flex-col items-center">
                <Upload className="text-gray-400 mb-3" size={40} />
                <span className="text-gray-900 font-semibold">Click to upload images</span>
                <span className="text-xs text-gray-500">PNG, JPG up to 10MB</span>
              </label>
            </motion.div>
            {errors.images && (
              <p className="text-red-500 text-sm mt-2 font-medium">{errors.images}</p>
            )}

            {(serviceForm?.existingImages?.length || serviceForm?.imagePreviews?.length) && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
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
                    className="relative border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <img src={imgObj.url} alt="Portfolio" className="w-full h-40 object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(imgObj.index, imgObj.isExisting)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 shadow-md hover:bg-red-600 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Upload PDFs <span className="text-gray-400">(optional)</span>
            </label>
            <motion.div
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
                errors.pdfs ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              whileHover={{ scale: 1.01 }}
            >
              <input
                id="edit-service-pdfs"
                type="file"
                multiple
                accept="application/pdf"
                onChange={handlePDFUpload}
                className="hidden"
              />
              <label htmlFor="edit-service-pdfs" className="cursor-pointer flex flex-col items-center">
                <FileText className="text-gray-400 mb-3" size={40} />
                <span className="text-gray-900 font-semibold">Click to upload PDFs</span>
                <span className="text-xs text-gray-500">PDF files up to 10MB</span>
              </label>
            </motion.div>
            {/* {errors.pdfs && (
              <p className="text-red-500 text-sm mt-2 font-medium">{errors.pdfs}</p>
            )} */}

            {((serviceForm?.existingPDFs && serviceForm.existingPDFs.length > 0) || (serviceForm?.pdfPreviews && serviceForm.pdfPreviews.length > 0)) && (
              <div className="flex flex-wrap gap-4 mt-6">
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
                    className="relative border border-gray-200 rounded-xl p-4 shadow-sm bg-gray-50 flex items-center gap-3 min-w-[200px]"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <FileText className="text-red-500" size={24} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{pdfObj.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePDF(pdfObj.index, pdfObj.isExisting)}
                      className="bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition"
                    >
                      <Trash2 size={14} />
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
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-4 bg-gray-900 text-white font-semibold text-lg rounded-xl transition-all duration-300 shadow-lg tracking-wide ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800 hover:shadow-xl'
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default EditService;


