import React from 'react';
import { formatCommunDisplayName } from '../utils/communName';
import { getFullName } from '../utils/userHelpers';

const SidebarPanelGreeting = ({ user }) => {
  if (!user) return null;

  const communName = user.communName || user.communityCommunName;
  const publicCommunityLabel = user.isPublicMember && user.requestedCommunityName
    ? user.requestedCommunityName
    : null;

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
      {publicCommunityLabel && (
        <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">
          {publicCommunityLabel} · Public member
        </p>
      )}
    </>
  );
};

export default SidebarPanelGreeting;
