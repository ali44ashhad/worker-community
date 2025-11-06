import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TopServiceCard from '../service/TopServiceCard';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
axios.defaults.withCredentials = true;

const TopServices = () => {
  const [topServices, setTopServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <section className="w-full max-w-[1350px] mx-auto px-4 py-16">
      <div className="mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-black text-center mb-3">Top Services</h2>
        <p className="text-gray-600 text-center max-w-2xl mx-auto">
          Explore a curated selection of services from our community, handpicked to get you started.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {topServices.map((service) => (
          <TopServiceCard key={service._id} service={service} />
        ))}
      </div>
    </section>
  );
}

export default TopServices