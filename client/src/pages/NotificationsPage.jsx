import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Bell, ChevronDown, LoaderCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchInboxCounts } from '../features/inboxSlice';
import { getApiBase } from '../utils/apiBase';

const API_URL = getApiBase();
const PAGE_SIZE = 20;

const categoryLabels = {
  approvals: 'Approvals',
  communities: 'Communities',
  broadcast: 'Broadcast',
  events: 'Events',
  registration: 'Registration',
  announcements: 'Announcement',
};

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [openingId, setOpeningId] = useState('');

  const loadNotifications = useCallback(async (targetPage = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError('');

    try {
      const { data } = await axios.get(`${API_URL}/api/user/inbox`, {
        params: { page: targetPage, limit: PAGE_SIZE },
        withCredentials: true,
      });
      const result = data?.data;
      setNotifications((current) =>
        append ? [...current, ...(result?.notifications || [])] : result?.notifications || []
      );
      setPage(targetPage);
      setHasNextPage(Boolean(result?.pagination?.hasNextPage));
      dispatch(fetchInboxCounts());
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load notifications.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const handleServiceWorkerMessage = (event) => {
      if (event?.data?.type === 'INBOX_REFRESH') {
        loadNotifications();
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, [loadNotifications]);

  const handleOpen = async (notification) => {
    if (openingId) return;
    setOpeningId(notification._id);

    try {
      if (!notification.readAt) {
        await axios.patch(
          `${API_URL}/api/user/inbox/${notification._id}/read`,
          {},
          { withCredentials: true }
        );
        setNotifications((current) =>
          current.map((item) =>
            item._id === notification._id
              ? { ...item, readAt: new Date().toISOString() }
              : item
          )
        );
        dispatch(fetchInboxCounts());
      }

      if (notification.destination) {
        const destination =
          user?.role === 'secretary'
            ? notification.destination === '/community/broadcast'
              ? '/secretary/broadcast'
              : notification.destination === '/community/events'
                ? '/secretary/events'
                : notification.destination.startsWith('/community/communities')
                  ? notification.destination.replace('/community/communities', '/secretary/communities')
                  : notification.destination
            : notification.destination;
        navigate(destination);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not mark notification as read.');
    } finally {
      setOpeningId('');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--purple-primary)]">
          Your updates
        </p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
          <Bell className="h-6 w-6 text-[var(--purple-primary)]" />
          Notifications
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Announcements and updates relevant to your account and community.
        </p>
      </header>

      {error && (
        <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => loadNotifications()}
            className="font-semibold underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-purple-100/50 bg-white/80 px-5 py-12 text-sm text-[var(--text-secondary)]">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Loading notifications…
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-purple-100/50 bg-white/80 px-5 py-12 text-center shadow-sm">
          <Bell className="mx-auto h-8 w-8 text-purple-300" />
          <h2 className="mt-3 text-sm font-semibold text-[var(--text-primary)]">You’re all caught up</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            New announcements and community updates will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <article
              key={notification._id}
              className={`rounded-2xl border bg-white/90 p-4 shadow-sm transition-colors sm:p-5 ${
                notification.readAt
                  ? 'border-purple-100/50'
                  : 'border-purple-200 bg-purple-50/60'
              }`}
            >
              <button
                type="button"
                onClick={() => handleOpen(notification)}
                disabled={Boolean(openingId)}
                className="w-full text-left disabled:cursor-wait"
                aria-label={`${notification.readAt ? '' : 'Unread: '}${notification.title}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                      notification.readAt ? 'bg-transparent' : 'bg-[var(--purple-primary)]'
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="break-words text-sm font-semibold text-[var(--text-primary)] sm:text-base">
                        {notification.title}
                      </h2>
                      <span className="rounded-full bg-purple-100/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--purple-primary)]">
                        {categoryLabels[notification.category] || 'Update'}
                      </span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--text-secondary)]">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-xs text-[var(--text-secondary)]">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                  {openingId === notification._id ? (
                    <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-[var(--purple-primary)]" />
                  ) : notification.destination ? (
                    <ChevronDown className="h-4 w-4 shrink-0 -rotate-90 text-[var(--text-secondary)]" />
                  ) : null}
                </div>
              </button>
            </article>
          ))}
        </div>
      )}

      {hasNextPage && !loading && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => loadNotifications(page + 1, true)}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 rounded-xl border border-purple-100 bg-white px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingMore ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {loadingMore ? 'Loading…' : 'Load older notifications'}
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
