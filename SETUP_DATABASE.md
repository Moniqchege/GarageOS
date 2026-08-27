# GarageOS — MySQL setup

The API now reads and writes MySQL through Prisma instead of the old
in-memory arrays in `store.ts` (that file is gone). Everything below runs
on your machine, where you have normal internet access — Prisma needs to
download its query-engine binary once, from `binaries.prisma.sh`.

## 1. Install dependencies

```bash
pnpm install
```

## 2. Point the API at your local MySQL

Edit `apps/api/.env` — it already has `DATABASE_URL` filled in for a
`garageos` user, but update the user/password to whatever you actually
have set up locally:

```
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/garageos"
```

If you haven't created that user/database yet, from a MySQL shell:

```sql
CREATE DATABASE garageos;
CREATE USER 'garageos'@'localhost' IDENTIFIED BY 'garageos_dev_pw';
GRANT ALL PRIVILEGES ON garageos.* TO 'garageos'@'localhost';
FLUSH PRIVILEGES;
```

(Those are exactly the credentials already in `.env` — use them as-is if
you don't have a preference, or swap in your own.)

## 3. Create the tables

```bash
cd apps/api
pnpm db:migrate
```

This runs `prisma migrate dev`, which reads `prisma/schema.prisma`,
creates a migration file under `prisma/migrations/`, and applies it —
i.e. creates all 9 tables (employees, inventory_items, labor_charges,
job_cards, job_lines, vehicle_records, customer_vehicles,
customer_notifications, business_settings). It'll ask for a migration
name — anything like `init` is fine.

## 4. Seed the database

```bash
pnpm db:seed
```

Runs `prisma/seed.ts`, which loads the exact same mock data that used to
live in `store.ts` (employees, inventory, labor catalog, job cards +
lines, vehicle records, customer vehicles, notifications, settings). It's
safe to re-run — it clears each table before reinserting, so you always
land on the same known state.

## 5. Run the API

```bash
pnpm dev
```

From here every route — inventory, jobs, users, customers, labor, POS
checkout, settings, analytics, auth — reads and writes MySQL directly.
Anything you add through the app (a new inventory item, a new job card,
a new employee, etc.) is now a real `INSERT` and survives a server
restart.

## What's intentionally still in-memory

The POS cart (`apps/api/src/routes/pos.ts`) stays as a local `let`
variable, not a table. It's single-cashier, single-session, cleared on
checkout or cancel — persisting it would just add a table with no
benefit. If you later want held/parked sales that survive a server
restart, that's the one piece that would need its own table.

## Inspecting data

```bash
cd apps/api
pnpm db:studio
```

Opens Prisma Studio — a browser GUI over your `garageos` database.
