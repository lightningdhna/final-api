// filepath: d:\datn\code\final\src\order\dto\create-order.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsInt,
  Min,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateOrderDto {
  @ApiPropertyOptional({ description: 'ID đơn hàng (UUID - tùy chọn)' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ description: 'ID sản phẩm (UUID)', example: '...' })
  @IsUUID()
  productId!: string;

  @ApiPropertyOptional({
    description: 'ID dropshipper (UUID - nếu là đơn dropship)',
    example: '...',
  })
  @IsOptional()
  @IsUUID()
  dropshipperId?: string;

  // timeCreated is set by service

  @ApiProperty({ description: 'Trạng thái đơn hàng (số nguyên)', example: 0 })
  @IsInt()
  status!: number; // Define meaning of statuses (e.g., 0: Pending, 1: Processing, 2: Shipped, 3: Delivered, 4: Cancelled)

  @ApiProperty({ description: 'Số lượng', example: 5 })
  @IsInt()
  @Min(1) // Usually order quantity is at least 1
  quantity!: number;

  @ApiProperty({ description: 'Tổng thể tích', example: 0.5 })
  @IsNumber()
  @Min(0)
  volume!: number;

  @ApiProperty({ description: 'Tổng trọng lượng', example: 2.5 })
  @IsNumber()
  @Min(0)
  weight!: number;

  @ApiProperty({ description: 'Tọa độ X giao hàng', example: 10.0 })
  @IsNumber()
  locationX!: number;

  @ApiProperty({ description: 'Tọa độ Y giao hàng', example: 106.0 })
  @IsNumber()
  locationY!: number;

  @ApiPropertyOptional({
    description: 'Ghi chú',
    example: 'Giao hàng giờ hành chính',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
