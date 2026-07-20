import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Bell, X } from 'lucide-react';
import {
  enablePushNotifications,
  getNotificationPermission,
  isPushSupported,
  registerServiceWorker,
} from '../utils/pushNotifications';

const DISMISS_KEY = 'commun_push_prompt_dismissed';

const PushNotificationPrompt = () => {
  const user = useSelector((state) => state.auth.user);
  const isCheckingAuth = useSelector((state) => state.auth.isCheckingAuth);
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isCheckingAuth || !user || !isPushSupported()) return;

    let cancelled = false;

    (async () => {
      try {
        await registerServiceWorker();
        const permission = await getNotificationPermission();
        if (cancelled) return;

        if (permission === 'granted') {
          // Re-sync subscription after login (new device / expired endpoint)
          await enablePushNotifications().catch(() => {});
          return;
        }

        if (permission === 'denied') return;
        if (localStorage.getItem(DISMISS_KEY) === '1') return;

        setVisible(true);
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, isCheckingAuth]);

  if (!visible) return null;

  const handleEnable = async () => {
    setBusy(true);
    try {
      const result = await enablePushNotifications();
      if (result.ok) {
        setVisible(false);
      } else if (result.reason === 'denied') {
        setVisible(false);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[80] mx-auto max-w-md sm:left-auto sm:right-6">
      <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-xl shadow-purple-500/15">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--purple-primary)] to-[var(--magenta)] text-white">
            <Bell className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Turn on notifications
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
              Get alerts for join requests, approvals, community group messages, broadcasts, and
              events — even when CommuN is in the background.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={handleEnable}
                className="rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-60"
              >
                {busy ? 'Enabling…' : 'Enable'}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-xl border border-purple-100 px-3.5 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-purple-50"
              >
                Not now
              </button>
            </div>
            <p className="mt-2 text-[10px] text-[var(--text-secondary)]">
              On iPhone: add CommuN to your Home Screen first, then enable notifications.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PushNotificationPrompt;
