import { ApiProperty } from '@nestjs/swagger';

// DTO định nghĩa cấu trúc response cho API dashboard
export class TopDropshipperDto {
  @ApiProperty({
    description: 'ID của dropshipper',
    example: '3bc04716-1a42-4d12-983f-5b0941d8d831',
  })
  id!: string; // Thêm dấu ! để xác nhận với TypeScript rằng giá trị này sẽ được gán

  @ApiProperty({
    description: 'Tên của dropshipper',
    example: 'Nguyễn Văn A',
    nullable: true,
  })
  name!: string | null;

  @ApiProperty({ description: 'Số lượng sản phẩm đã bán', example: 50 })
  quantity!: number;
}

export class SupplierSummaryInfoDto {
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

  @ApiProperty({ description: 'Số lượng kho', example: 3 })
  warehouseCount!: number;

  @ApiProperty({ description: 'Số lượng dropshipper đã đăng ký', example: 15 })
  dropshipperCount!: number;

  @ApiProperty({
    description: 'Số lượng đơn hàng hoàn thành trong tháng',
    example: 120,
  })
  completedOrderCount!: number;

  @ApiProperty({
    description: 'Số lượng sản phẩm đã bán trong tháng',
    example: 450,
  })
  soldProductQuantity!: number;

  @ApiProperty({
    description: 'Dropshipper nổi bật (bán được nhiều nhất)',
    type: TopDropshipperDto,
    nullable: true,
  })
  topDropshipper!: TopDropshipperDto | null;

  @ApiProperty({ description: 'Tháng của thống kê', example: 4 })
  month!: number;

  @ApiProperty({ description: 'Năm của thống kê', example: 2025 })
  year!: number;
}
