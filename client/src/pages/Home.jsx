import React from 'react';
import { motion } from 'framer-motion';
import HomeHero from '../components/home/HomeHero';
import LocalitiesSection from '../components/home/LocalitiesSection';
import BrowseCategories from '../components/home/BrowseCategories';
import AudienceSection from '../components/home/AudienceSection';
import CommunityCta from '../components/home/CommunityCta';

const Home = () => {
  
  return (
    <motion.div
      className="home-page min-h-screen bg-[var(--background-subtle)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <HomeHero />
      <LocalitiesSection />
      <BrowseCategories />
      <AudienceSection />
      <CommunityCta />
    </motion.div>
  );
};

export default Home;
