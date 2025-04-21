import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  SupplierStatisticsDto,
  ProductStatisticsDto,
} from './dto/supplier-statistic.dto';

@Injectable()
export class StatisticService {
  constructor(private readonly prisma: PrismaService) {}

  async getSupplierProductStatistics(
    supplierId: string,
  ): Promise<SupplierStatisticsDto | null> {
    // Kiểm tra nhà cung cấp tồn tại
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      return null; // Nhà cung cấp không tồn tại
    }

    // Lấy tất cả sản phẩm của nhà cung cấp
    const products = await this.prisma.product.findMany({
      where: { supplierId },
      select: {
        id: true,
        name: true,
      },
    });

    // Khởi tạo kết quả thống kê
    const result: SupplierStatisticsDto = {
      supplierId: supplier.id,
      supplierName: supplier.name,
      products: [],
    };

    // Với mỗi sản phẩm, thu thập thống kê
    for (const product of products) {
      // 1. Tổng tồn kho trên tất cả các kho
      const warehouseProducts = await this.prisma.warehouseProduct.findMany({
        where: { productId: product.id },
        select: {
          quantity: true,
          warehouseId: true,
        },
      });

      const totalStock = warehouseProducts.reduce(
        (sum, wp) => sum + wp.quantity,
        0,
      );
      const warehouseCount = warehouseProducts.filter(
        (wp) => wp.quantity > 0,
      ).length;

      // 2. Đơn hàng hoàn thành
      const completedOrders = await this.prisma.order.findMany({
        where: {
          productId: product.id,
          status: 3, // Giả định 3 là trạng thái hoàn thành
        },
      });
      const completedOrderCount = completedOrders.length;
      const soldQuantity = completedOrders.reduce(
        (sum, order) => sum + order.quantity,
        0,
      );

      // 3. Đơn hàng đang chờ
      const pendingOrders = await this.prisma.order.findMany({
        where: {
          productId: product.id,
          status: { in: [0, 1, 2] }, // Giả định đây là các trạng thái đang chờ xử lý
        },
      });
      const pendingOrderCount = pendingOrders.length;

      // Thêm vào kết quả
      result.products.push({
        productId: product.id,
        productName: product.name,
        totalStock,
        warehouseCount,
        completedOrderCount,
        soldQuantity,
        pendingOrderCount,
      });
    }

    return result;
  }
}
