// filepath: d:\datn\code\final\src\order\order.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, Plan, Prisma } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Validate product
    const product = await this.prisma.product.findUnique({
      where: { id: createOrderDto.productId },
    });
    if (!product)
      throw new NotFoundException(
        `Product with ID ${createOrderDto.productId} not found`,
      );

    // Validate dropshipper if provided
    if (createOrderDto.dropshipperId) {
      const dropshipper = await this.prisma.dropshipper.findUnique({
        where: { id: createOrderDto.dropshipperId },
      });
      if (!dropshipper)
        throw new NotFoundException(
          `Dropshipper with ID ${createOrderDto.dropshipperId} not found`,
        );
    }

    return this.prisma.order.create({
      data: {
        ...createOrderDto,
        timeCreated: new Date(), // Set creation time
      },
    });
  }

  async findAll(params: {
    productId?: string;
    dropshipperId?: string;
    status?: number;
  }): Promise<Order[]> {
    const { productId, dropshipperId, status } = params;
    return this.prisma.order.findMany({
      where: {
        productId: productId,
        dropshipperId: dropshipperId, // Handles null if dropshipperId is undefined
        status: status,
      },
      include: {
        // Optionally include related data
        product: true,
        dropshipper: true,
      },
    });
  }

  async findOne(id: string): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { id },
      include: { product: true, dropshipper: true, plans: true }, // Include relations
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    // Prevent changing productId or dropshipperId easily after creation? Add validation if needed.
    return this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
    });
  }

  async remove(id: string): Promise<Order> {
    // Consider implications for related Plans. Prisma might handle this via schema relations.
    const order = await this.findOne(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return this.prisma.order.delete({ where: { id } });
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
