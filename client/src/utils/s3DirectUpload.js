export async function uploadFileToS3(base, file) {
  const presignRes = await fetch(`${base || ''}/api/provider-profile/s3-presign`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type || 'application/octet-stream',
    }),
  });

  const presignText = await presignRes.text();
  const presignData = presignText
    ? (() => {
        try {
          return JSON.parse(presignText);
        } catch {
          return null;
        }
      })()
    : null;

  if (!presignRes.ok || !presignData?.success) {
    throw new Error(presignData?.message || 'Unable to prepare upload. Please try again.');
  }

  const uploadRes = await fetch(presignData.uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
  });

  if (!uploadRes.ok) {
    throw new Error('Upload failed. Please try again.');
  }

  return { url: presignData.publicUrl, public_id: presignData.public_id };
}
