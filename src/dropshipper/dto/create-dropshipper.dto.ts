// filepath: d:\datn\code\final\src\dropshipper\dto\create-dropshipper.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateDropshipperDto {
  @ApiProperty({
    description: 'ID của dropshipper (UUID - tùy chọn)',
    required: false,
  })
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @ApiProperty({ description: 'Tên dropshipper', example: 'Dropshipper X' })
  @IsString()
  @IsNotEmpty()
  name!: string;
}
