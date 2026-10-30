import { createHash } from 'node:crypto';
import { requireAdmin } from '../../server/lib/auth.js';
import { handleAdminCors } from '../../server/lib/cors.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (handleAdminCors(req, res, ['POST', 'OPTIONS'])) return;
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  if (!requireAdmin(req, res)) return;

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return res.status(503).json({ error: 'Image upload is not configured yet. Add Cloudinary server credentials, or paste a public HTTPS image URL instead.' });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'fida-products';
  const stringToSign = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
  const signature = createHash('sha1').update(stringToSign).digest('hex');
  return res.status(200).json({
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
    timestamp,
    folder,
    signature,
  });
}
