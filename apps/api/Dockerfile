FROM node:20-alpine AS deps
WORKDIR /app

COPY . .

RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app /app

RUN npm run prisma:generate
RUN npm run build:api

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app /app
COPY --from=builder /app/apps/api/dist ./apps/api/dist

EXPOSE 4000

CMD ["npm", "run", "start:api"]
