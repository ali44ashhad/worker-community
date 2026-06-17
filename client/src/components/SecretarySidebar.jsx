import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import {
  Calendar,
  ClipboardCheck,
  Home,
  LayoutGrid,
  LogOut,
  Megaphone,
  User,
  Users,
  X,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../features/authSlice';
import { motion } from 'framer-motion';
import SidebarPanelGreeting from './SidebarPanelGreeting';

const menuItems = [
  { icon: LayoutGrid, label: 'Dashboard', path: '/secretary/dashboard' },
  { icon: ClipboardCheck, label: 'Approve / reject', path: '/secretary/approvals' },
  { icon: Users, label: 'Member list', path: '/secretary/members' },
  { icon: Megaphone, label: 'Broadcast', path: '/secretary/broadcast' },
  { icon: Calendar, label: 'Events', path: '/secretary/events' },
  { icon: User, label: 'Update Profile', path: '/secretary/update-profile' },
  { icon: Home, label: 'Commun Home', path: '/' },
];

const SecretarySidebar = ({ isOpen = true, onClose }) => {
  const portalContainerRef = useRef(null);
  const [portalReady, setPortalReady] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

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

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleNavClick = () => {
    if (typeof onClose === 'function') onClose();
  };

  const sidebarContent = (
    <div
      className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col overflow-hidden border-r border-purple-100/60 bg-white/95 shadow-lg shadow-purple-500/5 backdrop-blur-sm"
      style={{
        transform: isOpen ? 'translateX(0) translateZ(0)' : 'translateX(-100%) translateZ(0)',
        transition: 'transform 0.3s ease-in-out',
      }}
    >
      <motion.div
        className="flex items-center justify-between gap-3 border-b border-purple-100/60 p-5"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="min-w-0">
          <Link to="/secretary/dashboard" onClick={handleNavClick} className="inline-flex items-center gap-2">
            <img src="/CommuN-logo.png" alt="CommuN" className="sidebar-logo" />
          </Link>
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-[var(--purple-primary)]">
            Secretary Panel
          </p>
          <SidebarPanelGreeting user={user} />
        </div>
        {onClose && (
          <button
            type="button"
            className="rounded-xl border border-purple-100 p-2 text-[var(--text-secondary)] transition-colors hover:bg-purple-50 hover:text-[var(--purple-primary)] lg:hidden"
            onClick={onClose}
            aria-label="Close navigation"
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
                transition={{ delay: index * 0.04 }}
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
                  {item.label}
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-purple-100/60 p-3">
        <button
          type="button"
          onClick={() => {
            handleLogout();
            handleNavClick();
          }}
          className="flex w-full items-center gap-3 rounded-xl border border-purple-100 px-3.5 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );

  if (!portalReady || !portalContainerRef.current) return null;
  return createPortal(sidebarContent, portalContainerRef.current);
};

export default SecretarySidebar;
