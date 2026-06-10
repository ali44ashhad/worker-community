import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchFeatureToggles,
  updateFeatureToggle,
  fetchBroadcasts,
  createBroadcast,
  deleteBroadcast,
} from '../../features/secretarySlice';
import ToggleSwitch from '../../components/ToggleSwitch';

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-400';

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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Secretary</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">Broadcast</h1>
        <p className="mt-2 text-sm text-gray-600 sm:text-base">
          Send neighbourhood updates to your Commun community
          {featureTogglesMeta.communityCommunName ? (
            <span className="font-medium text-indigo-600"> (@{featureTogglesMeta.communityCommunName})</span>
          ) : null}
          .
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Show broadcast to members</h2>
            <p className="mt-1 text-sm text-gray-500">
              When enabled, customers and providers in your Commun see a Broadcast option in their menu.
            </p>
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
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-bold text-gray-900">New broadcast</h2>
        <p className="mt-1 text-sm text-gray-500">Write a message for everyone in your Commun community.</p>

        {broadcastsMeta.needsCommunName && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Set your Commun name in Admin → Secretary management before sending broadcasts.
          </p>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="broadcast-title" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
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
            <label htmlFor="broadcast-message" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
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
            <p className="mt-1 text-right text-xs text-gray-400">{message.length}/2000</p>
          </div>
          <button
            type="submit"
            disabled={broadcastsMeta.needsCommunName || broadcastSending || !title.trim() || !message.trim()}
            className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {broadcastSending ? 'Sending…' : 'Send broadcast'}
          </button>
        </div>
      </motion.form>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Sent broadcasts</h2>
            <p className="mt-1 text-sm text-gray-500">
              {broadcastsLoading ? 'Loading…' : `${broadcasts.length} message${broadcasts.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {broadcastsError && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {broadcastsError}
          </p>
        )}

        {broadcastsLoading && broadcasts.length === 0 ? (
          <p className="mt-8 text-center text-sm text-gray-500">Loading broadcasts…</p>
        ) : broadcasts.length === 0 ? (
          <p className="mt-8 rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-sm text-gray-600">
            No broadcasts yet. Send your first neighbourhood update above.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-gray-100">
            {broadcasts.map((item) => (
              <li key={item._id} className="py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{item.message}</p>
                    <p className="mt-3 text-xs text-gray-500">{formatDate(item.createdAt)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => dispatch(deleteBroadcast(item._id))}
                    disabled={broadcastDeletingId === item._id}
                    className="self-start rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    {broadcastDeletingId === item._id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
};

export default SecretaryBroadcast;
