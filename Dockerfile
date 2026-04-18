# syntax=docker/dockerfile:1

ARG NODE_IMAGE=node:20-alpine

# -----------------------------
# Stage 1 — Install dependencies
# -----------------------------
FROM ${NODE_IMAGE} AS deps

RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile


# -----------------------------
# Stage 2 — Build application
# -----------------------------
FROM ${NODE_IMAGE} AS builder

RUN corepack enable pnpm

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build


# -----------------------------
# Stage 3 — Production deps only
# -----------------------------
FROM ${NODE_IMAGE} AS prod-deps

RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --prod --frozen-lockfile


# -----------------------------
# Stage 4 — Production runtime
# -----------------------------
FROM ${NODE_IMAGE} AS production

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# production dependencies
COPY --chown=node:node --from=prod-deps /app/node_modules ./node_modules

# compiled application
COPY --chown=node:node --from=builder /app/dist ./dist

# migrations (needed for runtime migrations if used)
COPY --chown=node:node --from=builder /app/migrations ./migrations

# optional runtime metadata
COPY --chown=node:node package.json ./

EXPOSE ${PORT}

# healthcheck using your /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:${PORT}/health || exit 1

# run as non-root user
USER node

CMD ["node", "dist/main.js"]
