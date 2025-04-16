// filepath: d:\datn\code\final\src\plan\dto\create-plan.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsDate, IsInt, Min, IsIn, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePlanDto {
  @ApiPropertyOptional({ description: 'ID kế hoạch (UUID - tùy chọn)' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({
    description: 'Ngày kế hoạch',
    example: '2025-04-18T00:00:00Z',
  })
  @IsDate()
  @Type(() => Date)
  planDate!: Date;

  @ApiProperty({
    description:
      'Trạng thái (0: waiting, 1: on-going, 2: in progress, 3: completed)',
    example: 0,
  })
  @IsInt()
  @IsIn([0, 1, 2, 3])
  status!: number;

  @ApiProperty({ description: 'ID xe tải (UUID)', example: '...' })
  @IsUUID()
  truckId!: string;

  @ApiProperty({ description: 'ID đơn hàng (UUID)', example: '...' })
  @IsUUID()
  orderId!: string;

  @ApiProperty({
    description: 'Loại kế hoạch (1: load, 2: unload)',
    example: 1,
  })
  @IsInt()
  @IsIn([1, 2])
  type!: number;

  @ApiPropertyOptional({
    description: 'ID kho (UUID - chỉ cần nếu type=1)',
    example: '...',
  })
  @IsOptional() // Make optional here, service validates based on type
  @IsUUID()
  warehouseId?: string | null; // Allow null

  @ApiProperty({
    description: 'Thời gian bắt đầu dự kiến',
    example: '2025-04-18T09:00:00Z',
  })
  @IsDate()
  @Type(() => Date)
  startTime!: Date;

  @ApiProperty({
    description: 'Thời gian thực hiện dự kiến (phút)',
    example: 60,
  })
  @IsInt()
  @Min(0)
  executionTime!: number;
}
