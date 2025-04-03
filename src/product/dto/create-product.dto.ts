import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsUUID,
  IsDate,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({
    description: 'ID của sản phẩm (UUID)',
    example: '3bc04716-1a42-4d12-983f-5b0941d8d831',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID sản phẩm phải là UUID hợp lệ' })
  id?: string;

  @ApiProperty({ description: 'Tên sản phẩm', example: 'Táo' })
  @IsString({
    message:
      'Thiếu thông tin tên sản phẩm hoặc thông tin tên sản phẩm không hợp lệ',
  })
  name!: string;

  @ApiProperty({
    description: 'Ngày tạo sản phẩm',
    example: '2025-03-31T12:00:00.000Z',
  })
  @IsOptional()
  @IsDate({ message: 'Ngày tạo sản phẩm phải là định dạng ngày hợp lệ' })
  @Type(() => Date)
  date?: string | Date;

  @ApiProperty({
    description: 'ID của nhà cung cấp (UUID)',
    example: '314de687-5713-44df-8121-5b2634e1b07b',
  })
  @IsUUID('4', { message: 'ID của nhà cung cấp phải là UUID hợp lệ' })
  supplierId!: string;

  @ApiProperty({ description: 'Giá sản phẩm', example: 10000 })
  @IsInt({ message: 'Giá sản phẩm phải là số nguyên' })
  @Min(0, { message: 'Giá sản phẩm phải lớn hơn hoặc bằng 0' })
  price!: number;

  @ApiPropertyOptional({
    description: 'Ghi chú về sản phẩm',
    example: 'Sản phẩm chất lượng cao',
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú sản phẩm phải là chuỗi ký tự' })
  note?: string;
}
