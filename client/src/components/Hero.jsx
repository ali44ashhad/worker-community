import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const categories = [
    { name: "Home Cooking", icon: "cookingIcon1.png" },
    { name: "Academics", icon: "academicsIcon.png" },
    { name: "Fitness & Sports", icon: "fitnessIcon.png" },
    { name: "Dance", icon: "danceIcon.png" },
    { name: "Art & Craft", icon: "artIcon.png" },
    { name: "Groceries", icon: "groceryIcon.png" },
    { name: "Photography", icon: "photographyIcon.png" },
    { name: "Event Planner", icon: "eventPlannerIcon.png" },
    { name: "Music", icon: "musicIcon.png" },
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
      <div className="mt-26 max-w-[1350px] mx-auto px-5">


        {/* ✅ Custom Carousel */}
        <div className="mt-6 w-full relative group">
          <div className="h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg relative">
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
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? 'w-8 bg-white'
                      : 'w-2 bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

                <div className="flex flex-col gap-3">
          {/* <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Hi {user?.name || "User"},
          </h1> */}

          <p className="text-gray-600 text-[1rem] mt-6 md:text-[1.1rem] max-w-3xl">
            Welcome to{" "}
            <span className="font-semibold text-indigo-600">Commun</span> — your
            neighborhood's trusted space for connection and collaboration. You
            can explore verified services from providers around you or even
            share your own skills to help others in your community.Together, let's build a stronger, more supportive neighborhood where everyone grows and thrives.
          </p>

          {/* Buttons */}
          <div className="flex  gap-4 mt-2">
            <Link to='/service' className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg shadow-sm hover:cursor-pointer hover:bg-gray-900 transition-colors">
              Explore Services
            </Link>
            {user && user.role!=="provider" && <button className="px-6 py-2.5 border border-black text-black text-sm font-medium rounded-lg hover:bg-indigo-50 transition-colors">
              Become a Provider
            </button> } 
          </div>
        </div>
      </div>
    );
  }

  // ✅ When no user is logged in
  return (
    <div className="min-h-[calc(100vh-64px)] mt-16 bg-white flex items-center">
      <div className="max-w-[1350px] mx-auto px-4 md:px-8 w-full flex flex-col md:flex-row justify-between items-center gap-10 py-12">
        {/* Left Section */}
        <div className="md:w-[47%] px-3">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight mb-8">
            Services from your Society
          </h1>

          {/* Category Grid */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              What are you looking for?
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer text-center border border-gray-200"
                >
                  <img
                    src={category.icon}
                    alt={category.name}
                    className="h-10 w-10 mb-2"
                  />
                  <p className="text-xs sm:text-sm text-gray-700 font-medium leading-tight">
                    {category.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Avatars + Rating */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0 sm:divide-x sm:divide-gray-300 mt-8">
            <div className="flex -space-x-3 sm:pr-4">
              {[
                "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop",
                "https://randomuser.me/api/portraits/men/75.jpg",
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`user${i}`}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white hover:-translate-y-1 transition z-[i]"
                />
              ))}
            </div>

            <div className="sm:pl-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="#FACC15"
                    stroke="#FACC15"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="sm:w-[18px] sm:h-[18px]"
                  >
                    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
                  </svg>
                ))}
                <p className="text-gray-700 font-medium ml-2 text-sm sm:text-base">
                  5.0
                </p>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">
                Trusted by{" "}
                <span className="font-medium text-gray-800">100,000+</span> users
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Image Grid */}
        <div className="md:w-[48%] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 h-auto md:h-[550px]">
          <div className="relative overflow-hidden rounded-lg shadow-lg sm:row-span-2">
            <img
              src="cooking.png"
              alt="Home Cooking"
              className="w-full h-full object-cover aspect-[3/4] md:aspect-auto transform hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="relative overflow-hidden rounded-lg shadow-lg">
            <img
              src="tutor.png"
              alt="Academics"
              className="w-full h-full object-cover aspect-square transform hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="relative overflow-hidden rounded-lg shadow-lg">
            <img
              src="fitness.png"
              alt="Fitness"
              className="w-full h-full object-cover aspect-square transform hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="relative overflow-hidden rounded-lg shadow-lg sm:col-span-2">
            <img
              src="art.png"
              alt="Art & Craft"
              className="w-full h-full object-cover aspect-[5/3] md:aspect-auto transform hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
