import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Briefcase, Calendar, ClipboardList, Star } from 'lucide-react';
import { getProviderDashboardStats } from '../../features/providerSlice';
import { getFullName, getFirstName } from '../../utils/userHelpers';
import { formatCommunDisplayName } from '../../utils/communName';
import { Link } from 'react-router-dom';
import ProfileAvatar from '../../components/ProfileAvatar';

const cardClass =
  'rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm shadow-purple-500/5 backdrop-blur-sm sm:p-6';

const btnPrimary =
  'inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90';
const btnSecondary =
  'inline-flex items-center justify-center rounded-xl border border-purple-100 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-purple-50';

const statusStyles = {
  pending: { label: 'Pending', badge: 'border-amber-100 bg-amber-50 text-amber-800' },
  accepted: { label: 'Accepted', badge: 'border-blue-100 bg-blue-50 text-blue-800' },
  rejected: { label: 'Rejected', badge: 'border-pink-100 bg-pink-50 text-pink-800' },
  completed: { label: 'Completed', badge: 'border-emerald-100 bg-emerald-50 text-emerald-700' },
  cancelled: { label: 'Cancelled', badge: 'border-red-100 bg-red-50 text-red-700' },
};

const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="mb-5 flex items-start gap-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0">
      <h2 className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">{title}</h2>
      {description && (
        <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">{description}</p>
      )}
    </div>
  </div>
);

const StatCard = ({ label, value, subValue, icon: Icon, delay = 0 }) => (
  <motion.div
    className={cardClass}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
  >
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-[var(--text-secondary)]">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">{value}</p>
        {subValue && <p className="mt-1 text-xs text-[var(--text-secondary)]">{subValue}</p>}
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </motion.div>
);

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
  const totalServices = dashboardStats?.totalServices || 0;
  const averageRating = dashboardStats?.averageRating || 0;
  const totalReviews = dashboardStats?.totalReviews || 0;

  const communName = user?.communName || user?.communityCommunName;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined);
  };

  const reload = () => dispatch(getProviderDashboardStats());

  if (isFetchingDashboard && !dashboardStats) {
    return (
      <motion.div
        className="flex min-h-screen items-center justify-center bg-[var(--background-subtle)] px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-full max-w-sm rounded-2xl border border-purple-100/50 bg-white/80 p-8 text-center shadow-sm shadow-purple-500/5">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-purple-100 border-t-[var(--purple-primary)]" />
          <p className="text-sm font-medium text-[var(--text-primary)]">Loading your dashboard…</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">Fetching bookings and stats.</p>
        </div>
      </motion.div>
    );
  }

  if (dashboardError && !dashboardStats) {
    return (
      <motion.div
        className="flex min-h-screen items-center justify-center bg-[var(--background-subtle)] px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-full max-w-sm rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-sm font-semibold text-red-600">Error: {dashboardError}</p>
          <button type="button" onClick={reload} className={`mt-4 w-full ${btnPrimary}`}>
            Try again
          </button>
        </div>
      </motion.div>
    );
  }

  const statCards = [
    { label: 'Total Bookings', value: totalBookings, icon: ClipboardList },
    { label: 'Active Services', value: totalServices, icon: Briefcase },
    {
      label: 'Avg. Rating',
      value: averageRating ? averageRating.toFixed(1) : '0.0',
      subValue: `${totalReviews} reviews`,
      icon: Star,
    },
  ];

  return (
    <motion.div
      className="min-h-screen bg-[var(--background-subtle)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <section className="border-b border-purple-100/60 bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20 py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--purple-primary)]">
                Provider
              </p>
              <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">Dashboard</h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Welcome back{user ? `, ${getFirstName(user)}` : ''}
                {communName ? (
                  <span className="font-medium text-[var(--purple-primary)]">
                    {' '}
                    · Welcome to {formatCommunDisplayName(communName)}
                  </span>
                ) : null}
                . Quick overview of your services and bookings.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/provider/manage-services" className={btnPrimary}>
                Manage services
              </Link>
              <Link to="/provider/update-profile" className={btnSecondary}>
                Update profile
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-5 px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {statCards.map((stat, index) => (
            <StatCard key={stat.label} {...stat} delay={index * 0.05} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <motion.div
            className={cardClass}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SectionHeader
              icon={Calendar}
              title="Upcoming bookings"
              description="Your next scheduled appointments."
            />

            {upcomingBookings.length === 0 ? (
              <p className="rounded-xl border border-dashed border-purple-100 bg-purple-50/30 py-10 text-center text-sm text-[var(--text-secondary)]">
                No upcoming bookings.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.slice(0, 5).map((booking, index) => {
                  const customer = booking.customer || {};
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
                    <div
                      key={booking._id || index}
                      className="flex items-center gap-3 rounded-xl border border-purple-100/50 bg-purple-50/20 p-3 sm:p-4"
                    >
                      <ProfileAvatar user={customer} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-[var(--text-primary)]">
                          {getFullName(customer) || 'Customer'}
                        </p>
                        <p className="truncate text-sm text-[var(--text-secondary)]">
                          {booking.serviceCategory} · {scheduledDate}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${style.badge}`}
                      >
                        {style.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          <motion.div
            className={cardClass}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <SectionHeader
              icon={ClipboardList}
              title="Recent bookings"
              description="Latest booking activity on your profile."
            />

            {recentBookings.length === 0 ? (
              <p className="rounded-xl border border-dashed border-purple-100 bg-purple-50/30 py-10 text-center text-sm text-[var(--text-secondary)]">
                No bookings yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentBookings.slice(0, 5).map((booking, index) => {
                  const customer = booking.customer || {};
                  const scheduledDate = formatDate(booking.scheduledDate);
                  const createdAt = formatDate(booking.createdAt);
                  const style = statusStyles[booking.status] || statusStyles.pending;

                  return (
                    <div
                      key={booking._id || index}
                      className="flex items-center gap-3 rounded-xl border border-purple-100/50 bg-purple-50/20 p-3 sm:p-4"
                    >
                      <ProfileAvatar user={customer} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-[var(--text-primary)]">
                          {getFullName(customer) || 'Customer'}
                        </p>
                        <p className="truncate text-sm text-[var(--text-secondary)]">
                          {booking.serviceCategory} · Scheduled {scheduledDate}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">Booked on {createdAt}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${style.badge}`}
                      >
                        {style.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProviderDashboard;
