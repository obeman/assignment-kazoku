import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  customerEmail!: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus = OrderStatus.PENDING;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice!: number;
} 