import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ChevronRight, TrendingUp } from 'lucide-react'; 
import { slugifyCategoryName } from '../utils/slug';
import HomePageLoader from '../components/loaders/HomePageLoader';
import { getApiBase } from '../utils/apiBase';
import CategoryIcon from '../components/CategoryIcon';
import { getCategoryDescription } from '../utils/categoryDisplay';

const API_URL = getApiBase() || 'http://localhost:3001';
axios.defaults.withCredentials = true;

const GRADIENTS = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-fuchsia-500',
  'from-pink-500 to-rose-500',
  'from-indigo-500 to-purple-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500',
];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45 },
};

const TopCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API_URL}/api/categories/top-clicked`, { params: { limit: 6 } });
        if (!mounted) return;
        setCategories(res.data?.categories || []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || 'Failed to load top categories');
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
            {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-fuchsia-100 rounded-full mb-6">
              <TrendingUp className="w-4 h-4 text-[var(--purple-primary)]" />
              <span className="text-sm font-semibold bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent">
                Most Clicked
              </span>
            </div> */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-br from-[var(--text-primary)] via-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent mb-4 leading-[1.1]">
              Top Categories
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              The 6 most-clicked categories based on total service clicks.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-white to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <p className="text-sm text-[var(--text-secondary)]">
             <span className="font-semibold text-[var(--purple-primary)]"> </span> 
            </p>
            <Link
              to="/category"
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
                <p className="text-red-600 font-semibold">Error loading top categories</p>
                <p className="text-[var(--text-secondary)] text-sm mt-2">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && categories.length > 0 && (
            <div className="grid items-stretch gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {categories.slice(0, 6).map((category, i) => {
                const gradient = GRADIENTS[i % GRADIENTS.length];
                const slug = slugifyCategoryName(category.name);
                const displayedKeywords = (category.keywords || []).slice(0, 4);

                return (
                  <motion.div
                    key={category._id || category.name}
                    className="h-full"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8, scale: 1.02 }}
                  >
                    <Link
                      to={`/category/${slug}`}
                      className="group relative flex h-full flex-col rounded-3xl border border-purple-100/50 bg-white/80 p-8 shadow-lg backdrop-blur-sm transition-all hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-500/10"
                    >
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-50/0 to-fuchsia-50/0 transition-all group-hover:from-purple-50/50 group-hover:to-fuchsia-50/30" />
                      <div className="relative flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-4">
                          <div
                            className={`mb-5 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg transition-all group-hover:scale-110 group-hover:rotate-3`}
                          >
                            <CategoryIcon icon={category.icon} name={category.name} className="h-8 w-8" />
                          </div>
                          
                        </div>

                        <h3 className="mb-2 line-clamp-1 min-h-[1.75rem] text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--purple-primary)] transition-colors">
                          {category.name}
                        </h3>
                        <p className="mb-4 line-clamp-2 min-h-[2.5rem] text-sm leading-snug text-[var(--text-secondary)]">
                          {getCategoryDescription(category)}
                        </p>
                        {/* <div className="mb-4 flex min-h-[3.25rem] flex-wrap content-start gap-1.5">
                          {displayedKeywords.map((keyword) => (
                            <span
                              key={keyword}
                              className="rounded-full border border-purple-100 bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-[var(--purple-primary)]"
                            >
                              {keyword}
                            </span>
                          ))}
                          {(category.keywords || []).length > 4 && (
                            <span className="rounded-full border border-fuchsia-100 bg-fuchsia-50 px-2.5 py-0.5 text-xs font-medium text-fuchsia-600">
                              +{category.keywords.length - 4}
                            </span>
                          )}
                        </div> */}
                        <div className="mt-auto flex shrink-0 items-center gap-1 text-sm font-semibold text-[var(--purple-primary)] transition-all group-hover:gap-2">
                          Explore
                          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}

          {!loading && !error && categories.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white/80 backdrop-blur-sm border border-purple-100/50 rounded-3xl p-8 max-w-md mx-auto shadow-lg shadow-purple-500/5">
                <p className="text-xl font-semibold text-[var(--text-primary)] mb-2">No categories found</p>
                <p className="text-[var(--text-secondary)] text-sm">Please check back later.</p>
              </div>
            </div>
          )}
        </div>
      </section> 
    </motion.div>
  );
};

export default TopCategories;

