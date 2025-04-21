import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException, // Giữ lại ở Controller
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  BadRequestException, // Thêm để xử lý lỗi từ service
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
import { SupplierSummaryInfoDto } from './dto/summary-info.dto'; // Import DTO cho dashboard
import { isEqual, pickBy } from 'lodash';

@ApiTags('supplier')
@Controller('supplier') // Base path là /supplier
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  // GET /supplier - Lấy tất cả nhà cung cấp
  @Get() // Route: GET /supplier
  @ApiOperation({ summary: 'Lấy danh sách tất cả nhà cung cấp' })
  @ApiResponse({ status: 200, description: 'Danh sách nhà cung cấp.' })
  async findAll() {
    return await this.supplierService.findAll();
  }

  // GET /supplier/by-warehouse/:warehouseId - Lấy nhà cung cấp theo ID kho
  @Get('by-warehouse/:warehouseId') // Route: GET /supplier/by-warehouse/:warehouseId
  @ApiOperation({ summary: 'Lấy nhà cung cấp theo id kho' })
  @ApiParam({
    name: 'warehouseId',
    description: 'ID của kho (UUID)',
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
    if (supplier === null) {
      // Service trả về null nghĩa là warehouse không tồn tại hoặc không có supplier liên kết
      throw new NotFoundException(
        `Supplier for Warehouse ID ${warehouseId} not found`,
      );
    }
    return supplier;
  }

  // GET /supplier/by-product/:productId - Lấy nhà cung cấp theo ID sản phẩm
  @Get('by-product/:productId') // Route: GET /supplier/by-product/:productId
  @ApiOperation({ summary: 'Lấy nhà cung cấp theo id sản phẩm' })
  @ApiParam({
    name: 'productId',
    description: 'ID của sản phẩm (UUID)',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Thông tin nhà cung cấp.' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sản phẩm hoặc nhà cung cấp liên quan.',
  })
  async findByProductId(@Param('productId', ParseUUIDPipe) productId: string) {
    const supplier = await this.supplierService.findByProductId(productId);
    if (supplier === null) {
      // Service trả về null nghĩa là product không tồn tại hoặc không có supplier liên kết
      throw new NotFoundException(
        `Supplier for Product ID ${productId} not found`,
      );
    }
    return supplier;
  }

  // GET /supplier/by-dropshipper/:dropshipperId - Lấy nhà cung cấp theo ID dropshipper
  @Get('by-dropshipper/:dropshipperId') // Route: GET /supplier/by-dropshipper/:dropshipperId
  @ApiOperation({ summary: 'Lấy danh sách nhà cung cấp theo id dropshipper' })
  @ApiParam({
    name: 'dropshipperId',
    description: 'ID của dropshipper (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách nhà cung cấp (có thể rỗng).',
  })
  // Không cần 404 ở đây vì service trả về mảng rỗng nếu không tìm thấy dropshipper hoặc không có đăng ký
  async findByDropshipperId(
    @Param('dropshipperId', ParseUUIDPipe) dropshipperId: string,
  ) {
    // Service sẽ trả về mảng rỗng nếu không tìm thấy, không cần kiểm tra null/ném 404 ở đây
    return await this.supplierService.findByDropshipperId(dropshipperId);
  }

  // GET /supplier/:id - Lấy chi tiết nhà cung cấp
  @Get(':id') // Route: GET /supplier/:id
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một nhà cung cấp' })
  @ApiParam({
    name: 'id',
    description: 'ID của nhà cung cấp (UUID)',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Thông tin chi tiết nhà cung cấp.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà cung cấp.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const supplier = await this.supplierService.findOne(id);
    if (supplier === null) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return supplier;
  }

  // PATCH /supplier/:id - Cập nhật nhà cung cấp
  @Patch(':id') // Route: PATCH /supplier/:id
  @ApiOperation({ summary: 'Cập nhật thông tin nhà cung cấp' })
  @ApiParam({
    name: 'id',
    description: 'ID của nhà cung cấp (UUID)',
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
    // Kiểm tra sự tồn tại trước khi cập nhật
    const existingSupplier = await this.supplierService.findOne(id);
    if (existingSupplier === null) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    const updatedFields = pickBy(updateSupplierDto, (value, key) => {
      return key in existingSupplier && !isEqual(value, existingSupplier[key]);
    });

    if (Object.keys(updatedFields).length === 0) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Không có trường nào cần cập nhật.',
        data: existingSupplier,
      };
    }

    return await this.supplierService.update(id, updatedFields);
  }

  // --- Các API không cần thiết theo yêu cầu ---

  // POST /supplier - Thêm nhà cung cấp (không cần thiết)
  @Post() // Route: POST /supplier
  @ApiOperation({
    summary: 'Tạo nhà cung cấp mới (API này không cần thiết theo yêu cầu)',
  })
  @ApiBody({ type: CreateSupplierDto })
  @ApiResponse({ status: 201, description: 'Nhà cung cấp đã được tạo.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  async create(@Body() createSupplierDto: CreateSupplierDto) {
    // API này chỉ để hoàn thiện, không phải trọng tâm
    return await this.supplierService.create(createSupplierDto);
  }

  // DELETE /supplier/:id - Xóa nhà cung cấp (không cần thiết)
  @Delete(':id') // Route: DELETE /supplier/:id
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xóa nhà cung cấp (API này không cần thiết theo yêu cầu)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của nhà cung cấp (UUID)',
    type: String,
  })
  @ApiResponse({ status: 204, description: 'Nhà cung cấp đã được xóa.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà cung cấp.' })
  @ApiResponse({ status: 400, description: 'Không thể xóa do ràng buộc.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    // API này chỉ để hoàn thiện, không phải trọng tâm
    // Kiểm tra tồn tại trước
    const supplierExists = await this.supplierService.findOne(id);
    if (!supplierExists) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    try {
      await this.supplierService.remove(id);
      // Không trả về gì cho 204
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // Ném lại lỗi 400 từ service
      }
      throw error; // Ném lại các lỗi khác
    }
  }
  // ... existing code ...

  // GET /supplier/:id/dashboard - Lấy thông tin tổng hợp về nhà cung cấp
  @Get(':id/summary') // Route: GET /supplier/:id/dashboard
  @ApiOperation({
    summary: 'Lấy thông tin tổng hợp (dashboard) về nhà cung cấp',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của nhà cung cấp (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin tổng hợp về nhà cung cấp.',
    type: SupplierSummaryInfoDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà cung cấp.' })
  async getDashboardInfo(@Param('id', ParseUUIDPipe) id: string) {
    const dashboardInfo = await this.supplierService.getSummaryInfo(id);
    if (dashboardInfo === null) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return dashboardInfo;
  }
}
