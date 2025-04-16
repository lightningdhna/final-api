// filepath: d:\datn\code\final\src\order\order.controller.ts
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
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đơn hàng mới' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Đơn hàng đã được tạo.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy Product hoặc Dropshipper (nếu có).',
  })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả đơn hàng (có thể lọc)' })
  @ApiQuery({
    name: 'productId',
    required: false,
    type: String,
    description: 'Lọc theo ID sản phẩm',
  })
  @ApiQuery({
    name: 'dropshipperId',
    required: false,
    type: String,
    description: 'Lọc theo ID dropshipper',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: Number,
    description: 'Lọc theo trạng thái',
  })
  @ApiResponse({ status: 200, description: 'Danh sách đơn hàng.' })
  findAll(
    @Query('productId', new ParseUUIDPipe({ optional: true }))
    productId?: string,
    @Query('dropshipperId', new ParseUUIDPipe({ optional: true }))
    dropshipperId?: string,
    @Query('status', new ParseIntPipe({ optional: true })) status?: number,
  ) {
    return this.orderService.findAll({ productId, dropshipperId, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết đơn hàng' })
  @ApiParam({ name: 'id', description: 'ID của đơn hàng (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Thông tin đơn hàng.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const order = await this.orderService.findOne(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật thông tin đơn hàng (ví dụ: status, note)',
  })
  @ApiParam({ name: 'id', description: 'ID của đơn hàng (UUID)', type: String })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({ status: 200, description: 'Đơn hàng đã được cập nhật.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa đơn hàng' })
  @ApiParam({ name: 'id', description: 'ID của đơn hàng (UUID)', type: String })
  @ApiResponse({ status: 204, description: 'Đơn hàng đã được xóa.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const order = await this.orderService.findOne(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    // Consider implications for related Plans
    await this.orderService.remove(id);
  }

  // --- Relationship Endpoints ---

  @Get(':id/plans')
  @ApiOperation({ summary: 'Lấy danh sách kế hoạch vận chuyển cho đơn hàng' })
  @ApiParam({ name: 'id', description: 'ID của đơn hàng (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Danh sách kế hoạch.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng.' })
  async findPlans(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.findPlans(id);
  }
}
