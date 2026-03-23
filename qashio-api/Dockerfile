FROM node:22.8.0

WORKDIR /app

# Copy package files and install all dependencies (including dev)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the app in dev mode (with hot reload)
CMD ["npm", "run", "start:dev"]
