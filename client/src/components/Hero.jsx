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
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

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

  // Preload critical images and images likely to be seen soon
  useEffect(() => {
    // Preload all carousel images (they're likely to be seen)
    carouselImages.forEach((slide, idx) => {
      const img = new Image();
      img.src = slide.src;
      // Set priority for first image
      if (idx === 0) {
        img.fetchPriority = 'high';
      }
    });
    
    // Preload all category icons (they're in a horizontal scroll, likely to be seen)
    categories.forEach(cat => {
      const img = new Image();
      img.src = cat.icon;
    });
  }, []);

  const user = useSelector((state) => state.auth.user);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    const id = setInterval(() => setCurrentSlide((s) => (s + 1) % carouselImages.length), 4500);
    return () => clearInterval(id);
  }, [isAutoPlaying, carouselImages.length]);

  // Handle user scroll detection
  useEffect(() => {
    if (!categoryScrollRef.current) return;
    
    const container = categoryScrollRef.current;
    
    const handleScroll = () => {
      isUserScrollingRef.current = true;
      setIsCategoryAutoPlaying(false);
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Resume auto-scroll after user stops scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        isUserScrollingRef.current = false;
        setIsCategoryAutoPlaying(true);
      }, 3000); // Resume after 3 seconds of no scrolling
    };
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    container.addEventListener('touchstart', handleScroll, { passive: true });
    container.addEventListener('touchmove', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('touchstart', handleScroll);
      container.removeEventListener('touchmove', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Auto-scroll category grid
  useEffect(() => {
    if (!isCategoryAutoPlaying || !categoryScrollRef.current || isUserScrollingRef.current) return;
    
    const id = setInterval(() => {
      if (!categoryScrollRef.current || isUserScrollingRef.current) return;
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
          <motion.div 
            initial={{ opacity: 0, x: -16 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6 }}
            style={{ willChange: 'auto' }}
          >
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
              style={{ willChange: 'auto' }}
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
                  style={{
                    WebkitOverflowScrolling: 'touch',
                    transform: 'translateZ(0)',
                    WebkitTransform: 'translateZ(0)',
                    willChange: 'scroll-position'
                  }}
                >
                  {categories.map((cat, idx) => (
                    <Link
                      key={idx}
                      to={cat.url}
                      className="category-item flex-shrink-0 flex flex-col items-center justify-center gap-2 p-3 rounded-xl text-center border border-gray-100 bg-white shadow-sm hover:shadow-md transition focus-visible:ring-2 focus-visible:ring-gray-200 w-28 sm:w-32"
                    >
                      <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center ring-1 ring-gray-100 overflow-hidden">
                        <img 
                          src={cat.icon} 
                          alt={cat.name} 
                          className="max-h-7 max-w-7 object-contain" 
                          loading={idx < 4 ? "eager" : "lazy"}
                          fetchPriority={idx < 4 ? "high" : "auto"}
                          decoding="async"
                          width="28"
                          height="28"
                          style={{
                            contentVisibility: 'auto',
                            transform: 'translateZ(0)',
                            WebkitTransform: 'translateZ(0)',
                            willChange: 'auto'
                          }}
                          onLoad={(e) => {
                            // Prevent layout shift
                            e.currentTarget.style.opacity = '1';
                          }}
                        />
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
            style={{ willChange: 'auto' }}
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
                        loading={idx === 0 ? "eager" : "lazy"}
                        fetchPriority={idx === 0 ? "high" : "auto"}
                        decoding="async"
                        width="800"
                        height="600"
                        className="absolute inset-0 w-full h-full object-cover object-center"
                        style={{
                          contentVisibility: 'auto',
                          transform: 'translateZ(0)',
                          WebkitTransform: 'translateZ(0)',
                          willChange: 'auto'
                        }}
                        onLoad={(e) => {
                          // Prevent layout shift
                          const img = e.currentTarget;
                          img.style.opacity = '1';
                          img.setAttribute('data-loaded', 'true');
                          img.removeAttribute('data-loading');
                        }}
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
                    <img 
                      src={s.src} 
                      alt={s.title} 
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      width="200"
                      height="150"
                      className="w-full h-full object-cover object-center"
                      style={{
                        contentVisibility: 'auto',
                        transform: 'translateZ(0)',
                        WebkitTransform: 'translateZ(0)',
                        willChange: 'auto'
                      }}
                      onLoad={(e) => {
                        // Prevent layout shift
                        e.currentTarget.style.opacity = '1';
                      }}
                    />
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