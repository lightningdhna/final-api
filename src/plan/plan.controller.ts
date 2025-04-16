// filepath: d:\datn\code\final\src\plan\plan.controller.ts
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
  ParseIntPipe,
  DefaultValuePipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ParseDatePipe } from '../pipes/parse-date.pipe'; // Assuming you create this pipe

@ApiTags('plan')
@Controller('plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo kế hoạch vận chuyển mới' })
  @ApiBody({ type: CreatePlanDto })
  @ApiResponse({ status: 201, description: 'Kế hoạch đã được tạo.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy Truck, Order hoặc Warehouse (nếu có).',
  })
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.planService.create(createPlanDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả kế hoạch (có thể lọc)' })
  @ApiQuery({ name: 'truckId', required: false, type: String })
  @ApiQuery({ name: 'orderId', required: false, type: String })
  @ApiQuery({ name: 'warehouseId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: Number })
  @ApiQuery({
    name: 'type',
    required: false,
    type: Number,
    description: '1: load, 2: unload',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: Date,
    description: 'Lọc theo ngày bắt đầu kế hoạch (planDate)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: Date,
    description: 'Lọc theo ngày kết thúc kế hoạch (planDate)',
  })
  @ApiResponse({ status: 200, description: 'Danh sách kế hoạch.' })
  findAll(
    @Query('truckId', new ParseUUIDPipe({ optional: true })) truckId?: string,
    @Query('orderId', new ParseUUIDPipe({ optional: true })) orderId?: string,
    @Query('warehouseId', new ParseUUIDPipe({ optional: true }))
    warehouseId?: string,
    @Query('status', new ParseIntPipe({ optional: true })) status?: number,
    @Query('type', new ParseIntPipe({ optional: true })) type?: number,
    @Query('startDate', new ParseDatePipe({ optional: true })) startDate?: Date,
    @Query('endDate', new ParseDatePipe({ optional: true })) endDate?: Date,
  ) {
    return this.planService.findAll({
      truckId,
      orderId,
      warehouseId,
      status,
      type,
      startDate,
      endDate,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết kế hoạch' })
  @ApiParam({ name: 'id', description: 'ID của kế hoạch (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Thông tin kế hoạch.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy kế hoạch.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const plan = await this.planService.findOne(id);
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    return plan;
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật thông tin kế hoạch (ví dụ: status, times)',
  })
  @ApiParam({ name: 'id', description: 'ID của kế hoạch (UUID)', type: String })
  @ApiBody({ type: UpdatePlanDto })
  @ApiResponse({ status: 200, description: 'Kế hoạch đã được cập nhật.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy kế hoạch.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePlanDto: UpdatePlanDto,
  ) {
    return this.planService.update(id, updatePlanDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa kế hoạch' })
  @ApiParam({ name: 'id', description: 'ID của kế hoạch (UUID)', type: String })
  @ApiResponse({ status: 204, description: 'Kế hoạch đã được xóa.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy kế hoạch.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const plan = await this.planService.findOne(id);
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    await this.planService.remove(id);
  }
}
