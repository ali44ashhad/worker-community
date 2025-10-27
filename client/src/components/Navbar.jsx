import React, { useState, useEffect } from 'react';
import { 
  HiOutlineMenu, 
  HiOutlineX, 
  HiOutlineSearch, 
  HiOutlineUserCircle
} from 'react-icons/hi';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../features/authSlice';
import { toast } from 'react-hot-toast';

const Navbar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const closeMenu = () => setIsMobileMenuOpen(false);

  // Logout handler
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out successfully');
      closeMenu();
    } catch (error) {
      toast.error(error || 'Logout failed');
    }
  };

  // Navigation links
  const navLinks = [
    { to: '/', text: 'Home' },
    { to: '/about', text: 'About' },
    { to: '/testimonials', text: 'Testimonials' },
    { to: '/faq', text: 'FAQ' },
    { to: '/provider', text: 'Providers' },
    { to: '/contact', text: 'Contact' },
  ];

  return (
    <header className="fixed top-0 text-white left-0 w-full bg-black z-50 h-16 shadow-md border-b border-gray-800">
      <nav className="max-w-[1370px] mx-auto px-3 sm:px-6 lg:px-8 h-full flex items-center justify-between relative">

        {/* Left Side: Logo */}
        <Link
          to="/"
          className="text-[1.45rem] font-semibold text-white tracking-tight flex items-center gap-0.5"
        >
          Commun
        </Link>

        {/* Centered Nav Links */}
        <div className="hidden md:flex flex-1 justify-center  ml-24 items-center text-[0.94rem] space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-gray-300 hover:text-white transition-colors duration-200 tracking-wide cursor-pointer"
            >
              {link.text}
            </Link>
          ))}
        </div>

        {/* Right Side: Search, Icons & Auth */}
        <div className="hidden md:flex items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search services..." 
              className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg pl-9 py-2 w-56 focus:outline-none focus:ring-1 focus:ring-blue-500" 
            />
          </div>

          {/* Auth Buttons */}
          {!user ? (
            <Link
              to="/login"
              className="text-black text-[0.94rem] bg-white rounded-lg px-4 py-2 transition-all duration-300 shadow-lg font-medium"
            >
              Login
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              { user &&               <button
                onClick={handleLogout}
                className="text-black text-[0.94rem] bg-white cursor-pointer rounded-lg px-4 py-2 transition-all duration-300 shadow-lg font-medium"
              >
                Become Provider
              </button> }
              <button
                onClick={handleLogout}
                className="text-black text-[0.94rem] bg-white cursor-pointer rounded-lg px-4 py-2 transition-all duration-300 shadow-lg font-medium"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="md:hidden text-white focus:outline-none z-60"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <HiOutlineX size={28} /> : <HiOutlineMenu size={28} />}
        </button>
      </nav>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={closeMenu}
        />
      )}

      {/* Slide-in Mobile Menu */}
      <div
        className={`md:hidden fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-50 transform transition-transform duration-500 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-start px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <Link to="/" onClick={closeMenu} className="text-xl font-bold tracking-tight text-gray-700">
            SOCIETY
          </Link>
        </div>

        {/* Menu Content */}
        <div className="flex flex-col h-[calc(100%-73px)] overflow-y-auto">
          {/* Links */}
          <div className="flex-1 py-6 px-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeMenu}
                className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all duration-200 font-medium"
              >
                {link.text}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-6 border-t border-gray-200 bg-gray-50 space-y-3">
            {!user ? (
              <Link
                to="/login"
                onClick={closeMenu}
                className="block w-full text-center text-white rounded-lg px-4 py-3 bg-blue-500 transition-all duration-300 shadow-lg font-medium"
              >
                Login
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="block w-full text-center text-white rounded-lg px-4 py-3 bg-blue-500 transition-all duration-300 shadow-lg font-medium"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
