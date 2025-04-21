import { ApiProperty } from '@nestjs/swagger';

export class WarehouseProductDetailDto {
  @ApiProperty({
    description: 'ID của sản phẩm',
    example: '3bc04716-1a42-4d12-983f-5b0941d8d831',
  })
  productId!: string;

  @ApiProperty({ description: 'Tên sản phẩm', example: 'Áo thun nam' })
  productName!: string;

  @ApiProperty({ description: 'Số lượng sản phẩm trong kho', example: 150 })
  quantity!: number;
}

export class WarehouseSummaryDto {
  @ApiProperty({
    description: 'ID của kho',
    example: '3bc04716-1a42-4d12-983f-5b0941d8d831',
  })
  warehouseId!: string;

  @ApiProperty({ description: 'Tên của kho', example: 'Kho Hà Nội' })
  warehouseName!: string;

  @ApiProperty({ description: 'Số loại mặt hàng trong kho', example: 15 })
  productTypeCount!: number;

  @ApiProperty({ description: 'Tổng số lượng hàng trong kho', example: 1200 })
  totalProductQuantity!: number;

  @ApiProperty({
    description: 'Thông tin chi tiết từng sản phẩm',
    type: [WarehouseProductDetailDto],
  })
  products!: WarehouseProductDetailDto[];
}
