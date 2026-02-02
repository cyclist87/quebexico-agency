# Node 20 (Vite 7, p-limit, p-retry exigent >=20)
FROM node:20-alpine AS base

WORKDIR /app

# Install: npm install (pas npm ci) pour éviter erreur lock file / bufferutil
COPY package.json package-lock.json* ./
RUN npm install

# Build
COPY . .
RUN npm run build

# Run
ENV NODE_ENV=production
EXPOSE 5000
CMD ["npm", "start"]
