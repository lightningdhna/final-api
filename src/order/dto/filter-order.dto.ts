import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsUUID } from 'class-validator';

export class FilterOrderDto {
  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái đơn hàng (0: chờ xử lý, 1: đang xử lý, 2: đang vận chuyển, 3: hoàn thành)',
    example: 2,
  })
  @IsOptional()
  @IsInt({ message: 'Trạng thái phải là số nguyên' })
  @Min(0, { message: 'Trạng thái không được nhỏ hơn 0' })
  @Max(3, { message: 'Trạng thái không được lớn hơn 3' })
  status?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo ID nhà cung cấp',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID nhà cung cấp phải là UUID hợp lệ' })
  supplierId?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo ID dropshipper',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID dropshipper phải là UUID hợp lệ' })
  dropshipperId?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo ID sản phẩm',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID sản phẩm phải là UUID hợp lệ' })
  productId?: string;
} 