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
import { FaRegHeart } from "react-icons/fa6";

const Navbar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const wishlistIds = useSelector((s) => s.wishlist.ids);

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
          className={`text-[1.45rem] font-semibold ${user ? "min-w-[300px]" : "" } text-white flex items-center gap-0.5`}
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
              {user && user.role !== 'provider' && (
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

              {/* 🖤 Wishlist Icon with Counter */}
              {user && (
                <Link to={`/cart/${user._id}`} className="relative">
                  <FaCartShopping size={30} className="text-white" />
                  {wishlistIds?.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-white text-black text-[0.7rem] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-black">
                      {wishlistIds.length}
                    </span>
                  )}
                </Link>
              )}

            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="xl:hidden text-white focus:outline-none z-60"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <HiOutlineX size={28} /> : <HiOutlineMenu size={28} />}
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
