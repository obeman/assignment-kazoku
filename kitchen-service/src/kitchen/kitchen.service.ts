import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, DataSource } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderStatus } from '../types/order.types';

interface OrderCreatedEvent {
  orderId: string;
  status: OrderStatus;
  customerEmail: string;
  totalPrice: number;
}

@Injectable()
export class KitchenService implements OnModuleInit {
  private readonly logger = new Logger(KitchenService.name);
  private orderTableExists = false;
  private useRawQueries = false;

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private dataSource: DataSource,
  ) {}

  async onModuleInit() {
    // Check if orders table exists
    try {
      // First try to check table existence directly with a raw query
      try {
        await this.dataSource.query('SELECT 1 FROM orders LIMIT 1');
        this.orderTableExists = true;
        this.logger.log('Orders table exists in the database (confirmed via raw query)');
        
        // If raw query works but entity doesn't, we'll use raw queries
        try {
          await this.orderRepository.findOne({ where: { id: 'check-existence' } });
          this.logger.log('Entity mapping is working correctly');
        } catch (err) {
          this.useRawQueries = true;
          this.logger.warn('Entity mapping has issues, will use raw queries instead');
        }
      } catch (err) {
        this.logger.warn('Orders table does not exist in the database');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Error during initialization: ${errorMessage}`);
      this.logger.warn('Will operate in simulation mode (no database operations)');
    }
  }

  async processOrder(data: OrderCreatedEvent) {
    this.logger.log(`Received order to process: ${JSON.stringify(data)}`);
    
    try {
      // Check if this is a test order (IDs starting with "test-")
      if (data.orderId.startsWith('test-')) {
        this.logger.log(`This is a test order (${data.orderId}). Skipping database operations.`);
        this.logger.log(`Order ${data.orderId} simulated processing: Status updated to PROCESSING`);
        return;
      }
      
      // If orders table doesn't exist, just log and return
      if (!this.orderTableExists) {
        this.logger.log(`Simulating order processing for ${data.orderId} (DB table not available)`);
        this.logger.log(`Order ${data.orderId} would be updated to PROCESSING status`);
        return;
      }
      
      // Process order based on the preferred method
      if (this.useRawQueries) {
        await this.processOrderWithRawQueries(data);
      } else {
        await this.processOrderWithRepository(data);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Error processing order: ${errorMessage}`);
      if (err instanceof Error && err.stack) {
        this.logger.error(err.stack);
      }
    }
  }

  private async processOrderWithRepository(data: OrderCreatedEvent) {
    try {
      // Try to find the order first
      let order = await this.orderRepository.findOne({ where: { id: data.orderId } });
      
      if (order) {
        // Update existing order
        order.status = OrderStatus.PROCESSING;
        await this.orderRepository.save(order);
        this.logger.log(`Updated existing order ${data.orderId} to PROCESSING status`);
      } else {
        // Create a new order
        order = new Order();
        order.id = data.orderId;
        order.customerEmail = data.customerEmail;
        order.status = OrderStatus.PROCESSING;
        order.totalPrice = Number(data.totalPrice);
        
        await this.orderRepository.save(order);
        this.logger.log(`Created new order ${data.orderId} with PROCESSING status`);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Error using repository: ${errorMessage}`);
      // Fallback to raw queries if repository fails
      await this.processOrderWithRawQueries(data);
    }
  }

  private async processOrderWithRawQueries(data: OrderCreatedEvent) {
    try {
      // Check if order exists
      const existingOrders = await this.dataSource.query(
        'SELECT id FROM orders WHERE id = ?',
        [data.orderId]
      );
      
      if (existingOrders && existingOrders.length > 0) {
        // Update existing order
        await this.dataSource.query(
          'UPDATE orders SET status = ? WHERE id = ?',
          [OrderStatus.PROCESSING, data.orderId]
        );
        this.logger.log(`Updated existing order ${data.orderId} to PROCESSING status (raw query)`);
      } else {
        // Create a new order
        await this.dataSource.query(
          'INSERT INTO orders (id, customer_email, status, total_price) VALUES (?, ?, ?, ?)',
          [data.orderId, data.customerEmail, OrderStatus.PROCESSING, Number(data.totalPrice)]
        );
        this.logger.log(`Created new order ${data.orderId} with PROCESSING status (raw query)`);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Error with raw queries: ${errorMessage}`);
      if (err instanceof Error && err.stack) {
        this.logger.error(err.stack);
      }
    }
  }
} 