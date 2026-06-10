export const MAX_EVENT_ATTACHMENTS = 5;

export const appendEventAttachmentsToFormData = (formData, { files = [], links = [] }) => {
  files.forEach((file) => formData.append('attachments', file));

  const validLinks = links
    .filter((item) => String(item?.url || '').trim())
    .map((item) => ({
      url: String(item.url).trim(),
      label: String(item.label || '').trim(),
    }));

  if (validLinks.length > 0) {
    formData.append('attachmentLinks', JSON.stringify(validLinks));
  }
};

export const countEventAttachments = (files = [], links = []) => {
  const linkCount = links.filter((item) => String(item?.url || '').trim()).length;
  return files.length + linkCount;
};
