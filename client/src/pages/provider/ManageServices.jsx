import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlinePhotograph } from 'react-icons/hi';
import { getMyProviderProfile } from '../../features/providerSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const ManageServices = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myProviderProfile, isFetchingMyProfile } = useSelector((state) => state.provider);
  const [deletingId, setDeletingId] = useState(null);
  const [serviceToRemove, setServiceToRemove] = useState(null);

  useEffect(() => {
    dispatch(getMyProviderProfile());
  }, [dispatch]);

  const services = useMemo(() => myProviderProfile?.serviceOfferings || [], [myProviderProfile]);

  const handleDelete = async () => {
    if (!serviceToRemove || deletingId) return;
    const serviceId = serviceToRemove._id;

    try {
      setDeletingId(serviceId);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/provider-profile/service/${serviceId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to delete service');
      }

      toast.success('Service removed successfully.');
      await dispatch(getMyProviderProfile());
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error(error.message || 'Unable to delete service');
    } finally {
      setDeletingId(null);
      setServiceToRemove(null);
    }
  };

  const handleUpdate = (serviceId) => {
    navigate(`/provider/manage-services/${serviceId}/edit`);
  };

  const handleAddService = () => {
    navigate('/provider/manage-services/new');
  };

  if (isFetchingMyProfile) {
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
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-xl font-semibold text-black">Loading your services...</p>
        </motion.div>
      </div>
    );
  }

  if (!services.length) {
    return (
      <motion.div
        className="max-w-5xl mx-auto text-center py-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-black mb-3">Manage Services</h1>
        <p className="text-gray-500 mb-8">
          You have not added any services yet. Create your first service to start receiving bookings.
        </p>
        <button
          onClick={handleAddService}
          className="inline-flex items-center gap-3 px-6 py-3 bg-black text-white font-semibold rounded-xl shadow-lg hover:bg-gray-900 transition"
        >
          <HiOutlinePlus size={20} />
          Add Service
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="max-w-6xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex flex-col gap-3 mb-10">
        <p className="text-sm uppercase tracking-wide text-gray-500">Manage Services</p>
        <h1 className="text-4xl font-bold text-black tracking-tight">Your offerings at a glance</h1>
        <p className="text-gray-600">
          Review, update, or remove your services. Keep them up to date to attract more customers.
        </p>
        <div className="mt-4">
          <button
            onClick={handleAddService}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-800 hover:bg-gray-100 transition-all"
          >
            <HiOutlinePlus size={18} />
            Add new service
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map((service, index) => {
          const coverImage = service.portfolioImages?.[0]?.url;
          return (
            <motion.div
              key={service._id}
              className="group bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col transition-all duration-300"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.1, delay: index * 0.05 }}
              whileHover={{ y: -6, scale: 1.01, boxShadow: '0px 20px 45px rgba(15,23,42,0.15)' }}
            >
              <div className="relative aspect-video overflow-hidden rounded-t-2xl bg-gray-100">
                {coverImage ? (
                  <motion.img
                    src={coverImage}
                    alt={service.serviceCategory}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                    <HiOutlinePhotograph size={36} />
                    <span className="text-sm font-medium">No images yet</span>
                  </div>
                )}
                {/* <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {coverImage && (
                  <div className="absolute bottom-3 left-3 px-3 py-1 bg-white/90 rounded-full text-xs font-semibold text-gray-900 shadow-md opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    View Details
                  </div>
                )} */}
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {service.serviceCategory || 'Uncategorized'}
                  </span>
                  {service.price !== undefined && (
                    <span className="text-lg font-bold text-black">₹{service.price}</span>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-black mt-3 mb-2">
                  {service.title || service.serviceCategory}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3">
                  {service.description || 'No description provided.'}
                </p>

                {service.subCategories?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                      Sub-categories
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {service.subCategories.map((sub) => (
                        <span
                          key={sub}
                          className="px-3 py-1 text-xs font-semibold bg-gray-100 rounded-full text-gray-700"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {service.keywords?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                      Keywords
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {service.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded-full text-gray-600"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    onClick={() => handleUpdate(service._id)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition"
                  >
                    <HiOutlinePencil size={18} />
                    Update
                  </button>
                  <button
                    onClick={() => setServiceToRemove(service)}
                    disabled={deletingId === service._id}
                    className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-semibold transition ${
                      deletingId === service._id
                        ? 'border-red-200 text-red-300 cursor-not-allowed'
                        : 'border-red-200 text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <HiOutlineTrash size={18} />
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {serviceToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold text-black mb-3">Remove this service?</h2>
            <p className="text-gray-600 mb-6">
              This action will permanently delete{' '}
              <span className="font-semibold text-black">{serviceToRemove.serviceCategory}</span>. You
              won’t be able to recover it later.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                onClick={() => setServiceToRemove(null)}
                disabled={deletingId === serviceToRemove._id}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`w-full sm:w-auto px-5 py-3 rounded-xl font-semibold text-white transition ${
                  deletingId === serviceToRemove._id
                    ? 'bg-red-300 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-500'
                }`}
                onClick={handleDelete}
                disabled={deletingId === serviceToRemove._id}
              >
                {deletingId === serviceToRemove._id ? 'Removing...' : 'Yes, remove'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default ManageServices;


