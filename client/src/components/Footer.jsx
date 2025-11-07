import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
axios.defaults.withCredentials = true;

const Footer = () => {
  const [topServices, setTopServices] = useState([]);
  const [isLoadingTopServices, setIsLoadingTopServices] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchTopServices = async () => {
      try {
        setIsLoadingTopServices(true);
        const res = await axios.get(`${API_URL}/api/comments/top-services?limit=6`);
        if (!isMounted) return;

        if (res.data?.success && Array.isArray(res.data.services)) {
          const deduped = res.data.services.filter((service) => service?._id);
          setTopServices(deduped.slice(0, 6));
        } else {
          setTopServices([]);
        }
      } catch (error) {
        console.error('Failed to fetch top services for footer:', error);
        if (isMounted) {
          setTopServices([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingTopServices(false);
        }
      }
    };

    fetchTopServices();

    return () => {
      isMounted = false;
    };
  }, []);

  const topServiceLinks = !isLoadingTopServices && topServices.length > 0
    ? topServices
    : [];

  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-16 lg:py-20">
        <div className='max-w-[1350px] mx-auto px-6' >
            <motion.div 
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">Commun</h2>
              <Link 
                to="/contact" 
                className="text-gray-600 hover:text-gray-900 transition-colors duration-300 font-medium inline-block"
              >
                Visit Help Center →
              </Link>
            </motion.div>

      {/* Middle Links Section */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        
        <div className="footer-column">
          <h3 className="text-base font-semibold text-gray-900 mb-6 tracking-tight">Company</h3>
          <ul className="list-none p-0 space-y-3">
            <li>
              <Link to="/about" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 text-sm font-medium">About Us</Link>
            </li>
            <li>
              <Link to="/service" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 text-sm font-medium">Services</Link>
            </li>
            <li>
              <Link to="/category" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 text-sm font-medium">Categories</Link>
            </li>
            <li>
              <Link to="/contact" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 text-sm font-medium">Contact Us</Link>
            </li>
            <li>
              <Link to="/faq" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 text-sm font-medium">FAQ</Link>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3 className="text-base font-semibold text-gray-900 mb-6 tracking-tight">Popular Categories</h3>
          <ul className="list-none p-0 space-y-3">
            <li><Link to="/category/Academics" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 text-sm font-medium">Academics</Link></li>
            <li><Link to="/category/Music" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 text-sm font-medium">Music</Link></li>
            <li><Link to="/category/Dance" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 text-sm font-medium">Dance</Link></li>
            <li><Link to="/category/Fitness%20%26%20Sports" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 text-sm font-medium">Fitness & Sports</Link></li>
            <li><Link to="/category/Home%20Cooking" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 text-sm font-medium">Home Baker</Link></li>
            <li><Link to="/category/Technology" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 text-sm font-medium">Technology</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3 className="text-base font-semibold text-gray-900 mb-6 tracking-tight">Top Services</h3>
          <ul className="list-none p-0 space-y-3">
            {isLoadingTopServices && (
              <li className="text-gray-500 text-sm font-medium">Loading top services...</li>
            )}
            {!isLoadingTopServices && topServiceLinks.length === 0 && (
              <li className="text-gray-500 text-sm font-medium">No top services available right now.</li>
            )}
            {topServiceLinks.map((service) => {
              const label = service?.serviceCategory || service?.title || service?.name || 'View Service';
              return (
                <li key={service._id}>
                  <Link
                    to={`/service/${service._id}`}
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-300 text-sm font-medium"
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="footer-column">
          <h3 className="text-base font-semibold text-gray-900 mb-6 tracking-tight">Top Providers</h3>
          <ul className="list-none p-0 space-y-3">
            <li><Link to="/provider/69008b1c842b1760024a9494" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 text-sm font-medium">Keshav Sharma</Link></li>
            <li><Link to="/provider/69009437842b1760024a94ad" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 text-sm font-medium">Suryansh Sharma</Link></li>
            <li><Link to="/service/69009593842b1760024a94cf" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 text-sm font-medium">Rohit Sharma</Link></li>
          </ul>
        </div>
      </motion.div>

      {/* Bottom Section */}
      <motion.div 
        className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-gray-200 gap-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Commun. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <motion.a 
            href="https://linkedin.com" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="LinkedIn" 
            className="text-gray-500 hover:text-gray-900 transition-colors duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg viewBox="0 0 24 24" role="img" className="w-5 h-5 fill-current">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"></path>
            </svg>
          </motion.a>
          
          <motion.a 
            href="https://youtube.com" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="YouTube" 
            className="text-gray-500 hover:text-gray-900 transition-colors duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg viewBox="0 0 24 24" role="img" className="w-5 h-5 fill-current">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
            </svg>
          </motion.a>
          
          <motion.a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Instagram" 
            className="text-gray-500 hover:text-gray-900 transition-colors duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg viewBox="0 0 24 24" role="img" className="w-5 h-5 fill-current">
              <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.784.305-1.455.718-2.126 1.388S.935 3.356.63 4.14C.333 4.905.13 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.26 2.148.558 2.913a5.88 5.88 0 0 0 1.388 2.126 5.88 5.88 0 0 0 2.126 1.388c.765.298 1.636.498 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.26 2.913-.558a5.88 5.88 0 0 0 2.126-1.388 5.88 5.88 0 0 0 1.388-2.126c.298-.765.498-1.636.558-2.913.06-1.277.072-1.683.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.26-2.148-.558-2.913a5.88 5.88 0 0 0-1.388-2.126A5.88 5.88 0 0 0 19.86.63c-.765-.298-1.636-.498-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.07 1.17.05 1.805.248 2.227.42a3.617 3.617 0 0 1 1.32 1.32c.172.422.37 1.057.42 2.227.054 1.265.07 1.646.07 4.85s-.016 3.585-.07 4.85c-.05 1.17-.248 1.805-.42 2.227a3.617 3.617 0 0 1-1.32 1.32c-.422.172-1.057.37-2.227.42-1.265.054-1.646.07-4.85.07s-3.585-.016-4.85-.07c-1.17-.05-1.805-.248-2.227-.42a3.617 3.617 0 0 1-1.32-1.32c-.172-.422-.37-1.057-.42-2.227-.054-1.265-.07-1.646-.07-4.85s.016-3.585.07-4.85c.05-1.17.248 1.805.42-2.227a3.617 3.617 0 0 1 1.32-1.32c.422-.172 1.057.37 2.227.42C8.415 2.176 8.797 2.16 12 2.16zm0 3.24A6.6 6.6 0 1 0 12 18.6a6.6 6.6 0 0 0 0-13.2zm0 10.8a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"></path>
            </svg>
          </motion.a>
          
          <motion.a 
            href="https://x.com" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="X" 
            className="text-gray-500 hover:text-gray-900 transition-colors duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg viewBox="0 0 24 24" role="img" className="w-5 h-5 fill-current">
               <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zm-1.61 19.7h2.508L6.881 3.03H4.21l13.08 17.823z"></path>
            </svg>
          </motion.a>
        </div>
      </motion.div>
        </div>
    </footer>
  );
}

export default Footer;