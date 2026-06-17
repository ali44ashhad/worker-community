import React from 'react';

const ToggleSwitch = ({ enabled, onToggle, disabled = false, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={enabled}
    aria-label={label}
    disabled={disabled}
    onClick={onToggle}
    className={`relative inline-flex h-7 w-12 flex-shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-primary)]/40 focus-visible:ring-offset-2 disabled:opacity-50 ${
      enabled ? 'bg-[var(--purple-primary)]' : 'bg-purple-200'
    }`}
  >
    <span
      className={`inline-block h-5 w-5 translate-y-1 rounded-full bg-white shadow transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

export default ToggleSwitch;
