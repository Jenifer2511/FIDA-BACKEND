# FIDA — Storefront + PostgreSQL API (admin deployed separately)

FIDA's React, TypeScript and Vite storefront uses a server-side PostgreSQL API. Deploy the separate `FIDA-Admin-Site` folder as its own Vercel project; it uses this project's protected API and the same PostgreSQL database. Published product changes will appear on the public storefront without editing source files. The storefront no longer embeds the admin interface.

## Features

- Admin sign-in using server-only environment credentials and short-lived signed sessions.
- Add and edit product names, categories, descriptions, display prices, images, featured status and publish status.
- Search and filter the catalogue by published, draft and archived status.
- Archive products without permanently deleting their database records; restore archived products as drafts.
- PostgreSQL storage with parameterized SQL queries and an initial seed of the eight existing FIDA products.
- Photo uploads from your computer stored directly as PostgreSQL BYTEA. External HTTPS image URLs are also supported.
- The storefront uses PostgreSQL when configured and retains the original supplied catalogue as a fallback if the API/database is not yet available.

## 1. Create the PostgreSQL database

Create a PostgreSQL database with a managed provider such as Neon, Supabase or another hosted PostgreSQL service. Copy its connection string; use a TLS-enabled connection string in production.

Run `db/schema.sql` once in the provider's SQL editor. It creates the `products` table and indexes, then inserts the eight existing FIDA products without overwriting later edits. Re-running the file is safe for existing product IDs.

## 2. Configure the server environment

In the storefront/backend Vercel project, open **Settings → Environment Variables** and set the following variables for Production (and Preview/Development as needed):

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string. Keep this server-only; never prefix it with `VITE_`. |
| `ADMIN_USERNAME` | Username used in the separate Admin Studio login. |
| `ADMIN_PASSWORD` | A long, unique admin password. |
| `ADMIN_SESSION_SECRET` | Random secret of at least 32 characters used to sign admin sessions. |
| `ADMIN_ORIGIN` | Exact separate admin site's origin, e.g. `https://admin-your-site.vercel.app`. Comma-separate additional trusted origins. |

Generate a suitable session secret with Node.js:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save the variables and redeploy the project. Do not commit credentials or real `.env` files. For local development, copy `.env.example` to `.env.local` (ignored by Git) and fill in your private values; keep `.env.example` as a template.

### Upload photos directly to PostgreSQL

For your existing database, run `db/migrations/001-product-images.sql` once in Neon SQL Editor, selecting the same database/branch used by `DATABASE_URL`. It only adds two nullable columns; it does not delete, replace or seed products. Then update and redeploy both existing projects: customer/backend first, admin second.

Keep your existing database and admin credentials on the backend. `ADMIN_ORIGIN` must include your exact admin origin, e.g. `https://fidaadminsite.vercel.app`. Optionally set `PUBLIC_API_BASE_URL` to the backend's stable production origin. If omitted, image URLs use the current request origin. Keep `VITE_API_BASE_URL` on the admin pointing to this backend, and rebuild after environment changes.

The browser prepares and encodes the photo. The authenticated API decodes it, checks its size, MIME type and file signature, and writes it to `products.image_data` (BYTEA), together with `products.image_mime_type` and the product details in one SQL statement. `products.image` holds the URL of the image-serving API.

JPG, PNG and WebP source files up to 10 MiB are supported. Files above 2 MiB are resized to at most 2400 pixels on the longest side and encoded as WebP until they fit within 2 MiB. Smaller files are preserved. GIF and AVIF must already be at most 2 MiB. The 2 MiB stored-file cap keeps the Base64 JSON payload below Vercel's 4.5 MB limit: https://vercel.com/docs/functions/limitations#request-body-size

Images persist through deployments. Editing product details preserves the photo; uploading a replacement updates it; switching to an external URL clears the old binary data. Image responses revalidate to avoid stale replacement photos. Existing external URL images are not automatically copied into PostgreSQL. No Cloudinary credentials are needed for the updated upload flow.

## 3. Deploy the separate admin site

Update your existing separate admin project using `FIDA-ADMIN-main.zip`. Copy the contents of its single project folder into the existing repository root, without another nested project folder. Set `VITE_API_BASE_URL` and `VITE_STOREFRONT_URL` to this storefront project's production URL in the admin site's environment settings. After the admin project has a deployment URL, set that exact URL in `ADMIN_ORIGIN` on this storefront/backend project and redeploy the storefront. Then open the separate admin domain and sign in with `ADMIN_USERNAME` and `ADMIN_PASSWORD`. The separate archive includes its own README with the full setup sequence.

Choose **Add product**, enter a name and category, provide a product image URL or upload an image, add any description and price label, then choose whether to publish it or feature it on the homepage. Select **Add product** or **Save changes**. The product is persisted in PostgreSQL; published products are returned by the public API and shown in the collection. Drafts remain private to the admin. Archived products are hidden from customers and can be restored.

If you publish a new product and do not see it, check that `DATABASE_URL` points to the database where `db/schema.sql` was run, and confirm that the deployment's environment variables are set for the active environment.

## API overview

| Endpoint | Access | Purpose |
| --- | --- | --- |
| `POST /api/admin/login` | Public login endpoint | Creates a signed, 8-hour admin session. |
| `GET /api/products` | Public | Returns published, non-archived products. |
| `GET /api/products?admin=1` | Admin token | Returns the complete product catalogue. |
| `POST /api/products` | Admin token | Creates a product. |
| `PUT /api/products?id=PRODUCT_ID` | Admin token | Updates or restores a product. |
| `DELETE /api/products?id=PRODUCT_ID` | Admin token | Archives a product rather than deleting its record. |
| `GET /api/product-image?id=PRODUCT_ID` | Public image URL | Returns the photo stored in PostgreSQL; HEAD and ETag revalidation are supported. |

The API validates incoming fields and uses parameterized SQL. Database credentials and the admin password are never sent to the browser. Admin session tokens are held in `sessionStorage` and expire after eight hours.

## Run the website locally

Requires Node.js 22 or compatible with the project's Vite version.

```sh
npm install
npm run dev
```

This starts the Vite-only storefront preview. For end-to-end testing of the serverless `/api` functions and PostgreSQL admin, configure your local environment variables and run the project with the Vercel development runtime. You can also double-click `START-LOCAL-API.bat` after creating `.env.local`:

```sh
npx vercel dev
```

When prompted, link the working folder to your Vercel project if required. Use a private local `.env.local` file for local variables and never commit it. A live/managed PostgreSQL instance is required for admin changes to be stored and synchronized.

Build and type-check the frontend:

```sh
npm run build
```

## Deploy to Vercel

The project uses Vite for the public frontend and the files under `api/` as Node.js serverless functions. Keep `package.json`, `package-lock.json`, `vercel.json`, `api/`, `server/`, `db/`, `src/` and `public/` in the project root. Set the environment variables above before using the separately deployed Admin Studio in production. Deploy through the existing GitHub integration or run:

```sh
npm install
npm run build
npx vercel --prod
```

After changing environment variables, redeploy so the serverless functions receive the new values.

## Site pages

| Page | URL |
| --- | --- |
| Homepage | `/` |
| Product collection | `/products` |
| Our story | `/our-story` |
| Contact | `/contact` |
| Enquiry | `/enquiry` |
| Separate Admin Studio | Deployed from `FIDA-Admin-Site` as a second Vercel project |

The storefront design, fonts, logos, and supplied image assets remain in `src/` and `public/`. Product schema and initial records are in `db/schema.sql`; product/login/upload APIs are in `api/`; connection-pool, session, and CORS helpers are in `server/lib/`.
