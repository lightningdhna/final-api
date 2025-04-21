import { ApiProperty } from '@nestjs/swagger';

export class RegistrationResponseDto {
  @ApiProperty({
    description: 'ID của dropshipper',
    example: '3bc04716-1a42-4d12-983f-5b0941d8d831',
  })
  dropshipperId!: string;

  @ApiProperty({
    description: 'ID của sản phẩm',
    example: '3bc04716-1a42-4d12-983f-5b0941d8d831',
  })
  productId!: string;

  @ApiProperty({
    description: 'Phí hoa hồng',
    example: 5.5,
  })
  commissionFee!: number;

  @ApiProperty({
    description: 'Ngày tạo',
    example: '2025-04-21T10:30:00.000Z',
  })
  createdDate!: Date;

  @ApiProperty({
    description: 'Trạng thái: 0 - đợi duyệt, 1 - chấp nhận, 2 - từ chối',
    example: 0,
    enum: [0, 1, 2],
  })
  status!: number;
}