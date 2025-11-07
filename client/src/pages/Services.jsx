// import React, { useEffect, useState, useMemo } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { getAllProviders } from '../features/providerSlice';
// import ServiceCard from '../components/service/ServiceCard';
// import HomePageLoader from '../components/loaders/HomePageLoader';
// import { HiOutlineSearch, HiOutlineRefresh } from 'react-icons/hi';

// const Services = () => {
//   const dispatch = useDispatch();
//   const { allProviders, isFetchingAll, error } = useSelector((state) => state.provider);

//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('All');
//   const [priceSort, setPriceSort] = useState('All'); // 'All', 'Low to High', 'High to Low'
//   const [priceRange, setPriceRange] = useState([0, 100000]); // [min, max]
//   const [filteredServices, setFilteredServices] = useState([]);
//   const [allServices, setAllServices] = useState([]);

//   // Fetch providers on component mount
//   useEffect(() => {
//     dispatch(getAllProviders());
//   }, [dispatch]);

//   // Extract all services from providers
//   useEffect(() => {
//     const extractedServices = [];
//     allProviders.forEach(provider => {
//       if (provider?.serviceOfferings && Array.isArray(provider.serviceOfferings)) {
//         provider.serviceOfferings.forEach(service => {
//           // Add provider info to each service
//           extractedServices.push({
//             ...service,
//             provider: {
//               ...provider,
//               user: provider.user,
//               _id: provider._id,
//               bio: provider.bio,
//               experience: provider.experience
//             }
//           });
//         });
//       }
//     });
//     setAllServices(extractedServices);
//   }, [allProviders]);

//   // Calculate min and max price from all services
//   const getPriceRange = () => {
//     const prices = allServices
//       .map(service => service?.price)
//       .filter(price => price !== undefined && price !== null && !isNaN(price))
//       .map(price => typeof price === 'number' ? price : parseFloat(price));
    
//     if (prices.length === 0) return [0, 100000];
    
//     const min = Math.min(...prices);
//     const max = Math.max(...prices);
//     return [Math.floor(min), Math.ceil(max)];
//   };

//   // Calculate min and max price - memoized
//   const [minPrice, maxPrice] = useMemo(() => {
//     if (allServices.length > 0) {
//       return getPriceRange();
//     }
//     return [0, 100000];
//   }, [allServices]);

//   // Initialize price range when services are loaded
//   useEffect(() => {
//     if (allServices.length > 0) {
//       const [min, max] = getPriceRange();
//       setPriceRange([min, max]);
//     }
//   }, [allServices]);

//   // Filter services based on search, category, and price
//   useEffect(() => {
//     let filtered = [...allServices];

//     // Apply search filter
//     if (searchQuery.trim()) {
//       filtered = filtered.filter(service => {
//         const category = service?.serviceCategory?.toLowerCase() || '';
//         const description = service?.description?.toLowerCase() || '';
//         const keywords = (service?.keywords || []).map(k => k?.toLowerCase()).join(' ');
//         const subCategories = (service?.subCategories || []).map(s => s?.toLowerCase()).join(' ');
//         const providerName = service?.provider?.user?.name?.toLowerCase() || '';
        
//         const query = searchQuery.toLowerCase();
//         return category.includes(query) || 
//                description.includes(query) || 
//                keywords.includes(query) ||
//                subCategories.includes(query) ||
//                providerName.includes(query);
//       });
//     }

//     // Apply category filter
//     if (selectedCategory !== 'All') {
//       filtered = filtered.filter(service => {
//         return service?.serviceCategory === selectedCategory;
//       });
//     }

//     // Apply price range filter
//     filtered = filtered.filter(service => {
//       const price = service?.price;
//       if (price === undefined || price === null) return false;
//       const numPrice = typeof price === 'number' ? price : parseFloat(price);
//       if (isNaN(numPrice)) return false;
//       return numPrice >= priceRange[0] && numPrice <= priceRange[1];
//     });

//     // Apply price sorting
//     if (priceSort === 'Low to High') {
//       filtered.sort((a, b) => {
//         const priceA = typeof a?.price === 'number' ? a.price : parseFloat(a?.price) || 0;
//         const priceB = typeof b?.price === 'number' ? b.price : parseFloat(b?.price) || 0;
//         return priceA - priceB;
//       });
//     } else if (priceSort === 'High to Low') {
//       filtered.sort((a, b) => {
//         const priceA = typeof a?.price === 'number' ? a.price : parseFloat(a?.price) || 0;
//         const priceB = typeof b?.price === 'number' ? b.price : parseFloat(b?.price) || 0;
//         return priceB - priceA;
//       });
//     }

