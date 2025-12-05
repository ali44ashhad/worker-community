import React from 'react'
import Hero from '../components/Hero'
import TopCategory from '../components/home/TopCategory'
import TopServices from '../components/home/TopServices'
import Testimonial from './Testimonial'
import { motion } from 'framer-motion'

const Home = () => {
  return (
    <motion.div 
      className=''
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        // Force GPU acceleration for smooth scrolling
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        willChange: 'auto',
        // Enable smooth scrolling on iOS
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <Hero />
      <TopCategory />
      <TopServices />
      <Testimonial />
    </motion.div>
  )
}

export default Home