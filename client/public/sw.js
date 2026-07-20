/* CommuN Web Push service worker */
self.addEventListener('push', (event) => {
  let payload = {
    title: 'CommuN',
    body: 'You have a new notification',
    icon: '/CommuN-logo-white.png',
    badge: '/CommuN-logo-white.png',
    tag: 'commun',
    data: { url: '/' },
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed, data: { ...payload.data, ...(parsed.data || {}) } };
    }
  } catch {
    try {
      payload.body = event.data?.text() || payload.body;
    } catch {
      /* ignore */
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'CommuN', {
      body: payload.body || '',
      icon: payload.icon || '/CommuN-logo-white.png',
      badge: payload.badge || '/CommuN-logo-white.png',
      tag: payload.tag || 'commun',
      data: payload.data || { url: '/' },
      renotify: true,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || '/';

  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of allClients) {
        if ('focus' in client) {
          await client.focus();
          if ('navigate' in client) {
            try {
              await client.navigate(targetUrl);
            } catch {
              /* older browsers */
            }
          }
          return;
        }
      }
      if (clients.openWindow) {
        await clients.openWindow(targetUrl);
      }
    })()
  );
});
