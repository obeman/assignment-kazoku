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

- Docker and Docker Compose
- MySQL (for local development only)

## Database Setup

1. Create the MySQL database manually:
```sql
CREATE DATABASE restoran;
```

2. Seed the database with initial schema and data:
```bash
cd kitchen-service
npm install mysql2 dotenv
node run-seed.js
```

This will create the necessary tables (food_menu, orders, order_foods) and populate the food_menu table with sample data.

## Using Docker Compose (Recommended)

The easiest way to run the entire system is with Docker Compose:

1. Build all services:
```bash
docker-compose build
```

2. Start all services:
```bash
docker-compose up
```

3. To run in background:
```bash
docker-compose up -d
```

This will start:
- RabbitMQ server
- RabbitMQ setup (automatically creates exchanges and queues)
- Order Service
- Kitchen Service
- Notification Service

The services will be available at:
- Order Service: http://localhost:3001
- Kitchen Service: http://localhost:3002
- Notification Service: http://localhost:3003
- RabbitMQ Management: http://localhost:15672 (guest/guest)

## Manual Setup (Alternative)

If you prefer to run services locally without Docker:

1. Install dependencies for each service:
```bash
cd order-service
npm install

cd ../kitchen-service
npm install

cd ../notification-service
npm install
```

2. Start each service (in separate terminals):
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

## Postman Collection

For testing the APIs, a Postman collection is provided:

1. In Postman, click on the "Import" button in the top left corner
2. Drag and drop the `Restaurant System API.postman_collection.json` file from the project root directory
3. Alternatively, click on "Upload Files" and select the file

The collection includes all necessary API endpoints for:
- Creating orders
- Retrieving order details
- Checking order status
- Accessing the food menu

## Environment Configuration

Each service requires its own `.env` file with the following settings (only needed for manual setup):

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
- `GET /orders/menu` - Get all food menu items
- `POST /orders` - Create a new order 
- `GET /orders/:orderId` - Get order details and status

## Troubleshooting

If you encounter issues with the database schema or enum values:

1. Delete the tables from the database
2. Run the seed script again:
```bash
cd kitchen-service
node run-seed.js
```

## Contributors

- [Naufal Muhammad Roshandi](https://github.com/obeman) 