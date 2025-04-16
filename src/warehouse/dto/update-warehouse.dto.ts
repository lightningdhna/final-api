import { PartialType } from '@nestjs/swagger';
import { CreateWarehouseDto } from './create-warehouse.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsNumber, IsInt, Min } from 'class-validator';

export class UpdateWarehouseDto extends PartialType(CreateWarehouseDto) {
  // Override or add specific validation if needed for updates

  @ApiPropertyOptional({ description: 'Tên kho', example: 'Kho Phụ' })
  @IsOptional()
  @IsString({ message: 'Tên kho phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên kho không được để trống nếu được cung cấp' })
  name?: string;

  @ApiPropertyOptional({ description: 'Tọa độ X', example: 10.8 })
  @IsOptional()
  @IsNumber({}, { message: 'Tọa độ X phải là số' })
  locationX?: number;

  @ApiPropertyOptional({ description: 'Tọa độ Y', example: 106.7 })
  @IsOptional()
  @IsNumber({}, { message: 'Tọa độ Y phải là số' })
  locationY?: number;

  @ApiPropertyOptional({ description: 'Sức chứa', example: 1500 })
  @IsOptional()
  @IsInt({ message: 'Sức chứa phải là số nguyên' })
  @Min(0, { message: 'Sức chứa phải lớn hơn hoặc bằng 0' })
  capacity?: number;

  @ApiPropertyOptional({ description: 'Thời gian xử lý tại kho (phút)', example: 45 })
  @IsOptional()
  @IsInt({ message: 'Thời gian xử lý phải là số nguyên' })
  @Min(0, { message: 'Thời gian xử lý phải lớn hơn hoặc bằng 0' })
  timeToLoad?: number;

  // ID is usually not updatable and comes from the URL param.
  // supplierId is also generally not changed via this endpoint.
}