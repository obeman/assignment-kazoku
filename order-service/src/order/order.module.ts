import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { FoodMenu } from './entities/food-menu.entity';
import { OrderFood } from './entities/order-food.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Channel } from 'amqplib';
import { ModuleRef } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, FoodMenu, OrderFood]),
    ClientsModule.registerAsync([
      {
        name: 'MICROSERVICE_CLIENT',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const rabbitmqUrl = configService.get('RABBITMQ_URL') || 'amqp://localhost:5672';
          console.log(`Order module configuring RabbitMQ with URL: ${rabbitmqUrl}`);
          
          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitmqUrl],
              queue: 'order_queue',
              queueOptions: {
                durable: false,
                autoDelete: false,
              },
              exchange: 'order_exchange',
              exchangeOptions: {
                type: 'fanout',
                durable: false,
                autoDelete: false,
              },
              noAssert: false,
              persistent: true,
              publisherConfirmation: true,
              socketOptions: {
                heartbeatIntervalInSeconds: 30,
                reconnectTimeInSeconds: 1,
              },
              assertExchange: false,
              setup: (channel: Channel) => {
                console.log('Order service: Setting up RabbitMQ channel...');
                
                return channel.checkExchange('order_exchange')
                  .then(() => {
                    console.log('Order service: Exchange "order_exchange" exists');
                    return channel;
                  })
                  .catch((err) => {
                    console.error('Order service: Exchange check failed, attempting to create:', err.message);
                    return channel.assertExchange('order_exchange', 'fanout', {
                      durable: false,
                      autoDelete: false,
                    }).then(() => {
                      console.log('Order service: Exchange "order_exchange" created');
                      return channel;
                    });
                  });
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    console.log('OrderModule initialized, ensuring RabbitMQ connection is ready');
  }
} 