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
import { DropshipperService } from './dropshipper.service';
import { CreateDropshipperDto } from './dto/create-dropshipper.dto';
import { UpdateDropshipperDto } from './dto/update-dropshipper.dto';
import {
  DropshipperSummaryDto,
  SupplierDropshipperSummaryDto,
} from './dto/summary-dropshipper.dto';
import { isEqual, pickBy } from 'lodash';
import { Prisma } from '@prisma/client';

@ApiTags('dropshipper')
@Controller('dropshipper')
export class DropshipperController {
  constructor(private readonly dropshipperService: DropshipperService) {}

  // POST /dropshipper - Tạo mới dropshipper
  @Post()
  @ApiOperation({ summary: 'Tạo mới dropshipper' })
  @ApiBody({ type: CreateDropshipperDto })
  @ApiResponse({ status: 201, description: 'Dropshipper đã được tạo.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  async create(@Body() createDropshipperDto: CreateDropshipperDto) {
    return await this.dropshipperService.create(createDropshipperDto);
  }

  // GET /dropshipper - Lấy tất cả dropshipper
  @Get()
  @ApiOperation({ summary: 'Lấy tất cả dropshipper' })
  @ApiResponse({ status: 200, description: 'Danh sách tất cả dropshipper.' })
  async findAll() {
    return await this.dropshipperService.findAll();
  }

  // GET /dropshipper/by-product/:productId - Lấy dropshipper theo sản phẩm
  @Get('by-product/:productId')
  @ApiOperation({ summary: 'Lấy danh sách dropshipper bán sản phẩm cụ thể' })
  @ApiParam({
    name: 'productId',
    description: 'ID của sản phẩm (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách dropshipper (có thể rỗng).',
  })
  async findByProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return await this.dropshipperService.findByProduct(productId);
  }

  // GET /dropshipper/by-supplier/:supplierId - Lấy dropshipper theo nhà cung cấp
  @Get('by-supplier/:supplierId')
  @ApiOperation({
    summary: 'Lấy danh sách dropshipper bán sản phẩm của nhà cung cấp',
  })
  @ApiParam({
    name: 'supplierId',
    description: 'ID của nhà cung cấp (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách dropshipper (có thể rỗng).',
  })
  async findBySupplier(@Param('supplierId', ParseUUIDPipe) supplierId: string) {
    return await this.dropshipperService.findBySupplier(supplierId);
  }

  // GET /dropshipper/:id - Lấy thông tin chi tiết của một dropshipper
  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một dropshipper' })
  @ApiParam({
    name: 'id',
    description: 'ID của dropshipper (UUID)',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Thông tin chi tiết dropshipper.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dropshipper.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const dropshipper = await this.dropshipperService.findOne(id);
    if (dropshipper === null) {
      throw new NotFoundException(`Không tìm thấy Dropshipper với ID ${id}`);
    }
    return dropshipper;
  }

  // GET /dropshipper/:id/summary - Lấy thông tin tổng hợp về một dropshipper
  @Get(':id/summary')
  @ApiOperation({ summary: 'Lấy thông tin tổng hợp về một dropshipper' })
  @ApiParam({
    name: 'id',
    description: 'ID của dropshipper (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin tổng hợp về dropshipper.',
    type: DropshipperSummaryDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dropshipper.' })
  async getSummary(@Param('id', ParseUUIDPipe) id: string) {
    const summary = await this.dropshipperService.getSummaryInfo(id);
    if (summary === null) {
      throw new NotFoundException(`Không tìm thấy Dropshipper với ID ${id}`);
    }
    return summary;
  }

  // GET /dropshipper/:id/supplier/:supplierId/summary - Lấy thông tin tổng hợp về dropshipper với một nhà cung cấp cụ thể
  @Get(':id/supplier/:supplierId/summary')
  @ApiOperation({
    summary:
      'Lấy thông tin tổng hợp về dropshipper với một nhà cung cấp cụ thể',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của dropshipper (UUID)',
    type: String,
  })
  @ApiParam({
    name: 'supplierId',
    description: 'ID của nhà cung cấp (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin tổng hợp về dropshipper với nhà cung cấp cụ thể.',
    type: SupplierDropshipperSummaryDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy dropshipper hoặc nhà cung cấp.',
  })
  async getSupplierSummary(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('supplierId', ParseUUIDPipe) supplierId: string,
  ) {
    const summary = await this.dropshipperService.getSupplierSummaryInfo(
      id,
      supplierId,
    );
    if (summary === null) {
      throw new NotFoundException(
        `Không tìm thấy Dropshipper với ID ${id} hoặc Supplier với ID ${supplierId}`,
      );
    }
    return summary;
  }

  // PATCH /dropshipper/:id - Cập nhật thông tin dropshipper
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin dropshipper' })
  @ApiParam({
    name: 'id',
    description: 'ID của dropshipper (UUID)',
    type: String,
  })
  @ApiBody({ type: UpdateDropshipperDto })
  @ApiResponse({
    status: 200,
    description:
      'Dropshipper đã được cập nhật thành công hoặc không có gì thay đổi.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dropshipper.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDropshipperDto: UpdateDropshipperDto,
  ) {
    // Kiểm tra sự tồn tại trước khi cập nhật
    const existingDropshipper = await this.dropshipperService.findOne(id);
    if (existingDropshipper === null) {
      throw new NotFoundException(`Không tìm thấy Dropshipper với ID ${id}`);
    }

    // Kiểm tra xem có trường nào thực sự thay đổi không
    const updatedFields = pickBy(updateDropshipperDto, (value, key) => {
      return (
        key in existingDropshipper && !isEqual(value, existingDropshipper[key])
      );
    });

    if (Object.keys(updatedFields).length === 0) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Không có trường nào cần cập nhật.',
        data: existingDropshipper,
      };
    }

    return await this.dropshipperService.update(id, updatedFields);
  }

  // DELETE /dropshipper/:id - Xóa dropshipper
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa dropshipper' })
  @ApiParam({
    name: 'id',
    description: 'ID của dropshipper (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Dropshipper đã được xóa thành công.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dropshipper.' })
  @ApiResponse({ status: 400, description: 'Không thể xóa do ràng buộc.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    // Kiểm tra tồn tại trước
    const dropshipperExists = await this.dropshipperService.findOne(id);
    if (!dropshipperExists) {
      throw new NotFoundException(`Không tìm thấy Dropshipper với ID ${id}`);
    }

    try {
      await this.dropshipperService.remove(id);
      // Không trả về gì cho 204 No Content
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Xử lý lỗi ràng buộc khóa ngoại
        if (error.code === 'P2003' || error.code === 'P2014') {
          throw new BadRequestException(
            `Không thể xóa dropshipper với ID ${id} do có tham chiếu tồn tại (đăng ký, đơn hàng).`,
          );
        }
      }
      throw error; // Ném lại các lỗi khác
    }
  }
}
