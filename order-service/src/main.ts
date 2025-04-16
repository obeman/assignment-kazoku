import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  const rabbitmqUrl = process.env.RABBITMQ_URL || configService.get('RABBITMQ_URL');
  console.log(`Order service is starting...`);
  console.log(`RABBITMQ_URL: ${rabbitmqUrl}`);
  console.log(`RABBITMQ_HOST: ${configService.get('RABBITMQ_HOST')}`);
  console.log(`RABBITMQ_PORT: ${configService.get('RABBITMQ_PORT')}`);
  
  // Enable CORS
  app.enableCors();
  
  // Start HTTP server
  const port = configService.get('PORT', 3001);
  await app.listen(port);
  console.log(`Order service is running on port ${port}`);
}
bootstrap(); 