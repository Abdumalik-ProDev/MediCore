FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 appuser
COPY --from=deps /app/node_modules ./node_modules
COPY . .
USER appuser
EXPOSE 5000
CMD ["node", "src/server.js"]
