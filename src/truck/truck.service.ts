import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTruckDto } from './dto/create-truck.dto';
import { UpdateTruckDto } from './dto/update-truck.dto';
import { Truck, Plan } from '@prisma/client';

@Injectable()
export class TruckService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTruckDto: CreateTruckDto): Promise<Truck> {
    return this.prisma.truck.create({ data: createTruckDto });
  }

  async findAll(): Promise<Truck[]> {
    // Add filtering logic here if needed
    return this.prisma.truck.findMany();
  }

  async findOne(id: string): Promise<Truck | null> {
    return this.prisma.truck.findUnique({
      where: { id },
      include: { plans: true }, // Optionally include plans
    });
  }

  async update(id: string, updateTruckDto: UpdateTruckDto): Promise<Truck> {
    const truck = await this.findOne(id);
    if (!truck) {
      throw new NotFoundException(`Truck with ID ${id} not found`);
    }
    return this.prisma.truck.update({
      where: { id },
      data: updateTruckDto,
    });
  }

  async remove(id: string): Promise<Truck> {
    // Consider implications for related Plans
    const truck = await this.findOne(id);
    if (!truck) {
      throw new NotFoundException(`Truck with ID ${id} not found`);
    }
    return this.prisma.truck.delete({ where: { id } });
  }

  // --- Relationship Methods ---
  async findPlans(id: string): Promise<Plan[]> {
    const truckExists = await this.prisma.truck.findUnique({
      where: { id },
      select: { id: true }, // Check existence efficiently
    });
    if (!truckExists) {
      throw new NotFoundException(`Truck with ID ${id} not found`);
    }
    // Query plans separately
    return this.prisma.plan.findMany({ where: { truckId: id } });
  }
}
