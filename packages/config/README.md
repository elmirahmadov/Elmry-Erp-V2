# `@elmry/config`

Shared runtime configuration for the monorepo.

## Layout

```
src/
  env.ts       # Load root `.env`, Zod validation, `env` export
  cors.ts      # ALLOWED_ORIGINS / default CORS list
  monorepo.ts  # Resolve monorepo root path
  index.ts     # Public API
```

## Usage

```ts
import { env, resolveCorsOrigins, getMonorepoRoot } from "@elmry/config";
```

Environment is read from the **monorepo root** `.env` only (see root `.env.example`).
