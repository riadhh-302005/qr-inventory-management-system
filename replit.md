# InventoryPro

A full-stack inventory management system with product CRUD, QR code generation/scanning, and custom JWT auth.

## Run & Operate

- `artifacts/laravel-api/start.sh` — starts MongoDB + Laravel API (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/inventory-app run dev` — run the frontend (proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `DATABASE_URL` — not used (MongoDB runs locally via `mongod`)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite, Tailwind CSS v4, shadcn/ui, Wouter routing
- Auth: Custom Bearer token auth (SHA-256 hashed tokens stored in MongoDB `api_tokens`)
- API: Laravel 11 (PHP 8.2), PHP built-in dev server
- DB: MongoDB (local `mongod` on `127.0.0.1:27017`, database `inventorypro`)
- ORM: `mongodb/laravel-mongodb` v5
- QR codes: `chillerlan/php-qrcode` v6 (server-side generation, stored as base64 PNG data URLs)
- Frontend data fetching: Orval-generated React Query hooks from OpenAPI spec

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `artifacts/laravel-api/` — Laravel PHP API
  - `start.sh` — starts mongod + php built-in server with custom php.ini
  - `php.ini` — combined Nix PHP extensions + mongodb.so
  - `app/Models/User.php` — MongoDB User model with `createApiToken()`
  - `app/Models/ApiToken.php` — MongoDB token model (hashed tokens)
  - `app/Models/Product.php` — MongoDB Product model
  - `app/Http/Middleware/BearerTokenAuth.php` — token auth middleware
  - `app/Http/Controllers/AuthController.php` — register/login/logout/me
  - `app/Http/Controllers/ProductController.php` — product CRUD
  - `app/Http/Controllers/DashboardController.php` — stats/low-stock/recent
  - `routes/api.php` — all API routes (public auth + protected with BearerTokenAuth)
- `artifacts/inventory-app/src/` — React frontend
  - `App.tsx` — Router and AuthContext setup
  - `context/AuthContext.tsx` — custom JWT auth context (localStorage token)
  - `pages/dashboard.tsx` — Dashboard with stats and charts
  - `pages/products/index.tsx` — Product list with search/filter
  - `pages/products/new.tsx` — Add product form
  - `pages/products/edit.tsx` — Edit product form
  - `pages/scanner.tsx` — QR code camera scanner
  - `pages/landing.tsx` — Public landing page
  - `pages/sign-in.tsx` — Sign-in form
  - `pages/sign-up.tsx` — Register form

## Architecture decisions

- QR codes are generated server-side (`chillerlan/php-qrcode`) at creation time and stored as base64 PNG data URLs in MongoDB — no regeneration needed at read time
- Auth is custom: login returns a random 40-char token, SHA-256 hashed before DB storage. Frontend stores plain token in `localStorage`, sends as `Authorization: Bearer <token>`
- Sanctum was removed — type incompatibility between Sanctum's PAT model and MongoDB models. Replaced with lightweight `BearerTokenAuth` middleware + `ApiToken` model
- All routes except `/api/auth/register` and `/api/auth/login` require authentication
- Product `productId` (e.g. `PRD-WK001`) is the QR code payload — the scanner looks up products by this field
- Dashboard stats computed via MongoDB aggregation pipeline in a single query

## PHP / Nix notes

- PHP binary: `/nix/store/8xs6a2mh8vhb0r5ds4wh5nm6a59x66z6-php-with-extensions-8.2.23/bin/php`
- MongoDB extension: `/nix/store/28awk63shjqzi2hzlk1qfyachq08jk34-php-mongodb-2.0.0/lib/php/extensions/mongodb.so`
- Custom `php.ini` at `artifacts/laravel-api/php.ini` — combines Nix's bundled PHP ini + adds mongodb extension. Used via `php -c php.ini` to avoid PHP_INI_SCAN_DIR conflicts
- "Already loaded" warnings in startup output are harmless (duplicate extension entries between Nix ini and custom ini)
- `start.sh` starts mongod if not running, then launches the Laravel built-in PHP server

## Demo data

- Demo account: `demo@example.com` / `password123`
- 8 seeded products across Electronics, Furniture, Accessories, Stationery categories

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After changing `openapi.yaml`, always run `pnpm --filter @workspace/api-spec run codegen` before restarting the API server
- `chillerlan/php-qrcode` v6 uses `QRGdImagePNG::class` as `outputType` (not the old `QRCode::OUTPUT_IMAGE_PNG` constant)
- The `@/pages/products/edit.tsx` expects product ID in the URL as `/products/:id/edit`
- Do NOT use `$middleware->statefulApi()` in bootstrap/app.php — it requires Sanctum session cookies which are not used
