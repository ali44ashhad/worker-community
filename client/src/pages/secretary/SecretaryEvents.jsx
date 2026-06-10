import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchFeatureToggles,
  updateFeatureToggle,
  fetchCommunityEvents,
  createCommunityEvent,
  deleteCommunityEvent,
} from '../../features/secretarySlice';
import ToggleSwitch from '../../components/ToggleSwitch';
import EventAttachmentList from '../../components/EventAttachmentList';
import CreateEventModal from '../../components/CreateEventModal';
import {
  formatEventDate,
  formatEventDateTime,
  getAuthorLabel,
  isEventActive,
} from '../../utils/communityEventDates';

const SecretaryEvents = () => {
  const dispatch = useDispatch();
  const {
    featureToggles,
    featureTogglesLoading,
    featureTogglesSaving,
    featureTogglesError,
    featureTogglesMeta,
    communityEvents,
    communityEventsLoading,
    communityEventsError,
    communityEventsMeta,
    communityEventSending,
    communityEventDeletingId,
  } = useSelector((state) => state.secretary);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchFeatureToggles());
    dispatch(fetchCommunityEvents());
  }, [dispatch]);

  const eventsEnabled = Boolean(featureToggles.events);
  const activeCount = communityEvents.filter(isEventActive).length;
  const cannotCreate = communityEventsMeta.needsCommunName;

  const handleCreateEvent = async (data) => {
    const result = await dispatch(createCommunityEvent(data));
    return !result.error;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Secretary</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">Events</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Create community events for your Commun
            {featureTogglesMeta.communityCommunName ? (
              <span className="font-medium text-indigo-600"> (@{featureTogglesMeta.communityCommunName})</span>
            ) : null}
            . Members can also post events when this is enabled.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="shrink-0 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
        >
          Create new event
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Show events to members</h2>
            <p className="mt-1 text-sm text-gray-500">
              When enabled, customers and providers can view and create events in your Commun.
            </p>
          </div>
          <ToggleSwitch
            enabled={eventsEnabled}
            label={`Events ${eventsEnabled ? 'on' : 'off'}`}
            disabled={featureTogglesLoading || featureTogglesSaving}
            onToggle={() => dispatch(updateFeatureToggle({ key: 'events', enabled: !eventsEnabled }))}
          />
        </div>

        {featureTogglesError && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {featureTogglesError}
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div>
          <h2 className="text-lg font-bold text-gray-900">Community events</h2>
          <p className="mt-1 text-sm text-gray-500">
            {communityEventsLoading
              ? 'Loading…'
              : `${activeCount} active · ${communityEvents.length} total`}
          </p>
        </div>

        {communityEventsError && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {communityEventsError}
          </p>
        )}

        {communityEventsLoading && communityEvents.length === 0 ? (
          <p className="mt-8 text-center text-sm text-gray-500">Loading events…</p>
        ) : communityEvents.length === 0 ? (
          <p className="mt-8 rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-sm text-gray-600">
            No events yet. Click <span className="font-medium">Create new event</span> to add one.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-gray-100">
            {communityEvents.map((item) => {
              const active = isEventActive(item);
              return (
                <li key={item._id} className="py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-gray-900">{item.title}</p>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            active ? 'bg-green-50 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {active ? 'Active' : 'Expired'}
                        </span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{item.description}</p>
                      <EventAttachmentList attachments={item.attachments} />
                      <p className="mt-3 text-xs text-gray-500">
                        By {getAuthorLabel(item.author)}
                        {item.author?.role ? ` · ${item.author.role}` : ''} · Expires {formatEventDate(item.expiresAt)} ·
                        Posted {formatEventDateTime(item.createdAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => dispatch(deleteCommunityEvent(item._id))}
                      disabled={communityEventDeletingId === item._id}
                      className="self-start rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      {communityEventDeletingId === item._id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </motion.div>

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateEvent}
        isSubmitting={communityEventSending}
        disabled={cannotCreate}
        disabledMessage="Set your Commun name in Admin → Secretary management before creating events."
        submitLabel="Create event"
      />
    </div>
  );
};

export default SecretaryEvents;
