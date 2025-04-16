// filepath: d:\datn\code\final\src\order\dto\update-order.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsNumber, Min } from 'class-validator';

// Usually, you only update certain fields like status or note
export class UpdateOrderDto {
  // Not extending PartialType to be more specific

  @ApiPropertyOptional({ description: 'Trạng thái đơn hàng', example: 1 })
  @IsOptional()
  @IsInt()
  status?: number;

  @ApiPropertyOptional({ description: 'Số lượng', example: 6 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Tổng thể tích', example: 0.6 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  volume?: number;

  @ApiPropertyOptional({ description: 'Tổng trọng lượng', example: 3.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ description: 'Tọa độ X giao hàng', example: 10.1 })
  @IsOptional()
  @IsNumber()
  locationX?: number;

  @ApiPropertyOptional({ description: 'Tọa độ Y giao hàng', example: 106.1 })
  @IsOptional()
  @IsNumber()
  locationY?: number;

  @ApiPropertyOptional({
    description: 'Ghi chú',
    example: 'Gọi trước khi giao',
  })
  @IsOptional()
  @IsString()
  note?: string;

  // Fields like productId, dropshipperId, timeCreated are generally not updated here.
}
