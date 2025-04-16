// filepath: d:\datn\code\final\src\dropshipper\dropshipper.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDropshipperDto } from './dto/create-dropshipper.dto';
import { UpdateDropshipperDto } from './dto/update-dropshipper.dto';
import { Dropshipper, Registration, Order } from '@prisma/client';

@Injectable()
export class DropshipperService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createDropshipperDto: CreateDropshipperDto,
  ): Promise<Dropshipper> {
    return this.prisma.dropshipper.create({ data: createDropshipperDto });
  }

  async findAll(): Promise<Dropshipper[]> {
    return this.prisma.dropshipper.findMany();
  }

  async findOne(id: string): Promise<Dropshipper | null> {
    return this.prisma.dropshipper.findUnique({ where: { id } });
  }

  async update(
    id: string,
    updateDropshipperDto: UpdateDropshipperDto,
  ): Promise<Dropshipper> {
    const dropshipper = await this.findOne(id);
    if (!dropshipper) {
      throw new NotFoundException(`Dropshipper with ID ${id} not found`);
    }
    return this.prisma.dropshipper.update({
      where: { id },
      data: updateDropshipperDto,
    });
  }

  async remove(id: string): Promise<Dropshipper> {
    // Consider implications for related Registrations and Orders
    return this.prisma.dropshipper.delete({ where: { id } });
  }

  // --- Relationship Methods ---

  async findRegistrations(id: string): Promise<Registration[]> {
    const dropshipper = await this.findOne(id);
    if (!dropshipper) {
      throw new NotFoundException(`Dropshipper with ID ${id} not found`);
    }
    return this.prisma.registration.findMany({
      where: { dropshipperId: id },
      // include: { product: true } // Optionally include related product
    });
  }

  async findOrders(id: string): Promise<Order[]> {
    const dropshipper = await this.findOne(id);
    if (!dropshipper) {
      throw new NotFoundException(`Dropshipper with ID ${id} not found`);
    }
    return this.prisma.order.findMany({
      where: { dropshipperId: id },
      // include: { product: true } // Optionally include related product
    });
  }
}
