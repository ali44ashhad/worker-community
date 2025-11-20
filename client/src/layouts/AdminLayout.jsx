import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { HiOutlineMenu } from 'react-icons/hi';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../features/authSlice';
import { toast } from 'react-hot-toast';
import { FaCartShopping } from "react-icons/fa6";
import { motion } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const wishlistIds = useSelector((s) => s.wishlist.ids);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

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
      <AdminSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

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
              <Link to="/admin" className="text-sm font-semibold text-gray-900 truncate">
                Admin Dashboard
              </Link>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {user && (
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link to={`/cart/${user._id}`} className="relative">
                    <FaCartShopping size={20} className="text-gray-700" />
                    {wishlistIds?.length > 0 && (
                      <motion.span
                        className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        {wishlistIds?.length || 0}
                      </motion.span>
                    )}
                  </Link>
                </motion.div>
              )}
              
              {user && (
                <motion.div whileHover={{ scale: 1.03 }}>
                  <Link
                    to={`/update-profile/${user._id}`}
                    className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-900 whitespace-nowrap"
                  >
                    Profile
                  </Link>
                </motion.div>
              )}
              
              <motion.button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-900 whitespace-nowrap"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Logout
              </motion.button>
            </div>
          </div>
        </div>

        <div className="min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
