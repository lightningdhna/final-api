// filepath: d:\datn\code\final\src\dropshipper\dto\update-dropshipper.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateDropshipperDto } from './create-dropshipper.dto';

export class UpdateDropshipperDto extends PartialType(CreateDropshipperDto) {}
