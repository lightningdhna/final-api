import { Module } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';
import { PrismaService } from '../../prisma/prisma.service'; // Adjust path if needed

@Module({
  controllers: [SupplierController],
  providers: [SupplierService, PrismaService],
  exports: [SupplierService], // Export if needed by other modules
})
export class SupplierModule {}
