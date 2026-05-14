# ─── Builder: Astro build ─────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Build-args: a CMS API URL és a site URL (Coolify-on át lehet adni)
ARG PUBLIC_CMS_URL=http://localhost:3001
ARG PUBLIC_SITE_URL=https://boxbook.hu
ENV PUBLIC_CMS_URL=$PUBLIC_CMS_URL
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL

# Csak package fájlok először (cache-elhető)
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

# Forrás + build
COPY astro.config.mjs tsconfig.json tailwind.config.mjs ./
COPY public ./public
COPY src ./src
RUN npm run build:nocheck

# ─── Runtime: nginx ───────────────────────────────────────
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
