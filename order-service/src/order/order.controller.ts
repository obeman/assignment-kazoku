import { Controller, Post, Body, Get, Param, Put, Logger } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { OrderStatus } from './entities/order.entity';
import { lastValueFrom } from 'rxjs';

@Controller('orders')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(
    private readonly orderService: OrderService,
    @Inject('MICROSERVICE_CLIENT') private readonly client: ClientProxy,
  ) {
    this.logger.log('Order controller initialized with RabbitMQ client');
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
      
      // Use lastValueFrom for proper promise handling with emit
      await lastValueFrom(this.client.emit('order_created', eventData));
      
      this.logger.log(`Order created event published successfully for order: ${order.id}`);
      this.logger.log('====================================');
      
      return order;
    } catch (error) {
      this.logger.error(`Error publishing order_created event: ${error.message}`);
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