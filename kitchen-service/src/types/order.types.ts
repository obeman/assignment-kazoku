export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface OrderData {
  id: string;
  customerEmail: string;
  status: OrderStatus;
  totalPrice: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
} 