import { Controller, Post, Body, Get, Param, Put, Logger, OnModuleInit } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { OrderStatus } from './entities/order.entity';
import { lastValueFrom } from 'rxjs';
import * as amqp from 'amqplib';
import { ConfigService } from '@nestjs/config';

@Controller('orders')
export class OrderController implements OnModuleInit {
  private readonly logger = new Logger(OrderController.name);
  private connection: any; // Using any type to avoid TypeScript errors
  private channel: any;    // Using any type to avoid TypeScript errors

  constructor(
    private readonly orderService: OrderService,
    @Inject('MICROSERVICE_CLIENT') private readonly client: ClientProxy,
    private readonly configService: ConfigService,
  ) {
    this.logger.log('Order controller initialized with RabbitMQ client');
    
    // Connect the client when the controller is initialized
    this.client.connect().then(() => {
      this.logger.log('Successfully connected to RabbitMQ client');
    }).catch(err => {
      this.logger.error(`Failed to connect to RabbitMQ client: ${err.message}`);
    });
  }

  async onModuleInit() {
    try {
      // Get RabbitMQ URL from environment variables
      const rabbitmqUrl = this.configService.get('RABBITMQ_URL') || 'amqp://localhost:5672';
      this.logger.log(`Connecting to RabbitMQ at ${rabbitmqUrl}`);
      
      // Direct connection to RabbitMQ
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      
      // Ensure exchange exists
      await this.channel.assertExchange('order_exchange', 'fanout', {
        durable: false,
        autoDelete: false
      });
      
      this.logger.log('Direct RabbitMQ connection established and exchange verified');
    } catch (error) {
      this.logger.error(`Failed to establish direct RabbitMQ connection: ${error.message}`);
      this.logger.error(error.stack);
    }
  }

  @Get('menu')
  getMenu() {
    return this.orderService.getMenu();
  }

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    try {
      const order = await this.orderService.createOrder(createOrderDto);
      
      const eventData = {
        orderId: order.id,
        status: order.status,
        customerEmail: createOrderDto.customerEmail,
        totalPrice: order.totalPrice,
      };
      
      this.logger.log('====================================');
      this.logger.log(`Publishing order_created event: ${JSON.stringify(eventData)}`);
      
      // Try both methods to publish the message
      try {
        // METHOD 1: Use NestJS ClientProxy (the way we've been trying)
        await lastValueFrom(this.client.emit('order_created', eventData))
          .then(() => this.logger.log('Method 1: NestJS ClientProxy emit successful'))
          .catch(err => this.logger.error(`Method 1 failed: ${err.message}`));
        
        // METHOD 2: Use direct AMQP publishing (like the test script)
        if (this.channel) {
          // Format message according to NestJS message protocol
          const nestFormattedMessage = {
            pattern: 'order_created',  // THIS IS CRITICAL - it must match @EventPattern in the consumers
            data: eventData
          };
          
          const messageBuffer = Buffer.from(JSON.stringify(nestFormattedMessage));
          const directResult = this.channel.publish('order_exchange', '', messageBuffer);
          this.logger.log(`Method 2: Direct AMQP publish result: ${directResult}`);
        } else {
          this.logger.error('Method 2: Cannot publish directly - channel not available');
        }
        
        this.logger.log(`Order created event published successfully for order: ${order.id}`);
        this.logger.log('====================================');
      } catch (emitError) {
        this.logger.error(`Error in emit operation: ${emitError.message}`);
        this.logger.error(emitError.stack);
      }
      
      return order;
    } catch (error) {
      this.logger.error(`Error publishing order_created event: ${error.message}`);
      this.logger.error(error.stack);
      throw error;
    }
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Get(':id/status')
  getStatus(@Param('id') id: string) {
    return this.orderService.getOrderStatus(id);
  }
} 