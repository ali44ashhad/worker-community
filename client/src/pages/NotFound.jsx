import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <motion.div
      className="home-page min-h-[70vh] bg-[var(--background-subtle)] flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-white/80 backdrop-blur-sm border border-purple-100/50 rounded-3xl p-8 max-w-md text-center shadow-lg shadow-purple-500/5">
        <p className="text-sm font-semibold text-[var(--purple-primary)]">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">Page not found</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          This address does not match a page on CommuN.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex px-6 py-2.5 bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white rounded-xl font-semibold"
        >
          Back to home
        </Link>
      </div>
    </motion.div>
  );
};

export default NotFound;
