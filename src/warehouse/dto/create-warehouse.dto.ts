import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsInt, Min, IsOptional, IsUUID } from 'class-validator';

export class CreateWarehouseDto {
  @ApiProperty({
    description: 'ID của kho (UUID - tùy chọn, sẽ tự động tạo nếu bỏ trống)',
    example: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID kho phải là UUID hợp lệ' })
  id?: string;

  @ApiProperty({ description: 'Tên kho', example: 'Kho Chính' })
  @IsString({ message: 'Tên kho phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên kho không được để trống' })
  name!: string;

  @ApiProperty({ description: 'Tọa độ X', example: 10.7769 })
  @IsNumber({}, { message: 'Tọa độ X phải là số' })
  locationX!: number;

  @ApiProperty({ description: 'Tọa độ Y', example: 106.7009 })
  @IsNumber({}, { message: 'Tọa độ Y phải là số' })
  locationY!: number;

  @ApiProperty({ description: 'Sức chứa (số nguyên không âm)', example: 1000, default: 0 })
  @IsOptional()
  @IsInt({ message: 'Sức chứa phải là số nguyên' })
  @Min(0, { message: 'Sức chứa phải lớn hơn hoặc bằng 0' })
  capacity?: number = 0;

  @ApiProperty({ description: 'Thời gian xử lý tại kho (phút, số nguyên không âm)', example: 30, default: 0 })
  @IsOptional()
  @IsInt({ message: 'Thời gian xử lý phải là số nguyên' })
  @Min(0, { message: 'Thời gian xử lý phải lớn hơn hoặc bằng 0' })
  timeToLoad?: number = 0;

  // supplierId is handled by the route parameter, not included in the body DTO
}