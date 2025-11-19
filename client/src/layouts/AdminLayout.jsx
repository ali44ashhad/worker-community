import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { HiOutlineMenu } from 'react-icons/hi';
import AdminSidebar from '../components/AdminSidebar';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

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
        <div className="lg:hidden sticky top-0 z-20 flex items-center gap-3 bg-white/90 backdrop-blur px-4 py-3 border-b border-gray-200 shadow-sm">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm"
            aria-label="Open navigation"
          >
            <HiOutlineMenu size={20} />
          </button>
          <p className="text-sm font-semibold text-gray-700">Menu</p>
        </div>

        <div className="min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
