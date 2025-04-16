FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p node_modules/@order-service/order/entities && \
    ln -s /app/src/entities/order.entity.ts node_modules/@order-service/order/entities/order.entity.ts

RUN npm run build

# Install netcat for the wait scripts
RUN apk add --no-cache netcat-openbsd

# Copy and make the scripts executable
COPY wait-for-mysql.sh /wait-for-mysql.sh
RUN chmod +x /wait-for-mysql.sh

EXPOSE 3002

# Start the application directly without the seed script
CMD ["npm", "run", "start:prod"] 