import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineBadgeCheck,
  HiOutlineXCircle,
  HiOutlineUser,
  HiOutlineBriefcase,
  HiOutlineStar,
  HiOutlineCalendar,
} from 'react-icons/hi';
import { getProviderDashboardStats } from '../../features/providerSlice';
import { getFullName, getFirstName, getInitials } from '../../utils/userHelpers';

const statusStyles = {
  pending: {
    label: 'Pending',
    bar: 'bg-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800',
  },
  accepted: {
    label: 'Accepted',
    bar: 'bg-blue-200',
    badge: 'bg-blue-100 text-blue-800',
  },
  rejected: {
    label: 'Rejected',
    bar: 'bg-pink-200',
    badge: 'bg-pink-100 text-pink-800',
  },
  completed: {
    label: 'Completed',
    bar: 'bg-green-200',
    badge: 'bg-green-100 text-green-800',
  },
  cancelled: {
    label: 'Cancelled',
    bar: 'bg-red-200',
    badge: 'bg-red-100 text-red-800',
  },
};

const ProviderDashboard = () => {
  const dispatch = useDispatch();
  const { dashboardStats, isFetchingDashboard, dashboardError } = useSelector(
    (state) => state.provider
  );
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(getProviderDashboardStats());
  }, [dispatch]);

  const totalBookings = dashboardStats?.totalBookings || 0;
  const recentBookings = dashboardStats?.recentBookings || [];
  const upcomingBookings = dashboardStats?.upcomingBookings || [];
  const statusCounts = dashboardStats?.statusCounts || {};
  const totalServices = dashboardStats?.totalServices || 0;
  const averageRating = dashboardStats?.averageRating || 0;
  const totalReviews = dashboardStats?.totalReviews || 0;
  const profileViews = dashboardStats?.profileViews || 0;
  const serviceClicks = dashboardStats?.serviceClicks || 0;
  const serviceClickDetails = dashboardStats?.serviceClickDetails || [];

  const formatDate = (dateString, options) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const statusData = useMemo(() => {
    return Object.keys(statusStyles).map((key) => {
      const count = statusCounts[key] || 0;
      const percentage = totalBookings ? Math.round((count / totalBookings) * 100) : 0;
      return { key, count, percentage, ...statusStyles[key] };
    });
  }, [statusCounts, totalBookings]);

  if (isFetchingDashboard && !dashboardStats) {
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
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-xl font-semibold text-black">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (dashboardError && !dashboardStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-red-600 text-xl font-semibold">Error: {dashboardError}</p>
        </motion.div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Bookings',
      value: totalBookings,
      icon: HiOutlineClipboardList,
    },
    {
      label: 'Active Services',
      value: totalServices,
      icon: HiOutlineBriefcase,
    },
    {
      label: 'Avg. Rating',
      value: averageRating ? averageRating.toFixed(1) : '0.0',
      subValue: `${totalReviews} reviews`,
      icon: HiOutlineStar,
    },
    // {
    //   label: 'Pending Requests',
    //   value: statusCounts.pending || 0,
    //   icon: HiOutlineClock,
    // },
    {
      label: 'Profile Clicks',
      value: profileViews,
      icon: HiOutlineUser,
    },
    {
      label: 'Service Clicks',
      value: serviceClicks,
      icon: HiOutlineCheckCircle,
    },
    // {
    //   label: 'Accepted Jobs',
    //   value: statusCounts.accepted || 0,
    //   icon: HiOutlineCheckCircle,
    // },
    // {
    //   label: 'Completed Jobs',
    //   value: statusCounts.completed || 0,
    //   icon: HiOutlineBadgeCheck,
    // },
    // {
    //   label: 'Cancelled',
    //   value: statusCounts.cancelled || 0,
    //   icon: HiOutlineXCircle,
    // },
  ];

  return (
    <motion.div
      className="max-w-[1200px] mx-auto px-6 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-sm uppercase tracking-wide text-gray-500 mb-1">
          Welcome back{user ? `, ${getFirstName(user)}` : ''}
        </p>
        <h1 className="text-4xl font-bold text-black tracking-tight">Provider Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Track your bookings, monitor progress, and stay ahead of your commitments.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-black mt-2">{stat.value}</p>
                  {stat.subValue && (
                    <p className="text-xs text-gray-500 mt-1 font-medium">{stat.subValue}</p>
                  )}
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <Icon className="text-gray-900" size={26} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <motion.div
          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
              <HiOutlineClipboardList className="text-gray-900" size={24} />
            </div>
            <h2 className="text-xl font-bold text-black tracking-tight">Booking Status</h2>
          </div>
          <div className="space-y-4">
            {statusData.map((status) => (
              <div key={status.key}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-black">{status.label}</p>
                  <p className="text-sm text-gray-500">{status.count} bookings</p>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${status.bar}`}
                    style={{ width: `${status.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{status.percentage}% of total</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
              <HiOutlineUser className="text-gray-900" size={24} />
            </div>
            <h2 className="text-xl font-bold text-black tracking-tight">Recent Bookings</h2>
          </div>

          {recentBookings.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No bookings yet.</p>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking, index) => {
                const customer = booking.customer || {};
                const initials = getInitials(customer);
                const scheduledDate = formatDate(booking.scheduledDate);
                const createdAt = formatDate(booking.createdAt);
                const style = statusStyles[booking.status] || statusStyles.pending;

                return (
                  <motion.div
                    key={booking._id || index}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
                    whileHover={{ x: 4 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {customer.profileImage ? (
                        <img
                          src={customer.profileImage}
                          alt={getFullName(customer)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-700 font-semibold">{initials}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-black truncate">
                        {getFullName(customer) || 'Unknown Customer'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {booking.serviceCategory} • Scheduled {scheduledDate}
                      </p>
                      <p className="text-xs text-gray-400">Booked on {createdAt}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${style.badge}`}>
                      {style.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div
          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
              <HiOutlineCalendar className="text-gray-900" size={24} />
            </div>
            <h2 className="text-xl font-bold text-black tracking-tight">Upcoming Jobs</h2>
          </div>
          {upcomingBookings.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No upcoming bookings.</p>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking, index) => {
                const customer = booking.customer || {};
                const initials = getInitials(customer);
                const scheduledDate = booking.scheduledDate
                  ? new Date(booking.scheduledDate).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })
                  : 'To be decided';
                const style = statusStyles[booking.status] || statusStyles.pending;

                return (
                  <motion.div
                    key={booking._id || index}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
                    whileHover={{ x: 4 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {customer.profileImage ? (
                        <img
                          src={customer.profileImage}
                          alt={getFullName(customer)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-700 font-semibold">{initials}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-black truncate">
                        {getFullName(customer) || 'Unknown Customer'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {booking.serviceCategory} • {scheduledDate}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${style.badge}`}>
                      {style.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div> */}

    

      <motion.div
        className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
            <HiOutlineBriefcase className="text-gray-900" size={24} />
          </div>
          <h2 className="text-xl font-bold text-black tracking-tight">Service Clicks Overview</h2>
        </div>

        {serviceClickDetails.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No services found.</p>
        ) : (
          <div className="space-y-3">
            {serviceClickDetails.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
              >
                <div>
                  <p className="font-semibold text-black">{service.servicename || service.serviceCategory || 'Service'}</p>
                  {service.servicename && service.serviceCategory && (
                    <p className="text-xs text-gray-500">{service.serviceCategory}</p>
                  )}
                  {/* {service.price !== undefined && (
                    <p className="text-xs text-gray-500">Price: ₹{service.price}</p>
                  )} */}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-black">{service.clicks}</p>
                  <p className="text-xs text-gray-500">Total Clicks</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ProviderDashboard;


