import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, IsUUID } from 'class-validator';

export class CreateRegistrationDto {
  @ApiProperty({
    description: 'ID của dropshipper',
    example: '3bc04716-1a42-4d12-983f-5b0941d8d831',
  })
  @IsNotEmpty({ message: 'ID của dropshipper không được để trống' })
  @IsUUID('4', { message: 'ID của dropshipper phải là UUID hợp lệ' })
  dropshipperId!: string;

  @ApiProperty({
    description: 'ID của sản phẩm',
    example: '3bc04716-1a42-4d12-983f-5b0941d8d831',
  })
  @IsNotEmpty({ message: 'ID của sản phẩm không được để trống' })
  @IsUUID('4', { message: 'ID của sản phẩm phải là UUID hợp lệ' })
  productId!: string;

  @ApiProperty({
    description: 'Phí hoa hồng',
    example: 5.5,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Phí hoa hồng không được để trống' })
  @IsNumber({}, { message: 'Phí hoa hồng phải là số' })
  @Min(0, { message: 'Phí hoa hồng không được âm' })
  commissionFee!: number;
}
