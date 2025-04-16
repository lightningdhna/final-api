import { Module } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { WarehouseController } from './warehouse.controller';
import { PrismaService } from '../../prisma/prisma.service'; // Adjust path if needed

@Module({
  controllers: [WarehouseController],
  providers: [WarehouseService, PrismaService],
  exports: [WarehouseService], // Export if needed by other modules
})
export class WarehouseModule {}
