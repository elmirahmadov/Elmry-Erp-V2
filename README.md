# Elmry ERP Monorepo

npm + Turbo monorepo. **Tek veritabanı paketi:** `@elmry/database`.

## Structure

```
apps/
  api/                 # Express API (@elmry/api)
    src/
      bootstrap/       # server, app, routes
      core/            # config, middleware, errors, logger
      modules/         # domain modules (auth, product, …)
  web/                 # Vite React SPA (@elmry/web)
    src/
      app/             # main + App (routes)
      common/          # shared UI, auth, actions
      pages/           # feature pages
      styles/          # design system CSS
      services/        # API endpoint map
packages/
  config/              # env + CORS (@elmry/config)
  database/            # Prisma schema/client/seed (@elmry/database)
    prisma/            # schema.prisma, migrations, seed.ts
    src/               # Prisma client export
scripts/               # prisma-env, wait-for-mysql
```

Legacy `ERP-BackEnd` / `ERP-FrontEnd` klasörleri `_archive/` altına taşındı (gitignore).

## Quick start

```bash
npm run docker:up:db
npm install
npm run db:setup
npm run dev
```

- API: http://localhost:5000  
- Web: http://localhost:5173  

## Database (yalnızca packages/database)

```bash
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:seed
npm run db:setup   # mysql + generate + push + seed
```

`apps/api` içinde Prisma **yok**. Schema / migration / seed → `packages/database`.

## Demo login

| Field | Value |
|-------|--------|
| Brend | `Demo` |
| Email | `admin@demo.com` |
| Password | `demo12345` |

## Env

Root `.env.example` → `.env`  
Web: `apps/web/.env.example` → `apps/web/.env`
