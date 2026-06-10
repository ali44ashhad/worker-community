import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineViewGrid,
  HiOutlineLogout,
  HiOutlineX,
  HiOutlineClipboardCheck,
  HiOutlineUsers,
  HiOutlineSpeakerphone,
  HiOutlineCalendar,
} from 'react-icons/hi';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../features/authSlice';
import { motion } from 'framer-motion';

const SecretarySidebar = ({ isOpen = true, onClose }) => {
  const portalContainerRef = useRef(null);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    const container = document.createElement('div');
    container.id = 'secretary-sidebar-portal';
    container.style.cssText =
      'position: static; transform: none; -webkit-transform: none; isolation: isolate; will-change: auto;';
    document.body.appendChild(container);
    portalContainerRef.current = container;
    setPortalReady(true);
    return () => {
      if (portalContainerRef.current?.parentNode) {
        portalContainerRef.current.parentNode.removeChild(portalContainerRef.current);
      }
      portalContainerRef.current = null;
      setPortalReady(false);
    };
  }, []);

  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const menuItems = [
    { icon: HiOutlineViewGrid, label: 'Dashboard', path: '/secretary/dashboard' },
    { icon: HiOutlineClipboardCheck, label: 'Approve / reject', path: '/secretary/approvals' },
    { icon: HiOutlineUsers, label: 'Member list', path: '/secretary/members' },
    { icon: HiOutlineSpeakerphone, label: 'Broadcast', path: '/secretary/broadcast' },
    { icon: HiOutlineCalendar, label: 'Events', path: '/secretary/events' },
    { icon: HiOutlineHome, label: 'Commun Home', path: '/' },
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleNavClick = () => {
    if (typeof onClose === 'function') onClose();
  };

  const sidebarContent = (
    <div
      className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col overflow-hidden border-r border-gray-200 bg-white shadow-lg"
      style={{
        transform: isOpen ? 'translateX(0) translateZ(0)' : 'translateX(-100%) translateZ(0)',
        transition: 'transform 0.3s ease-in-out',
      }}
    >
      <motion.div
        className="flex items-center justify-between gap-3 border-b border-gray-200 p-6"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Secretary panel</h1>
          {user && (
            <p className="mt-1 truncate text-sm text-gray-600">
              {user.communName ? `@${user.communName}` : user.name}
            </p>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 lg:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <HiOutlineX size={18} />
          </button>
        )}
      </motion.div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <motion.li
                key={item.path}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-white' : 'text-gray-500'} />
                  {item.label}
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-200 p-4">
        <button
          type="button"
          onClick={() => {
            handleLogout();
            handleNavClick();
          }}
          className="flex w-full items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <HiOutlineLogout size={20} />
          Logout
        </button>
      </div>
    </div>
  );

  if (!portalReady || !portalContainerRef.current) return null;
  return createPortal(sidebarContent, portalContainerRef.current);
};

export default SecretarySidebar;
