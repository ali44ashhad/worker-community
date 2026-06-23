import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, UserCircle } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../features/authSlice';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ProviderSidebar from '../components/ProviderSidebar';
import ProfileAvatar from '../components/ProfileAvatar';
import { getFullName } from '../utils/userHelpers';
import { formatCommunDisplayName } from '../utils/communName';

const ProviderLayout = ({ children }) => {
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
    <div className="relative min-h-screen bg-[var(--background-subtle)]">
      <ProviderSidebar isOpen={isDesktop ? true : isSidebarOpen} onClose={closeSidebar} />

      <main className="min-h-screen lg:ml-64">
        <div
          className={`sticky top-0 z-20 border-b border-purple-100/60 bg-white/90 shadow-sm shadow-purple-500/5 backdrop-blur-md transition-opacity duration-300 lg:hidden ${
            isSidebarOpen ? 'hidden' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-100 bg-white text-[var(--purple-primary)] shadow-sm transition-colors hover:bg-purple-50"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link
                to="/provider/dashboard"
                className="truncate text-sm font-semibold text-[var(--text-primary)]"
              >
                Provider
              </Link>
            </div>

            {user && (
              <div className="relative shrink-0" ref={dropdownRef}>
                <motion.button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-1.5 rounded-xl p-1 transition-colors hover:bg-purple-50"
                  whileTap={{ scale: 0.97 }}
                >
                  <ProfileAvatar user={user} size="md" />
                  <ChevronDown
                    className={`h-4 w-4 text-[var(--text-secondary)] transition-transform duration-200 ${
                      isUserDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </motion.button>

                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-purple-100/50 bg-white/95 py-2 shadow-lg shadow-purple-500/10 backdrop-blur-sm"
                    >
                      <div className="border-b border-purple-100/60 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ProfileAvatar user={user} size="lg" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                              {getFullName(user)}
                            </p>
                            <p className="truncate text-xs text-[var(--text-secondary)]">
                              {user.communName
                                ? formatCommunDisplayName(user.communName)
                                : user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="py-1.5">
                        <Link
                          to="/provider/update-profile"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--text-primary)] transition-colors hover:bg-purple-50"
                        >
                          <UserCircle className="h-4 w-4 shrink-0 text-[var(--purple-primary)]" />
                          <span>Update profile</span>
                        </Link>
                        <div className="my-1 border-t border-purple-100/60" />
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            handleLogout();
                          }}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4 shrink-0 text-red-500" />
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

        <div className="min-h-screen p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
};

export default ProviderLayout;
