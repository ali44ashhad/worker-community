// import React, { useState, useEffect } from "react";
// import { useSelector } from "react-redux";
// import { Link } from "react-router-dom";
// import { motion } from "framer-motion";

// const Hero = () => {
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [isAutoPlaying, setIsAutoPlaying] = useState(true);

//   const categories = [
//     { name: "Home Cooking", icon: "cookingIcon1.png" , url:"/category/Home%20Cooking" },
//     { name: "Academics", icon: "academicsIcon.png" , url:"/category/Academics" },
//     { name: "Fitness & Sports", icon: "fitnessIcon.png" , url : "category/Fitness%20%26%20Sports" },
//     { name: "Dance", icon: "danceIcon.png" , url:"/category/Dance" },
//     { name: "Art & Craft", icon: "artIcon.png" , url:"/category/Art%20%26%20Craft" },
//     { name: "Groceries", icon: "groceryIcon.png" , url:"category/Groceries" },
//     { name: "Photography", icon: "photographyIcon.png" , url:"category/Photography" },
//     { name: "Event Planner", icon: "eventPlannerIcon.png" , url:"category/Event%20/Planner" },
//     { name: "Music", icon: "musicIcon.png" , url:"/category/Music" },
//   ];

//   const carouselImages = [
//     "cooking.png",
//     "fitness.png",
//     "tutor.png",
//     "art.png"
//   ];

//   const user = useSelector((state) => state.auth.user);

//   // Auto-play carousel
//   useEffect(() => {
//     if (!isAutoPlaying) return;

//     const interval = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
//     }, 4000);

//     return () => clearInterval(interval);
//   }, [isAutoPlaying, carouselImages.length]);

//   const goToSlide = (index) => {
//     setCurrentSlide(index);
//   };

//   const goToPrevious = () => {
//     setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
//     setIsAutoPlaying(false);
//   };

//   const goToNext = () => {
//     setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
//     setIsAutoPlaying(false);
//   };

//   // ✅ User logged in
//   if (user) {
//     return (
//       <motion.div 
//         className="mt-28 max-w-[1350px] mx-auto px-6"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.5 }}
//       >
//         {/* ✅ Custom Carousel */}
//         <motion.div 
//           className="mt-8 w-full relative group"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.2 }}
//         >
//           <div className="h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl relative border border-gray-100">
//             {/* Carousel Images */}
//             <div className="h-full relative">
//               {carouselImages.map((img, index) => (
//                 <img
//                   key={index}
//                   src={img}
//                   alt={`Slide ${index + 1}`}
//                   className={`absolute inset-0 object-cover w-full h-full transition-opacity duration-700 ${
//                     index === currentSlide ? 'opacity-100' : 'opacity-0'
//                   }`}
//                 />
//               ))}
//             </div>

//             {/* Navigation Buttons */}
//             <motion.button
//               onClick={goToPrevious}
//               className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 p-2.5 rounded-full shadow-xl transition-all opacity-0 group-hover:opacity-100"
//               aria-label="Previous slide"
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.9 }}
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//               </svg>
//             </motion.button>

//             <motion.button
//               onClick={goToNext}
//               className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 p-2.5 rounded-full shadow-xl transition-all opacity-0 group-hover:opacity-100"
//               aria-label="Next slide"
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.9 }}
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//               </svg>
//             </motion.button>

//             {/* Indicators */}
//             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
//               {carouselImages.map((_, index) => (
//                 <motion.button
//                   key={index}
//                   onClick={() => goToSlide(index)}
//                   className={`h-2 rounded-full transition-all ${
//                     index === currentSlide
//                       ? 'bg-white w-8'
//                       : 'w-2 bg-white/50 hover:bg-white/75'
//                   }`}
//                   aria-label={`Go to slide ${index + 1}`}
//                   whileHover={{ scale: 1.2 }}
//                   whileTap={{ scale: 0.9 }}
//                 />
//               ))}
//             </div>
//           </div>
//         </motion.div>

