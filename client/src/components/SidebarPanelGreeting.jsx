import React from 'react';
import { formatCommunDisplayName } from '../utils/communName';
import { getFullName } from '../utils/userHelpers';

const SidebarPanelGreeting = ({ user }) => {
  if (!user) return null;

  const communName = user.communName || user.communityCommunName;

  return (
    <>
      <p className="mt-0.5 truncate text-xs font-medium text-[var(--text-primary)]">
        {getFullName(user)}
      </p>
      {communName && (
        <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">
          Welcome to {formatCommunDisplayName(communName)}
        </p>
      )}
    </>
  );
};

export default SidebarPanelGreeting;
