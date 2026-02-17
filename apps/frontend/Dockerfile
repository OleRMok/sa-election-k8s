# Stage 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Pass VITE_API_URL as a build argument
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copy the rest of the source code
COPY . .

# Build the project
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine
# Copy the custom build from the first stage to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 (standard Nginx practice)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]