import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAdminDashboardStats } from '../../features/adminSlice';
import { 
  HiOutlineUsers, 
  HiOutlineUserGroup, 
  HiOutlineBriefcase,
  HiOutlineCollection,
  HiOutlineChartBar,
  HiOutlineSparkles,
  HiOutlineStar
} from 'react-icons/hi';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { dashboardStats, isLoading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getAdminDashboardStats());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-xl">Error: {error}</div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Users',
      value: dashboardStats?.totalUsers || 0,
      icon: HiOutlineUsers,
      color: 'bg-blue-500',
    },
    {
      label: 'Total Providers',
      value: dashboardStats?.totalProviders || 0,
      icon: HiOutlineUserGroup,
      color: 'bg-green-500',
    },
    {
      label: 'Total Services',
      value: dashboardStats?.totalServices || 0,
      icon: HiOutlineBriefcase,
      color: 'bg-purple-500',
    },
    {
      label: 'Customers',
      value: dashboardStats?.roleCounts?.customer || 0,
      icon: HiOutlineCollection,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white border border-gray-300 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={28} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Breakdown */}
      <div className="bg-white border border-gray-300 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">User Role Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Customers</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {dashboardStats?.roleCounts?.customer || 0}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Providers</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {dashboardStats?.roleCounts?.provider || 0}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Admins</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {dashboardStats?.roleCounts?.admin || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Categories */}
        <div className="bg-white border border-gray-300 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500 p-2 rounded-lg">
              <HiOutlineChartBar className="text-white" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Top Categories</h2>
          </div>
          {dashboardStats?.topCategories && dashboardStats.topCategories.length > 0 ? (
            <div className="space-y-3">
              {dashboardStats.topCategories.slice(0, 5).map((cat, index) => (
                <div
                  key={cat.category}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{cat.category}</p>
                      <p className="text-xs text-gray-600">{cat.serviceCount} services</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{cat.totalClicks}</p>
                    <p className="text-xs text-gray-600">clicks</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No data available</p>
          )}
        </div>

        {/* Top Services */}
        <div className="bg-white border border-gray-300 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-500 p-2 rounded-lg">
              <HiOutlineSparkles className="text-white" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Top Services</h2>
          </div>
          {dashboardStats?.topServices && dashboardStats.topServices.length > 0 ? (
            <div className="space-y-3">
              {dashboardStats.topServices.slice(0, 5).map((service, index) => (
                <div
                  key={service._id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{service.serviceCategory}</p>
                    <p className="text-xs text-gray-600 truncate">
                      {service.provider?.user?.name || 'Unknown Provider'}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900">{service.serviceOfferingCount || 0}</p>
                    <p className="text-xs text-gray-600">clicks</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No data available</p>
          )}
        </div>

        {/* Top Providers */}
        <div className="bg-white border border-gray-300 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-500 p-2 rounded-lg">
              <HiOutlineStar className="text-white" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Top Providers</h2>
          </div>
          {dashboardStats?.topProviders && dashboardStats.topProviders.length > 0 ? (
            <div className="space-y-3">
              {dashboardStats.topProviders.slice(0, 5).map((provider, index) => (
                <div
                  key={provider._id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-600 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                    <p className="font-semibold text-gray-900 truncate">{provider.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-600 truncate">{provider.user?.email || ''}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900">{provider.providerProfileCount || 0}</p>
                    <p className="text-xs text-gray-600">clicks</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No data available</p>
          )}
        </div>
      </div>

      {/* Recent Providers */}
      <div className="bg-white border border-gray-300 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Providers</h2>
        {dashboardStats?.recentProviders && dashboardStats.recentProviders.length > 0 ? (
          <div className="space-y-4">
            {dashboardStats.recentProviders.map((provider) => (
              <div
                key={provider._id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
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
                  <p className="font-semibold text-gray-900">{provider.user?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">{provider.user?.email || ''}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(provider.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No providers yet</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
