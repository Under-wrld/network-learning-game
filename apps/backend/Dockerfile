# Build desde la RAÍZ del monorepo: docker build -f apps/backend/Dockerfile .
# (necesita acceso a packages/database, packages/shared, packages/simulations)

FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /repo

# ---------------------------------------------------------------------------
FROM base AS builder

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY apps/frontend/scripts apps/frontend/scripts
COPY apps/e2e/package.json apps/e2e/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/simulations/package.json packages/simulations/package.json

RUN pnpm install --frozen-lockfile

COPY packages/database packages/database
COPY packages/shared packages/shared
COPY packages/simulations packages/simulations
COPY apps/backend apps/backend
COPY tsconfig.json tsconfig.json

RUN pnpm --filter @network-learning-game/database run db:generate
RUN pnpm --filter @network-learning-game/database run build
RUN pnpm --filter @network-learning-game/shared run build
RUN pnpm --filter @network-learning-game/simulations run build
RUN pnpm --filter backend run build

RUN pnpm --filter backend deploy --prod /deploy

# ---------------------------------------------------------------------------
FROM node:24-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs
COPY --from=builder --chown=nodejs:nodejs /deploy .

USER nodejs
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.API_PORT||3001)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/main.js"]
