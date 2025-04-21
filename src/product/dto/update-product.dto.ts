// Không dùng PartialType để kiểm soát rõ hơn các trường có thể cập nhật
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsInt,
  Min,
  IsNumber,
} from 'class-validator';

export class UpdateProductDto {
  // id: Lấy từ route parameter, không cập nhật qua body
  // supplierId: Thường không thay đổi qua endpoint này
  // date: Không cập nhật tự động ở đây

  @ApiPropertyOptional({ description: 'Tên sản phẩm', example: 'Táo Đỏ Mỹ' })
  @IsOptional()
  @IsString({ message: 'Tên sản phẩm phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống nếu được cung cấp' })
  name?: string;

  @ApiPropertyOptional({ description: 'Giá sản phẩm', example: 15000 })
  @IsOptional()
  @IsInt({ message: 'Giá sản phẩm phải là số nguyên' })
  @Min(0, { message: 'Giá sản phẩm phải lớn hơn hoặc bằng 0' })
  price?: number;

  @ApiPropertyOptional({
    description: 'Ghi chú về sản phẩm',
    example: 'Hàng mới về',
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú sản phẩm phải là chuỗi ký tự' })
  note?: string;

  @ApiPropertyOptional({
    description: 'Trọng lượng sản phẩm (kg)',
    example: 0.25,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Trọng lượng phải là số' })
  @Min(0, { message: 'Trọng lượng phải lớn hơn hoặc bằng 0' })
  weight?: number;

  @ApiPropertyOptional({
    description: 'Thể tích sản phẩm (m³)',
    example: 0.00012,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Thể tích phải là số' })
  @Min(0, { message: 'Thể tích phải lớn hơn hoặc bằng 0' })
  volume?: number;
}
