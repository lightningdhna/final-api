// filepath: d:\datn\code\final\src\registration\dto\update-registration.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsInt, Min, IsIn, IsOptional } from 'class-validator';

export class UpdateRegistrationDto {
  @ApiPropertyOptional({ description: 'Phí hoa hồng', example: 12.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  commissionFee?: number;

  @ApiPropertyOptional({
    description: 'Trạng thái (0: pending, 1: approved, 2: rejected)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1, 2])
  status?: number;

  // dropshipperId and productId are typically not updatable via this DTO
}
