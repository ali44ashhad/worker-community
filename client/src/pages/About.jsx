import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineUsers, HiOutlineHeart, HiOutlineSparkles, HiOutlineShieldCheck } from 'react-icons/hi';
import { motion } from 'framer-motion';

const About = () => {
  const values = [
    {
      icon: <HiOutlineUsers className="w-12 h-12" />,
      title: "Community First",
      description: "We believe in building strong, supportive neighborhoods where everyone can thrive together. Our platform connects neighbors and creates meaningful relationships."
    },
    {
      icon: <HiOutlineShieldCheck className="w-12 h-12" />,
      title: "Trust & Safety",
      description: "Every provider on our platform is verified. We ensure that all services meet quality standards and that your community remains a safe space for everyone."
    },
    {
      icon: <HiOutlineHeart className="w-12 h-12" />,
      title: "Support Local",
      description: "By connecting you with neighbors, we're strengthening local economies and helping talented individuals in your community grow their businesses."
    },
    {
      icon: <HiOutlineSparkles className="w-12 h-12" />,
      title: "Quality Services",
      description: "From academics to home cooking, fitness to technology - we curate the best local services to ensure you get exactly what you need."
    }
  ];

  const stats = [
    { number: "1000+", label: "Active Providers" },
    { number: "50+", label: "Service Categories" },
    { number: "10K+", label: "Happy Customers" },
    { number: "500+", label: "Daily Bookings" }
  ];

  return (
    <div className='min-h-screen bg-white pb-16'>
      <div className='max-w-[1350px] mx-auto px-6 pt-28'>
        {/* Hero Section */}
        <motion.div 
          className='text-center mb-20'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className='text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight'>
            About Commun
          </h1>
          <p className='text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed'>
            Connecting neighbors, empowering communities. We're building a platform where local talent meets local needs, creating stronger, more supportive neighborhoods.
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.div 
          className='mb-20'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className='bg-white border border-gray-200 rounded-2xl p-8 md:p-12 shadow-lg'>
            <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center tracking-tight'>
              Our Mission
            </h2>
            <div className='max-w-4xl mx-auto'>
              <p className='text-gray-600 text-lg leading-relaxed mb-6'>
                At Commun, we believe that every neighborhood has incredible talent waiting to be discovered. Our mission is to create a platform where community members can easily find and offer services right in their own society.
              </p>
              <p className='text-gray-600 text-lg leading-relaxed'>
                Whether you're looking for a tutor for your child, a personal trainer, a home baker, or any other service, we connect you with verified providers in your community. At the same time, if you have a skill to share, we help you become a provider and serve your neighbors.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Values Grid */}
        <motion.div 
          className='mb-20'
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center tracking-tight'>
            Our Values
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {values.map((value, index) => (
              <motion.div
                key={index}
                className='bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300'
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <div className='text-gray-700 mb-6'>
                  {value.icon}
                </div>
                <h3 className='text-2xl font-bold text-gray-900 mb-4 tracking-tight'>
                  {value.title}
                </h3>
                <p className='text-gray-600 leading-relaxed'>
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className='mb-20'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className='bg-gray-50 border border-gray-200 rounded-2xl p-8 md:p-12 shadow-lg'>
            <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center tracking-tight'>
              Our Impact
            </h2>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8'>
              {stats.map((stat, index) => (
                <motion.div 
                  key={index} 
                  className='text-center'
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <p className='text-5xl md:text-6xl font-bold text-gray-900 mb-3 tracking-tight'>
                    {stat.number}
                  </p>
                  <p className='text-gray-600 font-semibold text-base'>
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div 
          className='mb-20'
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center tracking-tight'>
            How It Works
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {[
              {
                number: 1,
                title: "Browse Services",
                description: "Explore our wide range of services from verified providers in your community. Search by category, keyword, or browse all available services."
              },
              {
                number: 2,
                title: "Connect & Book",
                description: "View provider profiles, read descriptions, check portfolios, and book services directly through our platform. All transactions are secure and verified."
              },
              {
                number: 3,
                title: "Support Local",
                description: "Enjoy quality services while supporting your neighbors. Leave reviews, share feedback, and help build a stronger community together."
              }
            ].map((step, index) => (
              <motion.div 
                key={index}
                className='bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-lg'
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <div className='w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg'>
                  {step.number}
                </div>
                <h3 className='text-2xl font-bold text-gray-900 mb-4 tracking-tight'>
                  {step.title}
                </h3>
                <p className='text-gray-600 leading-relaxed'>
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Become a Provider */}
        <motion.div 
          className='mb-20'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className='bg-gray-900 text-white rounded-2xl p-8 md:p-12 text-center shadow-xl'>
            <h2 className='text-4xl md:text-5xl font-bold mb-6 tracking-tight'>
              Have a Skill to Share?
            </h2>
            <p className='text-gray-300 text-lg mb-8 max-w-2xl mx-auto leading-relaxed'>
              Join our community of providers and start offering your services to neighbors. Whether you're a tutor, chef, fitness trainer, or have any other skill, we make it easy to get started.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to='/become-provider'
                className='inline-block px-8 py-3.5 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg'
              >
                Become a Provider
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className='text-center'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className='bg-white border border-gray-200 rounded-2xl p-8 md:p-12 max-w-3xl mx-auto shadow-lg'>
            <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight'>
              Join the Commun Community
            </h2>
            <p className='text-gray-600 text-lg mb-8 leading-relaxed'>
              Ready to explore services or become a provider? Start your journey with Commun today.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to='/service'
                  className='inline-block px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-lg'
                >
                  Browse Services
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to='/category'
                  className='inline-block px-8 py-3.5 border-2 border-gray-200 text-gray-900 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300'
                >
                  View Categories
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
