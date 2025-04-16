// filepath: d:\datn\code\final\src\statistic\statistic.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
// Import services if complex logic requires them
// import { OrderService } from '../order/order.service';

@Injectable()
export class StatisticService {
  constructor(
    private readonly prisma: PrismaService,
    // Inject other services if needed
    // private readonly orderService: OrderService,
  ) {}

  async getCounts() {
    const [
      orderCount,
      productCount,
      supplierCount,
      dropshipperCount,
      warehouseCount,
      truckCount,
    ] = await this.prisma.$transaction([
      this.prisma.order.count(),
      this.prisma.product.count(),
      this.prisma.supplier.count(),
      this.prisma.dropshipper.count(),
      this.prisma.warehouse.count(),
      this.prisma.truck.count(),
    ]);
    return {
      orders: orderCount,
      products: productCount,
      suppliers: supplierCount,
      dropshippers: dropshipperCount,
      warehouses: warehouseCount,
      trucks: truckCount,
    };
  }

  async getOrdersByStatus() {
    const result = await this.prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
      orderBy: {
        status: 'asc',
      },
    });
    // Format result for better readability if needed
    return result.map((item) => ({
      status: item.status,
      count: item._count.status,
    }));
  }

  async getProductsBySupplier() {
    const result = await this.prisma.product.groupBy({
      by: ['supplierId'],
      _count: {
        id: true, // Count products by their id
      },
      orderBy: {
        _count: {
          id: 'desc', // Order by product count descending
        },
      },
    });

    // Optionally fetch supplier names for better readability
    const supplierIds = result.map((item) => item.supplierId);
    const suppliers = await this.prisma.supplier.findMany({
      where: { id: { in: supplierIds } },
      select: { id: true, name: true },
    });
    const supplierMap = new Map(suppliers.map((s) => [s.id, s.name]));

    return result.map((item) => ({
      supplierId: item.supplierId,
      supplierName: supplierMap.get(item.supplierId) || 'Unknown', // Handle case where supplier might be deleted
      productCount: item._count.id,
    }));
  }

  async getRegistrationsByStatus() {
    const result = await this.prisma.registration.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
      orderBy: {
        status: 'asc',
      },
    });
    return result.map((item) => ({
      status: item.status,
      count: item._count.status,
    }));
  }

  // Add more complex statistic methods here...
  // async getWarehouseCapacityStats() { ... }
}
