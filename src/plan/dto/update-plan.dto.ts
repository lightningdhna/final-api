// filepath: d:\datn\code\final\src\plan\dto\update-plan.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreatePlanDto } from './create-plan.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsInt, IsIn, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePlanDto {
  // Not using PartialType for more control

  @ApiPropertyOptional({
    description: 'Ngày kế hoạch',
    example: '2025-04-19T00:00:00Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  planDate?: Date;

  @ApiPropertyOptional({
    description:
      'Trạng thái (0: waiting, 1: on-going, 2: in progress, 3: completed)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1, 2, 3])
  status?: number;

  // Usually truckId and orderId are not changed in an update
  // @ApiPropertyOptional({ description: 'ID xe tải (UUID)', example: '...' })
  // @IsOptional()
  // @IsUUID()
  // truckId?: string;

  // @ApiPropertyOptional({ description: 'ID đơn hàng (UUID)', example: '...' })
  // @IsOptional()
  // @IsUUID()
  // orderId?: string;

  @ApiPropertyOptional({
    description: 'Loại kế hoạch (1: load, 2: unload)',
    example: 2,
  })
  @IsOptional()
  @IsInt()
  @IsIn([1, 2])
  type?: number;

  @ApiPropertyOptional({
    description: 'ID kho (UUID - chỉ cần nếu type=1, null nếu type=2)',
    example: '...',
  })
  @IsOptional()
  @IsUUID() // Basic validation, service handles logic based on type
  warehouseId?: string | null;

  @ApiPropertyOptional({
    description: 'Thời gian bắt đầu dự kiến/thực tế',
    example: '2025-04-19T10:00:00Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startTime?: Date;

  @ApiPropertyOptional({
    description: 'Thời gian thực hiện dự kiến/thực tế (phút)',
    example: 55,
  })
  @IsOptional()
  @IsInt()
  executionTime?: number;
}
