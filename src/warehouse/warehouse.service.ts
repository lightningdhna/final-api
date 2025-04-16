import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Adjust path if needed
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { Warehouse } from '@prisma/client';

@Injectable()
export class WarehouseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    supplierId: string,
    createWarehouseDto: CreateWarehouseDto,
  ): Promise<Warehouse> {
    // Verify supplier exists first
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
    });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
    }

    return await this.prisma.warehouse.create({
      data: {
        ...createWarehouseDto,
        supplierId: supplierId, // Link to the supplier
      },
    });
  }

  async findAll(): Promise<Warehouse[]> {
    return await this.prisma.warehouse.findMany();
  }

  async findAllBySupplier(supplierId: string): Promise<Warehouse[]> {
    // Optionally check if supplier exists first if strict validation is needed
    // const supplier = await this.prisma.supplier.findUnique({ where: { id: supplierId } });
    // if (!supplier) {
    //   throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
    // }
    return await this.prisma.warehouse.findMany({
      where: { supplierId },
    });
  }

  async findAllByProduct(productId: string): Promise<Warehouse[]> {
    // Find warehouses that have a WarehouseProduct entry matching the productId
    return await this.prisma.warehouse.findMany({
      where: {
        warehouseProducts: {
          some: {
            // 'some' checks if at least one related record matches
            productId: productId,
          },
        },
      },
      // Optionally include related data if needed
      // include: { warehouseProducts: true }
    });
  }

  async findOne(id: string): Promise<Warehouse | null> {
    return await this.prisma.warehouse.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    updateWarehouseDto: Partial<UpdateWarehouseDto>,
  ): Promise<Warehouse> {
    // Existence check is done in the controller
    return await this.prisma.warehouse.update({
      where: { id },
      data: updateWarehouseDto,
    });
  }

  async remove(id: string): Promise<Warehouse> {
    // Existence check is done in the controller
    // Consider cascading deletes or handling related entities (WarehouseProduct, Plan) if necessary
    // Depending on your Prisma schema's onDelete rules or application logic.
    // For now, it just deletes the warehouse.
    return await this.prisma.warehouse.delete({
      where: { id },
    });
  }
}
