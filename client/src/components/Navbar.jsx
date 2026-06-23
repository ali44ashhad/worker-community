import React, { useState, useEffect, useRef } from 'react';
import {
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineSearch,
  HiChevronDown,
  HiOutlineViewGrid,
  HiOutlineCog,
  HiOutlineUserCircle,
  HiOutlineLogout,
} from 'react-icons/hi';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../features/authSlice';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import SearchDropdown from './SearchDropdown';
import { getFullName } from '../utils/userHelpers';
import ProfileAvatar from './ProfileAvatar';

const Navbar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const desktopContains = desktopDropdownRef.current?.contains(event.target);
      const mobileContains = mobileDropdownRef.current?.contains(event.target);
      
      if (!desktopContains && !mobileContains) {
        setIsUserDropdownOpen(false);
      }
    };

    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out successfully');
      closeMenu();
      setIsUserDropdownOpen(false);
    } catch (error) {
      toast.error(error || 'Logout failed');
    }
  };

  // Get user's first name and initial

  const primaryNavLinks = [ 
    { to: '/about', text: 'About Us' },
    { to: '/service', text: 'Services' },
  ];

  const mobileNavLinks = [
    { to: '/', text: 'Home' },
    { to: location.pathname === '/' ? '/#categories' : '/category', text: 'Categories' },
    { to: '/about', text: 'About Us' },
    { to: '/service', text: 'Services' },
    { to: '/faq', text: 'FAQ' },
    { to: '/contact', text: 'Contact' },
  ];

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-[60] h-20 overflow-visible bg-white/95 backdrop-blur-md shadow-sm border-b border-purple-100/50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center shrink-0">
            <img src="/CommuN-logo.png" alt="CommuN" className="site-logo" />
          </Link>

          {/* Center nav — Figma: Categories + About Us */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-10 min-w-0">
            {primaryNavLinks.map((link, index) => (
              <motion.div
                key={link.text}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
              >
                <Link
                  to={link.to}
                  className="text-[var(--text-secondary)] hover:text-[var(--purple-primary)] transition-colors font-medium"
                >
                  {link.text}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right side - actions */}
          <div className="hidden md:flex items-center gap-3 min-w-0">
            <motion.div whileHover={{ scale: 1.02 }}>
              <button
                type="button"
                onClick={() => {
                  setIsUserDropdownOpen(false);
                  setIsSearchOpen(true);
                }}
                className="flex items-center gap-2 rounded-xl border border-purple-200/80 bg-white/70 px-5 py-2.5 font-medium text-[var(--text-secondary)] shadow-sm shadow-purple-500/5 transition-all hover:border-[var(--purple-primary)]/35 hover:bg-purple-50 hover:text-[var(--purple-primary)]"
              >
                <HiOutlineSearch className="h-4 w-4 text-[var(--purple-primary)]/80" />
                <span>Search</span>
              </button>
            </motion.div>

            {!user ? (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/login"
                  className="px-6 py-2.5 bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium text-sm"
                >
                  Sign In
                </Link>
              </motion.div>
            ) : (
              <div className="relative" ref={desktopDropdownRef}>
                <motion.button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setIsUserDropdownOpen((open) => !open);
                  }}
                  className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-purple-50 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ProfileAvatar
                    user={user}
                    size="lg"
                    alt={getFullName(user)}
                    className="border-2 border-purple-200"
                  />
                  <HiChevronDown 
                    className={`text-gray-600 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                    size={18}
                  />
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 z-[70] mt-2 w-64 rounded-xl border border-purple-100/50 bg-white py-2 shadow-lg shadow-purple-500/10"
                    >
                      {/* User Info Section */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <ProfileAvatar
                            user={user}
                            size="xl"
                            alt={getFullName(user)}
                            className="shrink-0 border-2 border-purple-200"
                          />
                          {/* Name and Email */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {getFullName(user)}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-1.5">
                      {user.role === 'customer' && (
                        <Link
                          to="/community/wishlist"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <HiOutlineViewGrid size={18} className="text-gray-500 flex-shrink-0" />
                          <span>User panel</span>
                        </Link>
                      )}
                      {user.role === 'provider' && (
                        <Link
                          to="/provider/dashboard"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <HiOutlineViewGrid size={18} className="text-gray-500 flex-shrink-0" />
                          <span>Provider Dashboard</span>
                        </Link>
                      )}
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <HiOutlineCog size={18} className="text-gray-500 flex-shrink-0" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      {user.role === 'secretary' && (
                        <Link
                          to="/secretary/dashboard"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <HiOutlineViewGrid size={18} className="text-gray-500 flex-shrink-0" />
                          <span>Secretary panel</span>
                        </Link>
                      )}
                      <Link
                        to="/update-profile"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <HiOutlineUserCircle size={18} className="text-gray-500 flex-shrink-0" />
                        <span>Update Profile</span>
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <HiOutlineLogout size={18} className="text-red-500 flex-shrink-0" />
                        <span>Logout</span>
                      </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-3 md:hidden">
            {user && (
              <div className="relative" ref={mobileDropdownRef}>
                <motion.button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setIsUserDropdownOpen((open) => !open);
                  }}
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ProfileAvatar
                    user={user}
                    size="md"
                    alt={getFullName(user)}
                    className="border-2 border-purple-200"
                  />
                  <HiChevronDown 
                    className={`text-gray-600 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                    size={18}
                  />
                </motion.button>

                {/* Dropdown Menu for Mobile */}
                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 z-[90] mt-2 w-64 rounded-xl border border-purple-100/50 bg-white py-2 shadow-lg shadow-purple-500/10"
                    >
                      {/* User Info Section */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <ProfileAvatar
                            user={user}
                            size="xl"
                            alt={getFullName(user)}
                            className="shrink-0 border-2 border-purple-200"
                          />
                          {/* Name and Email */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {getFullName(user)}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-1.5">
                      {user.role === 'customer' && (
                        <Link
                          to="/community/wishlist"
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            closeMenu();
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <HiOutlineViewGrid size={18} className="text-gray-500 flex-shrink-0" />
                          <span>User panel</span>
                        </Link>
                      )}
                      {user.role === 'provider' && (
                        <Link
                          to="/provider/dashboard"
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            closeMenu();
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <HiOutlineViewGrid size={18} className="text-gray-500 flex-shrink-0" />
                          <span>Provider Dashboard</span>
                        </Link>
                      )}
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            closeMenu();
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <HiOutlineCog size={18} className="text-gray-500 flex-shrink-0" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      {user.role === 'secretary' && (
                        <Link
                          to="/secretary/dashboard"
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            closeMenu();
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <HiOutlineViewGrid size={18} className="text-gray-500 flex-shrink-0" />
                          <span>Secretary panel</span>
                        </Link>
                      )}
                      <Link
                        to="/update-profile"
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          closeMenu();
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <HiOutlineUserCircle size={18} className="text-gray-500 flex-shrink-0" />
                        <span>Update Profile</span>
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <HiOutlineLogout size={18} className="text-red-500 flex-shrink-0" />
                        <span>Logout</span>
                      </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <motion.button
              className="p-2 text-[var(--purple-primary)] hover:bg-purple-50 rounded-lg transition-colors focus:outline-none"
              onClick={() => setIsMobileMenuOpen((s) => !s)}
              aria-label="Toggle menu"
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
            </motion.button>
          </div>
        </nav>
      </header>

      {/* Search overlay — rendered outside header so it is not clipped */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[55] bg-black/20 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
            />
            <motion.div
              className="fixed left-0 right-0 top-20 z-[65] flex justify-center px-4 sm:px-6"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <SearchDropdown isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMenu}
          />
        )}
      </AnimatePresence>

      {/* Slide-in menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            className="md:hidden fixed top-0 right-0 bottom-0 w-full sm:w-[85%] max-w-sm bg-white z-[80] shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="flex items-center justify-between px-6 py-6 border-b border-purple-100">
              <Link to="/" onClick={closeMenu} className="flex items-center gap-3 min-w-0">
                <img src="/CommuN-logo.png" alt="CommuN" className="site-logo" />
              </Link>
              <motion.button onClick={closeMenu} className="text-[var(--purple-primary)] p-2 hover:bg-purple-50 rounded-lg" aria-label="Close menu">
                <HiOutlineX size={22} />
              </motion.button>
            </div>

            <div className="flex flex-col h-[calc(100%-73px)] overflow-y-auto">
              <div className="py-6 px-6 space-y-2">
                {mobileNavLinks.map((link, i) => (
                  <motion.div key={link.text} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <Link
                      to={link.to}
                      onClick={closeMenu}
                      className={`block px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                        location.pathname === link.to || (link.to.includes('#categories') && location.pathname === '/')
                          ? 'bg-purple-50 text-[var(--purple-primary)]'
                          : 'text-[var(--text-secondary)] hover:bg-purple-50 hover:text-[var(--purple-primary)]'
                      }`}
                    >
                      {link.text}
                    </Link>
                  </motion.div>
                ))}

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: mobileNavLinks.length * 0.04 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      setIsSearchOpen(true);
                      closeMenu();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl border border-purple-200/80 bg-purple-50/30 px-4 py-3 font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--purple-primary)]/35 hover:bg-purple-50 hover:text-[var(--purple-primary)]"
                  >
                    <HiOutlineSearch size={18} className="text-[var(--purple-primary)]/80" />
                    Search
                  </button>
                </motion.div>

                {user && (
                  <>
                    {user.role === 'admin' && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (mobileNavLinks.length + 1) * 0.04 }}>
                        <Link to="/admin" onClick={closeMenu} className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl">Admin Dashboard</Link>
                      </motion.div>
                    )}
                    {user.role === 'secretary' && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (mobileNavLinks.length + 1) * 0.04 }}>
                        <Link to="/secretary/dashboard" onClick={closeMenu} className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl">Secretary panel</Link>
                      </motion.div>
                    )}
                    {user.role === 'provider' && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (mobileNavLinks.length + 1) * 0.04 }}>
                        <Link to="/provider/dashboard" onClick={closeMenu} className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl">Provider Dashboard</Link>
                      </motion.div>
                    )}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (mobileNavLinks.length + (['admin', 'provider', 'secretary'].includes(user.role) ? 2 : 1)) * 0.04 }}>
                      <Link to="/update-profile" onClick={closeMenu} className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl">Update Profile</Link>
                    </motion.div>
                    {user.role === 'customer' && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (mobileNavLinks.length + 1) * 0.04 }}>
                        <Link to="/community/wishlist" onClick={closeMenu} className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl">User panel</Link>
                      </motion.div>
                    )}
                  </>
                )}
              </div>

              <div className="px-6 py-6 border-t border-purple-100 space-y-3">
                {!user ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Link
                      to="/login"
                      onClick={closeMenu}
                      className="block text-center text-white rounded-xl px-4 py-3 bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] font-semibold hover:shadow-lg transition-all"
                    >
                      Sign In
                    </Link>
                  </motion.div>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="block w-full text-center text-white rounded-xl px-4 py-3 bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] font-semibold hover:shadow-lg transition-all"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
