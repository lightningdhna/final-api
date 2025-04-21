import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { Registration } from '@prisma/client';

@Injectable()
export class RegistrationService {
  constructor(private readonly prisma: PrismaService) {}

  // Kiểm tra sự tồn tại của sản phẩm và dropshipper
  async validateEntities(
    productId: string,
    dropshipperId: string,
  ): Promise<{
    productExists: boolean;
    dropshipperExists: boolean;
    supplierId?: string;
  }> {
    const [product, dropshipper] = await Promise.all([
      productId
        ? this.prisma.product.findUnique({
            where: { id: productId },
            select: { id: true, supplierId: true },
          })
        : null,
      this.prisma.dropshipper.findUnique({
        where: { id: dropshipperId },
        select: { id: true },
      }),
    ]);

    return {
      productExists: !!product,
      dropshipperExists: !!dropshipper,
      supplierId: product?.supplierId,
    };
  }

  // Tạo mới đăng ký
  async create(
    createRegistrationDto: CreateRegistrationDto,
  ): Promise<Registration | null> {
    const { productId, dropshipperId } = createRegistrationDto;

    // Kiểm tra xem đăng ký đã tồn tại chưa
    const existingRegistration = await this.prisma.registration.findUnique({
      where: {
        dropshipperId_productId: {
          dropshipperId,
          productId,
        },
      },
    });

    if (existingRegistration) {
      return null; // Đăng ký đã tồn tại
    }

    // Tạo đăng ký mới với status = 0 (đợi duyệt)
    return await this.prisma.registration.create({
      data: {
        ...createRegistrationDto,
        status: 0, // 0: pending
      },
    });
  }

