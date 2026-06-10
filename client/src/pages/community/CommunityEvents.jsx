import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
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
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Commun</p>
          <h1 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">Events</h1>
          <p className="mt-2 text-sm text-gray-600">
            Community events for your neighbourhood
            {eventsMeta.communityCommunName ? (
              <span className="font-medium text-indigo-600"> (@{eventsMeta.communityCommunName})</span>
            ) : null}
            . Anyone in your Commun can post an event (max {MAX_EVENT_DAYS} days).
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="shrink-0 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Create new event
          </button>
        )}
      </motion.div>

      {eventsError && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{eventsError}</p>
      )}

      {!eventsMeta.hasCommunity && !eventsLoading && (
        <p className="mt-8 rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-sm text-gray-600">
          You are not linked to a Commun community yet.
        </p>
      )}

      {eventsMeta.hasCommunity && !eventsMeta.eventsEnabled && !eventsLoading && (
        <p className="mt-8 rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-sm text-gray-600">
          Events are not enabled for your community right now.
        </p>
      )}

      {eventsLoading && events.length === 0 ? (
        <p className="mt-8 text-center text-sm text-gray-500">Loading events…</p>
      ) : events.length > 0 ? (
        <ul className="mt-8 space-y-4">
          {events.map((item, index) => {
            const isOwner = user && item.author?._id === user._id;
            return (
              <motion.li
                key={item._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-bold text-gray-900">{item.title}</h2>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{item.description}</p>
                    <EventAttachmentList attachments={item.attachments} />
                    <p className="mt-3 text-xs text-gray-500">
                      By {getAuthorLabel(item.author)}
                      {item.author?.role ? ` · ${item.author.role}` : ''} · Expires {formatEventDate(item.expiresAt)} ·
                      Posted {formatEventDateTime(item.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 self-start sm:items-end">
                    {!isOwner && (
                      <button
                        type="button"
                        onClick={() => handleInterested(item)}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
                      >
                        I am interested
                      </button>
                    )}
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        disabled={eventDeletingId === item._id}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
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
        <p className="mt-8 rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-sm text-gray-600">
          No active events yet. Click <span className="font-medium">Create new event</span> to post one.
        </p>
      ) : null}

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateEvent}
        isSubmitting={eventSending}
        heading="Create event"
        subheading="Share a meetup, market, workshop, or any local gathering with your Commun."
        submitLabel="Post event"
      />
    </div>
  );
};

export default CommunityEvents;
