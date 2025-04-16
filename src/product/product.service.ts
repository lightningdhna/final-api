import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { seedProducts } from '../../utils/prisma-seeders';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(newProduct: CreateProductDto) {
    const data = {
      ...newProduct,
      date: new Date().toISOString(),
    };
    return await this.prisma.product.create({
      data: data,
    });
  }

  async update(id: string, updatedFields: Partial<UpdateProductDto>) {
    
    const data = {
      ...updatedFields,
      date: new Date().toISOString(),
    };
    return await this.prisma.product.update({
      where: { id },
      data: data,
    });
  }

  async findAll() {
    return await this.prisma.product.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.product.findUnique({
      where: { id },
    });
  }

  async remove(id: string) {
    return await this.prisma.product.delete({
      where: { id },
    });
  }

  async seed(count: number) {
    // return await seedProducts(count);
  }
}
