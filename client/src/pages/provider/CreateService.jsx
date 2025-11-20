import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import SERVICE_RULES from '../../constants/serviceRules';

const initialServiceState = {
  category: '',
  subCategories: [],
  keywords: [],
  bio: '',
  experience: '',
  price: '',
  images: [],
  imagePreviews: [],
};

const CreateService = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialServiceState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleRemoveImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const validationErrors = {};
    let invalid = false;

    if (!form.category) {
      validationErrors.category = 'Select a category.';
      invalid = true;
    }

    if (
      form.category &&
      SERVICE_RULES[form.category]?.subCategories?.length > 0 &&
      form.subCategories.length === 0
    ) {
      validationErrors.subCategories = 'Pick at least one sub-category.';
      invalid = true;
    }

    if (
      form.category &&
      SERVICE_RULES[form.category]?.keywords?.length > 0 &&
      form.keywords.length === 0
    ) {
      validationErrors.keywords = 'Select at least one keyword.';
      invalid = true;
    }

    if (!form.bio.trim()) {
      validationErrors.bio = 'Description is required.';
      invalid = true;
    }

    if (form.price === '' || form.price === null || form.price === undefined) {
      validationErrors.price = 'Price is required.';
      invalid = true;
    } else if (parseFloat(form.price) < 0) {
      validationErrors.price = 'Price cannot be negative.';
      invalid = true;
    }

    if ((form.imagePreviews?.length || 0) === 0) {
      validationErrors.images = 'Upload at least one work image.';
      invalid = true;
    }

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
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const formData = new FormData();

      formData.append('serviceCategory', form.category);
      formData.append('subCategories', JSON.stringify(form.subCategories));
      formData.append('keywords', JSON.stringify(form.keywords));
      formData.append('description', form.bio);
      formData.append('experience', form.experience);
      formData.append('price', form.price);

      form.images.forEach((file) => {
        if (file instanceof File) {
          formData.append('portfolioImages', file);
        }
      });

      const response = await fetch(`${API_URL}/api/provider-profile/service`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to create service.');
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

          {form.category && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Sub-categories *
              </label>
              {renderChips(SERVICE_RULES[form.category]?.subCategories || [], 'subCategories')}
              {errors.subCategories && (
                <p className="text-red-500 text-sm mt-2 font-medium">{errors.subCategories}</p>
              )}
            </div>
          )}

          {form.category && SERVICE_RULES[form.category]?.keywords?.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Keywords *</label>
              {renderChips(SERVICE_RULES[form.category]?.keywords || [], 'keywords')}
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
            <div>
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
            </div>
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {form.imagePreviews.map((preview, index) => (
                  <motion.div
                    key={`preview-${index}`}
                    className="relative border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <img src={preview} alt="Preview" className="w-full h-40 object-cover" />
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

