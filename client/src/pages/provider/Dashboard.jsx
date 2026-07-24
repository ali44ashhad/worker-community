import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Briefcase, Eye, MousePointerClick, Star } from 'lucide-react';
import { getProviderDashboardStats } from '../../features/providerSlice';
import { getFirstName } from '../../utils/userHelpers';
import { formatCommunDisplayName } from '../../utils/communName';
import { Link } from 'react-router-dom';

const cardClass =
  'rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm shadow-purple-500/5 backdrop-blur-sm sm:p-6';

const btnPrimary =
  'inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90';
const btnSecondary =
  'inline-flex items-center justify-center rounded-xl border border-purple-100 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-purple-50';

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

  const totalServices = dashboardStats?.totalServices || 0;
  const averageRating = dashboardStats?.averageRating || 0;
  const totalReviews = dashboardStats?.totalReviews || 0;
  const profileViews = dashboardStats?.profileViews || 0;
  const serviceClicks = dashboardStats?.serviceClicks || 0;
  const serviceClickDetails = dashboardStats?.serviceClickDetails || [];

  const communName = user?.communName || user?.communityCommunName;

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
          <p className="mt-1 text-xs text-[var(--text-secondary)]">Fetching your service stats.</p>
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
    { label: 'Active Services', value: totalServices, icon: Briefcase },
    { label: 'Service Clicks', value: serviceClicks, icon: MousePointerClick },
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
                . Quick overview of your services and engagement.
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

        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SectionHeader
            icon={Eye}
            title="Engagement"
            description={`Profile views: ${profileViews}. Clicks per service below.`}
          />

          {serviceClickDetails.length === 0 ? (
            <p className="rounded-xl border border-dashed border-purple-100 bg-purple-50/30 py-10 text-center text-sm text-[var(--text-secondary)]">
              No services yet. Add a service to start tracking clicks.
            </p>
          ) : (
            <div className="space-y-3">
              {serviceClickDetails.map((service, index) => (
                <div
                  key={service.id || index}
                  className="flex items-center justify-between gap-3 rounded-xl border border-purple-100/50 bg-purple-50/20 p-3 sm:p-4"
                >
                  <p className="min-w-0 truncate font-semibold text-[var(--text-primary)]">
                    {service.serviceCategory || 'Service'}
                  </p>
                  <span className="shrink-0 text-sm font-medium text-[var(--text-secondary)]">
                    {service.clicks || 0} click{(service.clicks || 0) === 1 ? '' : 's'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProviderDashboard;
