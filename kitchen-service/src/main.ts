import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Channel } from 'amqplib';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  const rabbitmqUrl = configService.get('RABBITMQ_URL') || 'amqp://localhost:5672';
  console.log(`Kitchen service is starting...`);
  console.log(`RABBITMQ_URL: ${rabbitmqUrl}`);

  // Configure microservices
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: 'kitchen_queue',
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
        consumerTag: 'kitchen-consumer-' + Math.random().toString(36).substring(2, 15),
      },
      setup: (channel: Channel) => {
        console.log(`Kitchen service setting up RabbitMQ channel...`);
        return new Promise((resolve) => {
          // Don't try to create the exchange, just bind to it
          channel.assertQueue('kitchen_queue', { durable: false, autoDelete: false })
            .then(q => {
              console.log(`Kitchen service: Queue ${q.queue} asserted`);
              channel.bindQueue(q.queue, 'order_exchange', '');
              console.log(`Kitchen service: Queue ${q.queue} bound to order_exchange`);
              resolve(channel);
            });
        });
      },
    },
  });

  // Enable CORS
  app.enableCors();

  console.log(`Kitchen service starting microservices...`);
  // Start microservices
  await app.startAllMicroservices();
  
  // Start HTTP server
  const port = configService.get('PORT', 3002);
  await app.listen(port);
  console.log(`Kitchen service is running on port ${port}`);
}

bootstrap(); 