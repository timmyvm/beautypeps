# Beauty Peps

Beauty Peps is an online store for cosmetic beauty peptides, built with **Next.js 16, React 19, Tailwind CSS v4 and Drizzle ORM** on SQLite/libSQL. As well as the shop, it has a peptide library and learning content, customer accounts and an admin panel. All product, brand and editorial images were generated with **Higgsfield**.

## What's inside

| Area | Highlights |
| --- | --- |
| **Storefront** | Home page, shop with filters (category, concern, sort, search), product pages (key actives, INCI, how to use, FAQs, reviews, JSON-LD), bag, discount codes, one-page checkout, order confirmation, guest order tracking |
| **Education** | Peptide Library (one page per peptide covering how it works, the evidence and how to use it), the Science page, a peptide comparison chart, an interactive Routine Builder, Journal articles, glossary, FAQ, policies |
| **Customers** | Register, log in and reset a password (emailed link). Guest orders are linked when the customer registers. Account pages: order history and detail (progress tracker, payment details, tracking, buy again, cancel unpaid orders), addresses, wishlist, reviews, profile, security (change password, sign out everywhere, delete account) |
| **Admin** (`/admin`) | Dashboard (revenue chart, KPIs, low stock), orders (status workflow, emails to the customer, tracking, notes, packing slips, CSV + Australia Post MyPost export), customers, discounts, products (full editor and image uploads), categories, review moderation, Peptide Library and Journal editors, contact inbox, subscribers, email log, store settings |

Payments are **manual: bank transfer or PayID**. When a customer places an order, the confirmation email includes the payment details and uses the order number as the payment reference. The admin then clicks **Mark as paid**, then **Shipped** with a tracking number, and the customer is emailed at each step.

## Quick start

```bash
npm install
cp .env.example .env        # then edit ADMIN_EMAIL / ADMIN_PASSWORD
npm run db:setup            # runs migrations + seeds products, peptides, articles & demo data
npm run dev                 # http://localhost:3000
```

Seeded logins:

| Role | Email | Password |
| --- | --- | --- |
| Admin | value of `ADMIN_EMAIL` (default `admin@beautypeps.com.au`) | value of `ADMIN_PASSWORD` (default `ChangeMe-Peps-2026!`) |
| Demo customer | `demo@beautypeps.com.au` | `Demo-Peps-2026!` |

To seed only the real catalogue and content, without demo customers, orders or reviews, run `npm run db:seed -- --no-demo`.

Discount codes in the seed: `WELCOME10`, `PEPS20` (20% off orders over $150), `GLOW15` ($15 off orders over $100), `FREESHIP`.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run db:generate` | Create a new SQL migration after editing `lib/db/schema.ts` |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Wipe and re-seed the database |
| `npm run db:studio` | Drizzle Studio (DB browser) |

## Environment variables

See [`.env.example`](.env.example).

- `DATABASE_URL` / `DATABASE_AUTH_TOKEN`: `file:local.db` locally. For production use [Turso](https://turso.tech) (`libsql://…`).
- `AUTH_SECRET`: **required in production**, including `npm start` locally. Without it, sign-in is refused. `npm run dev` falls back to a development secret. Generate one with `openssl rand -base64 32`.
- `NEXT_PUBLIC_SITE_URL`: used in emails, the sitemap and OG tags.
- `RESEND_API_KEY` + `EMAIL_FROM`: optional. Without them, emails are not sent; they are only written to **Admin → Email log**, which is useful in development (e.g. to grab password-reset links).
- `BLOB_READ_WRITE_TOKEN`: optional. Without it, admin image uploads are saved to `public/uploads` (local only). On Vercel, add a Blob store.

## Deploying (Vercel + Turso)

1. Create a Turso database: `turso db create beautypeps`, then get its URL and a token.
2. Locally, with `DATABASE_URL` and `DATABASE_AUTH_TOKEN` pointing at Turso, run `npm run db:setup`.
3. Import the repo into Vercel and set `DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL` (plus optional Resend and Blob vars).
4. Deploy.

## Project layout

```
app/(site)/        public site: shop, products, cart, checkout, learn, peptides, account, auth…
app/admin/         admin panel
components/        ui kit, site chrome, order parts, admin, shop, learn…
lib/db/            Drizzle schema + client      drizzle/   SQL migrations
lib/auth/          JWT session cookies (jose) + bcrypt
lib/actions/       server actions (cart, checkout, auth, account, admin/*)
lib/seed-data/     catalogue, peptide monographs, articles, demo data
public/images/     Higgsfield-generated brand, product, editorial & article imagery
proxy.ts           route protection for /account and /admin (Next 16 "proxy" = old middleware)
```

## Compliance note

The products are positioned as **topical cosmetics**. The education pages describe published research, say how strong the evidence is, and avoid therapeutic claims. The footer carries a TGA-style disclaimer. Before you launch, review all copy, the policies and the business details in **Admin → Settings** (ABN, bank details, PayID).
