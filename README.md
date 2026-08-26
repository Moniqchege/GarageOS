# Garage Management System

Initial extraction of the GarageOS UI into a TypeScript React monorepo.

## Apps

- `@garage/staff` — http://localhost:5173
- `@garage/customer` — http://localhost:5174

## Shared packages

- `@garage/ui`
- `@garage/theme`
- `@garage/types`

## Run

```bash
corepack enable
corepack prepare pnpm@10.15.0 --activate
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
pnpm typecheck
```

## Source basis

The `legacy/` directory preserves the two supplied implementations. The first extracted pages use the same GarageOS domain concepts, brand tokens, sample vehicles, job cards, customer and workshop terminology.

Next migration targets are Login, Vehicle Intake, Job Card, Workshop/Bay, Customers, Stock, POS, Checkout, Receipt, Analytics, Staff and Settings.
