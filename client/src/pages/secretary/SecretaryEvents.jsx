import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { CalendarDays, Plus, ToggleRight, Trash2 } from 'lucide-react';
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
import { formatCommunDisplayName } from '../../utils/communName';

const btnPrimary =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90';
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
    <motion.div
      className="min-h-screen bg-[var(--background-subtle)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <section className="border-b border-purple-100/60 bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20 py-6 sm:py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--purple-primary)]">
                Secretary
              </p>
              <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">Events</h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Create community events for your Commun
                {featureTogglesMeta.communityCommunName ? (
                  <span className="font-medium text-[var(--purple-primary)]">
                    {' '}
                    ({formatCommunDisplayName(featureTogglesMeta.communityCommunName)})
                  </span>
                ) : null}
                . Members can also post events when this is enabled.
              </p>
            </div>
            <button type="button" onClick={() => setIsCreateModalOpen(true)} className={btnPrimary}>
              <Plus className="h-4 w-4" />
              Create new event
            </button>
          </div>
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
                  Show events to members
                </h2>
                <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                  When enabled, customers and providers can view and create events in your Commun.
                </p>
              </div>
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
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className={cardClass}
        >
          <SectionHeader
            icon={CalendarDays}
            title="Community events"
            description={
              communityEventsLoading
                ? 'Loading…'
                : `${activeCount} active · ${communityEvents.length} total`
            }
          />

          {communityEventsError && (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {communityEventsError}
            </p>
          )}

          {communityEventsLoading && communityEvents.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-purple-100 border-t-[var(--purple-primary)]" />
              <p className="text-sm text-[var(--text-secondary)]">Loading events…</p>
            </div>
          ) : communityEvents.length === 0 ? (
            <p className="rounded-xl border border-dashed border-purple-100 bg-purple-50/30 py-12 text-center text-sm text-[var(--text-secondary)]">
              No events yet. Click{' '}
              <span className="font-medium text-[var(--purple-primary)]">Create new event</span> to add one.
            </p>
          ) : (
            <ul className="divide-y divide-purple-100/60">
              {communityEvents.map((item, index) => {
                const active = isEventActive(item);
                return (
                  <motion.li
                    key={item._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-[var(--text-primary)]">{item.title}</p>
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                              active
                                ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                                : 'border-purple-100 bg-purple-50/50 text-[var(--text-secondary)]'
                            }`}
                          >
                            {active ? 'Active' : 'Expired'}
                          </span>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--text-secondary)]">
                          {item.description}
                        </p>
                        <EventAttachmentList attachments={item.attachments} />
                        <p className="mt-3 text-xs text-[var(--text-secondary)]">
                          By {getAuthorLabel(item.author)}
                          {item.author?.role ? ` · ${item.author.role}` : ''} · Expires{' '}
                          {formatEventDate(item.expiresAt)} · Posted {formatEventDateTime(item.createdAt)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => dispatch(deleteCommunityEvent(item._id))}
                        disabled={communityEventDeletingId === item._id}
                        className={btnDelete}
                      >
                        <Trash2 className="h-4 w-4" />
                        {communityEventDeletingId === item._id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </motion.div>
      </div>

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateEvent}
        isSubmitting={communityEventSending}
        disabled={cannotCreate}
        disabledMessage="Set your Commun name in Admin → Secretary management before creating events."
        submitLabel="Create event"
      />
    </motion.div>
  );
};

export default SecretaryEvents;
