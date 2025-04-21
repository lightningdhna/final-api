import { PartialType } from '@nestjs/swagger';
import { CreateDropshipperDto } from './create-dropshipper.dto';

export class UpdateDropshipperDto extends PartialType(CreateDropshipperDto) {}
