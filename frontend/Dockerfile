# =========================
# ETAPA 1: COMPILACIÓN
# =========================

FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


# =========================
# ETAPA 2: NGINX
# =========================

FROM nginx:alpine

# Configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Frontend Angular
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80
