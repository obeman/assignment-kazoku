import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
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

  @Column()
  quantity: number;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => FoodMenu)
  @JoinColumn({ name: 'food_menu_id' })
  foodMenu: FoodMenu;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 