# Stage 1: Build React/Vite application
FROM node:22-alpine AS builder

WORKDIR /app

ARG VITE_BACKEND_URL
ARG VITE_CLIENT_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV VITE_CLIENT_URL=${VITE_CLIENT_URL}
COPY package*.json .
RUN npm ci

COPY . .

RUN npm run build


# Stage 2: Serve the production build
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY client.nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]