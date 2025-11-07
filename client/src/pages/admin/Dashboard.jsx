import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAdminDashboardStats } from '../../features/adminSlice';
import { 
  HiOutlineUsers, 
  HiOutlineUserGroup, 
  HiOutlineBriefcase,
  HiOutlineCollection,
  HiOutlineChartBar,
  HiOutlineStar
} from 'react-icons/hi';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { dashboardStats, isLoading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getAdminDashboardStats());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-xl font-semibold text-black">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-red-600 text-xl font-semibold">Error: {error}</p>
        </motion.div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Users',
      value: dashboardStats?.totalUsers || 0,
      icon: HiOutlineUsers,
    },
    {
      label: 'Total Providers',
      value: dashboardStats?.totalProviders || 0,
      icon: HiOutlineUserGroup,
    },
    {
      label: 'Total Services',
      value: dashboardStats?.totalServices || 0,
      icon: HiOutlineBriefcase,
    },
    {
      label: 'Customers',
      value: dashboardStats?.roleCounts?.customer || 0,
      icon: HiOutlineCollection,
    },
  ];

  return (
    <motion.div 
      className="max-w-[1350px] mx-auto px-6 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-black mb-3 tracking-tight">Admin Dashboard</h1>
        <p className="text-gray-600 max-w-2xl">Overview of your platform and community insights</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="bg-white border border-gray-300 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-black">{stat.value}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <Icon className="text-gray-900" size={28} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Role Breakdown */}
      <motion.div 
        className="bg-white border border-gray-300 rounded-2xl p-8 mb-8 shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-black mb-6 tracking-tight">User Role Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-300 hover:bg-gray-100 transition-all duration-300">
            <p className="text-sm text-gray-600 font-medium mb-2">Customers</p>
            <p className="text-3xl font-bold text-black">
              {dashboardStats?.roleCounts?.customer || 0}
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-300 hover:bg-gray-100 transition-all duration-300">
            <p className="text-sm text-gray-600 font-medium mb-2">Providers</p>
            <p className="text-3xl font-bold text-black">
              {dashboardStats?.roleCounts?.provider || 0}
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-300 hover:bg-gray-100 transition-all duration-300">
            <p className="text-sm text-gray-600 font-medium mb-2">Admins</p>
            <p className="text-3xl font-bold text-black">
              {dashboardStats?.roleCounts?.admin || 0}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Categories */}
        <motion.div 
          className="bg-white border border-gray-300 rounded-2xl p-6 shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
              <HiOutlineChartBar className="text-gray-900" size={24} />
            </div>
            <h2 className="text-xl font-bold text-black tracking-tight">Top Categories</h2>
          </div>
          {dashboardStats?.topCategories && dashboardStats.topCategories.length > 0 ? (
            <div className="space-y-3">
              {dashboardStats.topCategories.slice(0, 5).map((cat, index) => (
                <motion.div
                  key={cat.category}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 border border-gray-300"
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center font-bold text-black">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-black">{cat.category}</p>
                      <p className="text-xs text-gray-600">{cat.serviceCount} services</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-black">{cat.totalClicks}</p>
                    <p className="text-xs text-gray-600">clicks</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No data available</p>
          )}
        </motion.div>

        {/* Top Providers */}
        <motion.div 
          className="bg-white border border-gray-300 rounded-2xl p-6 shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
              <HiOutlineStar className="text-gray-900" size={24} />
            </div>
            <h2 className="text-xl font-bold text-black tracking-tight">Top Providers</h2>
          </div>
          {dashboardStats?.topProviders && dashboardStats.topProviders.length > 0 ? (
            <div className="space-y-3">
              {dashboardStats.topProviders.slice(0, 5).map((provider, index) => (
                <motion.div
                  key={provider._id}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 border border-gray-300"
                  whileHover={{ x: 4 }}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center font-bold text-black flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {provider.user?.profileImage ? (
                      <img
                        src={provider.user.profileImage}
                        alt={provider.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 font-semibold text-sm">
                        {provider.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-black truncate">{provider.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-600 truncate">{provider.user?.email || ''}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-black">{provider.providerProfileCount || 0}</p>
                    <p className="text-xs text-gray-600">clicks</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No data available</p>
          )}
        </motion.div>
      </div>

      {/* Recent Providers */}
      <motion.div 
        className="bg-white border border-gray-300 rounded-2xl p-8 shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <h2 className="text-2xl font-bold text-black mb-6 tracking-tight">Recent Providers</h2>
        {dashboardStats?.recentProviders && dashboardStats.recentProviders.length > 0 ? (
          <div className="space-y-4">
            {dashboardStats.recentProviders.map((provider) => (
              <motion.div
                key={provider._id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 border border-gray-300"
                whileHover={{ x: 4 }}
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center overflow-hidden">
                  {provider.user?.profileImage ? (
                    <img
                      src={provider.user.profileImage}
                      alt={provider.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-semibold">
                      {provider.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-black">{provider.user?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">{provider.user?.email || ''}</p>
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  {new Date(provider.createdAt).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No providers yet</p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
