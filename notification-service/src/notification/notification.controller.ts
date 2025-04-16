import { Controller, Logger } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OrderStatus } from '../types/order.types';

interface OrderCreatedEvent {
  orderId: string;
  status: OrderStatus;
  customerEmail: string;
  totalPrice: number;
}

@Controller('notification')
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {
    this.logger.log('Notification controller initialized and listening for order_created events');
  }

  @EventPattern('order_created')
  async handleOrderCreated(@Payload() data: OrderCreatedEvent) {
    this.logger.log('====================================');
    this.logger.log('Notification controller received order_created event:');
    this.logger.log(JSON.stringify(data));
    this.logger.log('====================================');
    await this.notificationService.sendOrderConfirmation(data);
  }
} 