//         <motion.div 
//           className="flex flex-col gap-4 mt-8"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.4 }}
//         >
//           <p className="text-gray-600 text-base md:text-lg max-w-3xl leading-relaxed">
//             Welcome to{" "}
//             <span className="font-semibold text-gray-900">Commun</span> — your
//             neighborhood's trusted space for connection and collaboration. You
//             can explore verified services from providers around you or even
//             share your own skills to help others in your community. Together, let's build a stronger, more supportive neighborhood where everyone grows and thrives.
//           </p>

//           {/* Buttons */}
//           <div className="flex flex-wrap gap-4 mt-4">
//             <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//               <Link 
//                 to='/service' 
//                 className="px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl shadow-lg hover:bg-gray-800 transition-all duration-300"
//               >
//                 Explore Services
//               </Link>
//             </motion.div>
//             {user && user.role==="customer" && (
//               <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                 <Link 
//                   to='/become-provider' 
//                   className="px-6 py-3 border-2 border-gray-200 text-gray-900 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300"
//                 >
//                   Become a Provider
//                 </Link>
//               </motion.div>
//             )} 
//             {user && user.role==="admin" && (
//               <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                 <Link 
//                   to='/admin' 
//                   className="px-6 py-3 border-2 border-gray-200 text-gray-900 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300"
//                 >
//                   Admin Dashboard
//                 </Link>
//               </motion.div>
//             )} 
//           </div>
//         </motion.div>
//       </motion.div>
//     );
//   }

//   // ✅ When no user is logged in
//   return (
//     <div className="min-h-[calc(100vh-80px)] mt-20 bg-white flex items-center">
//       <div className="max-w-[1350px] mx-auto px-6 md:px-8 w-full flex flex-col md:flex-row justify-between items-center gap-12 py-16">
//         {/* Left Section */}
//         <motion.div 
//           className="md:w-[47%]"
//           initial={{ opacity: 0, x: -30 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.6 }}
//         >
//           <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-8 tracking-tight">
//             Services from your Society
//           </h1>

//           {/* Category Grid */}
//           <motion.div 
//             className="bg-gray-50 p-6 rounded-2xl shadow-lg border border-gray-100"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6, delay: 0.2 }}
//           >
//             <h2 className="text-lg font-semibold text-gray-900 mb-6">
//               What are you looking for?
//             </h2>

//             <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//               {categories.map((category, index) => (
//                 <motion.div
//                   key={index}
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                 >
//                   <Link
//                     to={`${category.url}`}
//                     className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer text-center border border-gray-200 hover:border-gray-300"
//                   >
//                     <img
//                       src={category.icon}
//                       alt={category.name}
//                       className="h-10 w-10 mb-2"
//                     />
//                     <p className="text-xs sm:text-sm text-gray-700 font-medium leading-tight">
//                       {category.name}
//                     </p>
//                   </Link>
//                 </motion.div>
//               ))}
//             </div>
//           </motion.div>

//           {/* Avatars + Rating */}
//           <motion.div 
//             className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0 sm:divide-x sm:divide-gray-200 mt-8"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6, delay: 0.5 }}
//           >
//             <div className="flex -space-x-3 sm:pr-6">
//               {[
//                 "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
//                 "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
//                 "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop",
//                 "https://randomuser.me/api/portraits/men/75.jpg",
//               ].map((src, i) => (
//                 <motion.img
//                   key={i}
//                   src={src}
//                   alt={`user${i}`}
//                   className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-3 border-white shadow-md"
//                   whileHover={{ scale: 1.1, zIndex: 10 }}
//                   transition={{ duration: 0.2 }}
//                 />
//               ))}
//             </div>

//             <div className="sm:pl-6">
//               <div className="flex items-center">
//                 {[...Array(5)].map((_, i) => (
//                   <svg
//                     key={i}
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="18"
//                     height="18"
//                     viewBox="0 0 24 24"
//                     fill="#FACC15"
//                     stroke="#FACC15"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
//                   </svg>
//                 ))}
//                 <p className="text-gray-900 font-semibold ml-2 text-base">
//                   5.0
//                 </p>
//               </div>
//               <p className="text-sm text-gray-600 mt-1">
//                 Trusted by{" "}
//                 <span className="font-semibold text-gray-900">100,000+</span> users
//               </p>
//             </div>
//           </motion.div>
//         </motion.div>

