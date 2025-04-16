import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { FoodMenu } from './entities/food-menu.entity';
import { OrderFood } from './entities/order-food.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(FoodMenu)
    private readonly foodMenuRepository: Repository<FoodMenu>,
    @InjectRepository(OrderFood)
    private readonly orderFoodRepository: Repository<OrderFood>,
  ) {}

  async getMenu(): Promise<FoodMenu[]> {
    return this.foodMenuRepository.find();
  }

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const { customerEmail, customerName, items } = createOrderDto;

    // Fetch all food menu items at once
    const foodMenuIds = items.map(item => item.foodMenuId);
    const foodMenuItems = await this.foodMenuRepository.findByIds(foodMenuIds);

    if (foodMenuItems.length !== items.length) {
      throw new NotFoundException('One or more food menu items not found');
    }

    // Create the order
    const order = new Order();
    order.customerEmail = customerEmail;
    order.customerName = customerName;
    order.status = OrderStatus.PENDING;

    // Create order foods and calculate total price
    const orderFoods = items.map(item => {
      const foodMenu = foodMenuItems.find(fm => fm.id === item.foodMenuId);
      const orderFood = new OrderFood();
      orderFood.foodMenu = foodMenu;
      orderFood.quantity = item.quantity;
      return orderFood;
    });

    // Calculate total price
    order.totalPrice = orderFoods.reduce((total, orderFood) => {
      return total + (orderFood.foodMenu.price * orderFood.quantity);
    }, 0);

    // Save the order first
    const savedOrder = await this.orderRepository.save(order);

    // Set the order for each order food and save them
    orderFoods.forEach(orderFood => {
      orderFood.order = savedOrder;
    });
    await this.orderFoodRepository.save(orderFoods);

    return this.findOne(savedOrder.id);
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['orderFoods', 'orderFoods.foodMenu'],
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderFoods', 'orderFoods.foodMenu'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async getOrderStatus(id: string): Promise<OrderStatus> {
    const order = await this.findOne(id);
    return order.status;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;
    return this.orderRepository.save(order);
  }
} 