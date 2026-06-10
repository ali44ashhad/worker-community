import React, { useEffect, useState, useRef } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { HiOutlineMenu, HiChevronDown, HiOutlineUserCircle, HiOutlineLogout } from 'react-icons/hi';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../features/authSlice';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import SecretarySidebar from '../components/SecretarySidebar';
import { getFullName, getInitials } from '../utils/userHelpers';

const SecretaryLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsUserDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error(error || 'Logout failed');
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      <SecretarySidebar isOpen={isDesktop ? true : isSidebarOpen} onClose={closeSidebar} />

      <main className="relative z-10 min-h-screen lg:ml-64">
        <div
          className={`sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur shadow-sm lg:hidden ${
            isSidebarOpen ? 'hidden' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm"
                aria-label="Open navigation"
              >
                <HiOutlineMenu size={20} />
              </button>
              <Link to="/secretary/dashboard" className="truncate text-sm font-semibold text-gray-900">
                Secretary panel
              </Link>
            </div>
            {user && (
              <div className="relative flex-shrink-0" ref={dropdownRef}>
                <motion.button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2"
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={getFullName(user)}
                      className="h-9 w-9 rounded-full border-2 border-gray-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-900 text-sm font-semibold text-white">
                      {getInitials(user)}
                    </div>
                  )}
                  <HiChevronDown
                    className={`text-gray-600 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                    size={18}
                  />
                </motion.button>
                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-100 bg-white py-2 shadow-lg"
                    >
                      <Link
                        to={`/update-profile/${user._id}`}
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <HiOutlineUserCircle size={18} className="text-gray-500" />
                        Update profile
                      </Link>
                      <div className="my-1 border-t border-gray-100" />
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        <HiOutlineLogout size={18} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        <div className="min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SecretaryLayout;
