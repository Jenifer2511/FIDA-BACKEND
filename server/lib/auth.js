import { createHmac, createHash, timingSafeEqual } from 'node:crypto';

function adminSecret() {
  return process.env.ADMIN_SESSION_SECRET || '';
}

export function safeEqual(left, right) {
  const a = createHash('sha256').update(String(left ?? '')).digest();
  const b = createHash('sha256').update(String(right ?? '')).digest();
  return timingSafeEqual(a, b);
}

export function createAdminToken(username) {
  const secret = adminSecret();
  if (secret.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET must contain at least 32 characters.');
  }
  const payload = Buffer.from(JSON.stringify({
    sub: username,
    exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60,
  })).toString('base64url');
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function isAdminRequest(req) {
  const secret = adminSecret();
  if (secret.length < 32) return false;
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return false;
  const token = header.slice(7).trim();
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payload, suppliedSignature] = parts;
  const expectedSignature = createHmac('sha256', secret).update(payload).digest('base64url');
  if (!safeEqual(suppliedSignature, expectedSignature)) return false;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Boolean(
      session?.sub &&
      session.sub === process.env.ADMIN_USERNAME &&
      Number.isFinite(session.exp) &&
      session.exp > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}

export function requireAdmin(req, res) {
  if (isAdminRequest(req)) return true;
  res.status(401).json({ error: 'Your admin session is invalid or expired. Sign in again.' });
  return false;
}
