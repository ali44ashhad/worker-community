import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProviderClicks } from '../../features/adminSlice';
import { 
  HiOutlineChevronDown,
  HiOutlineChevronRight,
  HiOutlineChartBar
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullName } from '../../utils/userHelpers';

const ProviderClicks = () => {
  const dispatch = useDispatch();
  const { providerClicks, isLoading, error } = useSelector((state) => state.admin);
  const [expandedProviders, setExpandedProviders] = useState(new Set());

  useEffect(() => {
    dispatch(getProviderClicks());
  }, [dispatch]);

  const toggleProvider = (providerId) => {
    const newExpanded = new Set(expandedProviders);
    if (newExpanded.has(providerId)) {
      newExpanded.delete(providerId);
    } else {
      newExpanded.add(providerId);
    }
    setExpandedProviders(newExpanded);
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
          <p className="text-xl font-semibold text-black">Loading provider clicks...</p>
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
      className="max-w-[1350px] mx-auto px-4 sm:px-6 py-4 sm:py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="mb-6 sm:mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3">
          <div className="p-2 sm:p-3 rounded-xl bg-gray-50 border border-gray-200">
            <HiOutlineChartBar className="text-gray-900" size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-black tracking-tight">Provider Clicks</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">View cumulative clicks for each provider and their services</p>
          </div>
        </div>
      </motion.div>

      {/* Table - Desktop View */}
      <motion.div 
        className="bg-white border border-gray-300 rounded-xl sm:rounded-2xl shadow-md overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Table Header - Hidden on mobile */}
        <div className="hidden md:block bg-gray-50 border-b border-gray-300 px-4 sm:px-6 py-4">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-1"></div>
            <div className="col-span-4">
              <p className="font-semibold text-black">Provider Name</p>
            </div>
            <div className="col-span-2 text-center">
              <p className="font-semibold text-black">Total Clicks</p>
            </div>
            <div className="col-span-2 text-center">
              <p className="font-semibold text-black">Service Count</p>
            </div>
            <div className="col-span-3"></div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {providerClicks && providerClicks.length > 0 ? (
            providerClicks.map((providerData, index) => {
              const providerId = providerData.provider._id;
              const isExpanded = expandedProviders.has(providerId);
              const providerName = getFullName(providerData.provider.user);
              return (
                <div key={providerId}>
                  {/* Provider Row */}
                  <motion.div
                    className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => toggleProvider(providerId)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    {/* Mobile Layout */}
                    <div className="md:hidden flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {isExpanded ? (
                          <HiOutlineChevronDown className="text-gray-600 flex-shrink-0" size={20} />
                        ) : (
                          <HiOutlineChevronRight className="text-gray-600 flex-shrink-0" size={20} />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-black text-sm truncate">{providerName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Clicks</p>
                          <p className="text-base font-bold text-black">{providerData.totalClicks || 0}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Services</p>
                          <p className="text-base text-gray-700">{providerData.serviceCount || 0}</p>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-1">
                        {isExpanded ? (
                          <HiOutlineChevronDown className="text-gray-600" size={20} />
                        ) : (
                          <HiOutlineChevronRight className="text-gray-600" size={20} />
                        )}
                      </div>
                      <div className="col-span-4">
                        <p className="font-semibold text-black">{providerName}</p>
                      </div>
                      <div className="col-span-2 text-center">
                        <p className="text-lg font-bold text-black">{providerData.totalClicks || 0}</p>
                      </div>
                      <div className="col-span-2 text-center">
                        <p className="text-gray-700">{providerData.serviceCount || 0}</p>
                      </div>
                      <div className="col-span-3"></div>
                    </div>
                  </motion.div>

                  {/* Expanded Services */}
                  <AnimatePresence>
                    {isExpanded && providerData.services && providerData.services.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-50 overflow-hidden"
                      >
                        <div className="px-4 sm:px-6 py-4">
                          {/* Mobile Services Layout */}
                          <div className="md:hidden space-y-3">
                            {providerData.services.map((service, serviceIndex) => (
                              <motion.div
                                key={service._id}
                                className="bg-white rounded-lg p-3 border border-gray-200"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: serviceIndex * 0.03 }}
                              >
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <p className="text-sm font-medium text-gray-900 flex-1 min-w-0">{service.servicename || 'Unnamed Service'}</p>
                                  <div className="flex-shrink-0 text-right">
                                    <p className="text-xs text-gray-500">Clicks</p>
                                    <p className="text-sm font-semibold text-black">{service.serviceOfferingCount || 0}</p>
                                  </div>
                                </div>
                                <div className="pt-2 border-t border-gray-200">
                                  <p className="text-xs text-gray-500 mb-1">Category</p>
                                  <p className="text-sm text-gray-700">{service.serviceCategory || 'Uncategorized'}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>

                          {/* Desktop Services Layout */}
                          <div className="hidden md:block ml-4 sm:ml-8 border-l-2 border-gray-300 pl-4 sm:pl-6 space-y-3">
                            <div className="grid grid-cols-12 gap-4 mb-2 pb-2 border-b border-gray-200">
                              <div className="col-span-5">
                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Service Name</p>
                              </div>
                              <div className="col-span-2 text-center">
                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Clicks</p>
                              </div>
                              <div className="col-span-5">
                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Category</p>
                              </div>
                            </div>
                            {providerData.services.map((service, serviceIndex) => (
                              <motion.div
                                key={service._id}
                                className="grid grid-cols-12 gap-4 py-2 hover:bg-white rounded-lg px-2 transition-colors"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: serviceIndex * 0.03 }}
                              >
                                <div className="col-span-5">
                                  <p className="text-sm font-medium text-gray-900">{service.servicename || 'Unnamed Service'}</p>
                                </div>
                                <div className="col-span-2 text-center">
                                  <p className="text-sm font-semibold text-black">{service.serviceOfferingCount || 0}</p>
                                </div>
                                <div className="col-span-5">
                                  <p className="text-sm text-gray-700">{service.serviceCategory || 'Uncategorized'}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                    {isExpanded && (!providerData.services || providerData.services.length === 0) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-50 overflow-hidden"
                      >
                        <div className="px-4 sm:px-6 py-4">
                          <div className="ml-4 sm:ml-8 border-l-2 border-gray-300 pl-4 sm:pl-6">
                            <p className="text-sm text-gray-500 italic">No services found for this provider</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="px-4 sm:px-6 py-12 text-center">
              <p className="text-gray-600">No provider data available</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProviderClicks;

