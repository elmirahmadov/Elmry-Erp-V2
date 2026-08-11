# @elmry/web

Vite + React SPA.

## `src/` layout

```
src/
  app/           # main.tsx, App.tsx (router)
  common/        # layout, auth, shared components, actions, store
  pages/         # feature screens
  styles/        # design tokens / WatchVerse CSS
  services/      # API endpoint constants
```

Tooling configs (`vite`, `tailwind`, `tsconfig`) stay at the app root — required by Vite.

## Scripts

```bash
npm run dev --workspace=@elmry/web
npm run build --workspace=@elmry/web
```