//         {/* Right Section: Image Grid */}
//         <motion.div 
//           className="md:w-[48%] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 h-auto md:h-[550px]"
//           initial={{ opacity: 0, x: 30 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.6, delay: 0.3 }}
//         >
//           <motion.div 
//             className="relative overflow-hidden rounded-2xl shadow-xl sm:row-span-2 border border-gray-100"
//             whileHover={{ scale: 1.02 }}
//             transition={{ duration: 0.3 }}
//           >
//             <img
//               src="cooking.png"
//               alt="Home Cooking"
//               className="w-full h-full object-cover aspect-[3/4] md:aspect-auto"
//             />
//           </motion.div>

//           <motion.div 
//             className="relative overflow-hidden rounded-2xl shadow-xl border border-gray-100"
//             whileHover={{ scale: 1.02 }}
//             transition={{ duration: 0.3 }}
//           >
//             <img
//               src="tutor.png"
//               alt="Academics"
//               className="w-full h-full object-cover aspect-square"
//             />
//           </motion.div>

//           <motion.div 
//             className="relative overflow-hidden rounded-2xl shadow-xl border border-gray-100"
//             whileHover={{ scale: 1.02 }}
//             transition={{ duration: 0.3 }}
//           >
//             <img
//               src="fitness.png"
//               alt="Fitness"
//               className="w-full h-full object-cover aspect-square"
//             />
//           </motion.div>

//           <motion.div 
//             className="relative overflow-hidden rounded-2xl shadow-xl sm:col-span-2 border border-gray-100"
//             whileHover={{ scale: 1.02 }}
//             transition={{ duration: 0.3 }}
//           >
//             <img
//               src="art.png"
//               alt="Art & Craft"
//               className="w-full h-full object-cover aspect-[5/3] md:aspect-auto"
//             />
//           </motion.div>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default Hero;

