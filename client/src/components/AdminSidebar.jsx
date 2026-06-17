import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Briefcase,
  ClipboardList,
  Home,
  Layers,
  LayoutDashboard,
  LogOut,
  Tag,
  User,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../features/authSlice';
import { motion } from 'framer-motion';
import SidebarPanelGreeting from './SidebarPanelGreeting';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: UserCog, label: 'Providers Mgmt', path: '/admin/providers' },
  { icon: Briefcase, label: 'Services Mgmt', path: '/admin/services' },
  { icon: Tag, label: 'Categories Mgnt', path: '/admin/categories' },
  { icon: Layers, label: 'Category Clicks', path: '/admin/category-clicks' },
  { icon: BarChart3, label: 'Provider Clicks', path: '/admin/provider-clicks' },
  { icon: Users, label: 'User Mgmt', path: '/admin/users' },
  { icon: ClipboardList, label: 'Secretary Mgmt', path: '/admin/secretaries' },
  { icon: User, label: 'Update Profile', path: '/admin/update-profile' },
  { icon: Home, label: 'Home Page', path: '/' },
];

const AdminSidebar = ({ isOpen = true, onClose }) => {
  const portalContainerRef = useRef(null);
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const container = document.createElement('div');
    container.id = 'admin-sidebar-portal';
    container.style.cssText =
      'position: static; transform: none; -webkit-transform: none; isolation: isolate; will-change: auto;';
    document.body.appendChild(container);
    portalContainerRef.current = container;

    return () => {
      if (portalContainerRef.current?.parentNode) {
        portalContainerRef.current.parentNode.removeChild(portalContainerRef.current);
      }
    };
  }, []);

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
      className="fixed left-0 top-0 z-50 flex w-64 flex-col overflow-hidden border-r border-purple-100/60 bg-white/95 shadow-lg shadow-purple-500/5 backdrop-blur-sm"
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
      }}
    >
      <motion.div
        className="flex items-center justify-between gap-3 border-b border-purple-100/60 p-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <div className="min-w-0">
          <Link to="/admin/dashboard" onClick={handleNavClick} className="inline-flex items-center gap-2">
            <img src="/CommuN-logo.png" alt="CommuN" className="sidebar-logo" />
          </Link>
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-[var(--purple-primary)]">
            Admin Panel
          </p>
          <SidebarPanelGreeting user={user} />
        </div>
        {onClose && (
          <button
            type="button"
            className="rounded-xl border border-purple-100 p-2 text-[var(--text-secondary)] transition-colors hover:bg-purple-50 hover:text-[var(--purple-primary)] lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </motion.div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <motion.li
                key={item.path}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
              >
                <Link
                  to={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] font-semibold text-white shadow-sm shadow-purple-500/20'
                      : 'font-medium text-[var(--text-secondary)] hover:bg-purple-50 hover:text-[var(--purple-primary)]'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : ''}`} />
                  <span>{item.label}</span>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      <motion.div
        className="border-t border-purple-100/60 p-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.2 }}
      >
        <button
          type="button"
          onClick={() => {
            handleLogout();
            handleNavClick();
          }}
          className="flex w-full items-center gap-3 rounded-xl border border-purple-100 px-3.5 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
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

export default AdminSidebar;
