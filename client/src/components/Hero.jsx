import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const categories = [
    { name: "Home Cooking", icon: "cookingIcon1.png" , url:"/category/Home%20Cooking" },
    { name: "Academics", icon: "academicsIcon.png" , url:"/category/Academics" },
    { name: "Fitness & Sports", icon: "fitnessIcon.png" , url : "category/Fitness%20%26%20Sports" },
    { name: "Dance", icon: "danceIcon.png" , url:"/category/Dance" },
    { name: "Art & Craft", icon: "artIcon.png" , url:"/category/Art%20%26%20Craft" },
    { name: "Groceries", icon: "groceryIcon.png" , url:"category/Groceries" },
    { name: "Photography", icon: "photographyIcon.png" , url:"category/Photography" },
    { name: "Event Planner", icon: "eventPlannerIcon.png" , url:"category/Event%20/Planner" },
    { name: "Music", icon: "musicIcon.png" , url:"/category/Music" },
  ];

  const carouselImages = [
    "cooking.png",
    "fitness.png",
    "tutor.png",
    "art.png"
  ];

  const user = useSelector((state) => state.auth.user);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, carouselImages.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    setIsAutoPlaying(false);
  };

  // ✅ User logged in
  if (user) {
    return (
      <motion.div 
        className="mt-28 max-w-[1350px] mx-auto px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* ✅ Custom Carousel */}
        <motion.div 
          className="mt-8 w-full relative group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl relative border border-gray-100">
            {/* Carousel Images */}
            <div className="h-full relative">
              {carouselImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Slide ${index + 1}`}
                  className={`absolute inset-0 object-cover w-full h-full transition-opacity duration-700 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <motion.button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 p-2.5 rounded-full shadow-xl transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous slide"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>

            <motion.button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 p-2.5 rounded-full shadow-xl transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next slide"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {carouselImages.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? 'bg-white w-8'
                      : 'w-2 bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="flex flex-col gap-4 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-gray-600 text-base md:text-lg max-w-3xl leading-relaxed">
            Welcome to{" "}
            <span className="font-semibold text-gray-900">Commun</span> — your
            neighborhood's trusted space for connection and collaboration. You
            can explore verified services from providers around you or even
            share your own skills to help others in your community. Together, let's build a stronger, more supportive neighborhood where everyone grows and thrives.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 mt-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to='/service' 
                className="px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl shadow-lg hover:bg-gray-800 transition-all duration-300"
              >
                Explore Services
              </Link>
            </motion.div>
            {user && user.role==="customer" && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to='/become-provider' 
                  className="px-6 py-3 border-2 border-gray-200 text-gray-900 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300"
                >
                  Become a Provider
                </Link>
              </motion.div>
            )} 
            {user && user.role==="admin" && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to='/admin' 
                  className="px-6 py-3 border-2 border-gray-200 text-gray-900 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300"
                >
                  Admin Dashboard
                </Link>
              </motion.div>
            )} 
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // ✅ When no user is logged in
  return (
    <div className="min-h-[calc(100vh-80px)] mt-20 bg-white flex items-center">
      <div className="max-w-[1350px] mx-auto px-6 md:px-8 w-full flex flex-col md:flex-row justify-between items-center gap-12 py-16">
        {/* Left Section */}
        <motion.div 
          className="md:w-[47%]"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-8 tracking-tight">
            Services from your Society
          </h1>

          {/* Category Grid */}
          <motion.div 
            className="bg-gray-50 p-6 rounded-2xl shadow-lg border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              What are you looking for?
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={`${category.url}`}
                    className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer text-center border border-gray-200 hover:border-gray-300"
                  >
                    <img
                      src={category.icon}
                      alt={category.name}
                      className="h-10 w-10 mb-2"
                    />
                    <p className="text-xs sm:text-sm text-gray-700 font-medium leading-tight">
                      {category.name}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Avatars + Rating */}
          <motion.div 
            className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0 sm:divide-x sm:divide-gray-200 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex -space-x-3 sm:pr-6">
              {[
                "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop",
                "https://randomuser.me/api/portraits/men/75.jpg",
              ].map((src, i) => (
                <motion.img
                  key={i}
                  src={src}
                  alt={`user${i}`}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-3 border-white shadow-md"
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                  transition={{ duration: 0.2 }}
                />
              ))}
            </div>

            <div className="sm:pl-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="#FACC15"
                    stroke="#FACC15"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
                  </svg>
                ))}
                <p className="text-gray-900 font-semibold ml-2 text-base">
                  5.0
                </p>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Trusted by{" "}
                <span className="font-semibold text-gray-900">100,000+</span> users
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Section: Image Grid */}
        <motion.div 
          className="md:w-[48%] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 h-auto md:h-[550px]"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.div 
            className="relative overflow-hidden rounded-2xl shadow-xl sm:row-span-2 border border-gray-100"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src="cooking.png"
              alt="Home Cooking"
              className="w-full h-full object-cover aspect-[3/4] md:aspect-auto"
            />
          </motion.div>

          <motion.div 
            className="relative overflow-hidden rounded-2xl shadow-xl border border-gray-100"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src="tutor.png"
              alt="Academics"
              className="w-full h-full object-cover aspect-square"
            />
          </motion.div>

          <motion.div 
            className="relative overflow-hidden rounded-2xl shadow-xl border border-gray-100"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src="fitness.png"
              alt="Fitness"
              className="w-full h-full object-cover aspect-square"
            />
          </motion.div>

          <motion.div 
            className="relative overflow-hidden rounded-2xl shadow-xl sm:col-span-2 border border-gray-100"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src="art.png"
              alt="Art & Craft"
              className="w-full h-full object-cover aspect-[5/3] md:aspect-auto"
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