import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
 

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef(null);
  const [categoryScrollIndex, setCategoryScrollIndex] = useState(0);
  const [isCategoryAutoPlaying, setIsCategoryAutoPlaying] = useState(true);
  const categoryScrollRef = useRef(null);

  const categories = [
    { name: "Home Cooking", icon: "cookingIcon1.png", url: "/category/Home%20Cooking" },
    { name: "Academics", icon: "academicsIcon.png", url: "/category/Academics" },
    { name: "Fitness & Sports", icon: "fitnessIcon.png", url: "/category/Fitness%20%26%20Sports" },
    { name: "Dance", icon: "danceIcon.png", url: "/category/Dance" },
    { name: "Art & Craft", icon: "artIcon.png", url: "/category/Art%20%26%20Craft" },
    { name: "Groceries", icon: "groceryIcon.png", url: "/category/Groceries" },
    { name: "Photography", icon: "photographyIcon.png", url: "/category/Photography" },
    { name: "Event Planner", icon: "eventPlannerIcon.png", url: "/category/Event%20%2F%20Planner" },
    { name: "Music", icon: "musicIcon.png", url: "/category/Music" },
  ];

  const carouselImages = [
    { src: "cooking.png", title: "Delicious Home Cooking", subtitle: "Find trusted home cooks nearby" },
    { src: "fitness.png", title: "Fitness & Trainers", subtitle: "Personal trainers and group classes" },
    { src: "tutor.png", title: "Personal Tutors", subtitle: "Academics, languages & exam prep" },
    { src: "art.png", title: "Art & Craft", subtitle: "Creative classes and workshops" },
  ];

  const user = useSelector((state) => state.auth.user);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    const id = setInterval(() => setCurrentSlide((s) => (s + 1) % carouselImages.length), 4500);
    return () => clearInterval(id);
  }, [isAutoPlaying, carouselImages.length]);

  // Auto-scroll category grid
  useEffect(() => {
    if (!isCategoryAutoPlaying || !categoryScrollRef.current) return;
    
    const id = setInterval(() => {
      if (!categoryScrollRef.current) return;
      const container = categoryScrollRef.current;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      const maxScroll = scrollWidth - clientWidth;
      
      if (maxScroll <= 0) return;
      
      const scrollAmount = 150; // Reduced scroll amount for slower movement
      const currentScroll = container.scrollLeft;
      const nextScroll = currentScroll + scrollAmount;
      
      if (nextScroll >= maxScroll - 10) {
        // Reset to start when near the end
        container.scrollTo({ left: 0, behavior: 'smooth' });
        setCategoryScrollIndex(0);
      } else {
        container.scrollTo({ left: nextScroll, behavior: 'smooth' });
        setCategoryScrollIndex((prev) => prev + 1);
      }
    }, 5000); // Increased interval for slower auto-scroll
    
    return () => clearInterval(id);
  }, [isCategoryAutoPlaying, categories.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };
  const goNext = () => {
    setCurrentSlide((s) => (s + 1) % carouselImages.length);
    setIsAutoPlaying(false);
  };
  const goPrev = () => {
    setCurrentSlide((s) => (s - 1 + carouselImages.length) % carouselImages.length);
    setIsAutoPlaying(false);
  };

  const scrollCategoryNext = () => {
    if (!categoryScrollRef.current) return;
    const container = categoryScrollRef.current;
    const scrollAmount = 170; // Reduced for slower movement
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const maxScroll = scrollWidth - clientWidth;
    
    const nextScroll = container.scrollLeft + scrollAmount;
    if (nextScroll >= maxScroll - 10) {
      container.scrollTo({ left: 0, behavior: 'smooth' });
      setCategoryScrollIndex(0);
    } else {
      container.scrollTo({ left: nextScroll, behavior: 'smooth' });
      setCategoryScrollIndex((prev) => prev + 1);
    }
    setIsCategoryAutoPlaying(false);
  };

  const scrollCategoryPrev = () => {
    if (!categoryScrollRef.current) return;
    const container = categoryScrollRef.current;
    const scrollAmount = 150; // Reduced for slower movement
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const maxScroll = scrollWidth - clientWidth;
    
    const prevScroll = container.scrollLeft - scrollAmount;
    if (prevScroll <= 0) {
      container.scrollTo({ left: maxScroll, behavior: 'smooth' });
      setCategoryScrollIndex(Math.floor(maxScroll / scrollAmount));
    } else {
      container.scrollTo({ left: prevScroll, behavior: 'smooth' });
      setCategoryScrollIndex((prev) => Math.max(0, prev - 1));
    }
    setIsCategoryAutoPlaying(false);
  };

  // Pause autoplay when user hovers (desktop)
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  return (
    <section className="mt-28 w-full relative">
      {/* Minimal glass decorative blobs for subtle color — low opacity */}
      <div className="pointer-events-none absolute -top-12 -left-10 w-80 h-80 rounded-full blur-3xl bg-gradient-to-br from-indigo-50 via-pink-50 to-purple-50 opacity-40 transform -rotate-12" />
      <div className="pointer-events-none absolute -bottom-12 -right-6 w-64 h-64 rounded-full blur-2xl bg-gradient-to-br from-pink-50 via-indigo-50 to-yellow-50 opacity-30 transform rotate-6" />

      <div className="max-w-[1370px] mx-auto px-6 md:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* LEFT: Headline + Categories */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Services from <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">your society</span>
            </h1>

            <p className="mt-6 text-gray-700 max-w-xl text-lg">
              Discover trusted local providers — from home cooks and tutors to fitness trainers and event planners. Connect, book and support neighbours who make life easier.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/service"
                className="inline-flex items-center px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-500 text-white font-semibold shadow-sm hover:shadow-lg transform transition"
              >
                Explore Services
              </Link>

              {!user ? (
                <Link to="/login" className="inline-flex items-center px-5 py-3 border border-gray-200 rounded-2xl text-gray-800 hover:bg-gray-50 transition">
                  Login
                </Link>
              ) :" "
              //  (
              //   <Link to={`/update-profile/${user._id}`} className="inline-flex items-center px-5 py-3 border border-gray-200 rounded-2xl text-gray-800 hover:bg-gray-50 transition">
              //     My Profile
              //   </Link>
              // )
              }
            </div>

            {/* Category grid compact - single row carousel with auto-scroll */}
            
            <motion.div 
              className="mt-6 relative group"
              onMouseEnter={() => setIsCategoryAutoPlaying(false)}
              onMouseLeave={() => setIsCategoryAutoPlaying(true)}
            >
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Quick categories</h3>
              <div className="relative">
                {/* Navigation Buttons */}
                <button
                  onClick={scrollCategoryPrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all hover:scale-110 -translate-x-2"
                  aria-label="Previous categories"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={scrollCategoryNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all hover:scale-110 translate-x-2"
                  aria-label="Next categories"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Single row scrolling container */}
                <div 
                  ref={categoryScrollRef}
                  className="flex gap-3 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                  {categories.map((cat, idx) => (
                    <Link
                      key={idx}
                      to={cat.url}
                      className="category-item flex-shrink-0 flex flex-col items-center justify-center gap-2 p-3 rounded-xl text-center border border-gray-100 bg-white shadow-sm hover:shadow-md transition focus-visible:ring-2 focus-visible:ring-gray-200 w-28 sm:w-32"
                    >
                      <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center ring-1 ring-gray-100 overflow-hidden">
                        <img src={cat.icon} alt={cat.name} className="max-h-7 max-w-7 object-contain" loading="lazy" />
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 font-medium leading-tight whitespace-normal break-words">
                        {cat.name}
                      </p>
                    </Link>
                  ))}
                  <Link
                    to="/category"
                    className="flex-shrink-0 flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-gray-300 text-xs sm:text-sm text-gray-600 hover:bg-gray-50 transition w-28 sm:w-32"
                  >
                    View all
                  </Link>
                </div>
              </div>
            </motion.div>
           

            {/* Trust row */}
            {/* <div className="mt-6 flex items-center gap-4">
              <div className="flex -space-x-2 sm:-space-x-3">
                {["testimonial1.png", "testimonial2.jpg", "testimonial3.jpg", "testimonial4.jpg"].map((src, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-white shadow-sm overflow-hidden bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${src})`,
                      backgroundSize: 'cover',
                      // backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center'
                    }}
                    role="img"
                    aria-label={`User ${i + 1}`}
                  />
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Trusted by <span className="font-bold">100,000+</span> neighbours</p>
                <p className="text-xs text-gray-500">Highly rated providers across cities</p>
              </div>
            </div> */}
          </motion.div>

          {/* RIGHT: Carousel + images */}
          <motion.div
            ref={carouselRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm">
              <div className="relative w-full bg-gray-50 overflow-hidden aspect-[4/3] md:aspect-[16/9]">
                <AnimatePresence mode="wait">
                  {carouselImages.map((slide, idx) => (
                    idx === currentSlide && (
                      <motion.img
                        key={slide.src}
                        src={slide.src}
                        alt={slide.title}
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 w-full h-full object-cover object-center"
                      />
                    )
                  ))}
                </AnimatePresence>

                {/* overlay text */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/20 to-transparent">
                  <div className="text-white">
                    <h3 className="text-xl md:text-2xl font-semibold drop-shadow">{carouselImages[currentSlide].title}</h3>
                    <p className="text-sm md:text-base mt-1 drop-shadow">{carouselImages[currentSlide].subtitle}</p>
                  </div>
                </div>

                {/* controls */}
                {/* <button onClick={goPrev} aria-label="Prev" className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 rounded-full p-2 shadow-md hover:scale-105 transition hidden md:flex">
                  <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <button onClick={goNext} aria-label="Next" className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 rounded-full p-2 shadow-md hover:scale-105 transition hidden md:flex">
                  <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                </button> */}

                {/* small indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {carouselImages.map((_, i) => (
                    <button key={i} onClick={() => goToSlide(i)} className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-indigo-600' : 'w-2 bg-white/60'}`} aria-label={`Go to slide ${i+1}`}></button>
                  ))}
                </div>
              </div>

              {/* Thumbnail grid */}
              <div className="p-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {carouselImages.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={`rounded-lg overflow-hidden border ${i === currentSlide ? 'ring-1 ring-indigo-300' : 'border-transparent'} shadow-sm aspect-[4/3]`}
                  >
                    <img src={s.src} alt={s.title} className="w-full h-full object-cover object-center" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;