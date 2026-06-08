# Artdict Next.js Fullstack Design

Date: 2026-06-08

## Goal

Convert Artdict from a static HTML/CSS/JavaScript site into a Next.js fullstack application with:

- Public storefront pages for products and authors.
- JSON APIs for products, authors, and orders.
- PostgreSQL database managed with Prisma.
- Admin dashboard for product, author, and order management.
- Admin authentication with secure HTTP-only cookies.
- Docker Compose for local development and deployment-friendly startup.

The first implementation should preserve the existing visual identity and content as much as possible while moving the project onto a backend-ready architecture.

## Current Context

The current repo is a static frontend on the `frontend` branch. It uses:

- `index.html` redirecting to `views/index.html`.
- `views/*.html` for public pages.
- `style.css` for the complete visual system.
- `main.js` for UI behavior and loading partial HTML.
- `browser-sync` for local serving.

There is no current backend, API layer, database schema, admin dashboard, or authentication system.

## Recommended Architecture

Use Next.js App Router as the single application boundary.

```text
app/
  (site)/
    page.tsx
    catalogue/page.tsx
    products/[slug]/page.tsx
    authors/page.tsx
    authors/[slug]/page.tsx
  admin/
    login/page.tsx
    page.tsx
    products/page.tsx
    authors/page.tsx
    orders/page.tsx
  api/
    products/route.ts
    products/[slug]/route.ts
    authors/route.ts
    authors/[slug]/route.ts
    orders/route.ts
    admin/login/route.ts
    admin/logout/route.ts
components/
lib/
prisma/
public/
docker-compose.yml
Dockerfile
```

Public pages should be rendered with server components where practical. Interactive UI behavior from `main.js` should move into small client components only where browser state or DOM events are required.

The existing static assets should move under `public/assets` so Next.js can serve them directly. The existing CSS should be imported globally first, then reduced or modularized only when needed.

## Data Model

### AdminUser

Stores admin accounts.

- `id`
- `email`
- `passwordHash`
- `name`
- `role`
- `createdAt`
- `updatedAt`

Only authenticated admins can access `/admin` routes.

### Category

Stores product categories such as shirts, hats, accessories, bookmarks, prints, and other.

- `id`
- `name`
- `slug`
- `sortOrder`
- `createdAt`
- `updatedAt`

### Product

Stores product catalogue data.

- `id`
- `name`
- `slug`
- `description`
- `story`
- `price`
- `stock`
- `status`
- `categoryId`
- `authorId`
- `createdAt`
- `updatedAt`

`status` should support at least `draft` and `published`. Public APIs return only published products.

### ProductImage

Stores ordered images for each product.

- `id`
- `productId`
- `src`
- `alt`
- `sortOrder`
- `createdAt`
- `updatedAt`

### Author

Stores artist profiles.

- `id`
- `name`
- `slug`
- `subtitle`
- `bio`
- `portraitSrc`
- `style`
- `status`
- `createdAt`
- `updatedAt`

`status` should support at least `draft` and `published`. Public APIs return only published authors.

### Order

Stores customer orders.

- `id`
- `customerName`
- `customerEmail`
- `customerPhone`
- `shippingAddress`
- `note`
- `status`
- `total`
- `createdAt`
- `updatedAt`

`status` should support `new`, `confirmed`, `fulfilled`, and `cancelled`.

### OrderItem

Stores order line items and preserves the sale price at checkout time.

- `id`
- `orderId`
- `productId`
- `productName`
- `unitPrice`
- `quantity`
- `lineTotal`

## Public API

### `GET /api/products`

Returns published products. Supports optional filters:

- `category`
- `q`
- `sort`

The response includes category, author summary, primary image, price, stock, and slug.

### `GET /api/products/[slug]`

Returns one published product with all images, category, author summary, story, and stock.

### `GET /api/authors`

Returns published authors with portrait, style, subtitle, and slug.

### `GET /api/authors/[slug]`

Returns one published author with bio and related published products.

### `POST /api/orders`

Creates an order from customer details and cart items.

Validation rules:

- Customer name, phone, and address are required.
- At least one item is required.
- Product ids must exist and be published.
- Quantity must be a positive integer.
- Total is calculated on the server from database prices.

## Admin Flow

### Login

`/admin/login` presents email and password fields.

On successful login:

