// Keep each stored image below 2 MiB; its Base64 JSON payload stays below Vercel's limit.
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

export async function prepareImage(file: File): Promise<File> {
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    throw new Error('Choose a JPG, PNG, WebP, GIF or AVIF image.');
  }
  if (!file.size || file.size > MAX_SOURCE_BYTES) {
    throw new Error('Choose a non-empty image no larger than 10 MB.');
  }
  if (file.size <= MAX_IMAGE_BYTES) return file;
  // Preserve GIF/AVIF animations; ask for a smaller original rather than flattening them.
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type.toLowerCase())) {
    throw new Error('GIF and AVIF files must be no larger than 2 MB.');
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    const scale = Math.min(1, 2400 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Your browser could not prepare this image. Try a smaller photo.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.9, 0.8, 0.65, 0.5]) {
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', quality));
      if (blob && blob.size <= MAX_IMAGE_BYTES) {
        return new File([blob], file.name.replace(/\.[^.]+$/, '') + (blob.type === 'image/webp' ? '.webp' : '.png'), { type: blob.type });
      }
    }
    throw new Error('This image is still too large. Resize it to under 2 MB and choose it again.');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const comma = result.indexOf(',');
      if (comma < 0) { reject(new Error('Could not read the selected image. Please choose it again.')); return; }
      resolve(result.slice(comma + 1));
    };
    reader.onerror = reader.onabort = () => reject(new Error('Could not read the selected image. Please choose it again.'));
    reader.readAsDataURL(file);
  });
}
