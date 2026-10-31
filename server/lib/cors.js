// Cross-origin access for the separately deployed admin frontend.
// Configure ADMIN_ORIGIN as an exact origin (or comma-separated exact origins).
export function handleAdminCors(req, res, methods) {
  const origin = String(req.headers.origin || '');
  const allowedOrigins = String(process.env.ADMIN_ORIGIN || '')
    .split(',')
    .map(value => value.trim().replace(/\/$/, ''))
    .filter(Boolean);
  const allowed = origin && allowedOrigins.includes(origin.replace(/\/$/, ''));

  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept');
    res.setHeader('Access-Control-Max-Age', '600');
    const currentVary = String(res.getHeader('Vary') || '').split(',').map(value => value.trim()).filter(Boolean);
    if (!currentVary.some(value => value.toLowerCase() === 'origin')) currentVary.push('Origin');
    res.setHeader('Vary', currentVary.join(', '));
  }

  if (req.method === 'OPTIONS') {
    if (!allowed) {
      res.status(403).end();
      return true;
    }
    res.status(204).end();
    return true;
  }
  return false;
}