  // Kiểm tra sản phẩm có thuộc nhà cung cấp không
  async isProductBelongsToSupplier(
    productId: string,
    supplierId: string,
  ): Promise<boolean> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { supplierId: true },
    });

    return product?.supplierId === supplierId;
  }

  // Lấy thông tin đăng ký theo productId và dropshipperId
  async findOne(
    productId: string,
    dropshipperId: string,
  ): Promise<Registration | null> {
    return await this.prisma.registration.findUnique({
      where: {
        dropshipperId_productId: {
          dropshipperId,
          productId,
        },
      },
    });
  }

  // Cập nhật trạng thái đăng ký (chấp nhận hoặc từ chối)
  async updateStatus(
    productId: string,
    dropshipperId: string,
    status: number,
  ): Promise<Registration | null> {
    // Kiểm tra đăng ký tồn tại
    const registration = await this.findOne(productId, dropshipperId);
    if (!registration) {
      return null; // Không tìm thấy đăng ký
    }

    // Cập nhật trạng thái
    return await this.prisma.registration.update({
      where: {
        dropshipperId_productId: {
          dropshipperId,
          productId,
        },
      },
      data: { status },
    });
  }

  // Xóa đăng ký
  async remove(
    productId: string,
    dropshipperId: string,
  ): Promise<Registration | null> {
    // Kiểm tra đăng ký tồn tại
    const registration = await this.findOne(productId, dropshipperId);
    if (!registration) {
      return null; // Không tìm thấy đăng ký
    }

    // Xóa đăng ký
    return await this.prisma.registration.delete({
      where: {
        dropshipperId_productId: {
          dropshipperId,
          productId,
        },
      },
    });
  }

  // Lấy tất cả đăng ký đang đợi duyệt của một nhà cung cấp
  async findPendingBySupplier(supplierId: string): Promise<Registration[]> {
    return this.findBySupplier(supplierId, 0);
  }

  // Lấy tất cả các đăng ký theo nhà cung cấp và trạng thái (tùy chọn)
  async findBySupplier(
    supplierId: string,
    status?: number,
  ): Promise<Registration[]> {
    // Lấy tất cả sản phẩm của nhà cung cấp
    const products = await this.prisma.product.findMany({
      where: { supplierId },
      select: { id: true },
    });

    const productIds = products.map((p) => p.id);

    if (productIds.length === 0) {
      return []; // Trả về mảng rỗng nếu nhà cung cấp không có sản phẩm nào
    }

    // Xây dựng điều kiện truy vấn
    const whereClause: any = {
      productId: { in: productIds },
    };

    // Thêm điều kiện status nếu được cung cấp
    if (status !== undefined) {
      whereClause.status = status;
    }

    // Lấy các đăng ký theo điều kiện
    return await this.prisma.registration.findMany({
      where: whereClause,
      include: {
        dropshipper: true,
        product: true,
      },
    });
  }

  // Lấy tất cả các đăng ký theo dropshipper và trạng thái (tùy chọn)
  async findByDropshipper(
    dropshipperId: string,
    status?: number,
  ): Promise<Registration[]> {
    // Xây dựng điều kiện truy vấn
    const whereClause: any = {
      dropshipperId,
    };

    // Thêm điều kiện status nếu được cung cấp
    if (status !== undefined) {
      whereClause.status = status;
    }

    return await this.prisma.registration.findMany({
      where: whereClause,
      include: {
        product: {
          include: {
            supplier: true,
          },
        },
      },
    });
  }

  // Kiểm tra sự tồn tại của nhà cung cấp
  async supplierExists(supplierId: string): Promise<boolean> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
      select: { id: true },
    });

    return !!supplier;
  }

  // Xóa tất cả đăng ký của một dropshipper với một nhà cung cấp
  async removeAllByDropshipperAndSupplier(
    dropshipperId: string,
    supplierId: string,
  ): Promise<{ count: number }> {
    // Lấy tất cả sản phẩm của nhà cung cấp
    const products = await this.prisma.product.findMany({
      where: { supplierId },
      select: { id: true },
    });

    const productIds = products.map((p) => p.id);

    if (productIds.length === 0) {
      return { count: 0 }; // Không có sản phẩm nào để xóa đăng ký
    }

    // Xóa tất cả đăng ký của dropshipper với các sản phẩm của nhà cung cấp
    const result = await this.prisma.registration.deleteMany({
      where: {
        dropshipperId,
        productId: { in: productIds },
      },
    });

    return { count: result.count };
  }

  async getRegistrationSummary(
    dropshipperId: string,
    productId: string,
  ): Promise<Record<string, any> | null> {
    // 1. Check if the registration exists
    const registration = await this.prisma.registration.findUnique({
      where: {
        dropshipperId_productId: {
          dropshipperId,
          productId,
        },
      },
      include: {
        dropshipper: true,
        product: true,
      },
    });

    if (!registration) {
      return null; // Registration not found
    }

    // 2. Get available quantity in warehouses
    const warehouseProducts = await this.prisma.warehouseProduct.findMany({
      where: { productId },
    });

    const availableQuantity = warehouseProducts.reduce(
      (total, wp) => total + wp.quantity,
      0,
    );

    // 3. Get completed orders for this product by this dropshipper
    const completedOrders = await this.prisma.order.findMany({
      where: {
        productId,
        dropshipperId,
        status: 3, // Assuming 3 is "completed" status
      },
    });

    const completedOrderCount = completedOrders.length;

    // 4. Calculate total quantity sold by this dropshipper
    const soldQuantity = completedOrders.reduce(
      (total, order) => total + order.quantity,
      0,
    );

    // 5. Get pending orders (those in processing or delivery status)
    // Assuming status values: 0=pending, 1=processing, 2=shipping, 3=completed, 4=cancelled
    const pendingOrders = await this.prisma.order.findMany({
      where: {
        productId,
        dropshipperId,
        status: {
          in: [0, 1, 2], // All non-completed, non-cancelled orders
        },
      },
    });

    const pendingOrderCount = pendingOrders.length;

    // Return the summary
    return {
      dropshipperId: registration.dropshipperId,
      dropshipperName: registration.dropshipper.name,
      productId: registration.productId,
      productName: registration.product.name,
      availableQuantity,
      completedOrderCount,
      soldQuantity,
      pendingOrderCount,
      commissionFee: registration.commissionFee,
    };
  }
}
