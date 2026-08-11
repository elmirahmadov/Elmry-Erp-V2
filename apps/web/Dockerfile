# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS build
WORKDIR /app

ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json* ./
COPY turbo.json ./
COPY packages/config/package.json packages/config/
COPY packages/database/package.json packages/database/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm install

COPY apps/web apps/web
RUN npm run build --workspace=@elmry/web

FROM nginx:1.27-alpine AS runner
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
