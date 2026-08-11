# `@elmry/database`

**Single source of truth** for the Elmry ERP database.

There is **no** Prisma schema inside `apps/api`. All schema, migrations, seed, and client generation live here.

## Layout

```
prisma/
  schema.prisma   # Models + MySQL datasource
  seed.ts         # Demo data
  migrations/     # Prisma migrations
src/
  client.ts       # Lazy PrismaClient singleton
  index.ts        # Package exports
generated/        # prisma generate output (gitignored)
```

## Scripts (from monorepo root)

```bash
npm run db:generate   # prisma generate
npm run db:push       # db push (dev)
npm run db:migrate    # migrate deploy
npm run db:seed       # seed demo company
npm run db:setup      # docker mysql + generate + push + seed
```

Or via workspace:

```bash
npm run generate --workspace=@elmry/database
npm run seed --workspace=@elmry/database
```

## Usage

```ts
import { prisma, Prisma } from "@elmry/database";
```

Requires `DATABASE_URL` in the monorepo root `.env`.
