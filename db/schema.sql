-- FIDA product catalogue for PostgreSQL.
-- Run this file once in your managed PostgreSQL provider's SQL editor.

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL,
  image_data BYTEA,
  image_mime_type TEXT,
  price VARCHAR(100) NOT NULL DEFAULT '',
  featured SMALLINT NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  published SMALLINT NOT NULL DEFAULT 1 CHECK (published IN (0, 1)),
  deleted SMALLINT NOT NULL DEFAULT 0 CHECK (deleted IN (0, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safe for the existing database: adds image storage without changing products.
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_data BYTEA;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_mime_type TEXT;

CREATE INDEX IF NOT EXISTS products_storefront_listing_idx
  ON products (published, deleted, featured DESC, updated_at DESC);

-- Seed the existing FIDA catalogue once; existing product edits are preserved.
INSERT INTO products (id, name, category, description, image, price, featured, published, deleted)
VALUES
  ('fida-navy-draped-gown', 'Navy Draped Frock', 'Frocks', 'A navy floor-length frock with a draped shoulder and gold-tone embellished trim. Enquire with FIDA about sizing, pricing, colours and current availability.', '/assets/products/navy-draped-gown.webp', '', 1, 1, 0),
  ('fida-ivory-embroidered-lehenga', 'Ivory Embroidered Lehenga', 'Lehengas', 'An ivory lehenga with intricate embroidery, a scalloped blouse and a coordinated sheer drape. Enquire with FIDA about sizing, pricing, colours and current availability.', '/assets/products/ivory-embroidered-lehenga.webp', '', 1, 1, 0),
  ('fida-rose-floral-blouse', 'Rose Floral Blouse', 'Blouses', 'A rose-toned blouse with multicoloured floral embroidery and a scalloped neckline, shown with a light pink drape. Enquire with FIDA about sizing, pricing, colours and current availability.', '/assets/products/rose-floral-blouse.webp', '', 0, 1, 0),
  ('fida-champagne-embellished-lehenga', 'Champagne Embellished Lehenga', 'Lehengas', 'A champagne-toned lehenga with an embellished blouse, a detailed skirt border and a coordinated drape. Enquire with FIDA about sizing, pricing, colours and current availability.', '/assets/products/champagne-embellished-lehenga.webp', '', 0, 1, 0),
  ('fida-ivory-heritage-lehenga', 'Ivory Heritage Lehenga', 'Lehengas', 'An ivory lehenga featuring intricate repeating embroidery, a long-sleeved blouse and a coordinated drape. Enquire with FIDA about sizing, pricing, colours and current availability.', '/assets/products/ivory-heritage-lehenga.webp', '', 0, 1, 0),
  ('fida-sage-embroidered-lehenga', 'Sage Embroidered Lehenga', 'Lehengas', 'A sage-green lehenga with floral embroidery, a flowing skirt and a sheer matching drape. Enquire with FIDA about sizing, pricing, colours and current availability.', '/assets/products/sage-embroidered-lehenga.webp', '', 1, 1, 0),
  ('fida-silver-grey-embroidered-gown', 'Silver Grey Embroidered Frock', 'Frocks', 'A silver-grey floor-length frock with an embroidered long-sleeved bodice and a flowing asymmetric drape. Enquire with FIDA about sizing, pricing, colours and current availability.', '/assets/products/silver-grey-embroidered-gown.webp', '', 0, 1, 0),
  ('fida-teal-embellished-gown', 'Teal Embellished Frock', 'Frocks', 'A teal floor-length frock with an asymmetric neckline and embellished diagonal detailing. Enquire with FIDA about sizing, pricing, colours and current availability.', '/assets/products/teal-embellished-gown.webp', '', 0, 1, 0),
  ('fida-caramel-structured-handbag', 'Caramel Structured Handbag', 'Accessories', 'A polished caramel handbag with a structured shape and a long shoulder strap. Enquire with FIDA about colours, pricing and availability.', '/assets/products/structured-caramel-handbag.webp', '', 0, 1, 0),
  ('fida-natural-woven-tote', 'Natural Woven Tote', 'Accessories', 'A relaxed woven tote finished with leather-look handles, designed for effortless daytime styling. Enquire with FIDA about colours, pricing and availability.', '/assets/products/natural-woven-tote.webp', '', 0, 1, 0),
  ('fida-jeweled-evening-clutch', 'Jeweled Evening Clutch', 'Accessories', 'A beaded evening clutch with luminous embellishment and a chain strap for special occasions. Enquire with FIDA about pricing and availability.', '/assets/products/jeweled-evening-clutch.webp', '', 0, 1, 0)
ON CONFLICT (id) DO NOTHING;

UPDATE products
SET category = 'Accessories'
WHERE id IN (
  'fida-caramel-structured-handbag',
  'fida-natural-woven-tote',
  'fida-jeweled-evening-clutch'
)
AND category <> 'Accessories';
