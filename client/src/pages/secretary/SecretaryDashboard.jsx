import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  HiOutlineClipboardCheck,
  HiOutlineUsers,
  HiOutlineSpeakerphone,
  HiOutlineCalendar,
} from 'react-icons/hi';
import {
  fetchPendingRegistrations,
  fetchCommunityMembers,
  fetchCommunityEvents,
  fetchBroadcasts,
} from '../../features/secretarySlice';
import { isEventActive } from '../../utils/communityEventDates';

const quickLinks = [
  {
    to: '/secretary/approvals',
    label: 'Approve / reject',
    description: 'Review pending signups and provider applications',
    icon: HiOutlineClipboardCheck,
    statKey: 'pending',
  },
  {
    to: '/secretary/members',
    label: 'Member list',
    description: 'View everyone in your Commun community',
    icon: HiOutlineUsers,
    statKey: 'members',
  },
  {
    to: '/secretary/broadcast',
    label: 'Broadcast',
    description: 'Send neighbourhood updates to your community',
    icon: HiOutlineSpeakerphone,
    statKey: 'broadcastCount',
  },
  {
    to: '/secretary/events',
    label: 'Events',
    description: 'Create and manage community events',
    icon: HiOutlineCalendar,
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
    members: membersLoading ? '…' : members.length,
    broadcastCount: broadcastsLoading ? '…' : broadcasts.length,
    activeEvents: communityEventsLoading ? '…' : activeEventsCount,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Secretary</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600 sm:text-base">
          Welcome to your secretary workspace
          {membersMeta.communityCommunName ? (
            <span className="font-medium text-indigo-600"> (@{membersMeta.communityCommunName})</span>
          ) : null}
          . Use the sidebar to open each section.
        </p>
      </motion.div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((item, index) => {
          const Icon = item.icon;
          const count = item.statKey ? stats[item.statKey] : null;
          return (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <Link
                to={item.to}
                className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex rounded-xl bg-gray-100 p-2.5 text-gray-800">
                    <Icon size={22} />
                  </span>
                  {count !== null && (
                    <span className="text-2xl font-bold tabular-nums text-gray-900">{count}</span>
                  )}
                </div>
                <h2 className="mt-4 font-bold text-gray-900">{item.label}</h2>
                <p className="mt-1 flex-1 text-sm text-gray-600">{item.description}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SecretaryDashboard;
