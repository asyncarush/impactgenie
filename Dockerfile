# ------------------------------
# Stage 1: Base image
# ------------------------------
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# ------------------------------
# Stage 2: Dependencies
# ------------------------------
FROM base AS deps

# Add necessary packages
RUN apk add --no-cache libc6-compat

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# ------------------------------
# Stage 3: Build
# ------------------------------
FROM base AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Optional: Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ------------------------------
# Stage 4: Production image
# ------------------------------
FROM base AS runner

WORKDIR /app

# Create user for running the app
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Copy standalone app files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Use non-root user
USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
    