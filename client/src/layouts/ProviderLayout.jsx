import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { HiOutlineMenu, HiChevronDown, HiOutlineUserCircle, HiOutlineLogout } from 'react-icons/hi';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../features/authSlice';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ProviderSidebar from '../components/ProviderSidebar';
import { getFullName, getInitials } from '../utils/userHelpers';

const ProviderLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsUserDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

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
      <ProviderSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
          onClick={closeSidebar}
        />
      )}

      <main className="lg:ml-64 min-h-screen">
        <div className="lg:hidden sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm flex-shrink-0"
                aria-label="Open navigation"
              >
                <HiOutlineMenu size={20} />
              </button>
              <Link to="/provider/dashboard" className="text-sm font-semibold text-gray-900 truncate">
                Provider Dashboard
              </Link>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {user && (
                <div className="relative" ref={dropdownRef}>
                  <motion.button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Avatar */}
                    <div className="relative">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={getFullName(user)}
                          className="w-9 h-9 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-sm border-2 border-gray-200">
                          {getInitials(user)}
                        </div>
                      )}
                    </div>
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
                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                      >
                        {/* User Info Section */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                              {user.profileImage ? (
                                <img
                                  src={user.profileImage}
                                  alt={getFullName(user)}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-base border-2 border-gray-200">
                                  {getInitials(user)}
                                </div>
                              )}
                            </div>
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
                          <Link
                            to={`/update-profile/${user._id}`}
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <HiOutlineUserCircle size={18} className="text-gray-500 flex-shrink-0" />
                            <span>Update Profile</span>
                          </Link>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={() => {
                              setIsUserDropdownOpen(false);
                              handleLogout();
                            }}
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
          </div>
        </div>

        <div className="min-h-screen p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default ProviderLayout;
