import React, { useState } from 'react';
import { getServiceCoverUrl, getServiceDisplayName } from '../../utils/serviceImage';

const textSizeClasses = {
  xs: 'text-[10px] leading-tight sm:text-xs',
  sm: 'text-xs leading-snug sm:text-sm',
  md: 'text-sm leading-snug sm:text-base',
  lg: 'text-base leading-snug sm:text-lg',
  xl: 'text-lg leading-snug sm:text-2xl md:text-3xl',
};

const ServiceCover = ({
  service,
  imageUrl,
  alt,
  className = '',
  imageClassName = 'h-full w-full object-cover',
  placeholderClassName = '',
  size = 'md',
}) => {
  const [imageError, setImageError] = useState(false);
  const displayName = getServiceDisplayName(service);
  const coverUrl = imageUrl ?? getServiceCoverUrl(service);
  const showImage = coverUrl && !imageError;

  if (showImage) {
    return (
      <img
        src={coverUrl}
        alt={alt || displayName}
        className={imageClassName}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-white p-3 text-center ${className} ${placeholderClassName}`}
      aria-label={displayName}
    >
      <p
        className={`font-bold text-[var(--text-primary)] break-words [overflow-wrap:anywhere] ${textSizeClasses[size] || textSizeClasses.md}`}
      >
        {displayName}
      </p>
    </div>
  );
};

export default ServiceCover;
