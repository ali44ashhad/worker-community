import React from 'react'
import Hero from '../components/Hero'
import TopCategory from '../components/home/TopCategoty'
import TopServices from '../components/home/TopServices'
import Testimonial from './Testimonial'

const Home = () => {
  return (
    <div className=''>
        <Hero></Hero>
        <TopCategory></TopCategory>
        <TopServices></TopServices>
        <Testimonial></Testimonial>
    </div>
  )
}

export default Home