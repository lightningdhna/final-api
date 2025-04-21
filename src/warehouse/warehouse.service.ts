import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { UpdateWarehouseProductDto } from './dto/update-warehouse.dto';
import { Warehouse, Prisma, WarehouseProduct } from '@prisma/client';

@Injectable()
export class WarehouseService {
  constructor(private readonly prisma: PrismaService) {}

  // Tạo kho mới cho một nhà cung cấp
  async create(
    supplierId: string,
    createWarehouseDto: CreateWarehouseDto,
  ): Promise<Warehouse | null> {
    // Kiểm tra supplier có tồn tại
    const supplierExists = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
      select: { id: true },
    });

    if (!supplierExists) {
      return null; // Trả về null nếu supplier không tồn tại
    }

    return await this.prisma.warehouse.create({
      data: {
        ...createWarehouseDto,
        supplierId,
      },
    });
  }

  // Lấy tất cả các kho
  async findAll(): Promise<Warehouse[]> {
    return await this.prisma.warehouse.findMany({
      include: { supplier: true },
    });
  }

  // Lấy tất cả các kho của một nhà cung cấp
  async findAllBySupplier(supplierId: string): Promise<Warehouse[]> {
    const supplierExists = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
      select: { id: true },
    });

    if (!supplierExists) {
      return []; // Trả về mảng rỗng nếu supplier không tồn tại
    }

    return await this.prisma.warehouse.findMany({
      where: { supplierId },
      include: { supplier: true },
    });
  }

  // Lấy chi tiết một kho
  async findOne(id: string): Promise<Warehouse | null> {
    return await this.prisma.warehouse.findUnique({
      where: { id },
      include: { supplier: true },
    });
  }

  // Cập nhật thông tin kho
  async update(
    id: string,
    updateWarehouseDto: Partial<UpdateWarehouseDto>,
  ): Promise<Warehouse> {
    return await this.prisma.warehouse.update({
      where: { id },
      data: updateWarehouseDto,
    });
  }

  // Xóa kho
  async remove(id: string): Promise<Warehouse | null> {
    try {
      return await this.prisma.warehouse.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003' || error.code === 'P2014') {
          throw new BadRequestException(
            `Cannot delete warehouse with ID ${id} due to existing references (e.g., products in warehouse, plans).`,
          );
        }
      }
      throw error;
    }
  }

  // Lấy thông tin tổng hợp về một kho
  async getSummaryInfo(
    warehouseId: string,
  ): Promise<Record<string, any> | null> {
    const warehouse = await this.findOne(warehouseId);
    if (!warehouse) {
      return null; // Kho không tồn tại
    }

    // Lấy tất cả WarehouseProduct liên quan đến kho này
    const warehouseProducts = await this.prisma.warehouseProduct.findMany({
      where: { warehouseId },
      include: {
        product: true,
      },
    });

    // Số loại mặt hàng trong kho
    const productTypeCount = warehouseProducts.length;

    // Tổng số lượng hàng trong kho
    const totalProductQuantity = warehouseProducts.reduce(
      (total, wp) => total + wp.quantity,
      0,
    );

    // Thông tin chi tiết từng sản phẩm
    const products = warehouseProducts.map((wp) => ({
      productId: wp.productId,
      productName: wp.product.name,
      quantity: wp.quantity,
    }));

    return {
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      productTypeCount,
      totalProductQuantity,
      products,
    };
  }

  // Cập nhật số lượng một mặt hàng trong kho
  async updateProductQuantity(
    warehouseId: string,
    productId: string,
    updateWarehouseProductDto: UpdateWarehouseProductDto,
  ): Promise<WarehouseProduct | null> {
    // Kiểm tra kho có tồn tại
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: warehouseId },
      select: { id: true },
    });

    if (!warehouse) {
      return null; // Kho không tồn tại
    }

    // Kiểm tra sản phẩm có tồn tại
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return null; // Sản phẩm không tồn tại
    }

    // Kiểm tra xem cặp warehouseId và productId đã tồn tại chưa
    const existingWarehouseProduct =
      await this.prisma.warehouseProduct.findUnique({
        where: {
          warehouseId_productId: {
            warehouseId,
            productId,
          },
        },
      });

    if (existingWarehouseProduct) {
      // Nếu đã tồn tại, cập nhật số lượng
      return await this.prisma.warehouseProduct.update({
        where: {
          warehouseId_productId: {
            warehouseId,
            productId,
          },
        },
        data: {
          quantity: updateWarehouseProductDto.quantity,
        },
      });
    } else {
      // Nếu chưa tồn tại, tạo mới
      return await this.prisma.warehouseProduct.create({
        data: {
          warehouseId,
          productId,
          quantity: updateWarehouseProductDto.quantity,
        },
      });
    }
  }

  // Lấy tất cả các kho có chứa >0 một mặt hàng cụ thể
  async findAllByProduct(productId: string): Promise<Warehouse[]> {
    // Kiểm tra sản phẩm có tồn tại
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return []; // Sản phẩm không tồn tại, trả về mảng rỗng
    }

    // Lấy tất cả các WarehouseProduct có số lượng > 0 cho sản phẩm này
    const warehouseProducts = await this.prisma.warehouseProduct.findMany({
      where: {
        productId,
        quantity: { gt: 0 },
      },
      select: {
        warehouseId: true,
      },
    });

    const warehouseIds = warehouseProducts.map((wp) => wp.warehouseId);

    // Truy vấn thông tin về các kho
    return await this.prisma.warehouse.findMany({
      where: {
        id: { in: warehouseIds },
      },
      include: {
        supplier: true,
        warehouseProducts: {
          where: {
            productId,
          },
          include: {
            product: true,
          },
        },
      },
    });
  }
}
