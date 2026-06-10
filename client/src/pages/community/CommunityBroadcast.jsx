import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCommunityBroadcasts } from '../../features/communitySlice';

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const CommunityBroadcast = () => {
  const dispatch = useDispatch();
  const { broadcasts, broadcastsLoading, broadcastsError, broadcastsMeta } = useSelector(
    (state) => state.community
  );

  useEffect(() => {
    dispatch(fetchCommunityBroadcasts());
  }, [dispatch]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Commun</p>
        <h1 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">Broadcast</h1>
        <p className="mt-2 text-sm text-gray-600">
          Updates from your neighbourhood secretary
          {broadcastsMeta.communityCommunName ? (
            <span className="font-medium text-indigo-600"> ({broadcastsMeta.communityCommunName})</span>
          ) : null}
          .
        </p>
      </motion.div>

      {broadcastsError && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {broadcastsError}
        </p>
      )}

      {!broadcastsMeta.hasCommunity && !broadcastsLoading && (
        <p className="mt-8 rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-sm text-gray-600">
          You are not linked to a Commun community yet.
        </p>
      )}

      {broadcastsMeta.hasCommunity && !broadcastsMeta.broadcastEnabled && !broadcastsLoading && (
        <p className="mt-8 rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-sm text-gray-600">
          Broadcast is not enabled for your community right now.
        </p>
      )}

      {broadcastsLoading && broadcasts.length === 0 ? (
        <p className="mt-8 text-center text-sm text-gray-500">Loading broadcasts…</p>
      ) : broadcasts.length > 0 ? (
        <ul className="mt-8 space-y-4">
          {broadcasts.map((item, index) => (
            <motion.li
              key={item._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-bold text-gray-900">{item.title}</h2>
                <span className="shrink-0 text-xs text-gray-500">{formatDate(item.createdAt)}</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{item.message}</p>
            </motion.li>
          ))}
        </ul>
      ) : broadcastsMeta.hasCommunity && broadcastsMeta.broadcastEnabled ? (
        <p className="mt-8 rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-sm text-gray-600">
          No broadcasts yet. Check back when your secretary posts an update.
        </p>
      ) : null}
    </div>
  );
};

export default CommunityBroadcast;
