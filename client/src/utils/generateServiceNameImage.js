/**
 * Builds a white JPEG with the service name in bold black text
 * (used when a provider creates a service without uploading images).
 */
export async function generateServiceNameImage(serviceName) {
  const text = String(serviceName || 'Service').trim() || 'Service';
  const width = 980;
  const height = 490;
  const paddingX = 80;
  const paddingY = 80;
  const maxTextWidth = width - paddingX * 2;
  const maxTextHeight = height - paddingY * 2;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#111111';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const wrapLines = (fontSize) => {
    ctx.font = `700 ${fontSize}px Arial, Helvetica, sans-serif`;
    const words = text.split(/\s+/).filter(Boolean);
    const lines = [];
    let current = '';

    const pushWrappedWord = (word) => {
      if (ctx.measureText(word).width <= maxTextWidth) {
        lines.push(word);
        return;
      }
      let chunk = '';
      for (const char of word) {
        const next = chunk + char;
        if (chunk && ctx.measureText(next).width > maxTextWidth) {
          lines.push(chunk);
          chunk = char;
        } else {
          chunk = next;
        }
      }
      if (chunk) lines.push(chunk);
    };

    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (ctx.measureText(next).width <= maxTextWidth) {
        current = next;
      } else {
        if (current) lines.push(current);
        current = '';
        if (ctx.measureText(word).width <= maxTextWidth) {
          current = word;
        } else {
          pushWrappedWord(word);
        }
      }
    }
    if (current) lines.push(current);
    return lines;
  };

  let fontSize = Math.min(140, Math.floor(width / Math.max(text.length * 0.45, 4)));
  let lines = wrapLines(fontSize);
  let lineHeight = fontSize * 1.2;

  while (fontSize > 28) {
    lines = wrapLines(fontSize);
    lineHeight = fontSize * 1.2;
    if (lines.length * lineHeight <= maxTextHeight) break;
    fontSize -= 4;
  }

  lines = wrapLines(fontSize);
  lineHeight = fontSize * 1.2;
  const blockHeight = lines.length * lineHeight;
  let y = height / 2 - blockHeight / 2 + lineHeight / 2;

  ctx.font = `700 ${fontSize}px Arial, Helvetica, sans-serif`;
  for (const line of lines) {
    ctx.fillText(line, width / 2, y);
    y += lineHeight;
  }

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error('Failed to generate service cover image.'));
      },
      'image/jpeg',
      0.92
    );
  });

  const safeName = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  return new File([blob], `${safeName || 'service'}-cover.jpeg`, {
    type: 'image/jpeg',
  });
}
