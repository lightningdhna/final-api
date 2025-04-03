/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { isEqual, pickBy } from 'lodash';

@ApiTags('product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo sản phẩm mới' })
  @ApiBody({ type: CreateProductDto })
  async create(@Body() newProduct: CreateProductDto) {
    return await this.productService.create(newProduct);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả sản phẩm' })
  async findAll() {
    return await this.productService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một sản phẩm' })
  @ApiParam({
    name: 'id',
    description: 'ID của sản phẩm',
    example: '3bc04716-1a42-4d12-983f-5b0941d8d831',
  })
  async findOne(@Param('id') id: string) {
    const product = await this.productService.findOne(id);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin sản phẩm' })
  @ApiParam({
    name: 'id',
    description: 'ID của sản phẩm',
    example: '3bc04716-1a42-4d12-983f-5b0941d8d831',
  })
  @ApiBody({ type: UpdateProductDto })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const existingProduct = await this.productService.findOne(id);
    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    const updatedFields = pickBy(updateProductDto, (value, key) => {
      return !isEqual(value, existingProduct[key]);
    });

    if (Object.keys(updatedFields).length === 0) {
      // Trả về 200 với thông báo
      return {
        statusCode: 200,
        message: 'Không có trường nào cần cập nhật',
      };
    }

    return await this.productService.update(id, updatedFields);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa sản phẩm' })
  @ApiParam({
    name: 'id',
    description: 'ID của sản phẩm',
    example: '3bc04716-1a42-4d12-983f-5b0941d8d831',
  })
  async remove(@Param('id') id: string) {
    await this.productService.findOne(id); // Kiểm tra xem sản phẩm có tồn tại không
    return await this.productService.remove(id);
  }

  @Post('seed/:count')
  @ApiOperation({ summary: 'Seed dữ liệu sản phẩm' })
  @ApiParam({
    name: 'count',
    description: 'Số lượng sản phẩm cần seed',
    example: 10,
  })
  async seed(@Param('count') count: string) {
    const parsedCount = parseInt(count, 10);
    if (isNaN(parsedCount) || parsedCount <= 0) {
      throw new BadRequestException('Count phải là số nguyên dương');
    }
    return await this.productService.seed(parsedCount);
  }
}
