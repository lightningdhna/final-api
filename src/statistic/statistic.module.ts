// filepath: d:\datn\code\final\src\statistic\statistic.module.ts
import { Module } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { StatisticController } from './statistic.controller';
import { PrismaService } from '../../prisma/prisma.service';
// Import other modules/services if needed for stats (e.g., OrderModule)
// import { OrderModule } from '../order/order.module';

@Module({
  // imports: [OrderModule], // Import modules whose services you need
  controllers: [StatisticController],
  // Provide PrismaService and potentially other services
  providers: [StatisticService, PrismaService /* , OrderService */],
})
export class StatisticModule {}
