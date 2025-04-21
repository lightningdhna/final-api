import { Injectable, BadRequestException } from '@nestjs/common'; // Bỏ NotFoundException
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier, Prisma } from '@prisma/client'; // Import Supplier và Prisma

@Injectable()
export class SupplierService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy nhà cung cấp theo ID
  async findOne(id: string): Promise<Supplier | null> {
    return await this.prisma.supplier.findUnique({
      where: { id },
    });
  }

  // Lấy nhà cung cấp theo ID kho
  async findByWarehouseId(warehouseId: string): Promise<Supplier | null> {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: warehouseId },
      include: { supplier: true },
    });
    // Trả về null nếu không tìm thấy kho
    return warehouse ? warehouse.supplier : null;
  }

  // Lấy nhà cung cấp theo ID sản phẩm
  async findByProductId(productId: string): Promise<Supplier | null> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { supplier: true },
    });
    // Trả về null nếu không tìm thấy sản phẩm
    return product ? product.supplier : null;
  }

  // Lấy tất cả nhà cung cấp theo ID dropshipper (qua registrations)
  async findByDropshipperId(dropshipperId: string): Promise<Supplier[]> {
    // Kiểm tra dropshipper tồn tại (tùy chọn, có thể bỏ qua nếu chỉ muốn trả về mảng rỗng)
    const dropshipperExists = await this.prisma.dropshipper.findUnique({
      where: { id: dropshipperId },
      select: { id: true },
    });
    if (!dropshipperExists) {
      return []; // Trả về mảng rỗng nếu dropshipper không tồn tại
    }

    const registrations = await this.prisma.registration.findMany({
      where: { dropshipperId: dropshipperId },
      include: {
        product: {
          include: {
            supplier: true,
          },
        },
      },
    });

    // Dùng Map để lấy danh sách supplier duy nhất
    const suppliersMap = new Map<string, Supplier>();
    registrations.forEach((reg) => {
      if (reg.product && reg.product.supplier) {
        suppliersMap.set(reg.product.supplier.id, reg.product.supplier);
      }
    });

    return Array.from(suppliersMap.values());
  }

  // Lấy tất cả nhà cung cấp
  async findAll(): Promise<Supplier[]> {
    return await this.prisma.supplier.findMany();
  }

  // Cập nhật nhà cung cấp
  async update(
    id: string,
    updateSupplierDto: Partial<UpdateSupplierDto>,
  ): Promise<Supplier> {
    // Controller đã kiểm tra sự tồn tại
    return await this.prisma.supplier.update({
      where: { id },
      data: updateSupplierDto,
    });
  }

  // --- Các hàm không cần thiết theo yêu cầu ---

  // Thêm nhà cung cấp (không cần thiết theo yêu cầu hiện tại)
  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    // Hàm này chỉ để hoàn thiện module, không phải trọng tâm
    return await this.prisma.supplier.create({
      data: createSupplierDto,
    });
  }

  // Xóa nhà cung cấp (không cần thiết theo yêu cầu hiện tại)
  async remove(id: string): Promise<Supplier | null> {
    // Hàm này chỉ để hoàn thiện module, không phải trọng tâm
    // Controller sẽ kiểm tra sự tồn tại trước khi gọi hàm này
    try {
      return await this.prisma.supplier.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Xử lý lỗi ràng buộc khóa ngoại
        if (error.code === 'P2003' || error.code === 'P2014') {
          throw new BadRequestException(
            `Cannot delete supplier with ID ${id} due to existing references (e.g., products, warehouses).`,
          );
        }
      }
      throw error; // Ném lại các lỗi khác
    }
  }

  async getSummaryInfo(
    supplierId: string,
  ): Promise<Record<string, any> | null> {
    // Kiểm tra nhà cung cấp tồn tại
    const supplier = await this.findOne(supplierId);
    if (!supplier) {
      return null; // Trả về null nếu supplier không tồn tại, để controller xử lý
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

    // 1. Số lượng kho
    const warehouseCount = await this.prisma.warehouse.count({
      where: { supplierId },
    });

    // 2. Lấy tất cả các sản phẩm của nhà cung cấp
    const products = await this.prisma.product.findMany({
      where: { supplierId },
      select: { id: true },
    });
    const productIds = products.map((p) => p.id);

    // 3. Số lượng dropshipper đã đăng ký
    // Lấy các đăng ký độc nhất theo dropshipperId
    const registrations = await this.prisma.registration.findMany({
      where: {
        productId: { in: productIds },
        status: 1, // Chỉ tính các đăng ký đã được phê duyệt
      },
      distinct: ['dropshipperId'],
      select: { dropshipperId: true },
    });
    const dropshipperCount = registrations.length;

    // 4. Số lượng đơn hàng hoàn thành trong tháng
    const completedOrders = await this.prisma.order.findMany({
      where: {
        productId: { in: productIds },
        status: 3, // Giả định status=3 là hoàn thành, cần điều chỉnh theo logic thực tế
        timeCreated: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });
    const completedOrderCount = completedOrders.length;

    // 5. Số lượng sản phẩm đã bán trong tháng
    const soldProductQuantity = completedOrders.reduce(
      (total, order) => total + order.quantity,
      0,
    );

    // 6. Dropshipper nổi bật
    // Nhóm các đơn hàng theo dropshipperId và tính tổng số lượng sản phẩm
    const dropshipperSales = new Map<
      string,
      { id: string; name: string | null; quantity: number }
    >();

    // Lọc chỉ các đơn hàng có dropshipperId (không null)
    const ordersWithDropshipper = completedOrders.filter(
      (order) => order.dropshipperId !== null,
    );

    for (const order of ordersWithDropshipper) {
      if (!order.dropshipperId) continue; // Skip nếu dropshipperId là null (đề phòng)

      // Nếu dropshipper chưa có trong map, thêm mới với số lượng ban đầu
      if (!dropshipperSales.has(order.dropshipperId)) {
        // Lấy thông tin cơ bản của dropshipper
        const dropshipper = await this.prisma.dropshipper.findUnique({
          where: { id: order.dropshipperId },
          select: { id: true, name: true },
        });

        dropshipperSales.set(order.dropshipperId, {
          id: order.dropshipperId,
          name: dropshipper?.name || null,
          quantity: order.quantity,
        });
      } else {
        // Nếu dropshipper đã có trong map, cộng thêm số lượng
        const currentSales = dropshipperSales.get(order.dropshipperId);
        if (currentSales) {
          currentSales.quantity += order.quantity;
        }
      }
    }

    // Chuyển map thành mảng và sắp xếp giảm dần theo số lượng
    const dropshipperSalesArray = Array.from(dropshipperSales.values());
    dropshipperSalesArray.sort((a, b) => b.quantity - a.quantity);

    // Dropshipper nổi bật là người đứng đầu danh sách (hoặc null nếu không có)
    const topDropshipper =
      dropshipperSalesArray.length > 0 ? dropshipperSalesArray[0] : null;

    // Trả về kết quả tổng hợp
    return {
      supplierId: supplier.id,
      supplierName: supplier.name,
      warehouseCount,
      dropshipperCount,
      completedOrderCount,
      soldProductQuantity,
      topDropshipper,
      // Thêm bất kỳ thông tin tổng hợp khác mà bạn muốn
      month: now.getMonth() + 1, // +1 vì getMonth() trả về 0-11
      year: now.getFullYear(),
    };
  }
}
