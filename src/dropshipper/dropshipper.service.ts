import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDropshipperDto } from './dto/create-dropshipper.dto';
import { UpdateDropshipperDto } from './dto/update-dropshipper.dto';
import { Dropshipper, Prisma } from '@prisma/client';

@Injectable()
export class DropshipperService {
  constructor(private readonly prisma: PrismaService) {}

  // Tạo mới dropshipper
  async create(
    createDropshipperDto: CreateDropshipperDto,
  ): Promise<Dropshipper> {
    return await this.prisma.dropshipper.create({
      data: createDropshipperDto,
    });
  }

  // Lấy tất cả dropshipper
  async findAll(): Promise<Dropshipper[]> {
    return await this.prisma.dropshipper.findMany();
  }

  // Lấy thông tin một dropshipper theo ID
  async findOne(id: string): Promise<Dropshipper | null> {
    return await this.prisma.dropshipper.findUnique({
      where: { id },
    });
  }

  // Cập nhật thông tin dropshipper
  async update(
    id: string,
    updateDropshipperDto: UpdateDropshipperDto,
  ): Promise<Dropshipper> {
    return await this.prisma.dropshipper.update({
      where: { id },
      data: updateDropshipperDto,
    });
  }

  // Xóa dropshipper
  async remove(id: string): Promise<Dropshipper | null> {
    try {
      return await this.prisma.dropshipper.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Ném lỗi để controller xử lý
        throw error;
      }
      throw error;
    }
  }

  // Lấy dropshipper theo sản phẩm (những người bán sản phẩm này)
  async findByProduct(productId: string): Promise<Dropshipper[]> {
    // Kiểm tra sản phẩm tồn tại
    const productExists = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!productExists) {
      return []; // Trả về mảng rỗng nếu sản phẩm không tồn tại
    }

    // Lấy các đăng ký được phê duyệt (status = 1) cho sản phẩm này
    const registrations = await this.prisma.registration.findMany({
      where: {
        productId,
        status: 1, // Chỉ lấy những đăng ký đã được phê duyệt
      },
      include: {
        dropshipper: true,
      },
    });

    // Trích xuất các dropshipper từ kết quả
    return registrations.map((registration) => registration.dropshipper);
  }

  // Lấy danh sách dropshipper theo supplierId (những người bán sản phẩm của nhà cung cấp này)
  async findBySupplier(supplierId: string): Promise<Dropshipper[]> {
    // Kiểm tra nhà cung cấp tồn tại
    const supplierExists = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
      select: { id: true },
    });

    if (!supplierExists) {
      return []; // Trả về mảng rỗng nếu nhà cung cấp không tồn tại
    }

    // Lấy tất cả sản phẩm của nhà cung cấp
    const products = await this.prisma.product.findMany({
      where: { supplierId },
      select: { id: true },
    });

    const productIds = products.map((p) => p.id);

    if (productIds.length === 0) {
      return []; // Trả về mảng rỗng nếu nhà cung cấp không có sản phẩm nào
    }

    // Lấy các đăng ký được phê duyệt cho các sản phẩm của nhà cung cấp
    const registrations = await this.prisma.registration.findMany({
      where: {
        productId: { in: productIds },
        status: 1, // Chỉ lấy những đăng ký đã được phê duyệt
      },
      include: {
        dropshipper: true,
      },
      distinct: ['dropshipperId'],
    });

    // Trích xuất các dropshipper độc nhất từ kết quả
    return registrations.map((registration) => registration.dropshipper);
  }

  // Lấy thông tin tổng hợp về một dropshipper
  async getSummaryInfo(
    dropshipperId: string,
  ): Promise<Record<string, any> | null> {
    // Kiểm tra dropshipper tồn tại
    const dropshipper = await this.findOne(dropshipperId);
    if (!dropshipper) {
      return null; // Trả về null nếu dropshipper không tồn tại
    }

    // Lấy ngày đầu tiên và cuối cùng của tháng hiện tại
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

    // 1. Lấy các đăng ký được phê duyệt của dropshipper
    const registrations = await this.prisma.registration.findMany({
      where: {
        dropshipperId,
        status: 1, // Đã được phê duyệt
      },
      include: {
        product: {
          include: {
            supplier: true,
          },
        },
      },
    });

    // 2. Số lượng nhà cung cấp liên kết (độc nhất)
    const supplierMap = new Map<string, boolean>();
    registrations.forEach((reg) => {
      if (reg.product && reg.product.supplier) {
        supplierMap.set(reg.product.supplier.id, true);
      }
    });
    const supplierCount = supplierMap.size;

    // 3. Số lượng sản phẩm đăng ký bán
    const registeredProductCount = registrations.length;

    // 4. Số lượng đơn hàng đã hoàn thành trong tháng
    const completedOrdersThisMonth = await this.prisma.order.findMany({
      where: {
        dropshipperId,
        status: 3, // Giả định status=3 là hoàn thành
        timeCreated: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });
    const completedOrderCount = completedOrdersThisMonth.length;

    // 5. Số lượng sản phẩm đã bán trong tháng
    const soldProductQuantity = completedOrdersThisMonth.reduce(
      (total, order) => total + order.quantity,
      0,
    );

    // 6. Số lượng đơn hàng đã hoàn thành (toàn thời gian)
    const completedOrdersAllTime = await this.prisma.order.findMany({
      where: {
        dropshipperId,
        status: 3, // Giả định status=3 là hoàn thành
      },
    });
    const completedOrderCountAllTime = completedOrdersAllTime.length;

    // 7. Số lượng sản phẩm đã bán (toàn thời gian)
    const soldProductQuantityAllTime = completedOrdersAllTime.reduce(
      (total, order) => total + order.quantity,
      0,
    );

    return {
      dropshipperId: dropshipper.id,
      dropshipperName: dropshipper.name,
      supplierCount,
      registeredProductCount,
      completedOrderCount,
      soldProductQuantity,
      completedOrderCountAllTime,
      soldProductQuantityAllTime,
      month: now.getMonth() + 1, // +1 vì getMonth() trả về 0-11
      year: now.getFullYear(),
    };
  }

  // Lấy thông tin tổng hợp về một dropshipper với một nhà cung cấp cụ thể
  async getSupplierSummaryInfo(
    dropshipperId: string,
    supplierId: string,
  ): Promise<Record<string, any> | null> {
    // Kiểm tra dropshipper và supplier tồn tại
    const [dropshipper, supplier] = await Promise.all([
      this.prisma.dropshipper.findUnique({
        where: { id: dropshipperId },
      }),
      this.prisma.supplier.findUnique({
        where: { id: supplierId },
      }),
    ]);

    if (!dropshipper || !supplier) {
      return null; // Trả về null nếu dropshipper hoặc supplier không tồn tại
    }

    // Lấy ngày đầu tiên và cuối cùng của tháng hiện tại
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

    // 1. Lấy các sản phẩm của nhà cung cấp
    const products = await this.prisma.product.findMany({
      where: { supplierId },
      select: { id: true },
    });
    const productIds = products.map((p) => p.id);

    if (productIds.length === 0) {
      // Nếu nhà cung cấp không có sản phẩm nào, trả về thông tin với số lượng là 0
      return {
        dropshipperId: dropshipper.id,
        dropshipperName: dropshipper.name,
        supplierId: supplier.id,
        supplierName: supplier.name,
        registeredProductCount: 0,
        completedOrderCount: 0,
        soldProductQuantity: 0,
        completedOrderCountAllTime: 0,
        soldProductQuantityAllTime: 0,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      };
    }

    // 2. Lấy các đăng ký được phê duyệt của dropshipper với các sản phẩm của nhà cung cấp
    const registrations = await this.prisma.registration.findMany({
      where: {
        dropshipperId,
        productId: { in: productIds },
        status: 1, // Đã được phê duyệt
      },
    });

    // 3. Số lượng sản phẩm đăng ký bán từ nhà cung cấp này
    const registeredProductCount = registrations.length;

    // 4. Số lượng đơn hàng đã hoàn thành trong tháng với sản phẩm từ nhà cung cấp này
    const completedOrdersThisMonth = await this.prisma.order.findMany({
      where: {
        dropshipperId,
        productId: { in: productIds },
        status: 3, // Giả định status=3 là hoàn thành
        timeCreated: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });
    const completedOrderCount = completedOrdersThisMonth.length;

    // 5. Số lượng sản phẩm đã bán trong tháng từ nhà cung cấp này
    const soldProductQuantity = completedOrdersThisMonth.reduce(
      (total, order) => total + order.quantity,
      0,
    );

    // 6. Số lượng đơn hàng đã hoàn thành (toàn thời gian) với sản phẩm từ nhà cung cấp này
    const completedOrdersAllTime = await this.prisma.order.findMany({
      where: {
        dropshipperId,
        productId: { in: productIds },
        status: 3, // Giả định status=3 là hoàn thành
      },
    });
    const completedOrderCountAllTime = completedOrdersAllTime.length;

    // 7. Số lượng sản phẩm đã bán (toàn thời gian) từ nhà cung cấp này
    const soldProductQuantityAllTime = completedOrdersAllTime.reduce(
      (total, order) => total + order.quantity,
      0,
    );

    return {
      dropshipperId: dropshipper.id,
      dropshipperName: dropshipper.name,
      supplierId: supplier.id,
      supplierName: supplier.name,
      registeredProductCount,
      completedOrderCount,
      soldProductQuantity,
      completedOrderCountAllTime,
      soldProductQuantityAllTime,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    };
  }
}
