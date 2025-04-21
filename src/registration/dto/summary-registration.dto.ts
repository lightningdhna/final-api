import { ApiProperty } from '@nestjs/swagger';

export class RegistrationSummaryDto {
  @ApiProperty({ description: 'ID của dropshipper' })
  dropshipperId!: string;

  @ApiProperty({ description: 'Tên dropshipper' })
  dropshipperName!: string;

  @ApiProperty({ description: 'ID của sản phẩm' })
  productId!: string;

  @ApiProperty({ description: 'Tên sản phẩm' })
  productName!: string;

  @ApiProperty({ description: 'Số lượng sản phẩm còn trong kho' })
  availableQuantity!: number;

  @ApiProperty({
    description: 'Số đơn hàng đã hoàn thành của dropshipper cho sản phẩm này',
  })
  completedOrderCount!: number;

  @ApiProperty({ description: 'Số lượng sản phẩm đã bán được bởi dropshipper' })
  soldQuantity!: number;

  @ApiProperty({ description: 'Số đơn hàng đang chờ xử lý/đang giao' })
  pendingOrderCount!: number;

  @ApiProperty({ description: 'Phí hoa hồng' })
  commissionFee!: number;
}
