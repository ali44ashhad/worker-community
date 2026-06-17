import React from 'react';
import { getInitials } from '../utils/userHelpers';

const SIZES = {
  xs: { box: 'h-5 w-5', text: 'text-[10px]' },
  sm: { box: 'h-6 w-6', text: 'text-xs' },
  smd: { box: 'h-7 w-7', text: 'text-xs' },
  md: { box: 'h-9 w-9', text: 'text-sm' },
  lg: { box: 'h-10 w-10', text: 'text-sm' },
  xl: { box: 'h-12 w-12', text: 'text-lg' },
  '2xl': { box: 'h-24 w-24', text: 'text-2xl' },
  '3xl': { box: 'h-28 w-28 sm:h-32 sm:w-32', text: 'text-3xl sm:text-4xl' },
};

const ProfileAvatar = ({
  user,
  src,
  alt = '',
  size = 'md',
  className = '',
  imageClassName = '',
  fallbackClassName = '',
}) => {
  const imageSrc = src ?? user?.profileImage;
  const { box, text } = SIZES[size] || SIZES.md;

  if (imageSrc) {
    return (
      <div className={`profile-avatar ${box} ${className}`}>
        <img src={imageSrc} alt={alt} className={imageClassName} />
      </div>
    );
  }

  return (
    <div
      className={`profile-avatar flex items-center justify-center bg-gradient-to-br from-[var(--purple-primary)] to-[var(--magenta)] font-semibold text-white ${box} ${text} ${fallbackClassName} ${className}`}
    >
      {getInitials(user)}
    </div>
  );
};

export default ProfileAvatar;
