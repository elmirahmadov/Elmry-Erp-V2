# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package.json package-lock.json* ./
COPY turbo.json ./
COPY packages/config/package.json packages/config/
COPY packages/database/package.json packages/database/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm install

FROM deps AS build
COPY packages/config packages/config
COPY packages/database packages/database
COPY apps/api apps/api
COPY tsconfig.json ./
RUN npm run db:generate
RUN npm run build --workspace=@elmry/config
RUN npm run build --workspace=@elmry/database
RUN npm run build --workspace=@elmry/api

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/scripts ./scripts

EXPOSE 5000
CMD ["node", "apps/api/dist/bootstrap/server.js"]