//     setFilteredServices(filtered);
//   }, [searchQuery, selectedCategory, priceSort, priceRange, allServices]);

//   // Get unique categories from all services
//   const getUniqueCategories = () => {
//     const categories = new Set();
//     allServices.forEach(service => {
//       if (service?.serviceCategory) {
//         categories.add(service.serviceCategory);
//       }
//     });
//     return Array.from(categories).sort();
//   };

//   const categories = getUniqueCategories();

//   const handleRefresh = () => {
//     dispatch(getAllProviders());
//   };

//   const handleClearFilters = () => {
//     setSearchQuery('');
//     setSelectedCategory('All');
//     setPriceSort('All');
//     if (allServices.length > 0) {
//       const [min, max] = getPriceRange();
//       setPriceRange([min, max]);
//     }
//   };

//   const handlePriceRangeChange = (index, value) => {
//     const numValue = parseInt(value) || 0;
//     const newRange = [...priceRange];
    
//     if (index === 0) {
//       // Min slider - ensure it doesn't exceed max and stays within bounds
//       const constrainedValue = Math.max(minPrice, Math.min(numValue, priceRange[1] - 1));
//       newRange[0] = constrainedValue;
//       // Ensure min doesn't equal or exceed max
//       if (constrainedValue >= priceRange[1]) {
//         newRange[0] = Math.max(minPrice, priceRange[1] - 1);
//       }
//     } else {
//       // Max slider - ensure it doesn't go below min and stays within bounds
//       const constrainedValue = Math.min(maxPrice, Math.max(numValue, priceRange[0] + 1));
//       newRange[1] = constrainedValue;
//       // Ensure max doesn't equal or go below min
//       if (constrainedValue <= priceRange[0]) {
//         newRange[1] = Math.min(maxPrice, priceRange[0] + 1);
//       }
//     }
    
//     setPriceRange(newRange);
//   };

//   return (
//     <div className='min-h-screen bg-gray-50 pb-16'>
//       <div className='max-w-[1350px] mx-auto px-4 pt-24'>
//         {/* Main Content: Filters on Left, Services on Right */}
//         <div className='flex flex-col lg:flex-row gap-6'>
//           {/* Left Sidebar - Everything */}
//           <div className='lg:w-80 flex-shrink-0'>
//             <div className='bg-white border border-gray-300 rounded-xl overflow-hidden sticky top-24 max-h-[calc(100vh-6rem)] flex flex-col'>
//               {/* Fixed Top Section */}
//               <div className='p-4 space-y-4 flex-shrink-0 border-b border-gray-200'>
//                 {/* Header */}
//                 <div className='mb-3'>
//                   <h1 className='text-2xl font-bold text-black mb-1'>
//                     All Services
//                   </h1>
//                   <p className='text-gray-600 text-xs leading-tight'>
//                     Browse through all available services from our talented community providers. 
//                     Find exactly what you need, from tutoring to baking, fitness to technology and more.
//                   </p>
//                 </div>

//                 {/* Search Bar */}
//                 <div className='relative'>
//                   <HiOutlineSearch className='absolute left-2 top-1/2 -translate-y-1/2 text-gray-400' size={16} />
//                   <input
//                     type='text'
//                     placeholder='Search...'
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className='w-full bg-white border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400'
//                   />
//                 </div>
//               </div>

//               {/* Scrollable Filters Section */}
//               <div className='p-4 space-y-4 overflow-y-auto flex-1'>
//                 <div>
//                   <h2 className='text-base font-bold text-black mb-3'>Filters</h2>
//                 </div>

//                 {/* Category Filters */}
//                 <div className='space-y-2'>
//                   <h3 className='text-xs font-semibold text-gray-700'>Categories</h3>
//                   <div className='flex flex-wrap gap-1.5'>
//                     <button
//                       onClick={() => setSelectedCategory('All')}
//                       className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
//                         selectedCategory === 'All'
//                           ? 'bg-gray-600 text-white border-gray-600'
//                           : 'bg-white text-black border-gray-300 hover:bg-gray-100'
//                       }`}
//                     >
//                       All
//                     </button>
//                     {categories.map((category) => (
//                       <button
//                         key={category}
//                         onClick={() => setSelectedCategory(category)}
//                         className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
//                           selectedCategory === category
//                             ? 'bg-gray-600 text-white border-gray-600'
//                             : 'bg-white text-black border-gray-300 hover:bg-gray-100'
//                         }`}
//                       >
//                         {category}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Price Filter with Range Slider */}
//                 <div className='space-y-3'>
//                   <h3 className='text-xs font-semibold text-gray-700'>Price Range</h3>
                  
