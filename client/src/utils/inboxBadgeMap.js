/** Map sidebar paths to inbox category keys (server inAppNotification.category) */
export function getInboxCategoryForPath(pathname) {
  const path = String(pathname || '');

  if (path.startsWith('/secretary/communities') || path.startsWith('/community/communities')) {
    return 'communities';
  }
  if (path === '/secretary/approvals') return 'approvals';
  if (path === '/secretary/broadcast' || path === '/community/broadcast') return 'broadcast';
  if (path === '/secretary/events' || path === '/community/events') return 'events';
  if (path === '/community/services' || path === '/pending-approval') return 'registration';

  return null;
}
