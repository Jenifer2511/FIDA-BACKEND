
import { randomUUID } from 'node:crypto';
import { query } from '../server/lib/db.js';
import { requireAdmin } from '../server/lib/auth.js';
import { handleAdminCors } from '../server/lib/cors.js';

class ValidationError extends Error {}

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'product';
}

// Validate actual image file signature
function hasValidImageSignature(buffer, mimeType) {
  if (mimeType === 'image/jpeg') {
    return buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff;
  }

  if (mimeType === 'image/png') {
    return buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      );
  }

  if (mimeType === 'image/webp') {
    return buffer.length >= 12 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP';
  }

  if (mimeType === 'image/gif') {
    const signature = buffer.toString('ascii', 0, 6);
    return signature === 'GIF87a' || signature === 'GIF89a';
  }

  if (mimeType === 'image/avif') {
    const brand = buffer.toString('ascii', 4, 12);
    return buffer.length >= 12 &&
      (brand.startsWith('ftypavif') || brand.startsWith('ftypavis'));
  }

  return false;
}

// Convert uploaded Base64 image into a PostgreSQL Buffer
function parseImageUpload(body = {}) {
  const encoded = body.imageData;

  if (!encoded) {
    return {
      uploaded: false,
      buffer: null,
      mimeType: null,
    };
  }

  if (typeof encoded !== 'string') {
    throw new ValidationError('Invalid image data.');
  }

  if (encoded.length > Math.ceil(MAX_IMAGE_BYTES * 4 / 3) + 8) {
    throw new ValidationError('Image must be smaller than 2 MB.');
  }

  if (
    !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded) ||
    encoded.length % 4 !== 0
  ) {
    throw new ValidationError('Invalid Base64 image data.');
  }

  const mimeType = String(
    body.imageMimeType ?? ''
  ).toLowerCase();

  if (!ALLOWED_IMAGE_TYPES.has(mimeType)) {
    throw new ValidationError('Unsupported image format.');
  }

  const buffer = Buffer.from(encoded, 'base64');

  if (buffer.toString('base64') !== encoded) throw new ValidationError('Invalid Base64 image data.');

  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) {
    throw new ValidationError('Image must be smaller than 2 MB.');
  }

  if (!hasValidImageSignature(buffer, mimeType)) {
    throw new ValidationError('Invalid image file.');
  }

  return {
    uploaded: true,
    buffer,
    mimeType,
  };
}

// Generate image URL for customer website
function publicImageUrl(req, productId) {
  const configuredBase = String(
    process.env.PUBLIC_API_BASE_URL || ''
  ).trim().replace(/\/+$/, '');

  let base = configuredBase;

  if (!base) {
    const host = String(
      req.headers['x-forwarded-host'] ||
      req.headers.host ||
      ''
    ).split(',')[0].trim();

    const protocol = String(
      req.headers['x-forwarded-proto'] || 'https'
    ).split(',')[0].trim();

    if (!host) {
      throw new Error('Could not determine backend URL.');
    }

    base = `${protocol}://${host}`;
  }

  return `${base}/api/product-image?id=${encodeURIComponent(productId)}`;
}

// Validate product details and image
function normaliseProduct(body = {}) {
  const name = String(body.name ?? '').trim();
  const category = String(body.category ?? '').trim();
  const description = String(body.description ?? '').trim();
  const image = String(body.image ?? '').trim();
  const price = String(body.price ?? '').trim();

  const imageUpload = parseImageUpload(body);

  if (image.length > 4096) throw new ValidationError('Image URL is too long.');

  if (!name || name.length > 160) {
    throw new ValidationError('Product name is required.');
  }

  if (!category || category.length > 100) {
    throw new ValidationError('Category is required.');
  }

  if (description.length > 8000) {
    throw new ValidationError('Description is too long.');
  }

  if (price.length > 100) {
    throw new ValidationError('Price label is too long.');
  }

  if (!imageUpload.uploaded) {
    if (!image) {
      throw new ValidationError(
        'Upload an image or provide an image URL.'
      );
    }

    if (image.startsWith('//')) {
      throw new ValidationError('Invalid image URL.');
    }

    if (image.startsWith('/')) {
      if (
        !image.startsWith('/assets/') &&
        !image.startsWith('/api/product-image?')
      ) {
        throw new ValidationError('Invalid local image path.');
      }
    } else {
      let url;

      try {
        url = new URL(image);
      } catch {
        throw new ValidationError('Invalid image URL.');
      }

      if (url.protocol !== 'https:') {
        throw new ValidationError('Image URL must use HTTPS.');
      }
    }
  }

  return {
    name,
    category,
    description,
    image,
    price,
    featured: body.featured ? 1 : 0,
    published: body.published ? 1 : 0,
    deleted: body.deleted ? 1 : 0,

    imageUploaded: imageUpload.uploaded,
    imageData: imageUpload.buffer,
    imageMimeType: imageUpload.mimeType,
  };
}

// Preserve existing FIDA naming rules
function formatProduct(product) {
  return {
    ...product,
    name: String(product.name || '').replace(/\bGown\b/gi, 'Frock'),
    category: String(product.category || '').replace(/\bGowns\b/gi, 'Frocks'),
    description: String(product.description || '').replace(/\bgown\b/gi, 'frock'),
  };
}

