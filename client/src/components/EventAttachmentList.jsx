import React from 'react';
import {
  HiOutlineDocument,
  HiOutlineExternalLink,
  HiOutlineLink,
  HiOutlinePhotograph,
} from 'react-icons/hi';

const kindLabel = {
  image: 'Image',
  pdf: 'PDF',
  video: 'Video',
  link: 'Link',
};

const EventAttachmentList = ({ attachments = [] }) => {
  if (!attachments.length) return null;

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs font-medium text-[var(--text-secondary)]">Attachments</p>
      <ul className="space-y-2">
        {attachments.map((item, index) => {
          const label = item.name || kindLabel[item.kind] || 'Attachment';
          const isImage = item.kind === 'image';
          const isVideo = item.kind === 'video';

          return (
            <li
              key={`${item.url}-${index}`}
              className="rounded-xl border border-purple-100/60 bg-purple-50/30 p-3"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
                  {item.kind === 'link' && <HiOutlineLink size={16} />}
                  {item.kind === 'pdf' && <HiOutlineDocument size={16} />}
                  {isImage && <HiOutlinePhotograph size={16} />}
                  {isVideo && <HiOutlineExternalLink size={16} />}
                </span>
                <div className="min-w-0 flex-1">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[var(--purple-primary)] transition-colors hover:text-[var(--magenta)]"
                  >
                    {label}
                  </a>
                  <p className="text-xs capitalize text-[var(--text-secondary)]">
                    {kindLabel[item.kind] || item.kind}
                  </p>
                  {isImage && (
                    <img
                      src={item.url}
                      alt={label}
                      className="mt-2 max-h-40 rounded-lg border border-purple-100 object-cover"
                    />
                  )}
                  {isVideo && (
                    <video
                      src={item.url}
                      controls
                      className="mt-2 max-h-48 w-full rounded-lg border border-purple-100"
                    />
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default EventAttachmentList;
