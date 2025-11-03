import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineUsers, HiOutlineHeart, HiOutlineSparkles, HiOutlineShieldCheck } from 'react-icons/hi';

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
    <div className='min-h-screen bg-gray-50 pb-16'>
      <div className='max-w-[1350px] mx-auto px-4 pt-24'>
        {/* Hero Section */}
        <div className='text-center mb-16'>
          <h1 className='text-4xl md:text-6xl font-bold text-black mb-6'>
            About Commun
          </h1>
          <p className='text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed'>
            Connecting neighbors, empowering communities. We're building a platform where local talent meets local needs, creating stronger, more supportive neighborhoods.
          </p>
        </div>

        {/* Mission Section */}
        <div className='mb-20'>
          <div className='bg-white border-2 border-black rounded-xl p-8 md:p-12'>
            <h2 className='text-3xl md:text-4xl font-bold text-black mb-6 text-center'>
              Our Mission
            </h2>
            <div className='max-w-4xl mx-auto'>
              <p className='text-gray-700 text-lg leading-relaxed mb-6'>
                At Commun, we believe that every neighborhood has incredible talent waiting to be discovered. Our mission is to create a platform where community members can easily find and offer services right in their own society.
              </p>
              <p className='text-gray-700 text-lg leading-relaxed'>
                Whether you're looking for a tutor for your child, a personal trainer, a home baker, or any other service, we connect you with verified providers in your community. At the same time, if you have a skill to share, we help you become a provider and serve your neighbors.
              </p>
            </div>
          </div>
        </div>

        {/* Values Grid */}
        <div className='mb-20'>
          <h2 className='text-3xl md:text-4xl font-bold text-black mb-12 text-center'>
            Our Values
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {values.map((value, index) => (
              <div
                key={index}
                className='bg-white border-2 border-black rounded-xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2'
              >
                <div className='text-black mb-4'>
                  {value.icon}
                </div>
                <h3 className='text-2xl font-bold text-black mb-3'>
                  {value.title}
                </h3>
                <p className='text-gray-600 leading-relaxed'>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className='mb-20'>
          <div className='bg-white border-2 border-black rounded-xl p-8 md:p-12'>
            <h2 className='text-3xl md:text-4xl font-bold text-black mb-12 text-center'>
              Our Impact
            </h2>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8'>
              {stats.map((stat, index) => (
                <div key={index} className='text-center'>
                  <p className='text-4xl md:text-5xl font-bold text-black mb-2'>
                    {stat.number}
                  </p>
                  <p className='text-gray-600 font-semibold'>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className='mb-20'>
          <h2 className='text-3xl md:text-4xl font-bold text-black mb-12 text-center'>
            How It Works
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='bg-white border-2 border-black rounded-xl p-8 text-center'>
              <div className='w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4'>
                1
              </div>
              <h3 className='text-2xl font-bold text-black mb-3'>
                Browse Services
              </h3>
              <p className='text-gray-600'>
                Explore our wide range of services from verified providers in your community. Search by category, keyword, or browse all available services.
              </p>
            </div>

            <div className='bg-white border-2 border-black rounded-xl p-8 text-center'>
              <div className='w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4'>
                2
              </div>
              <h3 className='text-2xl font-bold text-black mb-3'>
                Connect & Book
              </h3>
              <p className='text-gray-600'>
                View provider profiles, read descriptions, check portfolios, and book services directly through our platform. All transactions are secure and verified.
              </p>
            </div>

            <div className='bg-white border-2 border-black rounded-xl p-8 text-center'>
              <div className='w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4'>
                3
              </div>
              <h3 className='text-2xl font-bold text-black mb-3'>
                Support Local
              </h3>
              <p className='text-gray-600'>
                Enjoy quality services while supporting your neighbors. Leave reviews, share feedback, and help build a stronger community together.
              </p>
            </div>
          </div>
        </div>

        {/* Become a Provider */}
        <div className='mb-20'>
          <div className='bg-black text-white rounded-xl p-8 md:p-12 text-center'>
            <h2 className='text-3xl md:text-4xl font-bold mb-6'>
              Have a Skill to Share?
            </h2>
            <p className='text-gray-300 text-lg mb-8 max-w-2xl mx-auto'>
              Join our community of providers and start offering your services to neighbors. Whether you're a tutor, chef, fitness trainer, or have any other skill, we make it easy to get started.
            </p>
            <Link
              to='/become-provider'
              className='inline-block px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors'
            >
              Become a Provider
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className='text-center'>
          <div className='bg-white border-2 border-black rounded-xl p-8 md:p-12 max-w-3xl mx-auto'>
            <h2 className='text-3xl md:text-4xl font-bold text-black mb-6'>
              Join the Commun Community
            </h2>
            <p className='text-gray-600 text-lg mb-8'>
              Ready to explore services or become a provider? Start your journey with Commun today.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link
                to='/service'
                className='px-8 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors'
              >
                Browse Services
              </Link>
              <Link
                to='/category'
                className='px-8 py-3 border-2 border-black text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors'
              >
                View Categories
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
