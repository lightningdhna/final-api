// filepath: d:\datn\code\final\src\order\dto\create-order.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsInt,
  IsNumber,
  Min,
  IsString,
  IsDateString,
} from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID của sản phẩm',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'ID sản phẩm phải là UUID hợp lệ' })
  productId!: string;

  @ApiPropertyOptional({
    description: 'ID của dropshipper (nếu đơn hàng từ dropshipper)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID dropshipper phải là UUID hợp lệ' })
  dropshipperId?: string;

  @ApiProperty({
    description: 'Thời gian tạo đơn hàng',
    example: '2025-06-01T12:00:00Z',
  })
  @IsDateString({}, { message: 'Thời gian tạo không hợp lệ' })
  timeCreated!: string;

  @ApiProperty({
    description: 'Trạng thái đơn hàng (0: chờ xử lý, 1: đang xử lý, 2: đang vận chuyển, 3: hoàn thành)',
    example: 0,
  })
  @IsInt({ message: 'Trạng thái phải là số nguyên' })
  @Min(0, { message: 'Trạng thái không được âm' })
  status!: number;

  @ApiProperty({
    description: 'Số lượng sản phẩm',
    example: 5,
  })
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng phải lớn hơn 0' })
  quantity!: number;

  @ApiProperty({
    description: 'Thể tích (đơn vị: m³)',
    example: 0.5,
  })
  @IsNumber({}, { message: 'Thể tích phải là số' })
  @Min(0, { message: 'Thể tích không được âm' })
  volume!: number;

  @ApiProperty({
    description: 'Trọng lượng (đơn vị: kg)',
    example: 2.5,
  })
  @IsNumber({}, { message: 'Trọng lượng phải là số' })
  @Min(0, { message: 'Trọng lượng không được âm' })
  weight!: number;

  @ApiProperty({
    description: 'Tọa độ X của địa điểm giao hàng',
    example: 10.762622,
  })
  @IsNumber({}, { message: 'Tọa độ X phải là số' })
  locationX!: number;

  @ApiProperty({
    description: 'Tọa độ Y của địa điểm giao hàng',
    example: 106.660172,
  })
  @IsNumber({}, { message: 'Tọa độ Y phải là số' })
  locationY!: number;

  @ApiPropertyOptional({
    description: 'Ghi chú đơn hàng',
    example: 'Giao hàng vào buổi sáng',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  note?: string;
}
