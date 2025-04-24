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
  BadRequestException,
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
import { UpdateStatusDto } from './dto/update-status.dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import { isEqual, pickBy } from 'lodash';
import { Prisma } from '@prisma/client';

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
  async create(@Body() createOrderDto: CreateOrderDto) {
    // Kiểm tra sản phẩm tồn tại
    const productExists = await this.orderService.productExists(createOrderDto.productId);
    if (!productExists) {
      throw new BadRequestException(`Sản phẩm với ID ${createOrderDto.productId} không tồn tại`);
    }

    // Kiểm tra dropshipper tồn tại (nếu có)
    if (createOrderDto.dropshipperId) {
      const dropshipperExists = await this.orderService.dropshipperExists(createOrderDto.dropshipperId);
      if (!dropshipperExists) {
        throw new BadRequestException(`Dropshipper với ID ${createOrderDto.dropshipperId} không tồn tại`);
      }
    }

    return await this.orderService.create(createOrderDto);
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
  async findAll(@Query() filterDto: FilterOrderDto) {
    try {
      // Nếu có supplierId, kiểm tra tồn tại
      if (filterDto.supplierId) {
        const supplierExists = await this.orderService.supplierExists(filterDto.supplierId);
        if (!supplierExists) {
          throw new BadRequestException(`Supplier với ID ${filterDto.supplierId} không tồn tại`);
        }
        
        // Nếu có cả status và supplierId
        if (filterDto.status !== undefined) {
          return await this.orderService.findBySupplierAndStatus(filterDto.supplierId, filterDto.status);
        }
        
        return await this.orderService.findBySupplier(filterDto.supplierId);
      }
      
      // Nếu có dropshipperId, kiểm tra tồn tại
      if (filterDto.dropshipperId) {
        const dropshipperExists = await this.orderService.dropshipperExists(filterDto.dropshipperId);
        if (!dropshipperExists) {
          throw new BadRequestException(`Dropshipper với ID ${filterDto.dropshipperId} không tồn tại`);
        }
        
        // Nếu có cả status và dropshipperId
        if (filterDto.status !== undefined) {
          return await this.orderService.findByDropshipperAndStatus(filterDto.dropshipperId, filterDto.status);
        }
        
        return await this.orderService.findByDropshipper(filterDto.dropshipperId);
      }
      
      // Nếu có productId, kiểm tra tồn tại
      if (filterDto.productId) {
        const productExists = await this.orderService.productExists(filterDto.productId);
        if (!productExists) {
          throw new BadRequestException(`Sản phẩm với ID ${filterDto.productId} không tồn tại`);
        }
        
        return await this.orderService.findByProduct(filterDto.productId);
      }
      
      // Nếu chỉ có status
      if (filterDto.status !== undefined) {
        return await this.orderService.findByStatus(filterDto.status);
      }
      
      // Mặc định: lấy tất cả
      return await this.orderService.findAll();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Lỗi khi lấy danh sách đơn hàng');
    }
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
    // Kiểm tra đơn hàng tồn tại
    const existingOrder = await this.orderService.findOne(id);
    if (existingOrder === null) {
      throw new NotFoundException(`Đơn hàng với ID ${id} không tồn tại`);
    }

    // Kiểm tra sản phẩm tồn tại nếu có cập nhật productId
    if (updateOrderDto.productId && updateOrderDto.productId !== existingOrder.productId) {
      const productExists = await this.orderService.productExists(updateOrderDto.productId);
      if (!productExists) {
        throw new BadRequestException(`Sản phẩm với ID ${updateOrderDto.productId} không tồn tại`);
      }
    }

    // Kiểm tra dropshipper tồn tại nếu có cập nhật dropshipperId
    if (updateOrderDto.dropshipperId && updateOrderDto.dropshipperId !== existingOrder.dropshipperId) {
      const dropshipperExists = await this.orderService.dropshipperExists(updateOrderDto.dropshipperId);
      if (!dropshipperExists) {
        throw new BadRequestException(`Dropshipper với ID ${updateOrderDto.dropshipperId} không tồn tại`);
      }
    }

    // Kiểm tra các trường thay đổi
    const updatedFields = pickBy(updateOrderDto, (value, key) => {
      if (key === 'timeCreated' && value) {
        return !isEqual(new Date(value).toISOString(), existingOrder[key]?.toISOString());
      }
      return !isEqual(value, existingOrder[key]);
    });

    if (Object.keys(updatedFields).length === 0) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Không có trường nào cần cập nhật.',
        data: existingOrder,
      };
    }

    try {
      return await this.orderService.update(id, updatedFields);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(`Lỗi khi cập nhật đơn hàng: ${error.message}`);
      }
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa đơn hàng' })
  @ApiParam({ name: 'id', description: 'ID của đơn hàng (UUID)', type: String })
  @ApiResponse({ status: 204, description: 'Đơn hàng đã được xóa.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng.' })
  @ApiResponse({ status: 400, description: 'Không thể xóa do ràng buộc.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    // Kiểm tra đơn hàng tồn tại
    const orderExists = await this.orderService.findOne(id);
    if (!orderExists) {
      throw new NotFoundException(`Đơn hàng với ID ${id} không tồn tại`);
    }

    try {
      await this.orderService.remove(id);
      // 204 No Content - không trả về dữ liệu
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Xử lý lỗi ràng buộc khóa ngoại
        if (error.code === 'P2003' || error.code === 'P2014') {
          throw new BadRequestException(
            `Không thể xóa đơn hàng với ID ${id} do có tham chiếu tồn tại.`,
          );
        }
      }
      throw error;
    }
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

  @Get('by-status/:status')
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng theo trạng thái' })
  @ApiParam({
    name: 'status',
    description: 'Trạng thái đơn hàng (0: chờ xử lý, 1: đang xử lý, 2: đang vận chuyển, 3: hoàn thành)',
    type: Number,
  })
  @ApiResponse({ status: 200, description: 'Danh sách đơn hàng.' })
  async findByStatus(@Param('status') status: string) {
    const statusNumber = parseInt(status, 10);
    if (isNaN(statusNumber) || statusNumber < 0 || statusNumber > 3) {
      throw new BadRequestException('Trạng thái đơn hàng không hợp lệ');
    }
    
    return await this.orderService.findByStatus(statusNumber);
  }

  @Get('by-supplier/:supplierId')
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng theo nhà cung cấp' })
  @ApiParam({
    name: 'supplierId',
    description: 'ID của nhà cung cấp (UUID)',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Danh sách đơn hàng.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà cung cấp.' })
  async findBySupplier(@Param('supplierId', ParseUUIDPipe) supplierId: string) {
    const supplierExists = await this.orderService.supplierExists(supplierId);
    if (!supplierExists) {
      throw new NotFoundException(`Nhà cung cấp với ID ${supplierId} không tồn tại`);
    }
    
    return await this.orderService.findBySupplier(supplierId);
  }
  
  @Get('by-supplier/:supplierId/status/:status')
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng theo nhà cung cấp và trạng thái' })
  @ApiParam({
    name: 'supplierId',
    description: 'ID của nhà cung cấp (UUID)',
    type: String,
  })
  @ApiParam({
    name: 'status',
    description: 'Trạng thái đơn hàng (0: chờ xử lý, 1: đang xử lý, 2: đang vận chuyển, 3: hoàn thành)',
    type: Number,
  })
  @ApiResponse({ status: 200, description: 'Danh sách đơn hàng.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà cung cấp.' })
  async findBySupplierAndStatus(
    @Param('supplierId', ParseUUIDPipe) supplierId: string,
    @Param('status') status: string,
  ) {
    const supplierExists = await this.orderService.supplierExists(supplierId);
    if (!supplierExists) {
      throw new NotFoundException(`Nhà cung cấp với ID ${supplierId} không tồn tại`);
    }
    
    const statusNumber = parseInt(status, 10);
    if (isNaN(statusNumber) || statusNumber < 0 || statusNumber > 3) {
      throw new BadRequestException('Trạng thái đơn hàng không hợp lệ');
    }
    
    return await this.orderService.findBySupplierAndStatus(supplierId, statusNumber);
  }

  @Get('by-dropshipper/:dropshipperId')
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng theo dropshipper' })
  @ApiParam({
    name: 'dropshipperId',
    description: 'ID của dropshipper (UUID)',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Danh sách đơn hàng.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dropshipper.' })
  async findByDropshipper(@Param('dropshipperId', ParseUUIDPipe) dropshipperId: string) {
    const dropshipperExists = await this.orderService.dropshipperExists(dropshipperId);
    if (!dropshipperExists) {
      throw new NotFoundException(`Dropshipper với ID ${dropshipperId} không tồn tại`);
    }
    
    return await this.orderService.findByDropshipper(dropshipperId);
  }
  
  @Get('by-dropshipper/:dropshipperId/status/:status')
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng theo dropshipper và trạng thái' })
  @ApiParam({
    name: 'dropshipperId',
    description: 'ID của dropshipper (UUID)',
    type: String,
  })
  @ApiParam({
    name: 'status',
    description: 'Trạng thái đơn hàng (0: chờ xử lý, 1: đang xử lý, 2: đang vận chuyển, 3: hoàn thành)',
    type: Number,
  })
  @ApiResponse({ status: 200, description: 'Danh sách đơn hàng.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dropshipper.' })
  async findByDropshipperAndStatus(
    @Param('dropshipperId', ParseUUIDPipe) dropshipperId: string,
    @Param('status') status: string,
  ) {
    const dropshipperExists = await this.orderService.dropshipperExists(dropshipperId);
    if (!dropshipperExists) {
      throw new NotFoundException(`Dropshipper với ID ${dropshipperId} không tồn tại`);
    }
    
    const statusNumber = parseInt(status, 10);
    if (isNaN(statusNumber) || statusNumber < 0 || statusNumber > 3) {
      throw new BadRequestException('Trạng thái đơn hàng không hợp lệ');
    }
    
    return await this.orderService.findByDropshipperAndStatus(dropshipperId, statusNumber);
  }

  @Get('by-product/:productId')
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng theo sản phẩm' })
  @ApiParam({
    name: 'productId',
    description: 'ID của sản phẩm (UUID)',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Danh sách đơn hàng.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm.' })
  async findByProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    const productExists = await this.orderService.productExists(productId);
    if (!productExists) {
      throw new NotFoundException(`Sản phẩm với ID ${productId} không tồn tại`);
    }
    
    return await this.orderService.findByProduct(productId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái đơn hàng' })
  @ApiParam({
    name: 'id',
    description: 'ID của đơn hàng (UUID)',
    type: String,
  })
  @ApiBody({ type: UpdateStatusDto })
  @ApiResponse({ status: 200, description: 'Trạng thái đơn hàng đã được cập nhật.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    // Kiểm tra đơn hàng tồn tại
    const existingOrder = await this.orderService.findOne(id);
    if (existingOrder === null) {
      throw new NotFoundException(`Đơn hàng với ID ${id} không tồn tại`);
    }

    // Nếu trạng thái không thay đổi và không có note mới
    if (
      existingOrder.status === updateStatusDto.status &&
      (!updateStatusDto.note || updateStatusDto.note === existingOrder.note)
    ) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Không có trường nào cần cập nhật.',
        data: existingOrder,
      };
    }

    try {
      return await this.orderService.updateStatus(id, updateStatusDto);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(`Lỗi khi cập nhật trạng thái đơn hàng: ${error.message}`);
      }
      throw error;
    }
  }
}
