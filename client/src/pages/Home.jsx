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
    >
        <Hero />
        <TopCategory />
        <TopServices />
        <Testimonial />
    </motion.div>
  )
}

export default Home