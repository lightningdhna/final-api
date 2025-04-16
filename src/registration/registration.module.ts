// filepath: d:\datn\code\final\src\registration\registration.module.ts
import { Module } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [RegistrationController],
  providers: [RegistrationService, PrismaService],
  exports: [RegistrationService],
})
export class RegistrationModule {}