//                   {/* Price Sort Options */}
//                   <div className='flex gap-1.5'>
//                     <button
//                       onClick={() => setPriceSort('All')}
//                       className={`flex-1 px-2 py-1.5 rounded text-xs font-semibold transition-all border ${
//                         priceSort === 'All'
//                           ? 'bg-gray-600 text-white border-gray-600'
//                           : 'bg-white text-black border-gray-300 hover:bg-gray-100'
//                       }`}
//                     >
//                       All
//                     </button>
//                     <button
//                       onClick={() => setPriceSort('Low to High')}
//                       className={`flex-1 px-2 py-1.5 rounded text-xs font-semibold transition-all border ${
//                         priceSort === 'Low to High'
//                           ? 'bg-gray-600 text-white border-gray-600'
//                           : 'bg-white text-black border-gray-300 hover:bg-gray-100'
//                       }`}
//                     >
//                       Low-High
//                     </button>
//                     <button
//                       onClick={() => setPriceSort('High to Low')}
//                       className={`flex-1 px-2 py-1.5 rounded text-xs font-semibold transition-all border ${
//                         priceSort === 'High to Low'
//                           ? 'bg-gray-600 text-white border-gray-600'
//                           : 'bg-white text-black border-gray-300 hover:bg-gray-100'
//                       }`}
//                     >
//                       High-Low
//                     </button>
//                   </div>

//                   {/* Price Range Display */}
//                   <div className='text-center mb-2'>
//                     <span className='text-xs font-bold text-black'>
//                       ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
//                     </span>
//                   </div>

//                   {/* Dual Range Slider */}
//                   <div className='relative pt-3 pb-1'>
//                     <div className='relative h-2 bg-gray-200 rounded-lg'>
//                       {/* Active range track */}
//                       {maxPrice > minPrice && (
//                         <div
//                           className='absolute h-2 bg-gray-600 rounded-lg top-0 pointer-events-none'
//                           style={{
//                             left: `${((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}% `,
//                             width: `${((priceRange[1] - priceRange[0]) / (maxPrice - minPrice)) * 100}% `
//                           }}
//                         />
//                       )}
//                       {/* Min range input - Left handle */}
//                       <input
//                         type='range'
//                         min={minPrice}
//                         max={Math.max(minPrice, priceRange[1] - 1)}
//                         value={priceRange[0]}
//                         onChange={(e) => handlePriceRangeChange(0, e.target.value)}
//                         onInput={(e) => handlePriceRangeChange(0, e.target.value)}
//                         onMouseDown={(e) => {
//                           const rect = e.currentTarget.getBoundingClientRect();
//                           const clickX = e.clientX - rect.left;
//                           const sliderWidth = rect.width;
//                           const minThumbPos = ((priceRange[0] - minPrice) / (maxPrice - minPrice)) * sliderWidth;
//                           const maxThumbPos = ((priceRange[1] - minPrice) / (maxPrice - minPrice)) * sliderWidth;
//                           const thumbRadius = 25; // Clickable area around thumb
                          
//                           const distToMin = Math.abs(clickX - minThumbPos);
//                           const distToMax = Math.abs(clickX - maxThumbPos);
                          
//                           // Only allow if clicking closer to min thumb than max thumb, and within radius
//                           if (distToMin <= thumbRadius && distToMin < distToMax) {
//                             e.currentTarget.style.zIndex = '30';
//                             const maxSlider = e.currentTarget.parentElement?.querySelector('input[type="range"]:last-of-type');
//                             if (maxSlider) {
//                               maxSlider.style.zIndex = '10';
//                             }
//                             e.stopPropagation();
//                           } else {
//                             e.preventDefault();
//                             e.stopPropagation();
//                             return false;
//                           }
//                         }}
//                         onMouseUp={(e) => {
//                           e.currentTarget.style.zIndex = '20';
//                           const maxSlider = e.currentTarget.parentElement?.querySelector('input[type="range"]:last-of-type');
//                           if (maxSlider) {
//                             maxSlider.style.zIndex = '25';
//                           }
//                         }}
//                         onTouchStart={(e) => {
//                           const rect = e.currentTarget.getBoundingClientRect();
//                           const touchX = e.touches[0].clientX - rect.left;
//                           const sliderWidth = rect.width;
//                           const minThumbPos = ((priceRange[0] - minPrice) / (maxPrice - minPrice)) * sliderWidth;
//                           const maxThumbPos = ((priceRange[1] - minPrice) / (maxPrice - minPrice)) * sliderWidth;
//                           const thumbRadius = 25;
                          
