import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Inbox, Megaphone } from 'lucide-react';
import { fetchCommunityBroadcasts } from '../../features/communitySlice';
import { formatCommunDisplayName } from '../../utils/communName';

const cardClass =
  'rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm shadow-purple-500/5 backdrop-blur-sm sm:p-6';

const emptyClass =
  'rounded-xl border border-dashed border-purple-100 bg-purple-50/30 py-12 text-center text-sm text-[var(--text-secondary)]';

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
    <motion.div
      className="min-h-screen bg-[var(--background-subtle)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <section className="border-b border-purple-100/60 bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20 py-6 sm:py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--purple-primary)]">
            Commun
          </p>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">Broadcast</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Updates from your neighbourhood secretary
            {broadcastsMeta.communityCommunName ? (
              <span className="font-medium text-[var(--purple-primary)]">
                {' '}
                ({formatCommunDisplayName(broadcastsMeta.communityCommunName)})
              </span>
            ) : null}
            .
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
              <Megaphone className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">
                Community updates
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                Messages posted by your secretary for everyone in your Commun.
              </p>
            </div>
          </div>

          {broadcastsError && (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {broadcastsError}
            </p>
          )}

          {!broadcastsMeta.hasCommunity && !broadcastsLoading && (
            <p className={emptyClass}>You are not linked to a Commun community yet.</p>
          )}

          {broadcastsMeta.hasCommunity && !broadcastsMeta.broadcastEnabled && !broadcastsLoading && (
            <p className={emptyClass}>
              Broadcast is not enabled for your community right now.
            </p>
          )}

          {broadcastsLoading && broadcasts.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-purple-100 border-t-[var(--purple-primary)]" />
              <p className="text-sm text-[var(--text-secondary)]">Loading broadcasts…</p>
            </div>
          ) : broadcasts.length > 0 ? (
            <ul className="space-y-4">
              {broadcasts.map((item, index) => (
                <motion.li
                  key={item._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="rounded-xl border border-purple-100/50 bg-purple-50/20 p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold text-[var(--text-primary)] sm:text-lg">
                      {item.title}
                    </h3>
                    <span className="shrink-0 text-xs text-[var(--text-secondary)]">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-secondary)]">
                    {item.message}
                  </p>
                </motion.li>
              ))}
            </ul>
          ) : broadcastsMeta.hasCommunity && broadcastsMeta.broadcastEnabled ? (
            <div className={emptyClass}>
              <Inbox className="mx-auto mb-3 h-8 w-8 text-[var(--purple-primary)]/60" />
              No broadcasts yet. Check back when your secretary posts an update.
            </div>
          ) : null}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CommunityBroadcast;
