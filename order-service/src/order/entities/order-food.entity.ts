import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { FoodMenu } from './food-menu.entity';

@Entity('order_foods')
export class OrderFood {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, order => order.orderFoods)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => FoodMenu, foodMenu => foodMenu.orderFoods)
  @JoinColumn({ name: 'food_menu_id' })
  foodMenu: FoodMenu;

  @Column()
  quantity: number;
} 