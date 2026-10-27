# ============================================================
# Dockerfile multi-stage — Frontend React (Vite)
# ============================================================

# ---- Étape 1 : Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copier package.json et installer les dépendances
COPY package.json package-lock.json* ./
RUN npm install

# Copier les sources et builder
COPY . .
RUN npm run build

# ---- Étape 2 : Serveur Nginx (image légère) ----
FROM nginx:alpine

# Copier le build Vite vers nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Config nginx pour React Router (SPA — évite les 404 sur refresh)
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    location /api/ {\n\
        proxy_pass http://api:8083;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
    }\n\
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
