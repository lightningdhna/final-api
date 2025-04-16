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
  NotFoundException,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { isEqual, pickBy } from 'lodash';

@ApiTags('supplier')
@Controller('supplier')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo nhà cung cấp mới' })
  @ApiBody({ type: CreateSupplierDto })
  @ApiResponse({
    status: 201,
    description: 'Nhà cung cấp đã được tạo thành công.',
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  async create(@Body() createSupplierDto: CreateSupplierDto) {
    return await this.supplierService.create(createSupplierDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả nhà cung cấp' })
  @ApiResponse({ status: 200, description: 'Danh sách nhà cung cấp.' })
  async findAll() {
    return await this.supplierService.findAll();
  }

  // Specific routes before generic :id route
  @Get('by-warehouse/:warehouseId')
  @ApiOperation({ summary: 'Lấy nhà cung cấp theo id kho' })
  @ApiParam({
    name: 'warehouseId',
    description: 'ID của kho (UUID)',
    example: '3bc04716-1a42-4d12-983f-5b0941d8d831',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Thông tin nhà cung cấp.' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy kho hoặc nhà cung cấp liên quan.',
  })
  async findByWarehouseId(
    @Param('warehouseId', ParseUUIDPipe) warehouseId: string,
  ) {
    const supplier = await this.supplierService.findByWarehouseId(warehouseId);
    if (!supplier) {
      throw new NotFoundException(
        `Supplier for Warehouse ID ${warehouseId} not found`,
      );
    }
    return supplier;
  }

  @Get('by-product/:productId')
  @ApiOperation({ summary: 'Lấy nhà cung cấp theo id sản phẩm' })
  @ApiParam({
    name: 'productId',
    description: 'ID của sản phẩm (UUID)',
    example: '3bc04716-1a42-4d12-983f-5b0941d8d831',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Thông tin nhà cung cấp.' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sản phẩm hoặc nhà cung cấp liên quan.',
  })
  async findByProductId(@Param('productId', ParseUUIDPipe) productId: string) {
    const supplier = await this.supplierService.findByProductId(productId);
    if (!supplier) {
      throw new NotFoundException(
        `Supplier for Product ID ${productId} not found`,
      );
    }
    return supplier;
  }

  @Get('by-dropshipper/:dropshipperId')
  @ApiOperation({ summary: 'Lấy danh sách nhà cung cấp theo id dropshipper' })
  @ApiParam({
    name: 'dropshipperId',
    description: 'ID của dropshipper (UUID)',
    example: '3bc04716-1a42-4d12-983f-5b0941d8d831',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Danh sách nhà cung cấp.' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy dropshipper hoặc nhà cung cấp liên quan.',
  })
  async findByDropshipperId(
    @Param('dropshipperId', ParseUUIDPipe) dropshipperId: string,
  ) {
    const suppliers =
      await this.supplierService.findByDropshipperId(dropshipperId);
    if (!suppliers || suppliers.length === 0) {
      throw new NotFoundException(
        `No suppliers found for Dropshipper ID ${dropshipperId}`,
      );
    }
    return suppliers;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một nhà cung cấp' })
  @ApiParam({
    name: 'id',
    description: 'ID của nhà cung cấp (UUID)',
    example: '3bc04716-1a42-4d12-983f-5b0941d8d831',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Thông tin chi tiết nhà cung cấp.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà cung cấp.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const supplier = await this.supplierService.findOne(id);
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return supplier;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin nhà cung cấp' })
  @ApiParam({
    name: 'id',
    description: 'ID của nhà cung cấp (UUID)',
    example: '3bc04716-1a42-4d12-983f-5b0941d8d831',
    type: String,
  })
  @ApiBody({ type: UpdateSupplierDto })
  @ApiResponse({
    status: 200,
    description:
      'Nhà cung cấp đã được cập nhật thành công hoặc không có gì thay đổi.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà cung cấp.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    const existingSupplier = await this.supplierService.findOne(id);
    if (!existingSupplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    // Use lodash to find fields that actually changed
    const updatedFields = pickBy(updateSupplierDto, (value, key) => {
      // Ensure comparison handles potential undefined values correctly
      return key in existingSupplier && !isEqual(value, existingSupplier[key]);
    });

    if (Object.keys(updatedFields).length === 0) {
      // Return 200 OK with a message if no fields need updating
      return {
        statusCode: HttpStatus.OK,
        message: 'Không có trường nào cần cập nhật.',
        data: existingSupplier, // Optionally return the existing data
      };
    }

    // Only pass fields that have changed to the service
    return await this.supplierService.update(id, updatedFields);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Return 204 No Content on successful deletion
  @ApiOperation({ summary: 'Xóa nhà cung cấp' })
  @ApiParam({
    name: 'id',
    description: 'ID của nhà cung cấp (UUID)',
    example: '3bc04716-1a42-4d12-983f-5b0941d8d831',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Nhà cung cấp đã được xóa thành công.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà cung cấp.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const supplier = await this.supplierService.findOne(id); // Check existence first
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    await this.supplierService.remove(id);
    // No content should be returned body for 204 response
  }
}
