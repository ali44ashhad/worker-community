import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, TrendingUp } from 'lucide-react';
import ServiceCard from '../components/service/ServiceCard'; 
import HomePageLoader from '../components/loaders/HomePageLoader';
import { getApiBase } from '../utils/apiBase';

const API_URL = getApiBase() || 'http://localhost:3001';
axios.defaults.withCredentials = true;

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45 },
};

const TopServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API_URL}/api/service-offering/top-clicked`, {
          params: { limit: 6 },
        });
        if (!mounted) return;
        setServices(res.data?.services || []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || 'Failed to load top services');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <motion.div
      className="home-page min-h-screen bg-[var(--background-subtle)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero */}
      <section className="relative overflow-hidden pt-8 pb-14 lg:pt-10 lg:pb-16 bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(217,70,239,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(107,70,193,0.05),transparent_50%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-fuchsia-100 rounded-full mb-6">
              <TrendingUp className="w-4 h-4 text-[var(--purple-primary)]" />
              <span className="text-sm font-semibold bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent">
                Most Clicked
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-br from-[var(--text-primary)] via-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent mb-4 leading-[1.1]">
              Top Services
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              The 6 most-clicked services across the platform right now.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section className="pb-16 bg-gradient-to-b from-white to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <p className="text-sm text-[var(--text-secondary)]">
              Showing <span className="font-semibold text-[var(--purple-primary)]">{services.length}</span> services
            </p>
            <Link
              to="/service"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white rounded-2xl hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-[1.02] transition-all font-semibold"
            >
              View more
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>

          {loading && (
            <div className="mt-8">
              <HomePageLoader />
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-3xl p-8 max-w-md mx-auto">
                <p className="text-red-600 font-semibold">Error loading top services</p>
                <p className="text-[var(--text-secondary)] text-sm mt-2">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && services.length > 0 && (
            <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
              {services.slice(0, 6).map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          )}

          {!loading && !error && services.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white/80 backdrop-blur-sm border border-purple-100/50 rounded-3xl p-8 max-w-md mx-auto shadow-lg shadow-purple-500/5">
                <p className="text-xl font-semibold text-[var(--text-primary)] mb-2">No services found</p>
                <p className="text-[var(--text-secondary)] text-sm">Please check back later.</p>
              </div>
            </div>
          )}
        </div>
      </section>
 
    </motion.div>
  );
};

export default TopServices;

