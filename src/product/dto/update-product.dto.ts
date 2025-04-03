import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({
    description: 'ID của sản phẩm (UUID)',
    example: '3bc04716-1a42-4d12-983f-5b0941d8d831',
  })
  @IsUUID()
  id!: string; // Trường bắt buộc

  @ApiPropertyOptional({ description: 'Tên sản phẩm', example: 'Táo đỏ' })
  @IsOptional()
  @IsString({ message: 'Tên sản phẩm phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  name?: string;

  @ApiPropertyOptional({ description: 'Giá sản phẩm', example: 15000 })
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    description: 'Ghi chú về sản phẩm',
    example: 'Sản phẩm chất lượng cao',
  })
  @IsOptional()
  note?: string;
}