import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KitchenModule } from './kitchen/kitchen.module';
import { Order } from './entities/order.entity';
import { FoodMenu } from './entities/food-menu.entity';
import { OrderFood } from './entities/order-food.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('MYSQL_HOST', 'localhost'),
        port: configService.get('MYSQL_PORT', 3309),
        username: configService.get('MYSQL_USER', 'root'),
        password: configService.get('MYSQL_PASSWORD', 'obeman123'),
        database: configService.get('MYSQL_DATABASE', 'restoran'),
        entities: [Order, FoodMenu, OrderFood],
        synchronize: false,
        logging: true,
      }),
      inject: [ConfigService],
    }),
    KitchenModule,
  ],
})
export class AppModule {} 