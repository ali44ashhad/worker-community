import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const CommunityCta = () => (
  <section className="relative overflow-hidden bg-white py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-6">
          Ready to Connect with Your Community?
        </h2>

        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
          Whether you're looking for help or offering your services,
          CommuN brings your locality together.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center">
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-bold text-lg"
          >
            Get Started Now
            <ChevronRight className="ml-2 w-5 h-5" />
          </Link>

          <Link
            to="/about"
            className="inline-flex items-center justify-center px-10 py-5 border-2 border-[var(--purple-primary)] text-[var(--purple-primary)] rounded-2xl hover:bg-purple-50 transition-all duration-300 font-bold text-lg"
          >
            Learn More
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CommunityCta;