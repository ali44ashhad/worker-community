import React from 'react';
// 1. Import Link from react-router-dom
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black mt-14 text-white py-12 lg:px-16 lg:py-14">
        <div className='max-w-[1350px] mx-auto px-4' >
            <div className="mb-12">
        <h2 className="text-2xl font-medium mb-8">Commun</h2>
        {/* 2. Replaced <a> with <Link> and href with to */}
        <Link to="/contact" className="text-base font-medium hover:underline">
          Visit Help Center
        </Link>
      </div>

      {/* Middle Links Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        
        <div className="footer-column">
          <h3 className="text-lg font-medium mb-5">Company</h3>
          <ul className="list-none p-0">
            <li className="mb-4">
              <Link to="/about" className="text-sm hover:underline">About Us</Link>
            </li>
            <li className="mb-4">
              <Link to="/service" className="text-sm hover:underline">Services</Link>
            </li>
            <li className="mb-4">
              <Link to="/category" className="text-sm hover:underline">Categories</Link>
            </li>
            <li className="mb-4">
              <Link to="/contact" className="text-sm hover:underline">Contact Us</Link>
            </li>
            <li className="mb-4">
              <Link to="/faq" className="text-sm hover:underline">FAQ</Link>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3 className="text-lg font-medium mb-5">Popular Categories</h3>
          <ul className="list-none p-0">
            <li className="mb-4"><Link to="/category/Academics" className="text-sm hover:underline">Academics</Link></li>
            <li className="mb-4"><Link to="/category/Music" className="text-sm hover:underline">Music</Link></li>
            <li className="mb-4"><Link to="/category/Dance" className="text-sm hover:underline">Dance</Link></li>
            <li className="mb-4"><Link to="/category/Fitness%20%26%20Sports" className="text-sm hover:underline">Fitness & Sports</Link></li>
            <li className="mb-4"><Link to="/category/Home%20Cooking" className="text-sm hover:underline">Home Baker</Link></li>
            <li className="mb-4"><Link to="/category/Technology" className="text-sm hover:underline">Technology</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3 className="text-lg font-medium mb-5">Top Services</h3>
          <ul className="list-none p-0">
            <li className="mb-4"><Link to="service/69008b20842b1760024a9496" className="text-sm hover:underline">Workshops</Link></li>
            <li className="mb-4"><Link to="/service/6900943b842b1760024a94af" className="text-sm hover:underline">Photography</Link></li>
            <li className="mb-4"><Link to="/service/6900943c842b1760024a94b7" className="text-sm hover:underline">Technology</Link></li>
            <li className="mb-4"><Link to="/service/6900943f842b1760024a94bc" className="text-sm hover:underline">Music</Link></li>
            <li className="mb-4"><Link to="/service/6900958d842b1760024a94c9" className="text-sm hover:underline">Home Baker</Link></li>
            <li className="mb-4"><Link to="/service/69009593842b1760024a94cf" className="text-sm hover:underline">Consulting</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3 className="text-lg font-medium mb-5">Travel</h3>
          <ul className="list-none p-0">
            <li className="mb-4"><Link to="/" className="text-sm hover:underline">Reserve</Link></li>
            <li className="mb-4"><Link to="/" className="text-sm hover:underline">Airports</Link></li>
            <li className="mb-4"><Link to="/" className="text-sm hover:underline">Cities</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex items-center justify-start">
        <div className="flex items-center gap-6">
          
          {/* Note: Social media links are often external, so <a> tags might
              still be appropriate here. But following your request, they are 
              also <Link> tags. If they go to external sites (like linkedin.com),
              you should change them back to <a href="...">. */}
          
          <Link to="/" aria-label="LinkedIn" className="text-white">
            <svg viewBox="0 0 24 24" role="img" className="w-5 h-5 fill-current">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"></path>
            </svg>
          </Link>
          
          <Link to="/" aria-label="YouTube" className="text-white">
            <svg viewBox="0 0 24 24" role="img" className="w-5 h-5 fill-current">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
            </svg>
          </Link>
          
          <Link to="/" aria-label="Instagram" className="text-white">
            <svg viewBox="0 0 24 24" role="img" className="w-5 h-5 fill-current">
              <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.784.305-1.455.718-2.126 1.388S.935 3.356.63 4.14C.333 4.905.13 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.26 2.148.558 2.913a5.88 5.88 0 0 0 1.388 2.126 5.88 5.88 0 0 0 2.126 1.388c.765.298 1.636.498 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.26 2.913-.558a5.88 5.88 0 0 0 2.126-1.388 5.88 5.88 0 0 0 1.388-2.126c.298-.765.498-1.636.558-2.913.06-1.277.072-1.683.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.26-2.148-.558-2.913a5.88 5.88 0 0 0-1.388-2.126A5.88 5.88 0 0 0 19.86.63c-.765-.298-1.636-.498-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.07 1.17.05 1.805.248 2.227.42a3.617 3.617 0 0 1 1.32 1.32c.172.422.37 1.057.42 2.227.054 1.265.07 1.646.07 4.85s-.016 3.585-.07 4.85c-.05 1.17-.248 1.805-.42 2.227a3.617 3.617 0 0 1-1.32 1.32c-.422.172-1.057.37-2.227.42-1.265.054-1.646.07-4.85.07s-3.585-.016-4.85-.07c-1.17-.05-1.805-.248-2.227-.42a3.617 3.617 0 0 1-1.32-1.32c-.172-.422-.37-1.057-.42-2.227-.054-1.265-.07-1.646-.07-4.85s.016-3.585.07-4.85c.05-1.17.248 1.805.42-2.227a3.617 3.617 0 0 1 1.32-1.32c.422-.172 1.057.37 2.227.42C8.415 2.176 8.797 2.16 12 2.16zm0 3.24A6.6 6.6 0 1 0 12 18.6a6.6 6.6 0 0 0 0-13.2zm0 10.8a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"></path>
            </svg>
          </Link>
          
          <Link to="/" aria-label="X" className="text-white">
            <svg viewBox="0 0 24 24" role="img" className="w-5 h-5 fill-current">
               <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zm-1.61 19.7h2.508L6.881 3.03H4.21l13.08 17.823z"></path>
            </svg>
          </Link>
          
        </div>
      </div>
        </div>
      {/* Top Section */}
      

    </footer>
  );
}

export default Footer;