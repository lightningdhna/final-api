import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Plan, Prisma } from '@prisma/client';

@Injectable()
export class PlanService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPlanDto: CreatePlanDto): Promise<Plan> {
    // Validate Truck
    const truck = await this.prisma.truck.findUnique({
      where: { id: createPlanDto.truckId },
    });
    if (!truck)
      throw new NotFoundException(
        `Truck with ID ${createPlanDto.truckId} not found`,
      );

    // Validate Order
    const order = await this.prisma.order.findUnique({
      where: { id: createPlanDto.orderId },
    });
    if (!order)
      throw new NotFoundException(
        `Order with ID ${createPlanDto.orderId} not found`,
      );

    // Validate Warehouse if type is 'load' (type 1)
    if (createPlanDto.type === 1) {
      if (!createPlanDto.warehouseId) {
        throw new BadRequestException(
          'warehouseId is required for plan type 1 (load)',
        );
      }
      const warehouse = await this.prisma.warehouse.findUnique({
        where: { id: createPlanDto.warehouseId },
      });
      if (!warehouse)
        throw new NotFoundException(
          `Warehouse with ID ${createPlanDto.warehouseId} not found`,
        );
    } else {
      // Ensure warehouseId is null if type is not 1
      createPlanDto.warehouseId = null;
    }

    return this.prisma.plan.create({ data: createPlanDto });
  }

  async findAll(params: {
    truckId?: string;
    orderId?: string;
    warehouseId?: string;
    status?: number;
    type?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Plan[]> {
    const { truckId, orderId, warehouseId, status, type, startDate, endDate } =
      params;
    const where: Prisma.PlanWhereInput = {
      truckId: truckId,
      orderId: orderId,
      warehouseId: warehouseId,
      status: status,
      type: type,
    };

    // Correctly build the date filter object
    if (startDate || endDate) {
      where.planDate = {}; // Initialize planDate filter object
      if (startDate) {
        where.planDate.gte = startDate; // Greater than or equal to start date
      }
      if (endDate) {
        // Add 1 day to endDate to include the whole day if only date is provided
        const adjustedEndDate = new Date(endDate);
        adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
        where.planDate.lt = adjustedEndDate; // Less than the start of the next day
        // Or use lte: endDate if you want to include the exact timestamp
        // where.planDate.lte = endDate;
      }
    }

    return this.prisma.plan.findMany({
      where,
      include: {
        truck: true,
        order: true,
        warehouse: true,
      },
      orderBy: {
        planDate: 'asc',
      },
    });
  }

  async findOne(id: string): Promise<Plan | null> {
    return this.prisma.plan.findUnique({
      where: { id },
      include: { truck: true, order: true, warehouse: true },
    });
  }

  async update(id: string, updatePlanDto: UpdatePlanDto): Promise<Plan> {
    const plan = await this.findOne(id);
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }

    // Add validation if needed (e.g., prevent changing truck/order/type?)
    // Validate warehouseId if type is changed to 1
    if (
      updatePlanDto.type === 1 &&
      !updatePlanDto.warehouseId &&
      !plan.warehouseId // Check if the existing plan also doesn't have a warehouseId
    ) {
      throw new BadRequestException(
        'warehouseId is required if changing plan type to 1 (load)',
      );
    }
    if (updatePlanDto.type === 1 && updatePlanDto.warehouseId) {
      const warehouse = await this.prisma.warehouse.findUnique({
        where: { id: updatePlanDto.warehouseId },
      });
      if (!warehouse)
        throw new NotFoundException(
          `Warehouse with ID ${updatePlanDto.warehouseId} not found`,
        );
    }
    // If type changes away from 1, warehouseId should likely be nulled
    // Check if 'type' exists in the DTO before potentially nulling warehouseId
    if (updatePlanDto.hasOwnProperty('type') && updatePlanDto.type !== 1) {
      updatePlanDto.warehouseId = null;
    }

    return this.prisma.plan.update({
      where: { id },
      data: updatePlanDto,
    });
  }

  async remove(id: string): Promise<Plan> {
    const plan = await this.findOne(id);
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    return this.prisma.plan.delete({ where: { id } });
  }
}
