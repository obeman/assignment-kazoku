RESTAURANT ORDER SYSTEM
======================

SETUP
-----
1. Create .env file:
MYSQL_HOST=host.docker.internal
MYSQL_PORT=3309
MYSQL_USER=root
MYSQL_PASSWORD=obeman123
MYSQL_DATABASE=restoran
RABBITMQ_HOST=rabbitmq

2. Required ports:
3001: Order Service
3002: Kitchen Service
3003: Notification Service
3309: MySQL
5672: RabbitMQ

DATABASE INITIALIZATION
----------------------
1. Start MySQL only:
   docker-compose up mysql

2. Create database and tables:
   docker-compose exec mysql mysql -u root -pobeman123 -e "CREATE DATABASE IF NOT EXISTS restoran;"

3. Insert initial menu items:
   docker-compose exec mysql mysql -u root -pobeman123 restoran -e "
   INSERT INTO food_menu (name, price) VALUES 
   ('Nasi Goreng', 25000),
   ('Mie Goreng', 20000),
   ('Ayam Goreng', 30000),
   ('Sate Ayam', 35000),
   ('Es Teh', 5000),
   ('Es Jeruk', 7000);"

4. Stop MySQL:
   docker-compose down

RUNNING
-------
1. Start all services:
   docker-compose up --build

2. Stop all services:
   docker-compose down

3. Clean everything:
   docker-compose down -v

ENDPOINTS
---------
Order Service (3001):
GET /menu
POST /orders
GET /orders
GET /orders/:id
GET /orders/:id/status

Kitchen Service (3002):
GET /orders
PUT /orders/:id/status

TROUBLESHOOTING
--------------
1. "Duplicate entry" error:
   - Follow DATABASE INITIALIZATION steps
   - Then run: docker-compose up --build

2. Service fails:
   - Check ports
   - Check .env
   - Check logs: docker-compose logs [service]

3. RabbitMQ fails:
   - Wait 30s
   - Check logs: docker-compose logs rabbitmq

DEVELOPMENT
----------
1. Rebuild: docker-compose build [service]
2. Logs: docker-compose logs -f [service]
3. MySQL: docker-compose exec mysql mysql -u root -pobeman123 restoran
