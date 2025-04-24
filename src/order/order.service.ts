// filepath: d:\datn\code\final\src\order\order.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Order, Plan, Prisma } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    return await this.prisma.order.create({
      data: {
        ...createOrderDto,
        timeCreated: new Date(createOrderDto.timeCreated),
      },
    });
  }

  async findAll(): Promise<Order[]> {
    return await this.prisma.order.findMany({
      include: {
        product: true,
        dropshipper: true,
      },
    });
  }

  async findOne(id: string): Promise<Order | null> {
    return await this.prisma.order.findUnique({
      where: { id },
      include: {
        product: true,
        dropshipper: true,
        plans: true,
      },
    });
  }

  async update(id: string, updateOrderDto: Partial<UpdateOrderDto>): Promise<Order> {
    const data: any = { ...updateOrderDto };
    if (updateOrderDto.timeCreated) {
      data.timeCreated = new Date(updateOrderDto.timeCreated);
    }
    
    return await this.prisma.order.update({
      where: { id },
      data,
    });
  }

  async updateStatus(id: string, updateStatusDto: UpdateStatusDto): Promise<Order> {
    return await this.prisma.order.update({
      where: { id },
      data: {
        status: updateStatusDto.status,
        ...(updateStatusDto.note && { note: updateStatusDto.note }),
      },
    });
  }

  async remove(id: string): Promise<Order> {
    return await this.prisma.order.delete({
      where: { id },
    });
  }

  async findByStatus(status: number): Promise<Order[]> {
    return await this.prisma.order.findMany({
      where: { status },
      include: {
        product: true,
        dropshipper: true,
      },
    });
  }

  async findBySupplier(supplierId: string): Promise<Order[]> {
    return await this.prisma.order.findMany({
      where: {
        product: {
          supplierId,
        },
      },
      include: {
        product: true,
        dropshipper: true,
      },
    });
  }

  async findBySupplierAndStatus(supplierId: string, status: number): Promise<Order[]> {
    return await this.prisma.order.findMany({
      where: {
        product: {
          supplierId,
        },
        status,
      },
      include: {
        product: true,
        dropshipper: true,
      },
    });
  }

  async findByDropshipper(dropshipperId: string): Promise<Order[]> {
    return await this.prisma.order.findMany({
      where: { dropshipperId },
      include: {
        product: true,
        dropshipper: true,
      },
    });
  }

  async findByDropshipperAndStatus(dropshipperId: string, status: number): Promise<Order[]> {
    return await this.prisma.order.findMany({
      where: { 
        dropshipperId, 
        status 
      },
      include: {
        product: true,
        dropshipper: true,
      },
    });
  }

  async findByProduct(productId: string): Promise<Order[]> {
    return await this.prisma.order.findMany({
      where: { productId },
      include: {
        product: true,
        dropshipper: true,
      },
    });
  }

  async productExists(productId: string): Promise<boolean> {
    const count = await this.prisma.product.count({
      where: { id: productId },
    });
    return count > 0;
  }

  async dropshipperExists(dropshipperId: string): Promise<boolean> {
    const count = await this.prisma.dropshipper.count({
      where: { id: dropshipperId },
    });
    return count > 0;
  }

  async supplierExists(supplierId: string): Promise<boolean> {
    const count = await this.prisma.supplier.count({
      where: { id: supplierId },
    });
    return count > 0;
  }

  // --- Relationship Methods ---
  async findPlans(id: string): Promise<Plan[]> {
    const orderExists = await this.prisma.order.findUnique({
      where: { id },
      select: { id: true }, // Only select id to check existence efficiently
    });
    if (!orderExists) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    // Query plans separately
    return this.prisma.plan.findMany({ where: { orderId: id } });
  }
}
