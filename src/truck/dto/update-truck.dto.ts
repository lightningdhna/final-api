// filepath: d:\datn\code\final\src\truck\dto\update-truck.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateTruckDto } from './create-truck.dto';

export class UpdateTruckDto extends PartialType(CreateTruckDto) {}
