import { ApiProperty } from '@nestjs/swagger';

export class ProductStatisticsDto {
  @ApiProperty({
    description: 'ID của sản phẩm',
    example: '3bc04716-1a42-4d12-983f-5b0941d8d831',
  })
  productId!: string;

  @ApiProperty({
    description: 'Tên sản phẩm',
    example: 'iPhone 13 Pro',
  })
  productName!: string;

  @ApiProperty({
    description: 'Tổng số lượng sản phẩm còn trong kho',
    example: 250,
  })
  totalStock!: number;

  @ApiProperty({
    description: 'Số lượng kho còn hàng',
    example: 3,
  })
  warehouseCount!: number;

  @ApiProperty({
    description: 'Số đơn đã hoàn thành cho sản phẩm',
    example: 42,
  })
  completedOrderCount!: number;

  @ApiProperty({
    description: 'Tổng số lượng sản phẩm đã bán',
    example: 120,
  })
  soldQuantity!: number;

  @ApiProperty({
    description: 'Số đơn đang đợi xử lý',
    example: 15,
  })
  pendingOrderCount!: number;

  constructor(partial: Partial<ProductStatisticsDto> = {}) {
    Object.assign(this, partial);
  }
}

export class SupplierStatisticsDto {
  @ApiProperty({
    description: 'ID của nhà cung cấp',
    example: '3bc04716-1a42-4d12-983f-5b0941d8d831',
  })
  supplierId!: string;

  @ApiProperty({
    description: 'Tên nhà cung cấp',
    example: 'Apple Inc.',
  })
  supplierName!: string;

  @ApiProperty({
    description: 'Thống kê cho từng sản phẩm của nhà cung cấp',
    type: [ProductStatisticsDto],
  })
  products!: ProductStatisticsDto[];

  constructor(partial: Partial<SupplierStatisticsDto> = {}) {
    Object.assign(this, partial);
  }
}
