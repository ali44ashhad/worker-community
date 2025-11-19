import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineBriefcase,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineX,
} from 'react-icons/hi';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../features/authSlice';
import { motion } from 'framer-motion';

const AdminSidebar = ({ isOpen = true, onClose }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const menuItems = [
    {
      icon: HiOutlineHome,
      label: 'Dashboard',
      path: '/admin/dashboard',
    },
    {
      icon: HiOutlineUserGroup,
      label: 'Providers',
      path: '/admin/providers',
    },
    {
      icon: HiOutlineBriefcase,
      label: 'Services',
      path: '/admin/services',
    },
    {
      icon: HiOutlineUser,
      label: 'Update Profile',
      path: '/admin/update-profile',
    },
    {
      icon: HiOutlineHome,
      label: 'Home Page',
      path: '/',
    },
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleNavClick = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <div
      className={`w-64 bg-white border-r border-gray-300 min-h-screen fixed left-0 top-0 flex flex-col shadow-lg z-40 transform transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Logo/Header */}
      <motion.div
        className="p-6 border-b border-gray-300 flex items-center justify-between gap-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-black tracking-tight">Admin Panel</h1>
          {user && (
            <p className="text-sm text-gray-600 mt-2">Welcome, {user.name}</p>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-black hover:bg-gray-50 transition-all"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <HiOutlineX size={18} />
          </button>
        )}
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <motion.li
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link
                  to={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? 'bg-black text-white font-semibold shadow-md'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-black'
                  }`}
                >
                  <Icon
                    size={20}
                    className={isActive ? 'text-white' : 'text-gray-600 group-hover:text-black'}
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <motion.div
        className="p-4 border-t border-gray-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <button
          onClick={() => {
            handleLogout();
            handleNavClick();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-black transition-all duration-300 font-medium border border-gray-300 hover:border-gray-400"
        >
          <HiOutlineLogout size={20} />
          <span>Logout</span>
        </button>
      </motion.div>
    </div>
  );
};

export default AdminSidebar;
