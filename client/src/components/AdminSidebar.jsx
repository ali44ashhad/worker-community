import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HiOutlineHome, 
  HiOutlineUserGroup,
  HiOutlineBriefcase,
  HiOutlineLogout 
} from 'react-icons/hi';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../features/authSlice';

const AdminSidebar = () => {
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
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div className="w-64 bg-black text-white min-h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        {user && (
          <p className="text-sm text-gray-400 mt-1">Welcome, {user.name}</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-white text-black font-semibold'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200"
        >
          <HiOutlineLogout size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
