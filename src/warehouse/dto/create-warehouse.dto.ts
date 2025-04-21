import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class CreateWarehouseDto {
  @ApiProperty({ description: 'Tên của kho', example: 'Kho Hà Nội' })
  @IsNotEmpty({ message: 'Tên kho không được để trống' })
  @IsString({ message: 'Tên kho phải là chuỗi' })
  name!: string;

  @ApiProperty({ description: 'Tọa độ X', example: 21.0245 })
  @IsNumber({}, { message: 'Tọa độ X phải là số' })
  locationX!: number;

  @ApiProperty({ description: 'Tọa độ Y', example: 105.8412 })
  @IsNumber({}, { message: 'Tọa độ Y phải là số' })
  locationY!: number;

  @ApiProperty({ description: 'Sức chứa của kho', example: 1000 })
  @IsNumber({}, { message: 'Sức chứa phải là số' })
  @Min(0, { message: 'Sức chứa phải lớn hơn hoặc bằng 0' })
  capacity!: number;

  @ApiProperty({ description: 'Thời gian xử lý tại kho (phút)', example: 30 })
  @IsNumber({}, { message: 'Thời gian xử lý phải là số' })
  @Min(0, { message: 'Thời gian xử lý phải lớn hơn hoặc bằng 0' })
  timeToLoad!: number;
}
