export const MAX_EVENT_DAYS = 30;

export const getMinExpiryDateInput = () => new Date().toISOString().slice(0, 10);

export const getMaxExpiryDateInput = () => {
  const max = new Date();
  max.setDate(max.getDate() + MAX_EVENT_DAYS);
  return max.toISOString().slice(0, 10);
};

export const formatEventDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatEventDateTime = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const isEventActive = (event) => {
  if (!event?.expiresAt) return false;
  return new Date(event.expiresAt).getTime() >= Date.now();
};

export const getAuthorLabel = (author) => {
  if (!author) return 'Community member';
  const name = [author.firstName, author.lastName].filter(Boolean).join(' ').trim();
  if (name) return name;
  return author.email || 'Community member';
};
