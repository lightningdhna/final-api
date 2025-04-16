// filepath: d:\datn\code\final\src\truck\truck.controller.ts
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
  Query,
} from '@nestjs/common';
import { TruckService } from './truck.service';
import { CreateTruckDto } from './dto/create-truck.dto';
import { UpdateTruckDto } from './dto/update-truck.dto';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('truck')
@Controller('truck')
export class TruckController {
  constructor(private readonly truckService: TruckService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo xe tải mới' })
  @ApiBody({ type: CreateTruckDto })
  @ApiResponse({ status: 201, description: 'Xe tải đã được tạo.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  create(@Body() createTruckDto: CreateTruckDto) {
    return this.truckService.create(createTruckDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả xe tải' })
  // Add query params for filtering if needed (e.g., by type, availability)
  @ApiResponse({ status: 200, description: 'Danh sách xe tải.' })
  findAll() {
    // Add @Query params if filtering is implemented
    return this.truckService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết xe tải' })
  @ApiParam({ name: 'id', description: 'ID của xe tải (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Thông tin xe tải.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy xe tải.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const truck = await this.truckService.findOne(id);
    if (!truck) {
      throw new NotFoundException(`Truck with ID ${id} not found`);
    }
    return truck;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin xe tải' })
  @ApiParam({ name: 'id', description: 'ID của xe tải (UUID)', type: String })
  @ApiBody({ type: UpdateTruckDto })
  @ApiResponse({ status: 200, description: 'Xe tải đã được cập nhật.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy xe tải.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTruckDto: UpdateTruckDto,
  ) {
    return this.truckService.update(id, updateTruckDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa xe tải' })
  @ApiParam({ name: 'id', description: 'ID của xe tải (UUID)', type: String })
  @ApiResponse({ status: 204, description: 'Xe tải đã được xóa.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy xe tải.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const truck = await this.truckService.findOne(id);
    if (!truck) {
      throw new NotFoundException(`Truck with ID ${id} not found`);
    }
    // Consider implications for related Plans
    await this.truckService.remove(id);
  }

  // --- Relationship Endpoints ---

  @Get(':id/plans')
  @ApiOperation({ summary: 'Lấy danh sách kế hoạch vận chuyển cho xe tải' })
  @ApiParam({ name: 'id', description: 'ID của xe tải (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Danh sách kế hoạch.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy xe tải.' })
  async findPlans(@Param('id', ParseUUIDPipe) id: string) {
    return this.truckService.findPlans(id);
  }
}
