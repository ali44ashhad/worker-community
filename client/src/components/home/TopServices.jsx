import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import TopServiceCard from '../service/TopServiceCard';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
axios.defaults.withCredentials = true;

const TopServices = () => {
  const [topServices, setTopServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const fetchTopServices = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${API_URL}/api/comments/top-services?limit=6`);
        if (res.data.success) {
          // Transform services to match the expected format with provider info
          const transformedServices = res.data.services.map(service => ({
            ...service,
            provider: {
              ...service.provider,
              user: service.provider?.user || {}
            }
          }));
          setTopServices(transformedServices);
        }
      } catch (error) {
        console.error('Failed to fetch top services:', error);
        setTopServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopServices();
  }, []);

  if (isLoading) {
    return (
      <section className="w-full max-w-[1350px] mx-auto px-4 py-16">
        <div className="text-center">
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4'></div>
          <p className='text-xl font-semibold'>Loading services...</p>
        </div>
      </section>
    );
  }

  if (topServices.length === 0) return null;

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full max-w-[1350px] mx-auto px-4 py-16">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-4xl md:text-5xl font-bold text-black mb-3">Top Services</h2>
        <div className="flex items-start justify-between gap-4">
          <p className="text-gray-600 max-w-2xl flex-1">
            Explore a curated selection of services from our community, handpicked to get you started.
          </p>
          
          {/* Carousel Navigation Buttons - Top Right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={scrollLeft}
              className="w-10 h-10 rounded-full border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center transition-all shadow-sm hover:shadow-md"
              aria-label="Scroll left"
            >
              <HiChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <button
              onClick={scrollRight}
              className="w-10 h-10 rounded-full border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center transition-all shadow-sm hover:shadow-md"
              aria-label="Scroll right"
            >
              <HiChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Services Container */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-8 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {topServices.map((service) => (
          <div key={service._id} className="flex-shrink-0 w-full sm:w-80 lg:w-96">
            <TopServiceCard service={service} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default TopServices