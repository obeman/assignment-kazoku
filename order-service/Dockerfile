# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Install netcat for the wait script
RUN apk add --no-cache netcat-openbsd

# Copy and make the wait script executable
COPY wait-for-rabbitmq.sh /wait-for-rabbitmq.sh
RUN chmod +x /wait-for-rabbitmq.sh

EXPOSE 3001

# Use the wait script before starting the application
CMD ["/wait-for-rabbitmq.sh", "rabbitmq", "5672", "npm", "run", "start:prod"] 