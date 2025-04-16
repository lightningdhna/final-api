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
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { isEqual, pickBy } from 'lodash';

@ApiTags('warehouse')
@Controller() // Base path handled by specific routes
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post('supplier/:supplierId/warehouse')
  @ApiOperation({ summary: 'Tạo kho mới cho nhà cung cấp' })
  @ApiParam({
    name: 'supplierId',
    description: 'ID của nhà cung cấp (UUID)',
    type: String,
  })
  @ApiBody({ type: CreateWarehouseDto })
  @ApiResponse({ status: 201, description: 'Kho đã được tạo thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà cung cấp.' })
  async create(
    @Param('supplierId', ParseUUIDPipe) supplierId: string,
    @Body() createWarehouseDto: CreateWarehouseDto,
  ) {
    // Service method will handle checking if supplier exists before creating
    return await this.warehouseService.create(supplierId, createWarehouseDto);
  }

  @Get('supplier/:supplierId/warehouse')
  @ApiOperation({ summary: 'Lấy danh sách kho theo ID nhà cung cấp' })
  @ApiParam({
    name: 'supplierId',
    description: 'ID của nhà cung cấp (UUID)',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Danh sách kho.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà cung cấp.' })
  async findAllBySupplier(
    @Param('supplierId', ParseUUIDPipe) supplierId: string,
  ) {
    // Service method can handle checking if supplier exists if needed, or just return empty array
    return await this.warehouseService.findAllBySupplier(supplierId);
  }

  @Get('warehouse')
  @ApiOperation({ summary: 'Lấy danh sách tất cả các kho' })
  @ApiResponse({ status: 200, description: 'Danh sách tất cả kho.' })
  async findAll() {
    return await this.warehouseService.findAll();
  }

  @Get('warehouse/by-product/:productId')
  @ApiOperation({ summary: 'Lấy danh sách kho theo ID sản phẩm' })
  @ApiParam({
    name: 'productId',
    description: 'ID của sản phẩm (UUID)',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Danh sách kho chứa sản phẩm.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm.' }) // Or return empty list
  async findAllByProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return await this.warehouseService.findAllByProduct(productId);
  }

  @Get('warehouse/:id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một kho' })
  @ApiParam({ name: 'id', description: 'ID của kho (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Thông tin chi tiết kho.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy kho.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const warehouse = await this.warehouseService.findOne(id);
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }
    return warehouse;
  }

  @Patch('warehouse/:id')
  @ApiOperation({ summary: 'Cập nhật thông tin kho' })
  @ApiParam({ name: 'id', description: 'ID của kho (UUID)', type: String })
  @ApiBody({ type: UpdateWarehouseDto })
  @ApiResponse({
    status: 200,
    description: 'Kho đã được cập nhật thành công hoặc không có gì thay đổi.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy kho.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateWarehouseDto: UpdateWarehouseDto,
  ) {
    const existingWarehouse = await this.warehouseService.findOne(id);
    if (!existingWarehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    // Use lodash to find fields that actually changed
    const updatedFields = pickBy(updateWarehouseDto, (value, key) => {
      return (
        key in existingWarehouse && !isEqual(value, existingWarehouse[key])
      );
    });

    if (Object.keys(updatedFields).length === 0) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Không có trường nào cần cập nhật.',
        data: existingWarehouse,
      };
    }

    return await this.warehouseService.update(id, updatedFields);
  }

  @Delete('warehouse/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa kho' })
  @ApiParam({ name: 'id', description: 'ID của kho (UUID)', type: String })
  @ApiResponse({ status: 204, description: 'Kho đã được xóa thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy kho.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const warehouse = await this.warehouseService.findOne(id); // Check existence first
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }
    await this.warehouseService.remove(id);
    // No content should be returned for 204 response
  }
}
