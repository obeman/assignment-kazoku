import { Controller, Logger } from '@nestjs/common';
import { KitchenService } from './kitchen.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OrderStatus } from '../types/order.types';

interface OrderCreatedEvent {
  orderId: string;
  status: OrderStatus;
  customerEmail: string;
  totalPrice: number;
}

@Controller('kitchen')
export class KitchenController {
  private readonly logger = new Logger(KitchenController.name);

  constructor(private readonly kitchenService: KitchenService) {
    this.logger.log('Kitchen controller initialized and listening for order_created events');
  }

  @EventPattern('order_created')
  async handleOrderCreated(@Payload() data: OrderCreatedEvent) {
    this.logger.log('====================================');
    this.logger.log('Kitchen controller received order_created event:');
    this.logger.log(JSON.stringify(data));
    this.logger.log('====================================');
    await this.kitchenService.processOrder(data);
  }
} 