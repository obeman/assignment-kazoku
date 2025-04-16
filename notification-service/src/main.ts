import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Channel } from 'amqplib';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  const rabbitmqUrl = configService.get('RABBITMQ_URL') || 'amqp://localhost:5672';
  console.log(`Notification service is starting...`);
  console.log(`RABBITMQ_URL: ${rabbitmqUrl}`);

  // Configure microservices
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: 'notification_queue',
      queueOptions: {
        durable: false,
        autoDelete: false,
      },
      exchange: 'order_exchange',
      exchangeOptions: {
        type: 'fanout',
        durable: false,
      },
      noAck: true,
      prefetchCount: 1,
      isGlobalPrefetchCount: false,
      noAssert: false,
      socketOptions: {
        heartbeatIntervalInSeconds: 30,
        reconnectTimeInSeconds: 1,
      },
      bindExchange: true,
      assertExchange: false,
      assertQueue: true,
      consumerOptions: {
        consumerTag: 'notification-consumer-' + Math.random().toString(36).substring(2, 15),
      },
      setup: (channel: Channel) => {
        console.log(`Notification service setting up RabbitMQ channel...`);
        return new Promise((resolve) => {
          // Don't try to create the exchange, just bind to it
          channel.assertQueue('notification_queue', { durable: false, autoDelete: false })
            .then(q => {
              console.log(`Notification service: Queue ${q.queue} asserted`);
              channel.bindQueue(q.queue, 'order_exchange', '');
              console.log(`Notification service: Queue ${q.queue} bound to order_exchange`);
              resolve(channel);
            });
        });
      },
    },
  });

  // Enable CORS
  app.enableCors();

  console.log(`Notification service starting microservices...`);
  // Start microservices
  await app.startAllMicroservices();
  
  // Start HTTP server
  const port = configService.get('PORT', 3003);
  await app.listen(port);
  console.log(`Notification service is running on port ${port}`);
}

bootstrap(); 