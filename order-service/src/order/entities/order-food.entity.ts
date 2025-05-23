import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Order } from './order.entity';
import { FoodMenu } from './food-menu.entity';

@Entity('order_foods')
export class OrderFood {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ name: 'food_menu_id' })
  foodMenuId: number;

  @ManyToOne(() => Order, order => order.orderFoods)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => FoodMenu, foodMenu => foodMenu.orderFoods)
  @JoinColumn({ name: 'food_menu_id' })
  foodMenu: FoodMenu;

  @Column()
  quantity: number;
  
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 