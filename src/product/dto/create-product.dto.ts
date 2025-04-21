import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsOptional,
  IsNumber, // Thêm IsNumber
} from 'class-validator';

export class CreateProductDto {
  // id: Tự động tạo bởi Prisma
  // date: Tự động gán bởi service khi tạo
  // supplierId: Lấy từ route parameter

  @ApiProperty({ description: 'Tên sản phẩm', example: 'Táo Xanh' })
  @IsString({ message: 'Tên sản phẩm phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  name!: string;

  @ApiProperty({ description: 'Giá sản phẩm', example: 12000 })
  @IsInt({ message: 'Giá sản phẩm phải là số nguyên' })
  @Min(0, { message: 'Giá sản phẩm phải lớn hơn hoặc bằng 0' })
  price!: number;

  @ApiPropertyOptional({
    description: 'Ghi chú về sản phẩm',
    example: 'Táo nhập khẩu',
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú sản phẩm phải là chuỗi ký tự' })
  note?: string;

  @ApiPropertyOptional({
    description: 'Trọng lượng sản phẩm (kg)',
    example: 0.2,
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Trọng lượng phải là số' })
  @Min(0, { message: 'Trọng lượng phải lớn hơn hoặc bằng 0' })
  weight?: number = 0;

  @ApiPropertyOptional({
    description: 'Thể tích sản phẩm (m³)',
    example: 0.0001,
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Thể tích phải là số' })
  @Min(0, { message: 'Thể tích phải lớn hơn hoặc bằng 0' })
  volume?: number = 0;
}
