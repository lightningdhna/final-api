// filepath: d:\datn\code\final\src\dropshipper\dropshipper.module.ts
import { Module } from '@nestjs/common';
import { DropshipperService } from './dropshipper.service';
import { DropshipperController } from './dropshipper.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [DropshipperController],
  providers: [DropshipperService, PrismaService],
  exports: [DropshipperService],
})
export class DropshipperModule {}