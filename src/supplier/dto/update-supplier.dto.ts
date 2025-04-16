import { PartialType } from '@nestjs/swagger'; // Use PartialType from swagger for optional fields in docs
import { CreateSupplierDto } from './create-supplier.dto';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

// PartialType makes all properties of CreateSupplierDto optional
export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {
  // You can override properties here if needed, e.g., add specific validation for update
  @ApiPropertyOptional({
    description: 'Tên nhà cung cấp',
    example: 'Nhà Cung Cấp A Updated',
  })
  @IsOptional()
  @IsString({ message: 'Tên nhà cung cấp phải là chuỗi ký tự' })
  @IsNotEmpty({
    message: 'Tên nhà cung cấp không được để trống nếu được cung cấp',
  })
  name?: string;

  // ID is usually not updatable and comes from the URL param, so it's often omitted here.
  // If you allow ID updates (generally not recommended), you'd add it back.
}
