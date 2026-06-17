import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { CalendarDays, Calendar, MessageCircle, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  fetchCommunityEvents,
  createCommunityEvent,
  deleteCommunityEvent,
} from '../../features/communitySlice';
import {
  formatEventDate,
  formatEventDateTime,
  getAuthorLabel,
  MAX_EVENT_DAYS,
} from '../../utils/communityEventDates';
import { getFullName } from '../../utils/userHelpers';
import { buildEventInterestMessage, buildWhatsAppUrl } from '../../utils/whatsapp';
import EventAttachmentList from '../../components/EventAttachmentList';
import CreateEventModal from '../../components/CreateEventModal';
import { formatCommunDisplayName } from '../../utils/communName';

const cardClass =
  'rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm shadow-purple-500/5 backdrop-blur-sm sm:p-6';

const emptyClass =
  'rounded-xl border border-dashed border-purple-100 bg-purple-50/30 py-12 text-center text-sm text-[var(--text-secondary)]';

const btnPrimary =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90';

const btnInterested =
  'inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90';

const btnDelete =
  'inline-flex items-center justify-center gap-1.5 self-start rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50';

const CommunityEvents = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const {
    events,
    eventsLoading,
    eventsError,
    eventsMeta,
    eventSending,
    eventDeletingId,
  } = useSelector((state) => state.community);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCommunityEvents());
  }, [dispatch]);

  const canCreate = eventsMeta.hasCommunity && eventsMeta.eventsEnabled;

  const handleCreateEvent = async (data) => {
    const result = await dispatch(createCommunityEvent(data));
    if (!result.error) {
      toast.success(result.payload?.message || 'Event created.');
      return true;
    }
    toast.error(result.payload || 'Failed to create event');
    return false;
  };

  const handleDelete = async (eventId) => {
    const result = await dispatch(deleteCommunityEvent(eventId));
    if (!result.error) {
      toast.success(result.payload?.message || 'Event deleted.');
    } else {
      toast.error(result.payload || 'Failed to delete event');
    }
  };

  const handleInterested = (item) => {
    const authorPhone = item.author?.phoneNumber;
    const whatsappUrl = buildWhatsAppUrl(
      authorPhone,
      buildEventInterestMessage({
        eventTitle: item.title,
        authorName: getAuthorLabel(item.author),
        interestedUserName: getFullName(user),
        communityName: eventsMeta.communityCommunName,
      })
    );

    if (!whatsappUrl) {
      toast.error('Event creator has no WhatsApp number on their profile.');
      return;
    }

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      className="min-h-screen bg-[var(--background-subtle)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <section className="border-b border-purple-100/60 bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20 py-6 sm:py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--purple-primary)]">
                Commun
              </p>
              <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">Events</h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Community events for your neighbourhood
                {eventsMeta.communityCommunName ? (
                  <span className="font-medium text-[var(--purple-primary)]">
                    {' '}
                    ({formatCommunDisplayName(eventsMeta.communityCommunName)})
                  </span>
                ) : null}
                . Anyone in your Commun can post an event (max {MAX_EVENT_DAYS} days).
              </p>
            </div>
            {canCreate && (
              <button type="button" onClick={() => setIsCreateModalOpen(true)} className={btnPrimary}>
                <Plus className="h-4 w-4" />
                Create new event
              </button>
            )}
          </div>
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
              <CalendarDays className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">
                Community events
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                Local gatherings posted by members of your Commun.
              </p>
            </div>
          </div>

          {eventsError && (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {eventsError}
            </p>
          )}

          {!eventsMeta.hasCommunity && !eventsLoading && (
            <p className={emptyClass}>You are not linked to a Commun community yet.</p>
          )}

          {eventsMeta.hasCommunity && !eventsMeta.eventsEnabled && !eventsLoading && (
            <p className={emptyClass}>Events are not enabled for your community right now.</p>
          )}

          {eventsLoading && events.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-purple-100 border-t-[var(--purple-primary)]" />
              <p className="text-sm text-[var(--text-secondary)]">Loading events…</p>
            </div>
          ) : events.length > 0 ? (
            <ul className="space-y-4">
              {events.map((item, index) => {
                const isOwner = user && item.author?._id === user._id;
                return (
                  <motion.li
                    key={item._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="rounded-xl border border-purple-100/50 bg-purple-50/20 p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-[var(--text-primary)] sm:text-lg">
                          {item.title}
                        </h3>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-secondary)]">
                          {item.description}
                        </p>
                        <EventAttachmentList attachments={item.attachments} />
                        <p className="mt-3 text-xs text-[var(--text-secondary)]">
                          By {getAuthorLabel(item.author)}
                          {item.author?.role ? ` · ${item.author.role}` : ''} · Expires{' '}
                          {formatEventDate(item.expiresAt)} · Posted {formatEventDateTime(item.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 self-start sm:items-end">
                        {!isOwner && (
                          <button
                            type="button"
                            onClick={() => handleInterested(item)}
                            className={btnInterested}
                          >
                            <MessageCircle className="h-4 w-4" />
                            I am interested
                          </button>
                        )}
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => handleDelete(item._id)}
                            disabled={eventDeletingId === item._id}
                            className={btnDelete}
                          >
                            <Trash2 className="h-4 w-4" />
                            {eventDeletingId === item._id ? 'Deleting…' : 'Delete'}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          ) : canCreate ? (
            <div className={emptyClass}>
              <Calendar className="mx-auto mb-3 h-8 w-8 text-[var(--purple-primary)]/60" />
              No active events yet. Click{' '}
              <span className="font-medium text-[var(--purple-primary)]">Create new event</span> to post
              one.
            </div>
          ) : null}
        </motion.div>
      </div>

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateEvent}
        isSubmitting={eventSending}
        heading="Create event"
        subheading="Share a meetup, market, workshop, or any local gathering with your Commun."
        submitLabel="Post event"
      />
    </motion.div>
  );
};

export default CommunityEvents;
