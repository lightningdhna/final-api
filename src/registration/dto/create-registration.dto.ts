// filepath: d:\datn\code\final\src\registration\dto\create-registration.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsInt, Min, IsIn } from 'class-validator';

export class CreateRegistrationDto {
  @ApiProperty({ description: 'ID của dropshipper (UUID)', example: '...' })
  @IsUUID()
  dropshipperId!: string;

  @ApiProperty({ description: 'ID của sản phẩm (UUID)', example: '...' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ description: 'Phí hoa hồng', example: 10.5 })
  @IsNumber()
  @Min(0)
  commissionFee!: number;

  @ApiProperty({
    description: 'Trạng thái (0: pending, 1: approved, 2: rejected)',
    example: 0,
  })
  @IsInt()
  @IsIn([0, 1, 2]) // Ensure status is one of the allowed values
  status!: number;

  // createdDate is set by the service
}
