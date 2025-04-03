import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Product API')
    .setDescription('API quản lý sản phẩm')
    .setVersion('1.0')
    .addTag('product') // Gắn tag cho các endpoint liên quan đến product
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Swagger UI sẽ được truy cập tại /api

  // Bật CORS
  app.enableCors({
    origin: ['http://localhost:5173', 'https://datn-2025.vercel.app'], // Địa chỉ frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Các phương thức HTTP được phép
    credentials: true, // Nếu cần gửi cookie hoặc thông tin xác thực
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
