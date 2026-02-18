# Stage 1: Build (The "Heavy" part)
FROM node:18-alpine AS build

# Accept build argument
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app

# Copy dependency files first to leverage Docker cache
COPY package*.json ./
RUN npm install

# Copy all source files and build for production
COPY . .
RUN npm run build

# Stage 2: Production (The "Light" part)
FROM nginx:alpine

# Copy the static build files from the build stage to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the custom Nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]