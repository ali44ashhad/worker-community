export const EVENT_TYPE_OPTIONS = [
  { key: 'communityMeetup', label: 'Community meetup' },
  { key: 'marketDay', label: 'Market day' },
  { key: 'workshop', label: 'Workshop' },
  { key: 'sports', label: 'Sports' },
  { key: 'fundraiser', label: 'Fundraiser' },
];

export const EVENT_TYPE_LABELS = Object.fromEntries(
  EVENT_TYPE_OPTIONS.map(({ key, label }) => [key, label])
);

export const getEventTypeLabel = (eventType) =>
  EVENT_TYPE_LABELS[eventType] || 'Community meetup';
