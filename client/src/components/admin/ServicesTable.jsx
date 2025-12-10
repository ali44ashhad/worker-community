import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiChevronDown, 
  HiChevronRight,
  HiChevronLeft,
  HiChevronDoubleLeft,
  HiChevronDoubleRight,
  HiOutlineBriefcase,
  HiOutlineTag,
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlinePhotograph,
  HiOutlineDocument
} from 'react-icons/hi';
import { getFullName, getInitials } from '../../utils/userHelpers';

const ServicesTable = ({ services = [], isLoading = false, itemsPerPage = 10 }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const toggleRow = (serviceId) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  // Reset to page 1 when services change
  useEffect(() => {
    setCurrentPage(1);
    setExpandedRows(new Set());
  }, [services.length]);

  // Calculate pagination values
  const totalPages = Math.ceil(services.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentServices = services.slice(startIndex, endIndex);
  const startItemNumber = startIndex + 1;
  const endItemNumber = Math.min(endIndex, services.length);

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

  if (!services || services.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        <p>No services found</p>
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
              <th className="px-4 py-3 text-left text-sm font-semibold text-black">Service Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-black">Category</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-black">Provider</th>
              {/* <th className="px-4 py-3 text-left text-sm font-semibold text-black">Price</th> */}
              <th className="px-4 py-3 text-left text-sm font-semibold text-black">Created</th>
            </tr>
          </thead>
          <tbody>
            {currentServices.map((service, index) => {
              const actualIndex = startIndex + index;
              const isExpanded = expandedRows.has(service._id);
              const providerName = service.provider?.user ? getFullName(service.provider.user) : 'N/A';

              return (
                <React.Fragment key={service._id}>
                  <motion.tr
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleRow(service._id)}
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
                      <span className="font-medium text-black">{service.servicename || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{service.serviceCategory || 'N/A'}</td>
                    <td className="px-4 py-3">
                      {service.provider?.user ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {service.provider.user?.profileImage ? (
                              <img
                                src={service.provider.user.profileImage}
                                alt={providerName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-600 font-semibold text-xs">
                                {getInitials(service.provider.user)}
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-700 truncate max-w-[150px]">{providerName}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-700">N/A</span>
                      )}
                    </td>
                    {/* <td className="px-4 py-3 text-sm text-gray-700">
                      {service.price > 0 ? `$${service.price}` : 'N/A'}
                    </td> */}
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {service.createdAt ? new Date(service.createdAt).toLocaleDateString() : 'N/A'}
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
                            {/* Service Information */}
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                                <HiOutlineBriefcase className="text-gray-700" size={20} />
                                Service Information
                              </h3>
                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Service Name</p>
                                  <p className="text-sm text-black">{service.servicename || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                    <HiOutlineTag size={14} />
                                    Category
                                  </p>
                                  <p className="text-sm text-black">{service.serviceCategory || 'N/A'}</p>
                                </div>
                                {service.subCategories && service.subCategories.length > 0 && (
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Subcategories</p>
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
                                {service.keywords && service.keywords.length > 0 && (
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Keywords</p>
                                    <div className="flex flex-wrap gap-1">
                                      {service.keywords.map((keyword, idx) => (
                                        <span
                                          key={idx}
                                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                                        >
                                          {keyword}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                      <HiOutlineClock size={14} />
                                      Experience
                                    </p>
                                    <p className="text-sm text-black">{service.experience || 0} years</p>
                                  </div>
                                  {/* <div>
                                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                      <HiOutlineCurrencyDollar size={14} />
                                      Price
                                    </p>
                                    <p className="text-sm text-black">{service.price > 0 ? `$${service.price}` : 'N/A'}</p>
                                  </div> */}
                                </div>
                              </div>
                            </div>

                            {/* Provider Information */}
                            {service.provider?.user && (
                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                                  <HiOutlineUser className="text-gray-700" size={20} />
                                  Provider Information
                                </h3>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Name</p>
                                    <p className="text-sm text-black">{providerName}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                      <HiOutlineMail size={14} />
                                      Email
                                    </p>
                                    <p className="text-sm text-black">{service.provider.user?.email || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                      <HiOutlinePhone size={14} />
                                      Phone
                                    </p>
                                    <p className="text-sm text-black">{service.provider.user?.phoneNumber || 'N/A'}</p>
                                  </div>
                                  {service.provider.user?.addressLine1 && (
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                        <HiOutlineLocationMarker size={14} />
                                        Address
                                      </p>
                                      <p className="text-sm text-black">
                                        {service.provider.user.addressLine1}
                                        {service.provider.user.addressLine2 && `, ${service.provider.user.addressLine2}`}
                                        {service.provider.user.city && `, ${service.provider.user.city}`}
                                        {service.provider.user.state && `, ${service.provider.user.state}`}
                                        {service.provider.user.zip && ` ${service.provider.user.zip}`}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Description */}
                            {service.description && (
                              <div className="space-y-4 md:col-span-2">
                                <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                                  <HiOutlineDocumentText className="text-gray-700" size={20} />
                                  Description
                                </h3>
                                <p className="text-sm text-gray-700 bg-white p-4 rounded-lg border border-gray-200">
                                  {service.description}
                                </p>
                              </div>
                            )}

                            {/* Portfolio Images */}
                            {service.portfolioImages && service.portfolioImages.length > 0 && (
                              <div className="space-y-4 md:col-span-2">
                                <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                                  <HiOutlinePhotograph className="text-gray-700" size={20} />
                                  Portfolio Images ({service.portfolioImages.length})
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  {service.portfolioImages.map((image, idx) => (
                                    <div key={idx} className="relative">
                                      <img
                                        src={image.url}
                                        alt={`Portfolio ${idx + 1}`}
                                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Portfolio PDFs */}
                            {service.portfolioPDFs && service.portfolioPDFs.length > 0 && (
                              <div className="space-y-4 md:col-span-2">
                                <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                                  <HiOutlineDocument className="text-gray-700" size={20} />
                                  Portfolio PDFs ({service.portfolioPDFs.length})
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  {service.portfolioPDFs.map((pdf, idx) => (
                                    <a
                                      key={idx}
                                      href={pdf.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                      <HiOutlineDocument className="text-gray-700" size={18} />
                                      <span className="text-sm text-gray-700">PDF {idx + 1}</span>
                                    </a>
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
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 bg-gray-50 rounded-lg border border-gray-200">
          {/* Page Info */}
          <div className="text-sm text-gray-700 whitespace-nowrap">
            Showing <span className="font-semibold text-black">{startItemNumber}</span> to{' '}
            <span className="font-semibold text-black">{endItemNumber}</span> of{' '}
            <span className="font-semibold text-black">{services.length}</span> services
          </div>

          {/* Pagination Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap">
            {/* First Page */}
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className="p-2 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity hover:opacity-70 flex items-center justify-center flex-shrink-0"
              aria-label="First page"
            >
              <HiChevronDoubleLeft className="text-gray-700" size={20} />
            </button>

            {/* Previous Page */}
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="p-2 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity hover:opacity-70 flex items-center justify-center flex-shrink-0"
              aria-label="Previous page"
            >
              <HiChevronLeft className="text-gray-700" size={20} />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1 flex-nowrap">
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
              className="p-2 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity hover:opacity-70 flex items-center justify-center flex-shrink-0"
              aria-label="Next page"
            >
              <HiChevronRight className="text-gray-700" size={20} />
            </button>

            {/* Last Page */}
            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className="p-2 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity hover:opacity-70 flex items-center justify-center flex-shrink-0"
              aria-label="Last page"
            >
              <HiChevronDoubleRight className="text-gray-700" size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesTable;
