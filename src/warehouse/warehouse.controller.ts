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
  BadRequestException,
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
import { UpdateWarehouseProductDto } from './dto/update-warehouse.dto';
import { WarehouseSummaryDto } from './dto/summary-warehouse.dto';
import { isEqual, pickBy } from 'lodash';

@ApiTags('warehouse')
@Controller('warehouse') // Base path cho tất cả routes
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  // POST /warehouse/supplier/:supplierId - Tạo kho mới cho nhà cung cấp
  @Post('supplier/:supplierId')
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
    const newWarehouse = await this.warehouseService.create(
      supplierId,
      createWarehouseDto,
    );

    if (!newWarehouse) {
      throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
    }

    return newWarehouse;
  }

  // GET /warehouse - Lấy danh sách tất cả các kho
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả các kho' })
  @ApiResponse({ status: 200, description: 'Danh sách tất cả kho.' })
  async findAll() {
    return await this.warehouseService.findAll();
  }

  // GET /warehouse/supplier/:supplierId - Lấy danh sách kho theo ID nhà cung cấp
  @Get('supplier/:supplierId')
  @ApiOperation({ summary: 'Lấy danh sách kho theo ID nhà cung cấp' })
  @ApiParam({
    name: 'supplierId',
    description: 'ID của nhà cung cấp (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách kho của nhà cung cấp (có thể rỗng).',
  })
  async findAllBySupplier(
    @Param('supplierId', ParseUUIDPipe) supplierId: string,
  ) {
    return await this.warehouseService.findAllBySupplier(supplierId);
  }

  // GET /warehouse/by-product/:productId - Lấy danh sách kho theo ID sản phẩm
  @Get('by-product/:productId')
  @ApiOperation({
    summary: 'Lấy danh sách kho có chứa sản phẩm với số lượng > 0',
  })
  @ApiParam({
    name: 'productId',
    description: 'ID của sản phẩm (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách kho chứa sản phẩm (có thể rỗng).',
  })
  async findAllByProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return await this.warehouseService.findAllByProduct(productId);
  }

  // GET /warehouse/:id - Lấy thông tin chi tiết của một kho
  @Get(':id')
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

  // GET /warehouse/:id/summary - Lấy thông tin tổng hợp về một kho
  @Get(':id/summary')
  @ApiOperation({ summary: 'Lấy thông tin tổng hợp về một kho' })
  @ApiParam({ name: 'id', description: 'ID của kho (UUID)', type: String })
  @ApiResponse({
    status: 200,
    description: 'Thông tin tổng hợp về kho.',
    type: WarehouseSummaryDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy kho.' })
  async getSummaryInfo(@Param('id', ParseUUIDPipe) id: string) {
    const summaryInfo = await this.warehouseService.getSummaryInfo(id);
    if (!summaryInfo) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }
    return summaryInfo;
  }

  // PATCH /warehouse/:id - Cập nhật thông tin kho
  @Patch(':id')
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

    // Sử dụng lodash để tìm các trường thực sự thay đổi
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

  // PATCH /warehouse/:id/product/:productId - Cập nhật số lượng một mặt hàng trong kho
  @Patch(':id/product/:productId')
  @ApiOperation({ summary: 'Cập nhật số lượng một mặt hàng trong kho' })
  @ApiParam({ name: 'id', description: 'ID của kho (UUID)', type: String })
  @ApiParam({
    name: 'productId',
    description: 'ID của sản phẩm (UUID)',
    type: String,
  })
  @ApiBody({ type: UpdateWarehouseProductDto })
  @ApiResponse({
    status: 200,
    description: 'Số lượng sản phẩm đã được cập nhật.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy kho hoặc sản phẩm.',
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  async updateProductQuantity(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() updateWarehouseProductDto: UpdateWarehouseProductDto,
  ) {
    const updatedWarehouseProduct =
      await this.warehouseService.updateProductQuantity(
        id,
        productId,
        updateWarehouseProductDto,
      );

    if (!updatedWarehouseProduct) {
      throw new NotFoundException(
        `Warehouse with ID ${id} or Product with ID ${productId} not found`,
      );
    }

    return updatedWarehouseProduct;
  }

  // DELETE /warehouse/:id - Xóa kho
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa kho' })
  @ApiParam({ name: 'id', description: 'ID của kho (UUID)', type: String })
  @ApiResponse({ status: 204, description: 'Kho đã được xóa thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy kho.' })
  @ApiResponse({ status: 400, description: 'Không thể xóa do ràng buộc.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const warehouse = await this.warehouseService.findOne(id);
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    try {
      await this.warehouseService.remove(id);
      // Không trả về gì cho 204 No Content
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw error;
    }
  }
}
