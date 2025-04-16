import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrderModule } from './order/order.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('MYSQL_HOST', 'host.docker.internal'),
        port: configService.get('MYSQL_PORT', 3309),
        username: configService.get('MYSQL_USER', 'root'),
        password: configService.get('MYSQL_PASSWORD', 'obeman123'),
        database: configService.get('MYSQL_DATABASE', 'restoran'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    OrderModule,
  ],
})
export class AppModule {} 