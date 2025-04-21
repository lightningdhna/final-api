import { ApiProperty } from '@nestjs/swagger';

export class DropshipperSummaryDto {
  @ApiProperty({
    description: 'ID của dropshipper',
    example: '3bc04716-1a42-4d12-983f-5b0941d8d831',
  })
  dropshipperId!: string;

  @ApiProperty({
    description: 'Tên của dropshipper',
    example: 'Nguyễn Văn A',
  })
  dropshipperName!: string;

  @ApiProperty({
    description: 'Số lượng nhà cung cấp liên kết',
    example: 5,
  })
  supplierCount!: number;

  @ApiProperty({
    description: 'Số lượng sản phẩm đăng ký bán',
    example: 25,
  })
  registeredProductCount!: number;

  @ApiProperty({
    description: 'Số lượng đơn hàng đã hoàn thành trong tháng',
    example: 150,
  })
  completedOrderCount!: number;

  @ApiProperty({
    description: 'Số lượng sản phẩm đã bán trong tháng',
    example: 450,
  })
  soldProductQuantity!: number;

  @ApiProperty({
    description: 'Số lượng đơn hàng đã hoàn thành (toàn thời gian)',
    example: 1200,
  })
  completedOrderCountAllTime!: number;

  @ApiProperty({
    description: 'Số lượng sản phẩm đã bán (toàn thời gian)',
    example: 3600,
  })
  soldProductQuantityAllTime!: number;

  @ApiProperty({
    description: 'Tháng của thống kê',
    example: 4,
  })
  month!: number;

  @ApiProperty({
    description: 'Năm của thống kê',
    example: 2025,
  })
  year!: number;
}

export class SupplierDropshipperSummaryDto {
  @ApiProperty({
    description: 'ID của dropshipper',
    example: '3bc04716-1a42-4d12-983f-5b0941d8d831',
  })
  dropshipperId!: string;

  @ApiProperty({
    description: 'Tên của dropshipper',
    example: 'Nguyễn Văn A',
  })
  dropshipperName!: string;

  @ApiProperty({
    description: 'ID của nhà cung cấp',
    example: '3bc04716-1a42-4d12-983f-5b0941d8d831',
  })
  supplierId!: string;

  @ApiProperty({
    description: 'Tên của nhà cung cấp',
    example: 'Công ty TNHH ABC',
  })
  supplierName!: string;

  @ApiProperty({
    description: 'Số lượng sản phẩm đăng ký bán từ nhà cung cấp này',
    example: 10,
  })
  registeredProductCount!: number;

  @ApiProperty({
    description:
      'Số lượng đơn hàng đã hoàn thành trong tháng với sản phẩm từ nhà cung cấp này',
    example: 45,
  })
  completedOrderCount!: number;

  @ApiProperty({
    description: 'Số lượng sản phẩm đã bán trong tháng từ nhà cung cấp này',
    example: 120,
  })
  soldProductQuantity!: number;

  @ApiProperty({
    description:
      'Số lượng đơn hàng đã hoàn thành (toàn thời gian) với sản phẩm từ nhà cung cấp này',
    example: 320,
  })
  completedOrderCountAllTime!: number;

  @ApiProperty({
    description:
      'Số lượng sản phẩm đã bán (toàn thời gian) từ nhà cung cấp này',
    example: 980,
  })
  soldProductQuantityAllTime!: number;

  @ApiProperty({
    description: 'Tháng của thống kê',
    example: 4,
  })
  month!: number;

  @ApiProperty({
    description: 'Năm của thống kê',
    example: 2025,
  })
  year!: number;
}
