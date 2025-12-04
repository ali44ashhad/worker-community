import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiChevronDown, 
  HiChevronRight,
  HiChevronLeft,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineDocumentText,
  HiOutlineBriefcase
} from 'react-icons/hi';
import { getFullName, getInitials } from '../../utils/userHelpers';

const ProvidersTable = ({ providers = [], isLoading = false, itemsPerPage = 10 }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const toggleRow = (providerId) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(providerId)) {
        newSet.delete(providerId);
      } else {
        newSet.add(providerId);
      }
      return newSet;
    });
  };

  // Reset to page 1 when providers change
  useEffect(() => {
    setCurrentPage(1);
    setExpandedRows(new Set());
  }, [providers.length]);

  // Calculate pagination values
  const totalPages = Math.ceil(providers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProviders = providers.slice(startIndex, endIndex);
  const startItemNumber = startIndex + 1;
  const endItemNumber = Math.min(endIndex, providers.length);

  // Handle page changes
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setExpandedRows(new Set()); // Close all expanded rows when changing pages
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis
      if (currentPage <= 3) {
        // Show first pages
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show last pages
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show middle pages
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!providers || providers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        <p>No providers found</p>
      </div>
    );
  }

  const pageNumbers = getPageNumbers();

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-300">
              <th className="px-4 py-3 text-left text-sm font-semibold text-black w-12">
                {/* Arrow column */}
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-black">S.No</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-black">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-black">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-black">Phone</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-black">Services</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-black">Joined</th>
            </tr>
          </thead>
          <tbody>
            {currentProviders.map((provider, index) => {
              const actualIndex = startIndex + index;
            const isExpanded = expandedRows.has(provider._id);
            const fullName = getFullName(provider.user) || 'Unknown';
            const serviceCount = provider.serviceOfferings?.length || 0;

            return (
              <React.Fragment key={provider._id}>
                <motion.tr
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleRow(provider._id)}
                      className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200 transition-colors"
                      aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                    >
                      {isExpanded ? (
                        <HiChevronDown className="text-gray-700" size={18} />
                      ) : (
                        <HiChevronRight className="text-gray-700" size={18} />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{actualIndex + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {provider.user?.profileImage ? (
                          <img
                            src={provider.user.profileImage}
                            alt={fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-600 font-semibold text-sm">
                            {getInitials(provider.user)}
                          </span>
                        )}
                      </div>
                      <span className="font-medium text-black">{fullName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{provider.user?.email || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{provider.user?.phoneNumber || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{serviceCount}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {provider.createdAt ? new Date(provider.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                </motion.tr>
                
                {/* Expanded Row */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.tr
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-b border-gray-200"
                    >
                      <td colSpan="7" className="px-4 py-6 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Personal Information */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                              <HiOutlineUser className="text-gray-700" size={20} />
                              Personal Information
                            </h3>
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">First Name</p>
                                <p className="text-sm text-black">{provider.user?.firstName || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Last Name</p>
                                <p className="text-sm text-black">{provider.user?.lastName || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                  <HiOutlineMail size={14} />
                                  Email
                                </p>
                                <p className="text-sm text-black">{provider.user?.email || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                  <HiOutlinePhone size={14} />
                                  Phone
                                </p>
                                <p className="text-sm text-black">{provider.user?.phoneNumber || 'N/A'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Address Information */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                              <HiOutlineLocationMarker className="text-gray-700" size={20} />
                              Address
                            </h3>
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Address Line 1</p>
                                <p className="text-sm text-black">{provider.user?.addressLine1 || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Address Line 2</p>
                                <p className="text-sm text-black">{provider.user?.addressLine2 || 'N/A'}</p>
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">City</p>
                                  <p className="text-sm text-black">{provider.user?.city || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">State</p>
                                  <p className="text-sm text-black">{provider.user?.state || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">ZIP</p>
                                  <p className="text-sm text-black">{provider.user?.zip || 'N/A'}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Bio */}
                          <div className="space-y-4 md:col-span-2">
                            <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                              <HiOutlineDocumentText className="text-gray-700" size={20} />
                              Bio
                            </h3>
                            <p className="text-sm text-gray-700 bg-white p-4 rounded-lg border border-gray-200">
                              {provider.bio || 'No bio provided'}
                            </p>
                          </div>

                          {/* Services */}
                          {serviceCount > 0 && (
                            <div className="space-y-4 md:col-span-2">
                              <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                                <HiOutlineBriefcase className="text-gray-700" size={20} />
                                Services ({serviceCount})
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {provider.serviceOfferings.map((service) => (
                                  <div
                                    key={service._id}
                                    className="bg-white p-4 rounded-lg border border-gray-200"
                                  >
                                    <p className="font-semibold text-black mb-2">{service.serviceCategory || 'N/A'}</p>
                                    {service.subCategories && service.subCategories.length > 0 && (
                                      <div className="mb-2">
                                        <p className="text-xs text-gray-500 mb-1">Subcategories:</p>
                                        <div className="flex flex-wrap gap-1">
                                          {service.subCategories.map((sub, idx) => (
                                            <span
                                              key={idx}
                                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                                            >
                                              {sub}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {service.description && (
                                      <p className="text-xs text-gray-600 line-clamp-2">{service.description}</p>
                                    )}
                                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                                      {service.experience > 0 && (
                                        <span>{service.experience} years exp.</span>
                                      )}
                                      {service.price > 0 && (
                                        <span>${service.price}</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 bg-gray-50 rounded-lg border border-gray-200">
          {/* Page Info */}
          <div className="text-sm text-gray-700">
            Showing <span className="font-semibold text-black">{startItemNumber}</span> to{' '}
            <span className="font-semibold text-black">{endItemNumber}</span> of{' '}
            <span className="font-semibold text-black">{providers.length}</span> providers
          </div>

          {/* Pagination Buttons */}
          <div className="flex items-center gap-2">
            {/* First Page */}
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-gray-700"
              aria-label="First page"
            >
              First
            </button>

            {/* Previous Page */}
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <HiChevronLeft className="text-gray-700" size={18} />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {pageNumbers.map((page, idx) => {
                if (page === 'ellipsis') {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`min-w-[36px] px-3 py-2 rounded-lg border transition-colors ${
                      currentPage === page
                        ? 'bg-black text-white border-black font-semibold'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                    aria-label={`Go to page ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            {/* Next Page */}
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <HiChevronRight className="text-gray-700" size={18} />
            </button>

            {/* Last Page */}
            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-gray-700"
              aria-label="Last page"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProvidersTable;
