# Restaurant Microservices

This is a microservices-based restaurant management system consisting of three services:

1. **Order Service** - Handles order creation and management
2. **Kitchen Service** - Processes orders and updates order status
3. **Notification Service** - Sends email notifications to customers

## Architecture

- Services communicate through RabbitMQ using an event-driven architecture
- Each service has its own database and responsibility
- The system follows the event sourcing pattern for data consistency

## Services

### Order Service (Port 3001)
- Creates and manages food orders
- Publishes events when orders are created
- Provides order status information

### Kitchen Service (Port 3002)
- Subscribes to order creation events
- Updates order status to PROCESSING
- Simulates kitchen workflow

### Notification Service (Port 3003)
- Subscribes to order creation events
- Sends confirmation emails to customers
- Handles email delivery and templating

## Message Flow

1. Order Service creates an order and publishes an `order_created` event to RabbitMQ
2. Kitchen Service and Notification Service independently consume this event
3. Kitchen Service updates the order status
4. Notification Service sends an email to the customer

## Prerequisites

- Node.js (v16+)
- RabbitMQ
- MySQL

## Setup

1. Install dependencies for each service:
```bash
cd order-service
npm install

cd ../kitchen-service
npm install

cd ../notification-service
npm install
```

2. Set up RabbitMQ exchange and queues:
```bash
node setup-rabbitmq.js
```

3. Start each service (in separate terminals):
```bash
# Terminal 1
cd order-service
npm run start:dev

# Terminal 2
cd kitchen-service
npm run start:dev

# Terminal 3
cd notification-service
npm run start:dev
```

## Environment Configuration

Each service requires its own `.env` file with the following settings:

### Order Service
```
MYSQL_HOST=localhost
MYSQL_PORT=3309
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=restoran
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_URL=amqp://localhost:5672
```

### Kitchen Service
```
MYSQL_HOST=localhost
MYSQL_PORT=3309
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=restoran
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_URL=amqp://localhost:5672
```

### Notification Service
```
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_URL=amqp://localhost:5672
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
```

## API Endpoints

### Order Service
- `POST /orders` - Create a new order
- `GET /orders` - List all orders
- `GET /orders/:id` - Get order details
- `GET /orders/:id/status` - Get order status

## Contributors

- [Your Name](https://github.com/your-github-username) 