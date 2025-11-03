import { useState, useEffect } from 'react';
import {
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineSearch,
} from 'react-icons/hi';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../features/authSlice';
import { toast } from 'react-hot-toast';
import { FaCartShopping } from "react-icons/fa6";
// import { FaRegHeart } from "react-icons/fa6";
import SearchDropdown from './SearchDropdown';

const Navbar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const wishlistIds = useSelector((s) => s.wishlist.ids);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    setIsSearchOpen(false); // Close search dropdown on route change
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out successfully');
      closeMenu();
    } catch (error) {
      toast.error(error || 'Logout failed');
    }
  };

  const navLinks = [
    { to: '/', text: 'Home' },
    { to: '/about', text: 'About' },
    { to: '/testimonials', text: 'Testimonials' },
    { to: '/faq', text: 'FAQ' },
    { to: '/contact', text: 'Contact' },
    { to: '/service', text: 'Service' },
    { to: '/category', text: 'Categories' },
  ];

  return (
    <header className="fixed top-0 text-white left-0 w-full bg-black z-50 h-16 shadow-md border-b border-gray-800">
      <nav className="max-w-[1370px] mx-auto px-3 sm:px-6 lg:px-8 h-full flex items-center justify-between relative">

        {/* Left Side: Logo */}
        <Link
          to="/"
          className={`text-[1.45rem] font-semibold ${user ? "min-w-[300px]" : ""} text-white flex items-center gap-0.5`}
        >
          {user ? `Hi ${user.name},` : "Commun"}
        </Link>

        {/* Centered Nav Links */}
        {!user && (
          <div className="hidden xl:flex flex-1 justify-center ml-24 items-center text-[0.94rem] space-x-8">
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
        )}

        {/* Right Side */}
        <div className="hidden xl:flex items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search services..."
              onClick={() => setIsSearchOpen(true)}
              className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg pl-9 py-2 w-56 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              readOnly
            />
            {isSearchOpen && (
              <SearchDropdown 
                isOpen={isSearchOpen} 
                onClose={() => setIsSearchOpen(false)} 
              />
            )}
          </div>

          {!user ? (
            <Link
              to="/login"
              className="text-black text-[0.94rem] bg-white rounded-lg px-4 py-2 transition-all duration-300 shadow-lg font-medium"
            >
              Login
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              {user && user.role === 'customer' && (
                <Link
                  to="/become-provider"
                  className="text-black text-[0.94rem] bg-white cursor-pointer rounded-lg px-4 py-2 transition-all duration-300 shadow-lg font-medium"
                >
                  Become Provider
                </Link>
              )}
              {user && user.role === 'provider' && (
                <Link
                  to="/update-services"
                  className="text-black text-[0.94rem] bg-white cursor-pointer rounded-lg px-4 py-2 transition-all duration-300 shadow-lg font-medium"
                >
                  Update Services
                </Link>
              )}
              {user && user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-black text-[0.94rem] bg-white cursor-pointer rounded-lg px-4 py-2 transition-all duration-300 shadow-lg font-medium"
                >
                  Admin Dashboard
                </Link>
              )}

              {user && (
                <Link
                  to={`/update-profile/${user._id}`}
                  className="text-black text-[0.94rem] bg-white cursor-pointer rounded-lg px-4 py-2 transition-all duration-300 shadow-lg font-medium"
                >
                  Update Profile
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="text-black text-[0.94rem] bg-white cursor-pointer rounded-lg px-4 py-2 transition-all duration-300 shadow-lg font-medium"
              >
                Logout
              </button>

              {/* Wishlist Icon */}
              {user && (
                <Link to={`/cart/${user._id}`} className="relative">
                  <FaCartShopping size={30} className="text-white" />
                  <span className="absolute -top-2 -right-2 bg-white text-black text-[0.7rem] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-black">
                    {wishlistIds?.length || 0}
                  </span>
                </Link>
              )}

            
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-4 xl:hidden">
          {/* Wishlist icon for mobile */}
          {user && (
            <Link to={`/cart/${user._id}`} className="relative right-3">
              <FaCartShopping size={26} className="text-white" />
              <span className="absolute -top-2 -right-2 bg-white text-black text-[0.65rem] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-black">
                {wishlistIds?.length || 0}
              </span>
            </Link>
          )}

          <button
            className="text-white right-3 relative focus:outline-none z-60"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <HiOutlineX size={28} /> : <HiOutlineMenu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="xl:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={closeMenu}
        />
      )}

      {/* Slide-in Mobile Menu */}
      <div
        className={`xl:hidden fixed top-0 right-0 bottom-0 w-[85%] bg-black max-w-sm z-50 transform transition-transform duration-500 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-start px-6 py-5 border-gray-200 border-b bg-black">
          <Link to="/" onClick={closeMenu} className="text-xl font-bold tracking-tight text-white">
            Commun
          </Link>
        </div>

        <div className="flex flex-col h-[calc(100%-73px)] overflow-y-auto">
          <div className="flex-1 py-6 px-6 space-y-1 bg-black">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeMenu}
                className="block px-4 py-3 text-white hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
              >
                {link.text}
              </Link>
            ))}
            {user && (
              <Link
                to="/update-profile"
                onClick={closeMenu}
                className="block px-4 py-3 text-white hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
              >
                Update Profile
              </Link>
            )}
            {user && (
              <Link
                to="/become-provider"
                onClick={closeMenu}
                className="block px-4 py-3 text-white hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
              >
                {user.role === "provider" ? "Update Services" : "Become Provider"}
              </Link>
            )}
          </div>

          <div className="px-6 py-6 border-t border-gray-200 bg-black space-y-3">
            {!user ? (
              <Link
                to="/login"
                onClick={closeMenu}
                className="block text-center text-black rounded-lg px-3 py-2 bg-white transition-all duration-300 shadow-lg font-medium"
              >
                Login
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="block w-full text-center text-black rounded-lg px-3 py-2 bg-white transition-all duration-300 shadow-lg font-medium"
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
