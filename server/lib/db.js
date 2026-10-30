import pg from 'pg';

const { Pool } = pg;

if (!globalThis.__fidaPgPool) {
  globalThis.__fidaPgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
    application_name: 'fida-storefront',
    // Use a verified TLS connection by default. Set DATABASE_SSL=disable only
    // for a local PostgreSQL instance that does not support TLS.
    ssl: process.env.DATABASE_SSL === 'disable' ? false : { rejectUnauthorized: true },
  });
}

export async function query(text, values = []) {
  if (!process.env.DATABASE_URL) {
    const error = new Error('DATABASE_URL is not configured.');
    error.code = 'FIDA_DATABASE_NOT_CONFIGURED';
    throw error;
  }
  return globalThis.__fidaPgPool.query(text, values);
}
