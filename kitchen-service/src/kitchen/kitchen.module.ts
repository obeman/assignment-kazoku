import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KitchenService } from './kitchen.service';
import { KitchenController } from './kitchen.controller';
import { Order } from '../entities/order.entity';
import { FoodMenu } from '../entities/food-menu.entity';
import { OrderFood } from '../entities/order-food.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, FoodMenu, OrderFood])],
  controllers: [KitchenController],
  providers: [KitchenService],
})
export class KitchenModule {} 