function sendMethodError(res, methods) {
  res.setHeader('Allow', methods.join(', '));

  return res.status(405).json({
    error: 'Method not allowed.',
  });
}

// Handle database errors
function handleError(res, error) {
  if (error?.code === 'FIDA_DATABASE_NOT_CONFIGURED') {
    return res.status(503).json({
      error: 'DATABASE_URL is not configured.',
    });
  }

  if (error?.code === '42P01') {
    return res.status(503).json({
      error: 'Products table is missing.',
    });
  }

  if (error?.code === '42703') {
    return res.status(503).json({
      error: 'Image storage columns are missing. Run the PostgreSQL image migration.',
    });
  }

  if (error?.code === '23505') {
    return res.status(409).json({
      error: 'Product already exists.',
    });
  }

  console.error('FIDA products API error:', error);

  return res.status(500).json({
    error: 'The product request could not be completed.',
  });
}

// Main API handler
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (
    handleAdminCors(
      req,
      res,
      ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    )
  ) {
    return;
  }

  res.setHeader('Vary', 'Origin, Authorization');

  try {
    // GET: Retrieve products
    if (req.method === 'GET') {
      const includeAdmin = req.query?.admin === '1';

      if (includeAdmin && !requireAdmin(req, res)) {
        return;
      }

      const sql = includeAdmin
        ? `SELECT id, name, category, description, image,
                  price, featured, published, deleted,
                  created_at, updated_at
           FROM products
           ORDER BY updated_at DESC, created_at DESC`
        : `SELECT id, name, category, description, image,
                  price, featured, published, deleted,
                  created_at, updated_at
           FROM products
           WHERE published = 1 AND deleted = 0
           ORDER BY featured DESC, updated_at DESC`;

      const result = await query(sql);

      return res.status(200).json(
        result.rows.map(formatProduct)
      );
    }

    if (!['POST', 'PUT', 'DELETE'].includes(req.method)) {
      return sendMethodError(
        res,
        ['GET', 'POST', 'PUT', 'DELETE']
      );
    }

    // Protect all modification operations
    if (!requireAdmin(req, res)) {
      return;
    }

    // POST: Add new product and upload image
    if (req.method === 'POST') {
      const product = normaliseProduct(req.body || {});

      const id = `fida-${slugify(product.name)}-${randomUUID().slice(0, 8)}`;

      const image = product.imageUploaded
        ? publicImageUrl(req, id)
        : product.image;

      const result = await query(
        `INSERT INTO products (
          id,
          name,
          category,
          description,
          image,
          price,
          featured,
          published,
          deleted,
          image_data,
          image_mime_type
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
        )
        RETURNING
          id, name, category, description, image,
          price, featured, published, deleted,
          created_at, updated_at`,
        [
          id,
          product.name,
          product.category,
          product.description,
          image,
          product.price,
          product.featured,
          product.published,
          product.deleted,
          product.imageData,
          product.imageMimeType,
        ]
      );

      return res.status(201).json(
        formatProduct(result.rows[0])
      );
    }

    // Get product ID for update/delete
    const id = String(
      req.query?.id ?? req.body?.id ?? ''
    ).trim();

    if (!id || id.length > 200) {
      return res.status(400).json({
        error: 'A valid product ID is required.',
      });
    }

    // PUT: Update product and image
    if (req.method === 'PUT') {
      const product = normaliseProduct(req.body || {});

      const image = product.imageUploaded
        ? publicImageUrl(req, id)
        : product.image;

      const result = await query(
        `UPDATE products
         SET
           name = $2,
           category = $3,
           description = $4,
           image = $5,
           price = $6,
           featured = $7,
           published = $8,
           deleted = $9,

           image_data = CASE
             WHEN $10::boolean THEN $11::bytea
             WHEN image <> $5 THEN NULL
             ELSE image_data
           END,

           image_mime_type = CASE
             WHEN $10::boolean THEN $12::text
             WHEN image <> $5 THEN NULL
             ELSE image_mime_type
           END,

           updated_at = NOW()

         WHERE id = $1

         RETURNING
           id, name, category, description, image,
           price, featured, published, deleted,
           created_at, updated_at`,
        [
          id,
          product.name,
          product.category,
          product.description,
          image,
          product.price,
          product.featured,
          product.published,
          product.deleted,
          product.imageUploaded,
          product.imageData,
          product.imageMimeType,
        ]
      );

      if (!result.rowCount) {
        return res.status(404).json({
          error: 'Product not found.',
        });
      }

      return res.status(200).json(
        formatProduct(result.rows[0])
      );
    }

    // DELETE: Archive product
    const result = await query(
      `UPDATE products
       SET
         deleted = 1,
         published = 0,
         updated_at = NOW()
       WHERE id = $1
       RETURNING
         id, name, category, description, image,
         price, featured, published, deleted`,
      [id]
    );

    if (!result.rowCount) {
      return res.status(404).json({
        error: 'Product not found.',
      });
    }

    return res.status(200).json({
      ok: true,
      product: formatProduct(result.rows[0]),
    });

  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return handleError(res, error);
  }
}
