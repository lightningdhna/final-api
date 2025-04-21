import { Injectable, BadRequestException } from '@nestjs/common'; // Bỏ NotFoundException
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { Product, Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  // Trả về null nếu supplier không tồn tại
  async create(
    supplierId: string,
    createProductDto: CreateProductDto,
  ): Promise<Product | null> {
    const supplierExists = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
      select: { id: true },
    });
    if (!supplierExists) {
      return null; // Supplier không tồn tại
    }

    const data = {
      ...createProductDto,
      supplierId: supplierId,
      date: new Date(),
    };
    return await this.prisma.product.create({
      data: data,
    });
  }

  // Giả định ID hợp lệ, controller đã kiểm tra tồn tại trước khi gọi update
  async update(
    id: string,
    updateProductDto: Partial<UpdateProductDto>,
  ): Promise<Product> {
    return await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async findAll(): Promise<Product[]> {
    return await this.prisma.product.findMany({
      include: { supplier: true },
    });
  }

  // Trả về null nếu supplier không tồn tại, hoặc mảng rỗng nếu supplier có nhưng không có product
  async findAllBySupplier(supplierId: string): Promise<Product[] | null> {
    const supplierExists = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
      select: { id: true },
    });
    if (!supplierExists) {
      return null; // Supplier không tồn tại
    }
    return await this.prisma.product.findMany({
      where: { supplierId },
      include: { supplier: true },
    });
  }

  // Trả về null nếu warehouse không tồn tại
  async findAllByWarehouse(warehouseId: string): Promise<any[] | null> {
    const warehouseExists = await this.prisma.warehouse.findUnique({
      where: { id: warehouseId },
      select: { id: true },
    });
    if (!warehouseExists) {
      return null; // Warehouse không tồn tại
    }

    const warehouseProducts = await this.prisma.warehouseProduct.findMany({
      where: { warehouseId: warehouseId },
      include: {
        product: {
          include: {
            supplier: true,
          },
        },
      },
    });

    return warehouseProducts.map((wp) => ({
      ...wp.product,
      quantityInWarehouse: wp.quantity,
    }));
  }

  // Trả về null nếu không tìm thấy
  async findOne(id: string): Promise<Product | null> {
    return await this.prisma.product.findUnique({
      where: { id },
      include: { supplier: true },
    });
  }

  // Trả về Product nếu xóa thành công, null nếu không tìm thấy, ném lỗi nếu có ràng buộc
  async remove(id: string): Promise<Product | null> {
    const productExists = await this.findOne(id);
    if (!productExists) {
      return null; // Không tìm thấy sản phẩm để xóa
    }

    try {
      return await this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003' || error.code === 'P2014') {
          // Ném lỗi nghiệp vụ cụ thể hơn thay vì lỗi HTTP trực tiếp
          throw new BadRequestException(
            `Cannot delete product with ID ${id} due to existing references.`,
          );
        }
      }
      throw error; // Ném lại các lỗi khác
    }
  }

  async getSummaryInfo(productId: string): Promise<Record<string, any> | null> {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      return null; // Return null if product doesn't exist
    }

    // Get first and last day of current month for monthly statistics
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(
      now.getFullYear(), 
      now.getMonth() + 1, 
      0, 
      23, 59, 59
    );

    // 1. Total quantity in stock across all warehouses
    const warehouseProducts = await this.prisma.warehouseProduct.findMany({
      where: { productId },
    });
    
    const totalStockQuantity = warehouseProducts.reduce(
      (total, wp) => total + wp.quantity,
      0,
    );

    // 2. Count warehouses with stock
    const warehouseCount = warehouseProducts.filter(wp => wp.quantity > 0).length;

    // 3. Count dropshippers registered to sell this product
    const dropshipperCount = await this.prisma.registration.count({
      where: {
        productId,
        status: 1, // Only count approved registrations
      },
    });

    // 4. All completed orders
    const allCompletedOrders = await this.prisma.order.findMany({
      where: {
        productId,
        status: 3, // Assuming 3 is "completed" status
      },
    });
    
    const completedOrderCount = allCompletedOrders.length;
    
    // 5. Total quantity sold (all time)
    const totalSoldQuantity = allCompletedOrders.reduce(
      (total, order) => total + order.quantity,
      0,
    );

    // 6. Completed orders this month
    const monthlyCompletedOrders = allCompletedOrders.filter(
      order => order.timeCreated >= firstDayOfMonth && order.timeCreated <= lastDayOfMonth
    );
    
    const monthlyCompletedOrderCount = monthlyCompletedOrders.length;

    // 7. Quantity sold this month
    const monthlySoldQuantity = monthlyCompletedOrders.reduce(
      (total, order) => total + order.quantity,
      0,
    );

    // Return summary information
    return {
      productId: product.id,
      productName: product.name,
      totalStockQuantity,
      warehouseCount,
      dropshipperCount,
      totalSoldQuantity,
      completedOrderCount,
      monthlySoldQuantity,
      monthlyCompletedOrderCount,
      month: now.getMonth() + 1, // +1 because getMonth() returns 0-11
      year: now.getFullYear(),
    };
  }
}
