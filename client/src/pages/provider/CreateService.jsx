import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Trash2, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { getActiveCategories } from '../../features/adminSlice';
import { getApiBase } from '../../utils/apiBase';

const initialServiceState = {
  servicename: '',
  category: '',
  subCategories: [],
  keywords: [],
  bio: '',
  experience: '',
  // price: '',
  images: [],
  imagePreviews: [],
  pdfs: [],
  pdfPreviews: [],
};

const CreateService = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { activeCategories } = useSelector((state) => state.admin);
  const [form, setForm] = useState(initialServiceState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleCategoryChange = (category) => {
    setForm((prev) => ({
      ...prev,
      category,
      subCategories: [],
      keywords: [],
    }));
    setErrors((prev) => ({ ...prev, category: null, subCategories: null, keywords: null }));
  };

  const handleToggle = (key, value) => {
    setForm((prev) => {
      const list = prev[key] || [];
      const exists = list.includes(value);
      return {
        ...prev,
        [key]: exists ? list.filter((item) => item !== value) : [...list, value],
      };
    });
    setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const previews = files.map((file) => URL.createObjectURL(file));
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
      imagePreviews: [...prev.imagePreviews, ...previews],
    }));
    setErrors((prev) => ({ ...prev, images: null }));
  };

  const handlePDFUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    // For PDFs, we'll use the file name as preview
    const previews = files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));
    setForm((prev) => ({
      ...prev,
      pdfs: [...prev.pdfs, ...files],
      pdfPreviews: [...prev.pdfPreviews, ...previews],
    }));
    setErrors((prev) => ({ ...prev, pdfs: null }));
  };

  const handleRemoveImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
    }));
  };

  const handleRemovePDF = (index) => {
    setForm((prev) => ({
      ...prev,
      pdfs: prev.pdfs.filter((_, i) => i !== index),
      pdfPreviews: prev.pdfPreviews.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const validationErrors = {};
    let invalid = false;

    if (!form.servicename || !form.servicename.trim()) {
      validationErrors.servicename = 'Service name is required.';
      invalid = true;
    }

    if (!form.category) {
      validationErrors.category = 'Select a category.';
      invalid = true;
    }

    if (
      form.category &&
      (RULES[form.category]?.subCategories?.length || 0) > 0 &&
      form.subCategories.length === 0
    ) {
      validationErrors.subCategories = 'Pick at least one sub-category.';
      invalid = true;
    }

    if (
      form.category &&
      (RULES[form.category]?.keywords?.length || 0) > 0 &&
      form.keywords.length === 0
    ) {
      validationErrors.keywords = 'Select at least one keyword.';
      invalid = true;
    }

    if (!form.bio.trim()) {
      validationErrors.bio = 'Description is required.';
      invalid = true;
    }

    /* if (form.price === '' || form.price === null || form.price === undefined) {
      validationErrors.price = 'Price is required.';
      invalid = true;
    } else if (parseFloat(form.price) < 0) {
      validationErrors.price = 'Price cannot be negative.';
      invalid = true;
    } */

    // Work images / PDFs are optional (we show a default logo if none)

    setErrors(validationErrors);
    return !invalid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      toast.error('Fix the highlighted fields before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);
      const base = getApiBase();

      // Signed params for direct Cloudinary uploads (avoid Vercel 413 limits)
      const sigRes = await fetch(`${base || ''}/api/provider-profile/cloudinary-signature`, {
        method: 'GET',
        credentials: 'include',
      });
      const sigText = await sigRes.text();
      const sigData = sigText ? (() => { try { return JSON.parse(sigText); } catch { return null; } })() : null;
      if (!sigRes.ok || !sigData?.success) {
        throw new Error(sigData?.message || 'Unable to prepare upload. Please try again.');
      }

      const { cloudName, apiKey, timestamp, folder, signature } = sigData;
      const cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

      const uploadOne = async (file) => {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('api_key', apiKey);
        fd.append('timestamp', String(timestamp));
        fd.append('folder', folder);
        fd.append('signature', signature);
        const r = await fetch(cloudinaryUploadUrl, { method: 'POST', body: fd });
        const j = await r.json().catch(() => null);
        if (!r.ok || !j?.secure_url) {
          throw new Error(j?.error?.message || 'Upload failed. Please try again.');
        }
        return { url: j.secure_url, public_id: j.public_id };
      };

      const uploadedImages = [];
      for (const imgFile of (form.images || [])) {
        if (imgFile instanceof File) uploadedImages.push(await uploadOne(imgFile));
      }
      const uploadedPDFs = [];
      for (const pdfFile of (form.pdfs || [])) {
        if (pdfFile instanceof File) uploadedPDFs.push(await uploadOne(pdfFile));
      }

      const response = await fetch(`${base || ''}/api/provider-profile/service-json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          servicename: form.servicename,
          serviceCategory: form.category,
          subCategories: form.subCategories,
          keywords: form.keywords,
          description: form.bio,
          experience: form.experience,
          portfolioImages: uploadedImages,
          portfolioPDFs: uploadedPDFs,
        }),
      });

      const rawText = await response.text();
      const data = rawText ? (() => { try { return JSON.parse(rawText); } catch { return null; } })() : null;
      if (!response.ok) {
        const message =
          data?.message ||
          (response.status === 401
            ? 'Session expired. Please login again and retry.'
            : response.status === 413
              ? 'Upload too large. Please keep each file under 50MB.'
              : `Failed to create service (${response.status}).`);
        throw new Error(message);
      }

      toast.success('Service created successfully.');
      setForm(initialServiceState);
      navigate('/provider/manage-services');
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error(error.message || 'Unable to create service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderChips = (items, key) => (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <motion.button
          key={item}
          type="button"
          onClick={() => handleToggle(key, item)}
          className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-300 ${
            form[key]?.includes(item)
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
        <h1 className="text-4xl font-bold text-black tracking-tight mt-4 mb-2">Add New Service</h1>
        <p className="text-gray-600">Showcase a new offering to potential customers.</p>
        <p className="text-sm text-gray-500 mt-2">Fields marked with * are mandatory.</p>
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
              value={form.servicename}
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
              value={form.category}
              onChange={(event) => handleCategoryChange(event.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all duration-300 font-medium ${
                errors.category
                  ? 'border-red-300 focus:ring-red-400 bg-red-50'
                  : 'border-gray-200 focus:ring-gray-400 focus:bg-white'
              }`}
            >
              <option value="">Choose a category</option>
              {Object.keys(RULES).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-2 font-medium">{errors.category}</p>
            )}
          </div>

          {form.category && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Sub-categories *
              </label>
              {renderChips(RULES[form.category]?.subCategories || [], 'subCategories')}
              {errors.subCategories && (
                <p className="text-red-500 text-sm mt-2 font-medium">{errors.subCategories}</p>
              )}
            </div>
          )}

          {form.category && (RULES[form.category]?.keywords?.length || 0) > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Keywords *</label>
              {renderChips(RULES[form.category]?.keywords || [], 'keywords')}
              {errors.keywords && (
                <p className="text-red-500 text-sm mt-2 font-medium">{errors.keywords}</p>
              )}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Description *</label>
            <textarea
              value={form.bio}
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
                Experience (years) <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="number"
                min="0"
                value={form.experience}
                onChange={(event) => handleInputChange('experience', event.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all duration-300 font-medium border-gray-200 focus:ring-gray-400 focus:bg-white"
              />
            </div>
            {/* <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Price (₹) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
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
                Upload Work Images max upload 5 images upto 10 MB each(optional)
            </label>
            <motion.div
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
                errors.images ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              whileHover={{ scale: 1.01 }}
            >
              <input
                id="create-service-images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label htmlFor="create-service-images" className="cursor-pointer flex flex-col items-center">
                <Upload className="text-gray-400 mb-3" size={40} />
                <span className="text-gray-900 font-semibold">Click to upload images</span>
                <span className="text-xs text-gray-500">PNG, JPG up to 10MB</span>
              </label>
            </motion.div>
            {errors.images && (
              <p className="text-red-500 text-sm mt-2 font-medium">{errors.images}</p>
            )}

            {(form.imagePreviews?.length || 0) > 0 && (
              <div className="mt-6 columns-2 md:columns-3 gap-4 [column-fill:_balance]">
                {form.imagePreviews.map((preview, index) => (
                  <motion.div
                    key={`preview-${index}`}
                    className="relative rounded-xl overflow-hidden mb-4 break-inside-avoid"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <img src={preview} alt="Preview" className="w-full h-auto object-contain block" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
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
              Upload PDFs max upload 1 file upto 20 MB <span className="text-gray-400">(optional)</span>
            </label>
            <motion.div
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
                errors.pdfs ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              whileHover={{ scale: 1.01 }}
            >
              <input
                id="create-service-pdfs"
                type="file"
                multiple
                accept="application/pdf"
                onChange={handlePDFUpload}
                className="hidden"
              />
              <label htmlFor="create-service-pdfs" className="cursor-pointer flex flex-col items-center">
                <FileText className="text-gray-400 mb-3" size={40} />
                <span className="text-gray-900 font-semibold">Click to upload PDF</span>
                <span className="text-xs text-gray-500">PDF files up to 20MB</span>
              </label>
            </motion.div>
            {errors.pdfs && (
              <p className="text-red-500 text-sm mt-2 font-medium">{errors.pdfs}</p>
            )}

            {form.pdfPreviews && form.pdfPreviews.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-6">
                {form.pdfPreviews.map((preview, index) => (
                  <motion.div
                    key={`pdf-preview-${index}`}
                    className="relative border border-gray-200 rounded-xl p-4 shadow-sm bg-gray-50 flex items-center gap-3 min-w-[200px]"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <FileText className="text-red-500" size={24} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{preview.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePDF(index)}
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

        <motion.div className="flex justify-end" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-4 bg-gray-900 text-white font-semibold text-lg rounded-xl transition-all duration-300 shadow-lg tracking-wide ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800 hover:shadow-xl'
            }`}
          >
            {isSubmitting ? 'Creating...' : 'Create Service'}
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default CreateService;

