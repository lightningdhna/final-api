import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({
    description: 'ID của nhà cung cấp (UUID - tùy chọn, sẽ tự động tạo nếu bỏ trống)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID nhà cung cấp phải là UUID hợp lệ' })
  id?: string;

  @ApiProperty({ description: 'Tên nhà cung cấp', example: 'Nhà Cung Cấp A' })
  @IsString({ message: 'Tên nhà cung cấp phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên nhà cung cấp không được để trống' })
  name!: string;

  // Add other fields relevant to Supplier if needed from your schema
  // e.g., address, contact info, etc.
}