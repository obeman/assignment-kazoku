import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderStatus } from '../types/order.types';

interface OrderCreatedEvent {
  orderId: string;
  status: OrderStatus;
  customerEmail: string;
  totalPrice: number;
}

@Injectable()
export class KitchenService {
  private readonly logger = new Logger(KitchenService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async processOrder(data: OrderCreatedEvent) {
    this.logger.log(`Received order to process: ${JSON.stringify(data)}`);
    
    const order = await this.orderRepository.findOne({
      where: { id: data.orderId },
    });

    if (order) {
      this.logger.log(`Found order ${order.id}, updating status to PROCESSING`);
      order.status = OrderStatus.PROCESSING;
      await this.orderRepository.save(order);
      this.logger.log(`Order ${order.id} status updated to PROCESSING`);
    } else {
      this.logger.error(`Order with ID ${data.orderId} not found`);
    }
  }
} 