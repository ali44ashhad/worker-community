import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Inbox, Megaphone, Send, Trash2, ToggleRight } from 'lucide-react';
import {
  fetchFeatureToggles,
  updateFeatureToggle,
  fetchBroadcasts,
  createBroadcast,
  deleteBroadcast,
} from '../../features/secretarySlice';
import ToggleSwitch from '../../components/ToggleSwitch';
import { formatCommunDisplayName } from '../../utils/communName';

const inputClass =
  'w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/70 focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/25 focus:border-[var(--purple-primary)] transition-all disabled:cursor-not-allowed disabled:opacity-50';
const labelClass = 'mb-1.5 block text-xs font-medium text-[var(--text-secondary)]';
const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
const btnDelete =
  'inline-flex items-center justify-center gap-1.5 self-start rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50';

const cardClass =
  'rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm shadow-purple-500/5 backdrop-blur-sm sm:p-6';

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

const SecretaryBroadcast = () => {
  const dispatch = useDispatch();
  const {
    featureToggles,
    featureTogglesLoading,
    featureTogglesSaving,
    featureTogglesError,
    featureTogglesMeta,
    broadcasts,
    broadcastsLoading,
    broadcastsError,
    broadcastsMeta,
    broadcastSending,
    broadcastDeletingId,
  } = useSelector((state) => state.secretary);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    dispatch(fetchFeatureToggles());
    dispatch(fetchBroadcasts());
  }, [dispatch]);

  const broadcastEnabled = Boolean(featureToggles.broadcast);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(createBroadcast({ title: title.trim(), message: message.trim() }));
    if (!result.error) {
      setTitle('');
      setMessage('');
    }
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
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">Broadcast</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Send neighbourhood updates to your Commun community
            {featureTogglesMeta.communityCommunName ? (
              <span className="font-medium text-[var(--purple-primary)]">
                {' '}
                ({formatCommunDisplayName(featureTogglesMeta.communityCommunName)})
              </span>
            ) : null}
            .
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-5 px-4 py-8 sm:px-6 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cardClass}
        >
          <div className="flex flex-col gap-4 border-b border-purple-100/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
                <ToggleRight className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">
                  Show broadcast to members
                </h2>
                <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                  When enabled, customers and providers in your Commun see a Broadcast option in their menu.
                </p>
              </div>
            </div>
            <ToggleSwitch
              enabled={broadcastEnabled}
              label={`Broadcast ${broadcastEnabled ? 'on' : 'off'}`}
              disabled={featureTogglesLoading || featureTogglesSaving}
              onToggle={() => dispatch(updateFeatureToggle({ key: 'broadcast', enabled: !broadcastEnabled }))}
            />
          </div>

          {featureTogglesError && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {featureTogglesError}
            </p>
          )}
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className={cardClass}
        >
          <SectionHeader
            icon={Megaphone}
            title="New broadcast"
            description="Write a message for everyone in your Commun community."
          />

          {broadcastsMeta.needsCommunName && (
            <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Set your Commun name in Admin → Secretary management before sending broadcasts.
            </p>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="broadcast-title" className={labelClass}>
                Title *
              </label>
              <input
                id="broadcast-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                placeholder="e.g. Water shutdown tomorrow"
                maxLength={120}
                required
                disabled={broadcastsMeta.needsCommunName || broadcastSending}
              />
            </div>
            <div>
              <label htmlFor="broadcast-message" className={labelClass}>
                Message *
              </label>
              <textarea
                id="broadcast-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`${inputClass} min-h-[140px] resize-y`}
                placeholder="Share the details your neighbours need to know…"
                maxLength={2000}
                required
                disabled={broadcastsMeta.needsCommunName || broadcastSending}
              />
              <p className="mt-1 text-right text-xs text-[var(--text-secondary)]">{message.length}/2000</p>
            </div>
            <button
              type="submit"
              disabled={broadcastsMeta.needsCommunName || broadcastSending || !title.trim() || !message.trim()}
              className={btnPrimary}
            >
              <Send className="h-4 w-4" />
              {broadcastSending ? 'Sending…' : 'Send broadcast'}
            </button>
          </div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={cardClass}
        >
          <SectionHeader
            icon={Inbox}
            title="Sent broadcasts"
            description={
              broadcastsLoading
                ? 'Loading…'
                : `${broadcasts.length} message${broadcasts.length !== 1 ? 's' : ''}`
            }
          />

          {broadcastsError && (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {broadcastsError}
            </p>
          )}

          {broadcastsLoading && broadcasts.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-purple-100 border-t-[var(--purple-primary)]" />
              <p className="text-sm text-[var(--text-secondary)]">Loading broadcasts…</p>
            </div>
          ) : broadcasts.length === 0 ? (
            <p className="rounded-xl border border-dashed border-purple-100 bg-purple-50/30 py-12 text-center text-sm text-[var(--text-secondary)]">
              No broadcasts yet. Send your first neighbourhood update above.
            </p>
          ) : (
            <ul className="divide-y divide-purple-100/60">
              {broadcasts.map((item, index) => (
                <motion.li
                  key={item._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[var(--text-primary)]">{item.title}</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--text-secondary)]">
                        {item.message}
                      </p>
                      <p className="mt-3 text-xs text-[var(--text-secondary)]">{formatDate(item.createdAt)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => dispatch(deleteBroadcast(item._id))}
                      disabled={broadcastDeletingId === item._id}
                      className={btnDelete}
                    >
                      <Trash2 className="h-4 w-4" />
                      {broadcastDeletingId === item._id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SecretaryBroadcast;
