// filepath: d:\datn\code\final\src\dropshipper\dropshipper.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DropshipperService } from './dropshipper.service';
import { CreateDropshipperDto } from './dto/create-dropshipper.dto';
import { UpdateDropshipperDto } from './dto/update-dropshipper.dto';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('dropshipper')
@Controller('dropshipper')
export class DropshipperController {
  constructor(private readonly dropshipperService: DropshipperService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo dropshipper mới' })
  @ApiBody({ type: CreateDropshipperDto })
  @ApiResponse({ status: 201, description: 'Dropshipper đã được tạo.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  create(@Body() createDropshipperDto: CreateDropshipperDto) {
    return this.dropshipperService.create(createDropshipperDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả dropshipper' })
  @ApiResponse({ status: 200, description: 'Danh sách dropshipper.' })
  findAll() {
    return this.dropshipperService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết dropshipper' })
  @ApiParam({
    name: 'id',
    description: 'ID của dropshipper (UUID)',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Thông tin dropshipper.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dropshipper.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const dropshipper = await this.dropshipperService.findOne(id);
    if (!dropshipper) {
      throw new NotFoundException(`Dropshipper with ID ${id} not found`);
    }
    return dropshipper;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin dropshipper' })
  @ApiParam({
    name: 'id',
    description: 'ID của dropshipper (UUID)',
    type: String,
  })
  @ApiBody({ type: UpdateDropshipperDto })
  @ApiResponse({ status: 200, description: 'Dropshipper đã được cập nhật.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dropshipper.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDropshipperDto: UpdateDropshipperDto,
  ) {
    // Add logic similar to supplier update (check existence, pick changed fields) if needed
    return this.dropshipperService.update(id, updateDropshipperDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa dropshipper' })
  @ApiParam({
    name: 'id',
    description: 'ID của dropshipper (UUID)',
    type: String,
  })
  @ApiResponse({ status: 204, description: 'Dropshipper đã được xóa.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dropshipper.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const dropshipper = await this.dropshipperService.findOne(id);
    if (!dropshipper) {
      throw new NotFoundException(`Dropshipper with ID ${id} not found`);
    }
    await this.dropshipperService.remove(id);
  }

  // --- Relationship Endpoints ---

  @Get(':id/registrations')
  @ApiOperation({ summary: 'Lấy danh sách đăng ký theo dropshipper ID' })
  @ApiParam({
    name: 'id',
    description: 'ID của dropshipper (UUID)',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Danh sách đăng ký.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dropshipper.' })
  async findRegistrations(@Param('id', ParseUUIDPipe) id: string) {
    // Service should handle checking if dropshipper exists
    return this.dropshipperService.findRegistrations(id);
  }

  @Get(':id/orders')
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng theo dropshipper ID' })
  @ApiParam({
    name: 'id',
    description: 'ID của dropshipper (UUID)',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Danh sách đơn hàng.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dropshipper.' })
  async findOrders(@Param('id', ParseUUIDPipe) id: string) {
    // Service should handle checking if dropshipper exists
    return this.dropshipperService.findOrders(id);
  }
}
