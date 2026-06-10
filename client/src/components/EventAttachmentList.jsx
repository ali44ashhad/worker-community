import React from 'react';
import { HiOutlineDocument, HiOutlineExternalLink, HiOutlineLink, HiOutlinePhotograph } from 'react-icons/hi';

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
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Attachments</p>
      <ul className="space-y-2">
        {attachments.map((item, index) => {
          const label = item.name || kindLabel[item.kind] || 'Attachment';
          const isImage = item.kind === 'image';
          const isVideo = item.kind === 'video';

          return (
            <li
              key={`${item.url}-${index}`}
              className="rounded-xl border border-gray-100 bg-gray-50 p-3"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-gray-500">
                  {item.kind === 'link' && <HiOutlineLink size={18} />}
                  {item.kind === 'pdf' && <HiOutlineDocument size={18} />}
                  {isImage && <HiOutlinePhotograph size={18} />}
                  {isVideo && <HiOutlineExternalLink size={18} />}
                </span>
                <div className="min-w-0 flex-1">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    {label}
                  </a>
                  <p className="text-xs capitalize text-gray-500">{kindLabel[item.kind] || item.kind}</p>
                  {isImage && (
                    <img
                      src={item.url}
                      alt={label}
                      className="mt-2 max-h-40 rounded-lg border border-gray-200 object-cover"
                    />
                  )}
                  {isVideo && (
                    <video
                      src={item.url}
                      controls
                      className="mt-2 max-h-48 w-full rounded-lg border border-gray-200"
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