//                           const distToMin = Math.abs(touchX - minThumbPos);
//                           const distToMax = Math.abs(touchX - maxThumbPos);
                          
//                           if (distToMin <= thumbRadius && distToMin < distToMax) {
//                             e.currentTarget.style.zIndex = '30';
//                             const maxSlider = e.currentTarget.parentElement?.querySelector('input[type="range"]:last-of-type');
//                             if (maxSlider) {
//                               maxSlider.style.zIndex = '10';
//                             }
//                             e.stopPropagation();
//                           } else {
//                             e.preventDefault();
//                             e.stopPropagation();
//                           }
//                         }}
//                         onTouchEnd={(e) => {
//                           e.currentTarget.style.zIndex = '20';
//                           const maxSlider = e.currentTarget.parentElement?.querySelector('input[type="range"]:last-of-type');
//                           if (maxSlider) {
//                             maxSlider.style.zIndex = '25';
//                           }
//                         }}
//                         className='absolute w-full h-2 bg-transparent appearance-none cursor-grab active:cursor-grabbing slider'
//                         style={{ 
//                           zIndex: 20
//                         }}
//                       />
//                       {/* Max range input - Right handle */}
//                       <input
//                         type='range'
//                         min={Math.min(maxPrice, priceRange[0] + 1)}
//                         max={maxPrice}
//                         value={priceRange[1]}
//                         onChange={(e) => handlePriceRangeChange(1, e.target.value)}
//                         onInput={(e) => handlePriceRangeChange(1, e.target.value)}
//                         onMouseDown={(e) => {
//                           const rect = e.currentTarget.getBoundingClientRect();
//                           const clickX = e.clientX - rect.left;
//                           const sliderWidth = rect.width;
//                           const minThumbPos = ((priceRange[0] - minPrice) / (maxPrice - minPrice)) * sliderWidth;
//                           const maxThumbPos = ((priceRange[1] - minPrice) / (maxPrice - minPrice)) * sliderWidth;
//                           const thumbRadius = 25; // Clickable area around thumb
                          
//                           const distToMin = Math.abs(clickX - minThumbPos);
//                           const distToMax = Math.abs(clickX - maxThumbPos);
                          
//                           // Only allow if clicking closer to max thumb than min thumb, and within radius
//                           if (distToMax <= thumbRadius && distToMax < distToMin) {
//                             e.currentTarget.style.zIndex = '30';
//                             const minSlider = e.currentTarget.parentElement?.querySelector('input[type="range"]:first-of-type');
//                             if (minSlider) {
//                               minSlider.style.zIndex = '10';
//                             }
//                             e.stopPropagation();
//                           } else {
//                             e.preventDefault();
//                             e.stopPropagation();
//                             return false;
//                           }
//                         }}
//                         onMouseUp={(e) => {
//                           e.currentTarget.style.zIndex = '25';
//                           const minSlider = e.currentTarget.parentElement?.querySelector('input[type="range"]:first-of-type');
//                           if (minSlider) {
//                             minSlider.style.zIndex = '20';
//                           }
//                         }}
//                         onTouchStart={(e) => {
//                           const rect = e.currentTarget.getBoundingClientRect();
//                           const touchX = e.touches[0].clientX - rect.left;
//                           const sliderWidth = rect.width;
//                           const minThumbPos = ((priceRange[0] - minPrice) / (maxPrice - minPrice)) * sliderWidth;
//                           const maxThumbPos = ((priceRange[1] - minPrice) / (maxPrice - minPrice)) * sliderWidth;
//                           const thumbRadius = 25;
                          
//                           const distToMin = Math.abs(touchX - minThumbPos);
//                           const distToMax = Math.abs(touchX - maxThumbPos);
                          
