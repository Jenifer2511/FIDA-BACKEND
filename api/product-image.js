import { createHash } from 'node:crypto';
import { query } from '../server/lib/db.js';

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  // Allow only GET and HEAD requests
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');

    return res.status(405).json({
      error: 'Method not allowed.'
    });
  }

  // Get product ID from URL
  const id = String(req.query?.id ?? '').trim();

  if (!id || id.length > 200) {
    return res.status(400).json({
      error: 'A valid product ID is required.'
    });
  }

  try {

    // Fetch image directly from PostgreSQL
    const result = await query(
      `SELECT image_data, image_mime_type
       FROM products
       WHERE id = $1
       AND image_data IS NOT NULL`,
      [id]
    );

    // Check whether image exists
    if (!result.rowCount) {
      return res.status(404).json({
        error: 'Product image not found.'
      });
    }

    const row = result.rows[0];

    // Validate image MIME type
    const mimeType = ALLOWED_IMAGE_TYPES.has(
      row.image_mime_type
    )
      ? row.image_mime_type
      : 'application/octet-stream';

    // PostgreSQL BYTEA returns image data as a Buffer
    const imageBuffer = row.image_data;

    // Set response headers
    res.setHeader('Content-Type', mimeType);

    res.setHeader(
      'Content-Length',
      String(imageBuffer.length)
    );

    res.setHeader(
      'X-Content-Type-Options',
      'nosniff'
    );

    res.setHeader(
      'Cache-Control',
      'public, max-age=0, must-revalidate'
    );

    const etag = '"' + createHash('sha256').update(imageBuffer).digest('hex') + '"';
    res.setHeader('ETag', etag);
    if (String(req.headers['if-none-match'] || '').split(',').map(value => value.trim()).includes(etag)) {
      res.removeHeader('Content-Length');
      return res.status(304).end();
    }

    // HEAD request returns headers without image data
    if (req.method === 'HEAD') {
      return res.status(200).end();
    }

    // Send image to browser
    return res.status(200).send(imageBuffer);

  } catch (error) {

    // Database connection error
    if (error?.code === 'FIDA_DATABASE_NOT_CONFIGURED') {
      return res.status(503).json({
        error: 'Product database is not connected. Set DATABASE_URL in the deployment environment.'
      });
    }

    // Products table missing
    if (error?.code === '42P01') {
      return res.status(503).json({
        error: 'The products table is missing. Run db/schema.sql in PostgreSQL.'
      });
    }

    // Image columns missing
    if (error?.code === '42703') {
      return res.status(503).json({
        error: 'Image-storage columns are missing. Run the latest db/schema.sql in PostgreSQL.'
      });
    }

    // Other server errors
    console.error(
      'FIDA product image API error:',
      error
    );

    return res.status(500).json({
      error: 'The product image could not be loaded.'
    });
  }
}