import React from 'react';

const SidebarNavBadge = ({ count, active }) => {
  const n = Number(count) || 0;
  if (n < 1) return null;

  const label = n > 99 ? '99+' : String(n);

  return (
    <span
      className={`ml-auto flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none ${
        active ? 'bg-white text-[var(--purple-primary)]' : 'bg-red-500 text-white shadow-sm'
      }`}
      aria-label={`${label} unread`}
    >
      {label}
    </span>
  );
};

export default SidebarNavBadge;
