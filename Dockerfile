# ==============================================================================
# PHỞ GIA TRUYỀN 1986 — FRONTEND DOCKERFILE
# Multi-stage build: Node.js 20 Alpine -> Nginx 1.27 Alpine Static Server
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Production Static Bundle
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Accept API base URL build argument (defaulting to relative path /api/v1)
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy package dependency manifests
COPY package.json package-lock.json ./

# Clean install dependencies
RUN npm ci

# Copy frontend source code
COPY . ./

# Build production bundle with Vite
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Nginx Server
# ------------------------------------------------------------------------------
FROM nginx:1.27-alpine

# Remove default nginx HTML files
RUN rm -rf /usr/share/nginx/html/*

# Copy built distribution from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration (reverse proxy + SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
