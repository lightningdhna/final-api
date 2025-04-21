import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateRegistrationStatusDto {
  @ApiProperty({
    description: 'Trạng thái đăng ký: 1 - chấp nhận, 2 - từ chối',
    example: 1,
    enum: [1, 2],
  })
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsInt({ message: 'Trạng thái phải là số nguyên' })
  @Min(1, { message: 'Trạng thái phải là 1 hoặc 2' })
  @Max(2, { message: 'Trạng thái phải là 1 hoặc 2' })
  status!: number;

  @ApiProperty({
    description: 'Ghi chú (tùy chọn)',
    example: 'Chấp nhận đăng ký',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  note?: string;
}