//                           if (distToMax <= thumbRadius && distToMax < distToMin) {
//                             e.currentTarget.style.zIndex = '30';
//                             const minSlider = e.currentTarget.parentElement?.querySelector('input[type="range"]:first-of-type');
//                             if (minSlider) {
//                               minSlider.style.zIndex = '10';
//                             }
//                             e.stopPropagation();
//                           } else {
//                             e.preventDefault();
//                             e.stopPropagation();
//                           }
//                         }}
//                         onTouchEnd={(e) => {
//                           e.currentTarget.style.zIndex = '25';
//                           const minSlider = e.currentTarget.parentElement?.querySelector('input[type="range"]:first-of-type');
//                           if (minSlider) {
//                             minSlider.style.zIndex = '20';
//                           }
//                         }}
//                         className='absolute w-full h-2 bg-transparent appearance-none cursor-grab active:cursor-grabbing slider'
//                         style={{ 
//                           zIndex: 25
//                         }}
//                       />
//                     </div>
//                     {/* Price Range Labels */}
//                     <div className='flex justify-between text-[10px] text-gray-600 mt-1'>
//                       <span>₹{minPrice.toLocaleString()}</span>
//                       <span>₹{maxPrice.toLocaleString()}</span>
//                     </div>
//                   </div>

//                   {/* Min/Max Input Fields */}
//                   <div className='flex items-end gap-1.5'>
//                     <div className='flex-1'>
//                       <label className='block text-[10px] text-gray-600 mb-0.5'>Min</label>
//                       <input
//                         type='number'
//                         min={minPrice}
//                         max={maxPrice}
//                         value={priceRange[0]}
//                         onChange={(e) => handlePriceRangeChange(0, e.target.value)}
//                         className='w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400'
//                       />
//                     </div>
//                     <div className='flex-1'>
//                       <label className='block text-[10px] text-gray-600 mb-0.5'>Max</label>
//                       <input
//                         type='number'
//                         min={minPrice}
//                         max={maxPrice}
//                         value={priceRange[1]}
//                         onChange={(e) => handlePriceRangeChange(1, e.target.value)}
//                         className='w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400'
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className='space-y-1.5 pt-3 border-t border-gray-200'>
//                   <button
//                     onClick={handleRefresh}
//                     className='w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-semibold hover:bg-gray-100 transition-all'
//                   >
//                     <HiOutlineRefresh size={14} />
//                     Refresh
//                   </button>
//                   {(searchQuery || selectedCategory !== 'All' || priceSort !== 'All' || priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
//                     <button
//                       onClick={handleClearFilters}
//                       className='w-full px-3 py-1.5 bg-gray-600 text-white border border-gray-600 rounded text-xs font-semibold hover:bg-gray-700 transition-all'
//                     >
//                       Clear Filters
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Right Side - Services Grid */}
//           <div className='flex-1'>

//             {/* Loading State */}
//             {isFetchingAll && (
//               <div className='mt-12'>
//                 <HomePageLoader />
//               </div>
//             )}

//             {/* Error State */}
//             {error && !isFetchingAll && (
//               <div className='text-center py-12'>
//                 <div className='bg-red-50 border-2 border-red-200 rounded-xl p-6 max-w-md mx-auto'>
//                   <p className='text-red-600 font-semibold'>Error loading services</p>
//                   <p className='text-gray-600 text-sm mt-2'>{error}</p>
//                   <button
//                     onClick={handleRefresh}
//                     className='mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors'
//                   >
//                     Try Again
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* No Results State */}
//             {!isFetchingAll && !error && filteredServices.length === 0 && (
//               <div className='text-center py-12'>
//                 <div className='bg-white border-2 border-black rounded-xl p-8 max-w-md mx-auto'>
//                   <HiOutlineSearch className='mx-auto mb-4 text-gray-400' size={48} />
//                   <p className='text-xl font-semibold text-black mb-2'>
//                     No services found
//                   </p>
//                   <p className='text-gray-600 text-sm'>
//                     {searchQuery || selectedCategory !== 'All' || priceSort !== 'All' || priceRange[0] !== minPrice || priceRange[1] !== maxPrice
//                       ? 'Try adjusting your search or filter criteria.'
//                       : 'No services available at the moment.'}
//                   </p>
//                   {(searchQuery || selectedCategory !== 'All' || priceSort !== 'All' || priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
//                     <button
//                       onClick={handleClearFilters}
//                       className='mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors'
//                     >
//                       Clear Filters
//                     </button>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Services Grid */}
//             {!isFetchingAll && !error && filteredServices.length > 0 && (
//               <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
//                 {filteredServices.map((service) => (
//                   <ServiceCard key={service._id} service={service} />
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Services;

