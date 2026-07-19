# Build desde la RAÍZ del monorepo: docker build -f apps/frontend/Dockerfile .
# (necesita acceso a packages/shared y packages/simulations)

FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /repo

# ---------------------------------------------------------------------------
FROM base AS builder

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY apps/frontend/scripts apps/frontend/scripts
COPY apps/backend/package.json apps/backend/package.json
COPY apps/e2e/package.json apps/e2e/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/database/prisma packages/database/prisma
COPY packages/shared/package.json packages/shared/package.json
COPY packages/simulations/package.json packages/simulations/package.json

# El postinstall de packages/database corre `prisma generate`, que solo
# necesita el schema (ya copiado arriba) — packages/database/package.json
# está en el grafo de workspace aunque el frontend no lo importe directo.
RUN pnpm install --frozen-lockfile

COPY packages/shared packages/shared
COPY packages/simulations packages/simulations
COPY apps/frontend apps/frontend
COPY tsconfig.json tsconfig.json

RUN pnpm --filter @network-learning-game/shared run build
RUN pnpm --filter @network-learning-game/simulations run build

# NEXT_PUBLIC_* se inlinean en el bundle del cliente durante el build — son
# valores públicos por diseño (anon key, no service role), no secretos.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm --filter frontend run build

# ---------------------------------------------------------------------------
FROM node:24-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

COPY --from=builder --chown=nodejs:nodejs /repo/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nodejs:nodejs /repo/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder --chown=nodejs:nodejs /repo/apps/frontend/public ./apps/frontend/public

USER nodejs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "apps/frontend/server.js"]
