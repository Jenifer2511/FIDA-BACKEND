-- Safe for the existing database: adds image storage without changing products.
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_data BYTEA;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_mime_type TEXT;
