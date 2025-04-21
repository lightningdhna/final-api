import { ApiProperty } from '@nestjs/swagger';

export class ProductSummaryInfoDto {
  @ApiProperty({ description: 'ID của sản phẩm' })
  productId!: string;

  @ApiProperty({ description: 'Tên sản phẩm' })
  productName!: string;

  @ApiProperty({ description: 'Tổng số lượng hàng còn trong kho' })
  totalStockQuantity!: number;

  @ApiProperty({ description: 'Số kho còn hàng của sản phẩm này' })
  warehouseCount!: number;

  @ApiProperty({ description: 'Số dropshipper đã đăng ký bán sản phẩm' })
  dropshipperCount!: number;

  @ApiProperty({ description: 'Tổng số lượng sản phẩm đã bán được' })
  totalSoldQuantity!: number;

  @ApiProperty({ description: 'Tổng số đơn hàng đã hoàn thành' })
  completedOrderCount!: number;

  @ApiProperty({ description: 'Số lượng sản phẩm đã bán trong tháng hiện tại' })
  monthlySoldQuantity!: number;

  @ApiProperty({
    description: 'Số đơn hàng đã hoàn thành trong tháng hiện tại',
  })
  monthlyCompletedOrderCount!: number;

  @ApiProperty({ description: 'Tháng của thống kê' })
  month!: number;

  @ApiProperty({ description: 'Năm của thống kê' })
  year!: number;
}
