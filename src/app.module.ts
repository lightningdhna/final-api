import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ProductModule } from './product/product.module';
import { SupplierModule } from './supplier/supplier.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { DropshipperModule } from './dropshipper/dropshipper.module';
import { RegistrationModule } from './registration/registration.module';
import { OrderModule } from './order/order.module';
import { TruckModule } from './truck/truck.module';
import { PlanModule } from './plan/plan.module';
import { StatisticModule } from './statistic/statistic.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ProductModule,
    SupplierModule,
    WarehouseModule,
    DropshipperModule,
    RegistrationModule,
    OrderModule,
    TruckModule,
    PlanModule,
    StatisticModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
