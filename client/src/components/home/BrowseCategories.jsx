import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getActiveCategories } from '../../features/adminSlice';
import { slugifyCategoryName } from '../../utils/slug';

const GRADIENTS = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-fuchsia-500',
  'from-pink-500 to-rose-500',
  'from-indigo-500 to-purple-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500',
];

const DISPLAY_LIMIT = 6;

const getCategoryDescription = (category) => {
  if (category.description?.trim()) return category.description;
  if (category.subCategories?.length) {
    return category.subCategories.slice(0, 4).join(', ');
  }
  if (category.keywords?.length) {
    return category.keywords.slice(0, 4).join(', ');
  }
  return 'Explore services in this category';
};

const BrowseCategories = () => {
  const dispatch = useDispatch();
  const { activeCategories } = useSelector((state) => state.admin);

  useEffect(() => {
    if (!activeCategories?.length) {
      dispatch(getActiveCategories());
    }
  }, [dispatch, activeCategories?.length]);

  if (!activeCategories?.length) {
    return (
      <section id="categories" className="py-24 bg-gradient-to-b from-white to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--purple-primary)] mx-auto mb-4" />
          <p className="text-lg font-semibold text-[var(--text-secondary)]">Loading categories...</p>
        </div>
      </section>
    );
  }

  const displayedCategories = activeCategories.slice(0, DISPLAY_LIMIT);
  const hasMoreCategories = activeCategories.length > DISPLAY_LIMIT;

  return (
    <section id="categories" className="py-24 bg-gradient-to-b from-white to-purple-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[var(--text-primary)] to-[var(--purple-primary)] bg-clip-text text-transparent mb-4">
            Browse Categories
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            From everyday needs to special occasions, find the right local expert.
          </p>
        </div>

        <div className="grid items-stretch gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {displayedCategories.map((category, i) => {
            const gradient = GRADIENTS[i % GRADIENTS.length];
            const slug = slugifyCategoryName(category.name);

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
                      className={`mb-5 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-2xl font-bold text-white shadow-lg transition-all group-hover:scale-110 group-hover:rotate-3`}
                    >
                      {category.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="mb-2 line-clamp-1 min-h-[1.75rem] text-xl font-bold text-[var(--text-primary)]">
                      {category.name}
                    </h3>
                    <p className="mb-4 line-clamp-2 min-h-[2.5rem] text-sm leading-snug text-[var(--text-secondary)]">
                      {getCategoryDescription(category)}
                    </p>
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

        {hasMoreCategories && (
          <div className="mt-12 flex justify-center">
            <Link
              to="/category"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-8 py-3.5 text-sm font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90"
            >
              View More
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default BrowseCategories;
