import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTruckDto } from './dto/create-truck.dto';
import { UpdateTruckDto } from './dto/update-truck.dto';
import { Truck, Plan } from '@prisma/client';
import { PeriodMetricsDto } from './dto/summary-info.dto';

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

  // --- Summary Information Method ---
  async getSummaryInfo(truckId: string): Promise<Record<string, any> | null> {
    // Kiểm tra xe tải tồn tại
    const truck = await this.findOne(truckId);
    if (!truck) {
      return null; // Trả về null để controller xử lý
    }

    // Lấy ngày hiện tại và các ngày đầu/cuối tháng/năm
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    const lastDayOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

    // TODO: Thực hiện logic lấy dữ liệu thực tế từ bảng plan khi module plan hoàn thiện
    // Hiện tại trả về dữ liệu mẫu cho mục đích demo

    // Tạo metrics cho các khoảng thời gian
    const allTimeMetrics: PeriodMetricsDto = {
      orderCount: 250, // Dữ liệu mẫu
      operationTime: 1200.5, // Dữ liệu mẫu (giờ)
      totalDistance: 15000.3, // Dữ liệu mẫu (km)
    };

    const currentMonthMetrics: PeriodMetricsDto = {
      orderCount: 45, // Dữ liệu mẫu
      operationTime: 180.75, // Dữ liệu mẫu (giờ)
      totalDistance: 2300.5, // Dữ liệu mẫu (km)
    };

    const currentYearMetrics: PeriodMetricsDto = {
      orderCount: 180, // Dữ liệu mẫu
      operationTime: 850.25, // Dữ liệu mẫu (giờ)
      totalDistance: 10500.8, // Dữ liệu mẫu (km)
    };

    // Tính hiệu suất sử dụng (giả định)
    // Tỷ lệ giữa thời gian hoạt động so với tổng thời gian từ khi tạo xe
    const creationDate = truck.timeActive; // Sử dụng thời gian bắt đầu hoạt động
    const totalDaysAvailable = Math.max(
      1,
      (now.getTime() - creationDate.getTime()) / (24 * 60 * 60 * 1000),
    );
    const utilizationRate = (allTimeMetrics.operationTime / (totalDaysAvailable * 24)) * 100;

    // Trả về kết quả tổng hợp
    return {
      truckId: truck.id,
      truckName: truck.name,
      truckType: truck.type,
      allTime: allTimeMetrics,
      currentMonth: currentMonthMetrics,
      currentYear: currentYearMetrics,
      month: now.getMonth() + 1, // +1 vì getMonth() trả về 0-11
      year: now.getFullYear(),
      createdAt: creationDate,
      utilizationRate: Math.min(100, utilizationRate), // Đảm bảo không vượt quá 100%
    };
  }
}
