FROM node:18-alpine

WORKDIR /app

# Install amqplib for RabbitMQ connection
RUN npm install amqplib

# Copy the setup script
COPY setup-rabbitmq.js .

# Run the setup script
CMD ["node", "setup-rabbitmq.js"] 