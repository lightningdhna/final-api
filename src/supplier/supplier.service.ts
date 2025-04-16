import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Adjust path if needed
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from '@prisma/client'; // Import the Supplier type

@Injectable()
export class SupplierService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    return await this.prisma.supplier.create({
      data: createSupplierDto,
    });
  }

  async findAll(): Promise<Supplier[]> {
    return await this.prisma.supplier.findMany();
  }

  async findOne(id: string): Promise<Supplier | null> {
    return await this.prisma.supplier.findUnique({
      where: { id },
    });
  }

  async findByWarehouseId(warehouseId: string): Promise<Supplier | null> {
    const warehouse = await this.prisma.warehouse.findUnique({
        where: { id: warehouseId },
        include: { supplier: true }, // Include the related supplier
    });

    if (!warehouse) {
        // Optionally throw NotFoundException here or let the controller handle null
        // throw new NotFoundException(`Warehouse with ID ${warehouseId} not found`);
        return null;
    }

    return warehouse.supplier;
  }

  async findByProductId(productId: string): Promise<Supplier | null> {
      const product = await this.prisma.product.findUnique({
          where: { id: productId },
          include: { supplier: true }, // Include the related supplier
      });

      if (!product) {
          // throw new NotFoundException(`Product with ID ${productId} not found`);
          return null;
      }

      return product.supplier;
  }

  async findByDropshipperId(dropshipperId: string): Promise<Supplier[]> {
      // Find registrations for the dropshipper
      const registrations = await this.prisma.registration.findMany({
          where: { dropshipperId: dropshipperId },
          include: {
              product: { // Include the product related to the registration
                  include: {
                      supplier: true // Include the supplier related to the product
                  }
              }
          }
      });

      if (!registrations || registrations.length === 0) {
          // Return empty array if no registrations found
          return [];
      }

      // Use a Map to automatically handle uniqueness based on supplier ID
      const suppliersMap = new Map<string, Supplier>();
      registrations.forEach(reg => {
          // Check if product and supplier exist before accessing
          if (reg.product && reg.product.supplier) {
              // Add supplier to map, duplicates will be overwritten
              suppliersMap.set(reg.product.supplier.id, reg.product.supplier);
          }
      });

      // Convert the values of the map (unique suppliers) to an array
      return Array.from(suppliersMap.values());
  }


  async update(id: string, updateSupplierDto: Partial<UpdateSupplierDto>): Promise<Supplier> {
    // Prisma update throws an error if the record is not found,
    // but we already check in the controller.
    return await this.prisma.supplier.update({
      where: { id },
      data: updateSupplierDto,
    });
  }

  async remove(id: string): Promise<Supplier> {
    // Prisma delete throws an error if the record is not found,
    // but we already check in the controller.
    return await this.prisma.supplier.delete({
      where: { id },
    });
  }
}