# AutoParts POS — Vehicle Spare Parts Shop Management System

A full-stack point-of-sale and inventory management system built for a vehicle spare parts shop. Manages customers, suppliers, vehicles, parts/stock, purchases, sales/invoices, payments, stock movements, and sale returns.

## Tech Stack

- **Framework:** Next.js 14 (App Router, Server Actions)
- **Database:** PostgreSQL via [Prisma ORM](https://www.prisma.io/)
- **Auth:** NextAuth.js (credentials-based, role-based access: Admin / Manager / Cashier)
- **UI:** React 18 + Tailwind CSS 4
- **Charts:** Recharts

## Features

- Role-based login (Admin / Manager / Cashier)
- Customers, Suppliers, Vehicles, Categories, Parts/Stock management (full CRUD)
- Low-stock / reorder level alerts
- Purchases with multi-item entry — automatically increases stock and logs stock transactions
- Sales / Invoices (POS-style) with multi-item entry, discounts, partial payments, and balance tracking — automatically decreases stock
- Payment recording against outstanding invoices
- Sale returns — automatically restocks parts
- Full stock transaction ledger (purchase / sale / return / adjustment)
- Dashboard with sales trend chart, low-stock alerts, and outstanding balances
- Reports: sales revenue, gross profit, purchases, returns, top-selling parts, low-stock list, stock value (date-range filterable)
- Printable invoices
- System user management (Admin only)

## Getting Started (local development)

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   Copy `.env.example` to `.env` and fill in the values:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL` — a PostgreSQL connection string. The easiest free option is [Neon](https://neon.tech): create a project, copy the connection string (make sure it includes `?sslmode=require`).
   - `NEXTAUTH_SECRET` — generate one with `openssl rand -base64 32`.
   - `NEXTAUTH_URL` — `http://localhost:3000` for local dev.

3. **Push the database schema**

   ```bash
   npx prisma db push
   ```

4. **Seed initial data** (creates the first admin user + starter categories)

   ```bash
   npx prisma db seed
   ```

   Default login: **username `admin`, password `admin123`** — change this after first login by editing the user in System Users.

5. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Deploying to Production (Vercel + Neon)

1. Push this repository to GitHub (see below).
2. Create a free Postgres database on [Neon](https://neon.tech) and copy its connection string.
3. Go to [vercel.com](https://vercel.com), **New Project**, import this GitHub repo.
4. In the project's **Environment Variables** settings, add:
   - `DATABASE_URL` — your Neon connection string
   - `NEXTAUTH_SECRET` — a random secret (`openssl rand -base64 32`)
   - `NEXTAUTH_URL` — your Vercel deployment URL (e.g. `https://your-app.vercel.app`)
5. Deploy. Vercel runs `npm install` which triggers `prisma generate` automatically (via the `postinstall` script), then `npm run build`.
6. After the first successful deploy, run the schema push and seed once against the production database:

   ```bash
   DATABASE_URL="your-neon-connection-string" npx prisma db push
   DATABASE_URL="your-neon-connection-string" npx prisma db seed
   ```

   (Run this from your own machine or this workspace — it only needs network access to Neon.)
7. Log in with `admin` / `admin123` and change the password immediately.

## Project Structure

```
prisma/schema.prisma       Database schema (all 14 tables)
prisma/seed.ts              Seed script (admin user + categories)
src/lib/prisma.ts           Prisma client singleton
src/lib/auth.ts              NextAuth configuration
src/lib/session.ts           Server-side session helpers (requireUser/requireAdmin)
src/lib/actions/*.ts         Server Actions — all business logic & database writes
src/middleware.ts            Route protection (auth + admin-only routes)
src/app/login/               Login page
src/app/(app)/               Protected app shell — dashboard + all modules
src/components/              Shared UI components
```

## Notes on Business Logic

- **Purchases**: creating a purchase increases each part's stock quantity and writes a `PURCHASE` stock transaction per line item, inside a single database transaction.
- **Sales**: creating a sale checks stock availability first, then decreases stock, writes `SALE` stock transactions, and records a payment if an amount was paid at checkout — all inside a single database transaction.
- **Sale Returns**: returning items increases stock back and writes `RETURN` stock transactions; return quantity is validated against the original sale's quantities.
- **Manual stock edits**: editing a part's quantity directly logs an `ADJUSTMENT` stock transaction for the difference.
