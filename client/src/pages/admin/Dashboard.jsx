import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAdminDashboardStats,
} from '../../features/adminSlice';
import {
  BarChart3,
  Briefcase,
  LayoutDashboard,
  Star,
  UserCircle,
  Users,
  UserCog,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getFullName } from '../../utils/userHelpers';
import ProfileAvatar from '../../components/ProfileAvatar';

const Section = ({ title, description, children, icon: Icon }) => (
  <div className="rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm shadow-purple-500/5 backdrop-blur-sm sm:p-6">
    {(title || description) && (
      <div className="mb-5 flex items-start gap-3">
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div className="min-w-0">
          {title && (
            <h2 className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">{title}</h2>
          )}
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">{description}</p>
          )}
        </div>
      </div>
    )}
    {children}
  </div>
);

const StatCard = ({ label, value, icon: Icon, delay = 0 }) => (
  <motion.div
    className="rounded-2xl border border-purple-100/50 bg-white/80 p-4 shadow-sm shadow-purple-500/5 backdrop-blur-sm sm:p-5"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
  >
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-[var(--text-secondary)]">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">{value}</p>
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { dashboardStats, isLoading, error } = useSelector(
    (state) => state.admin
  );

  useEffect(() => {
    dispatch(getAdminDashboardStats());
  }, [dispatch]);

  const reload = () => {
    dispatch(getAdminDashboardStats());
  };

  if (isLoading && !dashboardStats) {
    return (
      <motion.div
        className="flex min-h-screen items-center justify-center bg-[var(--background-subtle)] px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-full max-w-sm rounded-2xl border border-purple-100/50 bg-white/80 p-8 text-center shadow-sm shadow-purple-500/5">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-purple-100 border-t-[var(--purple-primary)]" />
          <p className="text-sm font-medium text-[var(--text-primary)]">Loading dashboard…</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">Fetching platform insights.</p>
        </div>
      </motion.div>
    );
  }

  if (error && !dashboardStats) {
    return (
      <motion.div
        className="flex min-h-screen items-center justify-center bg-[var(--background-subtle)] px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-full max-w-sm rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-sm font-semibold text-red-600">Error: {error}</p>
          <button
            type="button"
            onClick={reload}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all"
          >
            Try again
          </button>
        </div>
      </motion.div>
    );
  }

  const stats = [
    { label: 'Total Users', value: dashboardStats?.totalUsers || 0, icon: Users },
    { label: 'Total Providers', value: dashboardStats?.totalProviders || 0, icon: UserCog },
    { label: 'Total Services', value: dashboardStats?.totalServices || 0, icon: Briefcase },
    { label: 'Customers', value: dashboardStats?.roleCounts?.customer || 0, icon: UserCircle },
  ];

  const roleCounts = [
    { label: 'Customers', value: dashboardStats?.roleCounts?.customer || 0 },
    { label: 'Providers', value: dashboardStats?.roleCounts?.provider || 0 },
    { label: 'Admins', value: dashboardStats?.roleCounts?.admin || 0 },
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
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--purple-primary)]">
            Admin
          </p>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Overview of your platform and community insights.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-5 px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} {...stat} delay={index * 0.05} />
          ))}
        </div>

        <Section
          title="User role breakdown"
          description="Distribution of accounts by role across the platform."
          icon={LayoutDashboard}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {roleCounts.map((role) => (
              <div
                key={role.label}
                className="rounded-xl border border-purple-100/50 bg-purple-50/30 p-4 sm:p-5"
              >
                <p className="text-xs font-medium text-[var(--text-secondary)]">{role.label}</p>
                <p className="mt-1 text-2xl font-semibold text-[var(--purple-primary)]">
                  {role.value}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Section
            title="Top categories"
            description="Most clicked service categories."
            icon={BarChart3}
          >
            {dashboardStats?.topCategories?.length > 0 ? (
              <div className="space-y-2">
                {dashboardStats.topCategories.slice(0, 5).map((cat, index) => (
                  <div
                    key={cat.category}
                    className="flex items-center justify-between gap-3 rounded-xl border border-purple-100/50 bg-purple-50/20 p-3 transition-colors hover:bg-purple-50/40 sm:p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-fuchsia-100 text-sm font-semibold text-[var(--purple-primary)]">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                          {cat.category}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {cat.serviceCount} service{cat.serviceCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-[var(--purple-primary)]">
                        {cat.totalClicks}
                      </p>
                      <p className="text-[10px] text-[var(--text-secondary)]">clicks</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-[var(--text-secondary)]">
                No category data available.
              </p>
            )}
          </Section>

          <Section
            title="Top providers"
            description="Providers with the most service clicks."
            icon={Star}
          >
            {dashboardStats?.topProviders?.length > 0 ? (
              <div className="space-y-2">
                {dashboardStats.topProviders.slice(0, 5).map((provider) => (
                  <div
                    key={provider._id}
                    className="flex items-center gap-3 rounded-xl border border-purple-100/50 bg-purple-50/20 p-3 transition-colors hover:bg-purple-50/40 sm:p-4"
                  >
                    <ProfileAvatar user={provider.user} size="lg" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                        {getFullName(provider.user) || 'Unknown'}
                      </p>
                      <p className="truncate text-xs text-[var(--text-secondary)]">
                        {provider.user?.email || ''}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-[var(--purple-primary)]">
                        {provider.providerProfileCount || 0}
                      </p>
                      <p className="text-[10px] text-[var(--text-secondary)]">clicks</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-[var(--text-secondary)]">
                No provider data available.
              </p>
            )}
          </Section>
        </div>

      
      </div>
    </motion.div>
  );
};

export default Dashboard;
