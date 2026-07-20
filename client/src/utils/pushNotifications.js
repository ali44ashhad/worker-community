import axios from 'axios';
import { getApiBase } from './apiBase';

const API_URL = getApiBase();

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export async function registerServiceWorker() {
  if (!isPushSupported()) return null;
  return navigator.serviceWorker.register('/sw.js');
}

export async function getNotificationPermission() {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request permission, subscribe to push, and save subscription on the server.
 */
export async function enablePushNotifications() {
  if (!isPushSupported()) {
    return { ok: false, reason: 'unsupported' };
  }

  await registerServiceWorker();
  const registration = await navigator.serviceWorker.ready;

  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }
  if (permission !== 'granted') {
    return { ok: false, reason: permission === 'denied' ? 'denied' : 'default' };
  }

  const { data } = await axios.get(`${API_URL}/api/push/vapid-public-key`, {
    withCredentials: true,
  });
  const publicKey = data?.data?.publicKey;
  if (!publicKey) {
    return { ok: false, reason: 'not_configured' };
  }

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const json = subscription.toJSON();
  await axios.post(
    `${API_URL}/api/push/subscribe`,
    {
      endpoint: json.endpoint,
      keys: json.keys,
    },
    { withCredentials: true }
  );

  return { ok: true };
}

export async function disablePushNotifications() {
  if (!isPushSupported()) return { ok: false, reason: 'unsupported' };

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return { ok: true };

  const endpoint = subscription.endpoint;
  try {
    await axios.delete(`${API_URL}/api/push/unsubscribe`, {
      data: { endpoint },
      withCredentials: true,
    });
  } catch {
    /* still unsubscribe locally */
  }

  await subscription.unsubscribe();
  return { ok: true };
}
