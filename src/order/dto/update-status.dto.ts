import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({
    description: 'Trạng thái mới của đơn hàng (0: chờ xử lý, 1: đang xử lý, 2: đang vận chuyển, 3: hoàn thành)',
    example: 2,
  })
  @IsInt({ message: 'Trạng thái phải là số nguyên' })
  @Min(0, { message: 'Trạng thái không được nhỏ hơn 0' })
  @Max(3, { message: 'Trạng thái không được lớn hơn 3' })
  status!: number;

  @ApiPropertyOptional({
    description: 'Ghi chú khi cập nhật trạng thái',
    example: 'Đang trên đường giao hàng',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  note?: string;
} 