# Stage 1: Install dependencies
FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Stage 2: Runner
FROM oven/bun:1 AS runner
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production

CMD ["bun", "run", "src/index.ts"]
