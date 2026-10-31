import { createAdminToken, safeEqual } from '../../server/lib/auth.js';
import { handleAdminCors } from '../../server/lib/cors.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (handleAdminCors(req, res, ['POST', 'OPTIONS'])) return;
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_SESSION_SECRET } = process.env;
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !ADMIN_SESSION_SECRET || ADMIN_SESSION_SECRET.length < 32) {
    return res.status(503).json({
      error: 'Admin login is not configured. Set ADMIN_USERNAME, ADMIN_PASSWORD and a 32+ character ADMIN_SESSION_SECRET in your deployment environment.',
    });
  }

  const username = String(req.body?.username ?? '');
  const password = String(req.body?.password ?? '');
  if (!safeEqual(username, ADMIN_USERNAME) || !safeEqual(password, ADMIN_PASSWORD)) {
    return res.status(401).json({ error: 'Incorrect username or password.' });
  }

  try {
    const token = createAdminToken(ADMIN_USERNAME);
    return res.status(200).json({ token, expiresIn: 28800, username: ADMIN_USERNAME });
  } catch {
    return res.status(503).json({ error: 'Admin login is unavailable. Check the server configuration.' });
  }
}
