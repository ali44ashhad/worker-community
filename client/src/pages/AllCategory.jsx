import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getActiveCategories } from '../features/adminSlice';
import { slugifyCategoryName } from '../utils/slug';
import CategoryIcon from '../components/CategoryIcon';
import { getCategoryDescription } from '../utils/categoryDisplay';

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

const AllCategory = () => {
  const dispatch = useDispatch();
  const { activeCategories } = useSelector((state) => state.admin);

  useEffect(() => {
    if (!activeCategories?.length) {
      dispatch(getActiveCategories());
    }
  }, [dispatch, activeCategories?.length]);

  return (
    <motion.div
      className="home-page min-h-screen bg-[var(--background-subtle)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-16 lg:pt-32 lg:pb-20 bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(217,70,239,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(107,70,193,0.05),transparent_50%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-fuchsia-100 rounded-full mb-6">
              <span className="text-sm font-semibold bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent">
                Explore Local Services
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-br from-[var(--text-primary)] via-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent mb-6 leading-[1.1]">
              All Categories
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              Explore all available service categories. Each category offers specialized services
              from talented community providers in your neighbourhood.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories grid */}
      <section className="py-16 bg-gradient-to-b from-white to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!activeCategories?.length ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--purple-primary)] mx-auto mb-4" />
              <p className="text-lg font-semibold text-[var(--text-secondary)]">Loading categories...</p>
            </div>
          ) : (
            <div className="grid items-stretch gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {activeCategories.map((category, i) => {
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
                        <div
                          className={`mb-5 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg transition-all group-hover:scale-110 group-hover:rotate-3`}
                        >
                          <CategoryIcon icon={category.icon} name={category.name} className="h-8 w-8" />
                        </div>
                        <h3 className="mb-2 line-clamp-1 min-h-[1.75rem] text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--purple-primary)] transition-colors">
                          {category.name}
                        </h3>
                        <p className="mb-4 line-clamp-2 min-h-[2.5rem] text-sm leading-snug text-[var(--text-secondary)]">
                          {getCategoryDescription(category)}
                        </p>
                        <div className="mb-4 flex min-h-[3.25rem] flex-wrap content-start gap-1.5">
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
                        </div>
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
        </div>
      </section>

      {/* Footer hint */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="max-w-2xl mx-auto text-center">
            <div className="bg-white/80 backdrop-blur-sm border border-purple-100/50 rounded-3xl p-6 sm:p-8 shadow-lg shadow-purple-500/5">
              <p className="text-[var(--text-secondary)] text-sm sm:text-base">
                Can&apos;t find what you&apos;re looking for? Try browsing{' '}
                <Link to="/service" className="text-[var(--purple-primary)] font-semibold hover:underline">
                  all services
                </Link>{' '}
                or{' '}
                <Link to="/provider" className="text-[var(--purple-primary)] font-semibold hover:underline">
                  providers
                </Link>
                .
              </p>
            </div>
          </motion.div>
        </div>
      </section>
 
    </motion.div>
  );
};

export default AllCategory;
