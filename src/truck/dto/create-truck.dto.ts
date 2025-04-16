import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'; // Added ApiPropertyOptional
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsDate,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTruckDto {
  @ApiPropertyOptional({ description: 'ID xe tải (UUID - tùy chọn)' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ description: 'Tên/Biển số xe', example: '51C-12345' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Loại xe', example: 'Xe tải 1 tấn' })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({ description: 'Tải trọng tối đa (kg)', example: 1000 })
  @IsNumber()
  @Min(0)
  maxWeight!: number;

  @ApiProperty({ description: 'Thể tích tối đa (m³)', example: 5 })
  @IsNumber()
  @Min(0)
  maxVolume!: number;

  @ApiProperty({ description: 'Tốc độ trung bình (km/h)', example: 50 })
  @IsNumber()
  @Min(0)
  averageSpeed!: number;

  @ApiProperty({
    description: 'Thời gian bắt đầu hoạt động',
    example: '2025-04-17T08:00:00Z',
  })
  @IsDate()
  @Type(() => Date) // Ensure transformation from string/number
  timeActive!: Date;

  @ApiProperty({
    description: 'Thời gian kết thúc hoạt động',
    example: '2025-04-17T18:00:00Z',
  })
  @IsDate()
  @Type(() => Date)
  timeInactive!: Date;
}
