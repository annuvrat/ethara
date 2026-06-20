# Stage 1: Build React Application
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install packages
RUN npm ci

# Copy project files
COPY . .

# Build for production
RUN npm run build

# Stage 2: High-performance Nginx static server
FROM nginx:alpine

# Copy dist output to Nginx directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose default HTTP port
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
