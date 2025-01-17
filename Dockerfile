# Stage 1: Build the Node.js/React application
ARG NODE_VERSION=20.12.2
FROM --platform=linux/amd64 node:${NODE_VERSION}-alpine as build-stage

WORKDIR /app
COPY package*.json ./
RUN npm install

# Copy the rest of your project files
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Set up the Node.js/Express server to serve the React app
FROM --platform=linux/amd64 node:${NODE_VERSION}-alpine as production-stage

WORKDIR /app

# Install only prod dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy the built React files from the build stage
COPY --from=build-stage /app/dist ./dist

# Create a simple Express server to serve the React app
COPY index.cjs .

EXPOSE 80
CMD ["node", "index.cjs"]