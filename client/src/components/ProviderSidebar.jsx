import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineCog,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineX,
} from 'react-icons/hi';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/authSlice';
import { motion } from 'framer-motion';

const ProviderSidebar = ({ isOpen = true, onClose }) => {
  const portalContainerRef = useRef(null);

  useEffect(() => {
    // Create a container for the sidebar that doesn't have transforms
    const container = document.createElement('div');
    container.id = 'provider-sidebar-portal';
    container.style.cssText = 'position: static; transform: none; -webkit-transform: none; isolation: isolate; will-change: auto;';
    document.body.appendChild(container);
    portalContainerRef.current = container;

    return () => {
      if (portalContainerRef.current && portalContainerRef.current.parentNode) {
        portalContainerRef.current.parentNode.removeChild(portalContainerRef.current);
      }
    };
  }, []);
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const menuItems = [
    {
      icon: HiOutlineClipboardList,
      label: 'Dashboard',
      path: '/provider/dashboard',
    },
    {
      icon: HiOutlineCog,
      label: 'Manage Services',
      path: '/provider/manage-services',
    },
    {
      icon: HiOutlineUser,
      label: 'Update Profile',
      path: '/provider/update-profile',
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

  const sidebarContent = (
    <div
      className="w-64 bg-white border-r border-gray-300 fixed left-0 top-0 flex flex-col shadow-lg z-50 overflow-hidden"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        maxHeight: '100vh',
        width: '16rem',
        transform: isOpen ? 'translateX(0) translateZ(0)' : 'translateX(-100%) translateZ(0)',
        WebkitTransform: isOpen ? 'translateX(0) translateZ(0)' : 'translateX(-100%) translateZ(0)',
        transition: 'transform 0.3s ease-in-out',
        WebkitTransition: 'transform 0.3s ease-in-out',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility',
        imageRendering: 'crisp-edges',
        filter: 'none !important',
        WebkitFilter: 'none !important',
        backdropFilter: 'none !important',
        WebkitBackdropFilter: 'none !important',
        isolation: 'isolate',
        opacity: 1
      }}
    >
      <motion.div
        className="p-6 border-b border-gray-300 flex items-center justify-between gap-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-black tracking-tight">Provider Hub</h1>
          {user && <p className="text-sm text-gray-600 mt-2">Hello, {user.name}</p>}
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

  if (!portalContainerRef.current) {
    return null;
  }

  return createPortal(sidebarContent, portalContainerRef.current);
};

export default ProviderSidebar;
