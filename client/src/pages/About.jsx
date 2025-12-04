import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineUsers, HiOutlineHeart, HiOutlineSparkles, HiOutlineShieldCheck } from 'react-icons/hi';
import { motion } from 'framer-motion';

const About = () => {
  const values = [
    { icon: <HiOutlineUsers className="w-12 h-12 text-indigo-600" />, title: 'Community First', description: 'We believe in building strong, supportive neighborhoods where everyone can thrive together. Our platform connects neighbors and creates meaningful relationships.' },
    { icon: <HiOutlineShieldCheck className="w-12 h-12 text-pink-500" />, title: 'Trust & Safety', description: 'Every provider on our platform is verified. We ensure that all services meet quality standards and that your community remains a safe space for everyone.' },
    { icon: <HiOutlineHeart className="w-12 h-12 text-indigo-600" />, title: 'Support Local', description: 'By connecting you with neighbors, we strengthen local economies and help talented individuals in your community grow their businesses.' },
    { icon: <HiOutlineSparkles className="w-12 h-12 text-pink-500" />, title: 'Quality Services', description: 'From academics to home cooking, fitness to technology — we curate the best local services to ensure you get exactly what you need.' }
  ];

  const stats = [
    { number: '1000+', label: 'Active Providers' },
    { number: '50+', label: 'Service Categories' },
    { number: '10K+', label: 'Happy Customers' },
    { number: '500+', label: 'Daily Bookings' }
  ];

  return (
    <section className="relative bg-white min-h-screen pb-16 overflow-hidden">
      {/* Subtle background accents */}
      <div className="pointer-events-none absolute -top-12 -left-12 w-80 h-80 rounded-full blur-3xl bg-gradient-to-br from-indigo-50 via-pink-50 to-purple-50 opacity-30" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl bg-gradient-to-br from-pink-50 via-indigo-50 to-yellow-50 opacity-25" />

      <div className="max-w-[1370px] mx-auto px-6 pt-28 relative z-10">
        {/* Hero Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">Commun</span>
          </h1>
          <p className="text-gray-700 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Connecting neighbors, empowering communities. We build bridges where local talent meets local needs, fostering collaboration and growth.
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.div className="mb-20" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="rounded-2xl p-8 md:p-12 bg-white/70 backdrop-blur-md border border-gray-200 shadow-md">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">
              Our Mission
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed max-w-4xl mx-auto">
              At Commun, we believe every neighborhood is full of untapped potential. We connect skilled individuals with their local communities, empowering them to share their services safely and easily.
            </p>
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div className="mb-20" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div key={i} whileHover={{ scale: 1.02, y: -4 }} className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="mb-6">{v.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{v.title}</h3>
                <p className="text-gray-700 leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div className="mb-20" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 md:p-12 shadow-md">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center">Our Impact</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <motion.div key={i} whileInView={{ scale: [0.9, 1] }} className="text-center">
                  <p className="text-5xl font-extrabold text-gray-900 mb-2">{stat.number}</p>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Become a Provider CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-20">
          <div className="bg-gradient-to-r from-indigo-600 to-pink-500 text-white rounded-2xl p-12 text-center shadow-xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Have a Skill to Share?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-white/90">
              Join our community of providers and start offering your skills to neighbors — grow your business, earn, and make an impact locally.
            </p>
            <Link to="/become-provider" className="inline-block px-8 py-3.5 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-lg">
              Become a Provider
            </Link>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
          <div className="rounded-2xl border border-gray-200 p-10 shadow-md max-w-3xl mx-auto bg-white/70 backdrop-blur-md">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Join the Commun Community</h2>
            <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto">
              Whether you want to explore local services or become a provider, start your journey with us today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/service" className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-pink-500 text-white rounded-xl font-semibold hover:shadow-md transition-all">
                Browse Services
              </Link>
              <Link to="/category" className="px-8 py-3 border border-gray-200 rounded-xl font-semibold text-gray-800 hover:bg-gray-50 transition-all">
                View Categories
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