import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProviders } from '../features/providerSlice';
import ServiceCard from '../components/service/ServiceCard';
import HomePageLoader from '../components/loaders/HomePageLoader';
import { HiOutlineSearch, HiOutlineRefresh } from 'react-icons/hi';

const Services = () => {
  const dispatch = useDispatch();
  const { allProviders, isFetchingAll, error } = useSelector((state) => state.provider);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceSort, setPriceSort] = useState('All'); // 'All', 'Low to High', 'High to Low'
  const [priceRange, setPriceRange] = useState([0, 100000]); // [min, max]
  const [filteredServices, setFilteredServices] = useState([]);
  const [allServices, setAllServices] = useState([]);

  // Fetch providers on component mount
  useEffect(() => {
    dispatch(getAllProviders());
  }, [dispatch]);

  // Extract all services from providers
  useEffect(() => {
    const extractedServices = [];
    allProviders.forEach(provider => {
      if (provider?.serviceOfferings && Array.isArray(provider.serviceOfferings)) {
        provider.serviceOfferings.forEach(service => {
          // Add provider info to each service
          extractedServices.push({
            ...service,
            provider: {
              ...provider,
              user: provider.user,
              _id: provider._id,
              bio: provider.bio,
              experience: provider.experience
            }
          });
        });
      }
    });
    setAllServices(extractedServices);
  }, [allProviders]);

  // Calculate min and max price from all services
  const getPriceRange = () => {
    const prices = allServices
      .map(service => service?.price)
      .filter(price => price !== undefined && price !== null && !isNaN(price))
      .map(price => typeof price === 'number' ? price : parseFloat(price));
    
    if (prices.length === 0) return [0, 100000];
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return [Math.floor(min), Math.ceil(max)];
  };

  // Calculate min and max price - memoized
  const [minPrice, maxPrice] = useMemo(() => {
    if (allServices.length > 0) {
      return getPriceRange();
    }
    return [0, 100000];
  }, [allServices]);

  // Initialize price range when services are loaded
  useEffect(() => {
    if (allServices.length > 0) {
      const [min, max] = getPriceRange();
      setPriceRange([min, max]);
    }
  }, [allServices]);

  // Filter services based on search, category, and price
  useEffect(() => {
    let filtered = [...allServices];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(service => {
        const category = service?.serviceCategory?.toLowerCase() || '';
        const description = service?.description?.toLowerCase() || '';
        const keywords = (service?.keywords || []).map(k => k?.toLowerCase()).join(' ');
        const subCategories = (service?.subCategories || []).map(s => s?.toLowerCase()).join(' ');
        const providerName = service?.provider?.user?.name?.toLowerCase() || '';
        
        const query = searchQuery.toLowerCase();
        return category.includes(query) || 
               description.includes(query) || 
               keywords.includes(query) ||
               subCategories.includes(query) ||
               providerName.includes(query);
      });
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(service => {
        return service?.serviceCategory === selectedCategory;
      });
    }

    // Apply price range filter
    filtered = filtered.filter(service => {
      const price = service?.price;
      if (price === undefined || price === null) return false;
      const numPrice = typeof price === 'number' ? price : parseFloat(price);
      if (isNaN(numPrice)) return false;
      return numPrice >= priceRange[0] && numPrice <= priceRange[1];
    });

    // Apply price sorting
    if (priceSort === 'Low to High') {
      filtered.sort((a, b) => {
        const priceA = typeof a?.price === 'number' ? a.price : parseFloat(a?.price) || 0;
        const priceB = typeof b?.price === 'number' ? b.price : parseFloat(b?.price) || 0;
        return priceA - priceB;
      });
    } else if (priceSort === 'High to Low') {
      filtered.sort((a, b) => {
        const priceA = typeof a?.price === 'number' ? a.price : parseFloat(a?.price) || 0;
        const priceB = typeof b?.price === 'number' ? b.price : parseFloat(b?.price) || 0;
        return priceB - priceA;
      });
    }

    setFilteredServices(filtered);
  }, [searchQuery, selectedCategory, priceSort, priceRange, allServices]);

  // Get unique categories from all services
  const getUniqueCategories = () => {
    const categories = new Set();
    allServices.forEach(service => {
      if (service?.serviceCategory) {
        categories.add(service.serviceCategory);
      }
    });
    return Array.from(categories).sort();
  };

  const categories = getUniqueCategories();

  const handleRefresh = () => {
    dispatch(getAllProviders());
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setPriceSort('All');
    if (allServices.length > 0) {
      const [min, max] = getPriceRange();
      setPriceRange([min, max]);
    }
  };

  const handleMinChange = (value) => {
    const numValue = parseInt(value) || minPrice;
    if (numValue < priceRange[1]) {
      setPriceRange([Math.max(minPrice, numValue), priceRange[1]]);
    }
  };

  const handleMaxChange = (value) => {
    const numValue = parseInt(value) || maxPrice;
    if (numValue > priceRange[0]) {
      setPriceRange([priceRange[0], Math.min(maxPrice, numValue)]);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 pb-16'>
      <div className='max-w-[1350px] mx-auto px-4 pt-24'>
        {/* Main Content: Filters on Left, Services on Right */}
        <div className='flex flex-col lg:flex-row gap-6'>
          {/* Left Sidebar - Everything */}
          <div className='lg:w-80 flex-shrink-0'>
            <div className='bg-white border border-gray-300 rounded-xl overflow-hidden sticky top-24 max-h-[calc(100vh-6rem)] flex flex-col'>
              {/* Fixed Top Section */}
              <div className='p-4 space-y-4 flex-shrink-0 border-b border-gray-200'>
                {/* Header */}
                <div className='mb-3'>
                  <h1 className='text-2xl font-bold text-black mb-1'>
                    All Services
                  </h1>
                  <p className='text-gray-600 text-xs leading-tight'>
                    Browse through all available services from our talented community providers. 
                    Find exactly what you need, from tutoring to baking, fitness to technology and more.
                  </p>
                </div>

                {/* Search Bar */}
                <div className='relative'>
                  <HiOutlineSearch className='absolute left-2 top-1/2 -translate-y-1/2 text-gray-400' size={16} />
                  <input
                    type='text'
                    placeholder='Search...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='w-full bg-white border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400'
                  />
                </div>
              </div>

              {/* Scrollable Filters Section */}
              <div className='p-4 space-y-4 overflow-y-auto flex-1'>
                <div>
                  <h2 className='text-base font-bold text-black mb-3'>Filters</h2>
                </div>

                {/* Category Filters */}
                <div className='space-y-2'>
                  <h3 className='text-xs font-semibold text-gray-700'>Categories</h3>
                  <div className='flex flex-wrap gap-1.5'>
                    <button
                      onClick={() => setSelectedCategory('All')}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
                        selectedCategory === 'All'
                          ? 'bg-gray-600 text-white border-gray-600'
                          : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      All
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                          selectedCategory === category
                            ? 'bg-gray-600 text-white border-gray-600'
                            : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Filter with Range Slider */}
                <div className='space-y-3'>
                  <h3 className='text-xs font-semibold text-gray-700'>Price Range</h3>
                  
                  {/* Price Sort Options */}
                  <div className='flex gap-1.5'>
                    <button
                      onClick={() => setPriceSort('All')}
                      className={`flex-1 px-2 py-1.5 rounded text-xs font-semibold transition-all border ${
                        priceSort === 'All'
                          ? 'bg-gray-600 text-white border-gray-600'
                          : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setPriceSort('Low to High')}
                      className={`flex-1 px-2 py-1.5 rounded text-xs font-semibold transition-all border ${
                        priceSort === 'Low to High'
                          ? 'bg-gray-600 text-white border-gray-600'
                          : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      Low-High
                    </button>
                    <button
                      onClick={() => setPriceSort('High to Low')}
                      className={`flex-1 px-2 py-1.5 rounded text-xs font-semibold transition-all border ${
                        priceSort === 'High to Low'
                          ? 'bg-gray-600 text-white border-gray-600'
                          : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      High-Low
                    </button>
                  </div>

                  {/* Price Range Display */}
                  <div className='text-center mb-2'>
                    <span className='text-xs font-bold text-black'>
                      ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                    </span>
                  </div>

                  {/* Dual Range Slider */}
                  <div className='relative pt-3 pb-1'>
                    <div className='relative h-2 bg-gray-200 rounded-lg'>
                      {/* Active range track */}
                      {maxPrice > minPrice && (
                        <div
                          className='absolute h-2 bg-gray-600 rounded-lg top-0 pointer-events-none'
                          style={{
                            left: `${((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                            width: `${((priceRange[1] - priceRange[0]) / (maxPrice - minPrice)) * 100}%`
                          }}
                        />
                      )}
                      
                      {/* Min range input */}
                      <input
                        type='range'
                        min={minPrice}
                        max={maxPrice}
                        value={priceRange[0]}
                        onChange={(e) => handleMinChange(e.target.value)}
                        className='absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gray-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer'
                        style={{ top: 0, zIndex: priceRange[0] > maxPrice - (maxPrice - minPrice) * 0.1 ? 5 : 3 }}
                      />
                      
                      {/* Max range input */}
                      <input
                        type='range'
                        min={minPrice}
                        max={maxPrice}
                        value={priceRange[1]}
                        onChange={(e) => handleMaxChange(e.target.value)}
                        className='absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gray-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer'
                        style={{ top: 0, zIndex: 4 }}
                      />
                    </div>
                    
                    {/* Price Range Labels */}
                    <div className='flex justify-between text-[10px] text-gray-600 mt-1'>
                      <span>₹{minPrice.toLocaleString()}</span>
                      <span>₹{maxPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Min/Max Input Fields */}
                  <div className='flex items-end gap-1.5'>
                    <div className='flex-1'>
                      <label className='block text-[10px] text-gray-600 mb-0.5'>Min</label>
                      <input
                        type='number'
                        min={minPrice}
                        max={maxPrice}
                        value={priceRange[0]}
                        onChange={(e) => handleMinChange(e.target.value)}
                        className='w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400'
                      />
                    </div>
                    <div className='flex-1'>
                      <label className='block text-[10px] text-gray-600 mb-0.5'>Max</label>
                      <input
                        type='number'
                        min={minPrice}
                        max={maxPrice}
                        value={priceRange[1]}
                        onChange={(e) => handleMaxChange(e.target.value)}
                        className='w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400'
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='space-y-1.5 pt-3 border-t border-gray-200'>
                  <button
                    onClick={handleRefresh}
                    className='w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-semibold hover:bg-gray-100 transition-all'
                  >
                    <HiOutlineRefresh size={14} />
                    Refresh
                  </button>
                  {(searchQuery || selectedCategory !== 'All' || priceSort !== 'All' || priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
                    <button
                      onClick={handleClearFilters}
                      className='w-full px-3 py-1.5 bg-gray-600 text-white border border-gray-600 rounded text-xs font-semibold hover:bg-gray-700 transition-all'
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Services Grid */}
          <div className='flex-1'>

            {/* Loading State */}
            {isFetchingAll && (
              <div className='mt-12'>
                <HomePageLoader />
              </div>
            )}

            {/* Error State */}
            {error && !isFetchingAll && (
              <div className='text-center py-12'>
                <div className='bg-red-50 border-2 border-red-200 rounded-xl p-6 max-w-md mx-auto'>
                  <p className='text-red-600 font-semibold'>Error loading services</p>
                  <p className='text-gray-600 text-sm mt-2'>{error}</p>
                  <button
                    onClick={handleRefresh}
                    className='mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors'
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* No Results State */}
            {!isFetchingAll && !error && filteredServices.length === 0 && (
              <div className='text-center py-12'>
                <div className='bg-white border-2 border-black rounded-xl p-8 max-w-md mx-auto'>
                  <HiOutlineSearch className='mx-auto mb-4 text-gray-400' size={48} />
                  <p className='text-xl font-semibold text-black mb-2'>
                    No services found
                  </p>
                  <p className='text-gray-600 text-sm'>
                    {searchQuery || selectedCategory !== 'All' || priceSort !== 'All' || priceRange[0] !== minPrice || priceRange[1] !== maxPrice
                      ? 'Try adjusting your search or filter criteria.'
                      : 'No services available at the moment.'}
                  </p>
                  {(searchQuery || selectedCategory !== 'All' || priceSort !== 'All' || priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
                    <button
                      onClick={handleClearFilters}
                      className='mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors'
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Services Grid */}
            {!isFetchingAll && !error && filteredServices.length > 0 && (
              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
                {filteredServices.map((service) => (
                  <ServiceCard key={service._id} service={service} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;