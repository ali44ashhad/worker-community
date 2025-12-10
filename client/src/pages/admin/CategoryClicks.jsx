import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCategoryClicks } from '../../features/adminSlice';
import { 
  HiOutlineChevronDown,
  HiOutlineChevronRight,
  HiOutlineChartBar
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullName } from '../../utils/userHelpers';

const CategoryClicks = () => {
  const dispatch = useDispatch();
  const { categoryClicks, isLoading, error } = useSelector((state) => state.admin);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  useEffect(() => {
    dispatch(getCategoryClicks());
  }, [dispatch]);

  const toggleCategory = (category) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
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
          <p className="text-xl font-semibold text-black">Loading category clicks...</p>
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
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-black tracking-tight">Category Clicks</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">View cumulative clicks for each category and their services</p>
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
              <p className="font-semibold text-black">Category Name</p>
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
          {categoryClicks && categoryClicks.length > 0 ? (
            categoryClicks.map((category, index) => {
              const isExpanded = expandedCategories.has(category.category);
              return (
                <div key={category.category}>
                  {/* Category Row */}
                  <motion.div
                    className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => toggleCategory(category.category)}
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
                          <p className="font-semibold text-black text-sm truncate">{category.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Clicks</p>
                          <p className="text-base font-bold text-black">{category.totalClicks || 0}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Services</p>
                          <p className="text-base text-gray-700">{category.serviceCount || 0}</p>
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
                        <p className="font-semibold text-black">{category.category}</p>
                      </div>
                      <div className="col-span-2 text-center">
                        <p className="text-lg font-bold text-black">{category.totalClicks || 0}</p>
                      </div>
                      <div className="col-span-2 text-center">
                        <p className="text-gray-700">{category.serviceCount || 0}</p>
                      </div>
                      <div className="col-span-3"></div>
                    </div>
                  </motion.div>

                  {/* Expanded Services */}
                  <AnimatePresence>
                    {isExpanded && category.services && category.services.length > 0 && (
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
                            {category.services.map((service, serviceIndex) => (
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
                                  <p className="text-xs text-gray-500 mb-1">Provider</p>
                                  <p className="text-sm text-gray-700">
                                    {service.provider?.user 
                                      ? getFullName(service.provider.user)
                                      : 'Unknown Provider'}
                                  </p>
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
                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Provider</p>
                              </div>
                            </div>
                            {category.services.map((service, serviceIndex) => (
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
                                  <p className="text-sm text-gray-700">
                                    {service.provider?.user 
                                      ? getFullName(service.provider.user)
                                      : 'Unknown Provider'}
                                  </p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                    {isExpanded && (!category.services || category.services.length === 0) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-50 overflow-hidden"
                      >
                        <div className="px-4 sm:px-6 py-4">
                          <div className="ml-4 sm:ml-8 border-l-2 border-gray-300 pl-4 sm:pl-6">
                            <p className="text-sm text-gray-500 italic">No services found in this category</p>
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
              <p className="text-gray-600">No category data available</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CategoryClicks;

