// filepath: d:\datn\code\final\src\registration\registration.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { Registration, Prisma } from '@prisma/client';

@Injectable()
export class RegistrationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createRegistrationDto: CreateRegistrationDto,
  ): Promise<Registration> {
    // Check if dropshipper and product exist
    const dropshipper = await this.prisma.dropshipper.findUnique({
      where: { id: createRegistrationDto.dropshipperId },
    });
    if (!dropshipper)
      throw new NotFoundException(
        `Dropshipper with ID ${createRegistrationDto.dropshipperId} not found`,
      );

    const product = await this.prisma.product.findUnique({
      where: { id: createRegistrationDto.productId },
    });
    if (!product)
      throw new NotFoundException(
        `Product with ID ${createRegistrationDto.productId} not found`,
      );

    try {
      return await this.prisma.registration.create({
        data: {
          ...createRegistrationDto,
          createdDate: new Date(), // Ensure createdDate is set
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'Registration for this dropshipper and product already exists.',
        );
      }
      throw error;
    }
  }

  async findAll(params: {
    dropshipperId?: string;
    productId?: string;
    status?: number;
  }): Promise<Registration[]> {
    const { dropshipperId, productId, status } = params;
    return this.prisma.registration.findMany({
      where: {
        dropshipperId: dropshipperId,
        productId: productId,
        status: status,
      },
      include: {
        // Optionally include related data
        dropshipper: true,
        product: true,
      },
    });
  }

  async findOne(
    dropshipperId: string,
    productId: string,
  ): Promise<Registration | null> {
    return this.prisma.registration.findUnique({
      where: {
        dropshipperId_productId: { dropshipperId, productId },
      },
      include: { dropshipper: true, product: true },
    });
  }

  async update(
    dropshipperId: string,
    productId: string,
    updateRegistrationDto: UpdateRegistrationDto,
  ): Promise<Registration> {
    const registration = await this.findOne(dropshipperId, productId);
    if (!registration) {
      throw new NotFoundException(
        `Registration not found for Dropshipper ${dropshipperId} and Product ${productId}`,
      );
    }
    return this.prisma.registration.update({
      where: {
        dropshipperId_productId: { dropshipperId, productId },
      },
      data: updateRegistrationDto,
    });
  }

  async remove(
    dropshipperId: string,
    productId: string,
  ): Promise<Registration> {
    const registration = await this.findOne(dropshipperId, productId);
    if (!registration) {
      throw new NotFoundException(
        `Registration not found for Dropshipper ${dropshipperId} and Product ${productId}`,
      );
    }
    return this.prisma.registration.delete({
      where: {
        dropshipperId_productId: { dropshipperId, productId },
      },
    });
  }
}
