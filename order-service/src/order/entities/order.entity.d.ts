import { FoodMenu } from './food-menu.entity';
export declare enum OrderStatus {
    PENDING = "PENDING",
    PROCESSED = "PROCESSED"
}
export declare class Order {
    id: number;
    customerEmail: string;
    status: OrderStatus;
    items: FoodMenu[];
    totalPrice: number;
}
