# Dockerfile for Vite React with Node.js v18.19.0

# Use Node.js v18.19.0 as a parent image
FROM node:18.19.0-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of your app's source code
COPY . .

# Build the app
RUN npm run build

# Use an nginx image to serve the static files
FROM nginx:alpine

# Copy the built files from the previous step
COPY --from=0 /app/dist /usr/share/nginx/html
# COPY default.conf ./
COPY default.conf /etc/nginx/conf.d/default.conf 
# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
