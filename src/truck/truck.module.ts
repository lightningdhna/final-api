// filepath: d:\datn\code\final\src\truck\truck.module.ts
import { Module } from '@nestjs/common';
import { TruckService } from './truck.service';
import { TruckController } from './truck.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [TruckController],
  providers: [TruckService, PrismaService],
  exports: [TruckService],
})
export class TruckModule {}
