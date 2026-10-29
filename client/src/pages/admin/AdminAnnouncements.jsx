import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Megaphone, Send } from 'lucide-react';
import { getApiBase } from '../../utils/apiBase';

const API_URL = getApiBase();
const PAGE_SIZE = 20;

const inputClass =
  'w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/70 transition-all focus:border-[var(--purple-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/25 disabled:cursor-not-allowed disabled:opacity-50';
const buttonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
const cardClass =
  'rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm shadow-purple-500/5 sm:p-6';

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

const getStatusLabel = (status) => {
  if (status === 'sent') return 'Processed';
  if (status === 'partial') return 'Partially processed';
  if (status === 'sending') return 'Processing';
  return 'Failed';
};

const AdminAnnouncements = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const loadHistory = useCallback(async (targetPage = 1, append = false) => {
    setLoadingHistory(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/admin/announcements`, {
        params: { page: targetPage, limit: PAGE_SIZE },
        withCredentials: true,
      });
      const result = data?.data;
      setAnnouncements((current) =>
        append ? [...current, ...(result?.announcements || [])] : result?.announcements || []
      );
      setPage(targetPage);
      setHasNextPage(Boolean(result?.pagination?.hasNextPage));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load announcement history.');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();
    if (!trimmedTitle || !trimmedMessage || sending) return;

    const confirmed = window.confirm(
      'Send this announcement to all active customers, providers, and secretaries across all societies?'
    );
    if (!confirmed) return;

    setSending(true);
    setError('');
    try {
      const { data } = await axios.post(
        `${API_URL}/api/admin/announcements`,
        { title: trimmedTitle, message: trimmedMessage },
        { withCredentials: true }
      );
      const announcement = data?.data?.announcement;
      if (announcement) {
        setAnnouncements((current) => [
          announcement,
          ...current.filter((item) => item._id !== announcement._id),
        ]);
      }
      setTitle('');
      setMessage('');
      await loadHistory(1);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to send announcement.');
      await loadHistory(1);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--purple-primary)]">
          Super Admin
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
          Announcements
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Send an announcement to active customers, providers, and secretaries across all societies.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={`${cardClass} mt-8`}>
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
            <Megaphone className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">
              New announcement
            </h2>
            <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">
              Recipients will also see this in their in-app notifications. Push delivery requires an enabled device.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="announcement-title" className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
              Title *
            </label>
            <input
              id="announcement-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={inputClass}
              placeholder="e.g. Happy Diwali"
              maxLength={120}
              required
              disabled={sending}
            />
          </div>

          <div>
            <label htmlFor="announcement-message" className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
              Message *
            </label>
            <textarea
              id="announcement-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className={`${inputClass} min-h-32 resize-y`}
              placeholder="Write the announcement for all users…"
              maxLength={2000}
              required
              disabled={sending}
            />
          </div>

          <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--purple-primary)]">
              Lock-screen preview
            </p>
            <div className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm">
              <img
                src="/vite.png"
                alt="CommuN"
                className="h-10 w-10 shrink-0 rounded-lg object-contain"
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-[var(--text-secondary)]">CommuN</p>
                <p className="mt-0.5 break-words text-sm font-semibold text-[var(--text-primary)]">
                  {title.trim() || 'Announcement title'}
                </p>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-[var(--text-secondary)]">
                  {message.trim() || 'Your announcement message will appear here.'}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <button type="submit" className={buttonClass} disabled={sending || !title.trim() || !message.trim()}>
              <Send className="h-4 w-4" />
              {sending ? 'Sending…' : 'Review and send'}
            </button>
          </div>
        </div>
      </form>

      <section className={`${cardClass} mt-6`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">
              Announcement history
            </h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Delivery numbers are push-provider results, not confirmation that users saw the notification.
            </p>
          </div>
        </div>

        {loadingHistory && announcements.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--text-secondary)]">Loading announcements…</p>
        ) : announcements.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--text-secondary)]">No announcements sent yet.</p>
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement) => {
              const delivery = announcement.delivery || {};
              return (
                <article key={announcement._id} className="rounded-xl border border-purple-100/70 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="break-words text-sm font-semibold text-[var(--text-primary)]">
                        {announcement.title}
                      </h3>
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-[var(--text-secondary)]">
                        {announcement.message}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-[var(--purple-primary)]">
                      {getStatusLabel(announcement.status)}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
                    <span>{formatDate(announcement.createdAt)}</span>
                    {announcement.author ? (
                      <span>
                        By {announcement.author.firstName} {announcement.author.lastName}
                      </span>
                    ) : null}
                    <span>Audience: {delivery.targetUsers || 0}</span>
                    <span>Web: {delivery.webSent || 0}/{delivery.webDevices || 0} sent</span>
                    <span>Mobile: {delivery.mobileSent || 0}/{delivery.mobileDevices || 0} sent</span>
                    <span>
                      Failed: {(delivery.webFailed || 0) + (delivery.mobileFailed || 0)}
                    </span>
                    {delivery.webDevices > 0 && !delivery.webConfigured ? <span>Web push not configured</span> : null}
                    {delivery.mobileDevices > 0 && !delivery.mobileConfigured ? <span>Mobile push not configured</span> : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {hasNextPage && (
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => loadHistory(page + 1, true)}
              className="rounded-xl border border-purple-100 bg-white px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-purple-50 disabled:opacity-50"
              disabled={loadingHistory}
            >
              {loadingHistory ? 'Loading…' : 'Load older announcements'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminAnnouncements;
