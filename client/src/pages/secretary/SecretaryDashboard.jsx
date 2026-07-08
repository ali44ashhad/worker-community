import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  Calendar,
  ClipboardCheck,
  LayoutDashboard,
  Megaphone,
  Users,
} from 'lucide-react';
import {
  fetchPendingRegistrations,
  fetchCommunityMembers,
  fetchCommunityEvents,
  fetchBroadcasts,
} from '../../features/secretarySlice';
import { isEventActive } from '../../utils/communityEventDates';
import { formatCommunDisplayName } from '../../utils/communName';

const quickLinks = [
  {
    to: '/secretary/approvals',
    label: 'Approve / reject',
    description: 'Review pending signups and provider applications',
    icon: ClipboardCheck,
    statKey: 'pending',
  },
  {
    to: '/secretary/members',
    label: 'Member list',
    description: 'View everyone in your Commun community',
    icon: Users,
    statKey: 'members',
  },
  {
    to: '/secretary/broadcast',
    label: 'Broadcast',
    description: 'Send neighbourhood updates to your community',
    icon: Megaphone,
    statKey: 'broadcastCount',
  },
  {
    to: '/secretary/events',
    label: 'Events',
    description: 'Create and manage community events',
    icon: Calendar,
    statKey: 'activeEvents',
  },
];

const SecretaryDashboard = () => {
  const dispatch = useDispatch();
  const {
    pendingUsers,
    loading,
    members,
    membersLoading,
    membersMeta,
    membersPagination,
    communityEvents,
    communityEventsLoading,
    broadcasts,
    broadcastsLoading,
  } = useSelector((state) => state.secretary);

  useEffect(() => {
    dispatch(fetchPendingRegistrations());
    dispatch(fetchCommunityMembers());
    dispatch(fetchCommunityEvents());
    dispatch(fetchBroadcasts());
  }, [dispatch]);

  const activeEventsCount = communityEvents.filter(isEventActive).length;

  const stats = {
    pending: loading ? '…' : pendingUsers.length,
    members: membersLoading ? '…' : (membersPagination?.totalMembers ?? members.length),
    broadcastCount: broadcastsLoading ? '…' : broadcasts.length,
    activeEvents: communityEventsLoading ? '…' : activeEventsCount,
  };

  return (
    <motion.div
      className="min-h-screen bg-[var(--background-subtle)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <section className="border-b border-purple-100/60 bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20 py-6 sm:py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--purple-primary)]">
            Secretary
          </p>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Welcome to your secretary workspace
            {membersMeta.communityCommunName ? (
              <span className="font-medium text-[var(--purple-primary)]">
                {' '}
                ({formatCommunDisplayName(membersMeta.communityCommunName)})
              </span>
            ) : null}
            . Use the sidebar to open each section.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">
              Quick access
            </h2>
            <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">
              Jump to approvals, members, broadcasts, or events.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((item, index) => {
            const Icon = item.icon;
            const count = item.statKey ? stats[item.statKey] : null;
            return (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  to={item.to}
                  className="group flex h-full flex-col rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm shadow-purple-500/5 backdrop-blur-sm transition-all hover:border-purple-200/80 hover:shadow-md hover:shadow-purple-500/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 p-2.5 text-[var(--purple-primary)] transition-transform group-hover:scale-105">
                      <Icon className="h-5 w-5" />
                    </span>
                    {count !== null && (
                      <span className="text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
                        {count}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 font-semibold text-[var(--text-primary)]">{item.label}</h3>
                  <p className="mt-1 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {item.description}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default SecretaryDashboard;
