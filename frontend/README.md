## CEYLARA — Womenswear Commerce Platform

Full-featured commerce experience built with **Next.js 14 App Router**, **MongoDB/Mongoose**, and a reusable component system inspired by modern luxury storefronts.

### Features

- Storefront: Home, Shop w/ filters, category hubs, product detail with gallery/size guide, cart, checkout, order confirmation, search, content pages.
- Customer account area: profile, address book, orders & tracking, wishlist, recently viewed.
- Admin panel: dashboard analytics, product/category CRUD, order workflow, customers, discounts, shipping & site settings, reviews, inventory snapshots.
- APIs: authentication with JWT cookies, catalog search/filter, cart/order creation, wishlist, address storage, review moderation, admin reports.
- Shared utilities: Tailwind CSS tokens, design system components, Zustand cart/wishlist, React Query provider, env validation, reusable Mongo models.

### Tech Stack

- Next.js 16 / React 19 (App Router, Route Handlers)
- TypeScript, Tailwind CSS, React Query, Zustand, React Hook Form, Zod
- MongoDB via Mongoose, JSON Web Tokens, Nodemailer, Cloudinary-ready upload hooks

### Getting Started

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` for the storefront and `http://localhost:3000/admin` for the management panel (requires setting a user role to `admin` in MongoDB).

### Testing & Linting

- `npm run lint` — ESLint (Next config)
- Add Playwright/Cypress for E2E and Vitest/Jest for unit tests as needed (hooks, services, API handlers).

### Project Structure

- `src/app` — App Router routes (storefront + admin + API)
- `src/components` — Reusable UI, store, admin, account, auth, content sections
- `src/lib` — DB connection, models, auth helpers, validators, constants
- `src/store` — Zustand slices for cart, wishlist, recently viewed
- `src/data` — Mock data to hydrate UI before real catalog content

### Environment Variables

Create `frontend/.env.local` with the following keys (CI environments should mirror these values):

```
MONGODB_URI=mongodb://127.0.0.1:27017/ceylara
JWT_SECRET=dev-ceylara-secret-key
JWT_REFRESH_SECRET=dev-ceylara-refresh-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BRAND_NAME=CEYLARA
UPLOADTHING_TOKEN=
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=000000000000000
CLOUDINARY_API_SECRET=demo-secret
CLOUDINARY_UPLOAD_FOLDER=ceylara/uploads
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=demo
SMTP_PASS=demo
SMTP_SECURE=false
SMTP_FROM=notifications@ceylara.local
STRIPE_SECRET_KEY=sk_test_123
STRIPE_PUBLISHABLE_KEY=pk_test_123
STRIPE_WEBHOOK_SECRET=whsec_123
```

### Deployment

- Frontend/API: Vercel or any Node host.
- Database: MongoDB Atlas (set `MONGODB_URI`).
- Assets: configure Cloudinary with the keys above for product imagery.