- Compare password with `passwordHash`.
- Create a signed session token.
- Store the token in an HTTP-only, secure cookie.
- Redirect to `/admin`.

On failure:

- Return a generic login error.
- Do not reveal whether the email or password was wrong.

### Protected Admin Routes

All `/admin` pages except `/admin/login` require a valid session. Unauthenticated users redirect to `/admin/login`.

### Dashboard

`/admin` shows a compact overview:

- Product count.
- Published product count.
- Author count.
- New order count.
- Recent orders.

### Product Management

`/admin/products` supports:

- List products.
- Create product.
- Edit product.
- Publish or unpublish product.
- Manage category, price, stock, description, story, author, and images.

### Author Management

`/admin/authors` supports:

- List authors.
- Create author.
- Edit author.
- Publish or unpublish author.
- Manage name, subtitle, style, bio, portrait image, and slug.

### Order Management

`/admin/orders` supports:

- List orders newest first.
- View order detail.
- Update order status.

Order editing is limited to status changes in v1. Customer and item data should remain immutable after creation.

## Docker

Use Docker Compose with two services:

- `app`: Next.js application.
- `postgres`: PostgreSQL database.

The app service should use environment variables for:

- `DATABASE_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`
- `NODE_ENV`

Local development should support:

```bash
docker compose up
```

The database volume should persist local data between container restarts.

## Seeding

Prisma seed should create:

- One admin user from `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- Initial categories.
- Initial products migrated from existing catalogue HTML.
- Initial authors migrated from existing author pages.

Seed should be idempotent by using stable slugs and upserts.

## Frontend Migration

The migration should keep the current visual result recognizable:

- Move assets to `public/assets`.
- Import the existing global CSS into Next.js first.
- Convert repeated header, menu, and footer partials into React components.
- Convert each public HTML page into a Next.js route.
- Replace hard-coded product and author data with Prisma-backed queries or API calls.
- Keep client-side interactions only where needed, such as menu overlay, sliders, product gallery, filters, and quantity controls.

Catalogue filters should work from database data. They can be implemented server-side through query parameters or client-side after loading products; server-side filtering is preferred for consistency with API behavior.

## Error Handling

Public API errors should return JSON with:

- `error`
- `message`

Admin form errors should be shown inline near the relevant form when possible.

Unknown public product or author slugs should return Next.js `notFound()`.

Order creation errors should not create partial orders. Order and order items should be written in one database transaction.

## Security

V1 security requirements:

- Passwords are stored only as bcrypt hashes.
- Admin session cookie is HTTP-only.
- Session secret comes from environment variables.
- Public APIs never return `passwordHash`.
- Admin routes verify authentication server-side.
- Order totals are calculated server-side.
- Admin login uses generic failure messaging.
- Mutating admin actions require CSRF protection or an equivalent per-session validation.

If server actions are used, they must include a per-session CSRF token or equivalent validation for admin mutations.

## Testing And Verification

Required verification for v1:

- Prisma schema validates.
- Database migrations apply in Docker.
- Seed creates the admin and initial catalogue data.
- Next.js build passes.
- Public pages render without missing core assets.
- Public API endpoints return expected data.
- Admin login rejects invalid credentials and accepts seeded credentials.
- Admin protected pages redirect when unauthenticated.
- Order creation validates bad payloads and creates valid orders transactionally.

Existing Playwright smoke checks can be adapted from static URLs to Next.js routes.

## Scope Boundaries

Included in v1:

- Next.js migration.
- PostgreSQL and Prisma.
- Public product and author APIs.
- Order creation API.
- Admin login/logout.
- Admin dashboard.
- Admin CRUD for products and authors.
- Admin order list/detail/status update.
- Docker Compose local runtime.

Not included in v1:

- Online payment gateway integration.
- Customer accounts.
- Email notifications.
- File upload service or cloud image storage.
- Multi-admin role permissions beyond a basic role field.
- Inventory reservation under high concurrency.
- Production CI/CD pipeline.

## Acceptance Criteria

The implementation is complete when:

- `docker compose up` starts the app and database.
- The public site is available from the Next.js app.
- Catalogue and author pages read data from PostgreSQL.
- A seeded admin can log in at `/admin/login`.
- Admin can create and update products and authors.
- Admin can view orders and change order status.
- A public user can submit an order through the API.
- Build and verification commands pass.
