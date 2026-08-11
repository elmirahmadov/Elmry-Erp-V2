# @elmry/api

Express API. Database access only via `@elmry/database` — **no local Prisma**.

## `src/` layout

```
src/
  bootstrap/     # HTTP entry: server.ts, app.ts, routes.ts
  core/          # config, middlewares, errors, logger, utils
  modules/       # feature modules (controller / service / repository / dto)
```

## Scripts

```bash
npm run dev --workspace=@elmry/api
npm run build --workspace=@elmry/api
```
