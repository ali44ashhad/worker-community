import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineFlag, HiOutlineBookOpen, HiOutlineLightBulb, HiOutlineSparkles, HiOutlineUsers, HiOutlineBriefcase, HiOutlineLightningBolt } from 'react-icons/hi';

const About = () => {
  return (
    <section className="relative bg-white min-h-screen pb-12 sm:pb-16 overflow-hidden">
      {/* Subtle background accents */}
      <div className="pointer-events-none absolute -top-12 -left-12 w-80 h-80 rounded-full blur-3xl bg-gradient-to-br from-indigo-50 via-pink-50 to-purple-50 opacity-30" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl bg-gradient-to-br from-pink-50 via-indigo-50 to-yellow-50 opacity-25" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 opacity-20" />
      {/* Decorative grid pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-30"></div>

      <div className="max-w-[1370px] mx-auto px-4 sm:px-6 pt-20 sm:pt-28 relative z-10">
        {/* Hero Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16 sm:mb-24 md:mb-28">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 sm:mb-8 tracking-tight leading-tight">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">Commun</span>
          </h1>
          <div className="text-gray-700 text-base sm:text-lg md:text-xl max-w-4xl mx-auto leading-relaxed sm:leading-relaxed space-y-4 sm:space-y-5 px-2">
            <p className="tracking-wide">
              Every neighbourhood is rich with talent, services, and people who can support one another — but most of this remains unseen. Someone runs fitness classes at home, someone sells home-cooked products, someone offers tuitions, workshops, repairs, or professional services… yet most residents never know about them.
            </p>
            <p className="font-semibold text-gray-900 text-lg sm:text-xl">
              Commun was created to bring all of this to light.
            </p>
            <p className="tracking-wide">
              Commun is a hyperlocal platform that helps residents discover trusted services within their neighbourhood and enables those who offer skills or home-based products to become visible to fellow neighbours. Built for independent colonies and Community clusters, Commun brings residents together by making discovery easy, Communication seamless, and opportunities accessible to everyone.
            </p>
            <p className="font-medium text-indigo-600">
              And this is only the beginning.
            </p>
          </div>
        </motion.div>

        {/* Visual Separator */}
        <div className="flex justify-center mb-12 sm:mb-16 md:mb-20">
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full"></div>
        </div>

        {/* Our Purpose Section */}
        <motion.div className="mb-16 sm:mb-20 md:mb-24" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-full bg-gradient-to-r from-indigo-100 to-pink-100">
              <HiOutlineFlag className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 text-center tracking-tight">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">Purpose</span>
            </h2>
          </div>
          <p className="text-gray-700 text-base sm:text-lg leading-relaxed sm:leading-relaxed max-w-4xl mx-auto text-center font-semibold px-4 tracking-wide">
            To make neighbourhood living more connected, convenient, and Community-driven.
          </p>
        </motion.div>

        {/* Visual Separator */}
        <div className="flex justify-center mb-12 sm:mb-16 md:mb-20">
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent rounded-full"></div>
        </div>

        {/* Our Story Section */}
        <motion.div className="mb-16 sm:mb-20 md:mb-24" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-full bg-gradient-to-r from-pink-100 to-indigo-100">
              <HiOutlineBookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-pink-600" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 text-center tracking-tight">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">Story</span>
            </h2>
          </div>
          <div className="text-gray-700 text-base sm:text-lg leading-relaxed sm:leading-relaxed max-w-4xl mx-auto space-y-4 sm:space-y-5 px-4 tracking-wide">
            <p>
              Commun began with a simple observation:
            </p>
            <p>
              Despite living just a few steps apart, neighbours often remain disconnected from the skills, services, and support systems that exist right around them.
            </p>
            <p>
              Independent colonies — unlike gated Communities — lack a unified platform where residents can Communicate, offer services, or discover what others provide. People end up searching the entire internet for services that may be available right next door. This gap inspired the creation of Commun.
            </p>
            <p className="font-semibold text-gray-900">We imagined a platform where:</p>
            <ul className="list-none space-y-2 sm:space-y-3 ml-0">
              <li className="flex items-start">
                <span className="text-indigo-600 mr-3 mt-1">•</span>
                <span>Residents could list what they offer</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-600 mr-3 mt-1">•</span>
                <span>Neighbours could find trusted help easily</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-3 mt-1">•</span>
                <span>Communities could strengthen their internal networks</span>
              </li>
            </ul>
            <p>
              What started as an idea for resident-to-resident discovery evolved into a broader vision: <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">to create India's most connected neighbourhood ecosystem.</span>
            </p>
            <p>
              Commun is built on the belief that stronger neighbourhoods create better everyday living — and technology can make this happen effortlessly.
            </p>
          </div>
        </motion.div>

        {/* Visual Separator */}
        <div className="flex justify-center mb-12 sm:mb-16 md:mb-20">
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full"></div>
        </div>

        {/* The Problem We're Solving Section */}
        <motion.div className="mb-16 sm:mb-20 md:mb-24" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-full bg-gradient-to-r from-indigo-100 to-pink-100">
              <HiOutlineLightBulb className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 text-center tracking-tight">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">Problem</span> We're <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">Solving</span>
            </h2>
          </div>
          <div className="text-gray-700 text-base sm:text-lg leading-relaxed sm:leading-relaxed max-w-4xl mx-auto space-y-6 sm:space-y-8 px-4 tracking-wide">
            <div className="flex gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                  1
                </div>
              </div>
              <div className="flex-grow">
                <p className="font-semibold text-gray-900 mb-2 text-lg sm:text-xl">Residents don't know what services exist within their own colony</p>
                <p>There is no structured way to discover tutors, fitness coaches, hobby experts, home bakers, freelancers, and more — even when they live in the same block.</p>
              </div>
            </div>
            <div className="flex gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-pink-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                  2
                </div>
              </div>
              <div className="flex-grow">
                <p className="font-semibold text-gray-900 mb-2 text-lg sm:text-xl">Home-based service providers have no visibility</p>
                <p>Talented residents struggle to reach their immediate neighbourhood audience, forcing them to depend on citywide listings or word of mouth.</p>
              </div>
            </div>
            <div className="flex gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                  3
                </div>
              </div>
              <div className="flex-grow">
                <p className="font-semibold text-gray-900 mb-2 text-lg sm:text-xl">Existing platforms aren't hyperlocal</p>
                <ul className="list-none space-y-2 mt-2">
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <span>Justdial, Nearbuy show citywide vendors, not neighbours</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pink-600 mr-2">•</span>
                    <span>MyGate caters mainly to gated societies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <span>IamHere is radius-based, not colony-based</span>
                  </li>
                </ul>
                <p className="mt-2 font-semibold text-gray-900">None of them solve the "my colony, my Community" gap.</p>
              </div>
            </div>
            <div className="flex gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-pink-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                  4
                </div>
              </div>
              <div className="flex-grow">
                <p className="font-semibold text-gray-900 mb-2 text-lg sm:text-xl">No platform strengthens neighbourhood trust & collaboration</p>
                <p>Communities thrive when people know and support each other — but there has never been a digital tool designed for this.</p>
              </div>
            </div>
            <div className="mt-8 sm:mt-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-50 to-pink-50 border border-indigo-200">
              <p className="font-semibold text-gray-900 text-center text-lg sm:text-xl">
                Commun solves all of these with one platform that keeps the neighbourhood at its center.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Visual Separator */}
        <div className="flex justify-center mb-12 sm:mb-16 md:mb-20">
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent rounded-full"></div>
        </div>

        {/* Why Commun Matters Section */}
        <motion.div className="mb-16 sm:mb-20 md:mb-24" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="flex flex-col items-center mb-8 sm:mb-12">
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-full bg-gradient-to-r from-pink-100 to-indigo-100">
              <HiOutlineSparkles className="w-8 h-8 sm:w-10 sm:h-10 text-pink-600" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 text-center tracking-tight">
              Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">Commun</span> Matters?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-10 px-4">
            <motion.div whileHover={{ scale: 1.02, y: -4 }} className="group relative h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-pink-500 rounded-2xl p-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.5),0_0_20px_rgba(236,72,153,0.5)] pointer-events-none">
                <div className="h-full w-full bg-transparent rounded-2xl"></div>
              </div>
              <div className="relative bg-white/70 backdrop-blur-md border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm h-full flex flex-col">
                <div className="mb-4 sm:mb-6 p-3 rounded-full bg-gradient-to-r from-indigo-100 to-pink-100 w-fit">
                  <HiOutlineUsers className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">For Residents</h3>
                <ul className="text-gray-700 leading-relaxed space-y-2 sm:space-y-3 list-none flex-grow">
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2 mt-1">•</span>
                    <span>Find trusted services offered by neighbours</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pink-600 mr-2 mt-1">•</span>
                    <span>Avoid citywide clutter & irrelevant search results</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2 mt-1">•</span>
                    <span>Support local talent and build real Community connections</span>
                  </li>
                </ul>
              </div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02, y: -4 }} className="group relative h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-pink-500 rounded-2xl p-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.5),0_0_20px_rgba(236,72,153,0.5)] pointer-events-none">
                <div className="h-full w-full bg-transparent rounded-2xl"></div>
              </div>
              <div className="relative bg-white/70 backdrop-blur-md border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm h-full flex flex-col">
                <div className="mb-4 sm:mb-6 p-3 rounded-full bg-gradient-to-r from-pink-100 to-indigo-100 w-fit">
                  <HiOutlineBriefcase className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">For Service Providers</h3>
                <ul className="text-gray-700 leading-relaxed space-y-2 sm:space-y-3 list-none flex-grow">
                  <li className="flex items-start">
                    <span className="text-pink-600 mr-2 mt-1">•</span>
                    <span>Get visibility within your own colony</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2 mt-1">•</span>
                    <span>Build a trusted audience right where you live</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pink-600 mr-2 mt-1">•</span>
                    <span>Grow home-based businesses without marketing spend</span>
                  </li>
                </ul>
              </div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02, y: -4 }} className="group relative h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-pink-500 rounded-2xl p-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.5),0_0_20px_rgba(236,72,153,0.5)] pointer-events-none">
                <div className="h-full w-full bg-transparent rounded-2xl"></div>
              </div>
              <div className="relative bg-white/70 backdrop-blur-md border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm h-full flex flex-col">
                <div className="mb-4 sm:mb-6 p-3 rounded-full bg-gradient-to-r from-indigo-100 to-pink-100 w-fit">
                  <HiOutlineLightningBolt className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">For the Future</h3>
                <ul className="text-gray-700 leading-relaxed space-y-2 sm:space-y-3 list-none flex-grow">
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2 mt-1">•</span>
                    <span>Secure in-app payments</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pink-600 mr-2 mt-1">•</span>
                    <span>RWA management tools</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2 mt-1">•</span>
                    <span>Announcements, payrolls, visitor logs, events & more</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
          <p className="text-gray-700 text-base sm:text-lg leading-relaxed sm:leading-relaxed max-w-4xl mx-auto text-center px-4 tracking-wide">
            Commun is built to become <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">the digital backbone of every neighbourhood</span> — simple, safe, and truly Community-first.
          </p>
        </motion.div>

        {/* Visual Separator */}
        <div className="flex justify-center mb-12 sm:mb-16 md:mb-20">
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full"></div>
        </div>

        {/* Investor-Style Value Statement */}
        <motion.div className="mb-16 sm:mb-20 md:mb-24" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="bg-gradient-to-r from-indigo-600 to-pink-500 text-white rounded-2xl p-8 sm:p-10 md:p-12 text-center shadow-xl mx-4">
            <p className="text-base sm:text-lg md:text-xl leading-relaxed sm:leading-relaxed max-w-4xl mx-auto text-white/90 tracking-wide">
              Commun operates at the intersection of <span className="font-semibold text-white">Community, convenience, and hyperlocal commerce</span>, aiming to become the default digital layer for neighbourhoods across India. By empowering residents and enabling micro-entrepreneurs, Commun unlocks a scalable ecosystem with long-term network effects.
            </p>
          </div>
        </motion.div>

        {/* Visual Separator */}
        <div className="flex justify-center mb-12 sm:mb-16 md:mb-20">
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent rounded-full"></div>
        </div>

        {/* Final CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
          <div className="rounded-2xl border border-gray-200 p-6 sm:p-8 md:p-10 shadow-md max-w-3xl mx-auto bg-white/70 backdrop-blur-md mx-4">
            <p className="text-gray-700 text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed sm:leading-relaxed tracking-wide">
              Whether you're seeking help, offering your skills, or managing a colony, Commun is here to strengthen the bond between people and the places they call home.
            </p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500 tracking-tight">
              Connect. Discover. Thrive Local — with Commun.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link to="/service" className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-pink-500 text-white rounded-xl font-semibold hover:shadow-md transition-all text-sm sm:text-base">
                Browse Services
              </Link>
              <Link to="/category" className="px-6 sm:px-8 py-2.5 sm:py-3 border border-gray-200 rounded-xl font-semibold text-gray-800 hover:bg-gray-50 transition-all text-sm sm:text-base">
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
