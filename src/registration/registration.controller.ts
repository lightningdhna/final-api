// filepath: d:\datn\code\final\src\registration\registration.controller.ts
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
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('registration')
@Controller('registration')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đăng ký mới' })
  @ApiBody({ type: CreateRegistrationDto })
  @ApiResponse({ status: 201, description: 'Đăng ký đã được tạo.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy Dropshipper hoặc Product.',
  })
  create(@Body() createRegistrationDto: CreateRegistrationDto) {
    // Service should validate existence of dropshipperId and productId
    return this.registrationService.create(createRegistrationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả đăng ký (có thể lọc)' })
  @ApiQuery({
    name: 'dropshipperId',
    required: false,
    type: String,
    description: 'Lọc theo ID dropshipper',
  })
  @ApiQuery({
    name: 'productId',
    required: false,
    type: String,
    description: 'Lọc theo ID sản phẩm',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: Number,
    description: 'Lọc theo trạng thái',
  })
  @ApiResponse({ status: 200, description: 'Danh sách đăng ký.' })
  findAll(
    @Query('dropshipperId', new ParseUUIDPipe({ optional: true }))
    dropshipperId?: string,
    @Query('productId', new ParseUUIDPipe({ optional: true }))
    productId?: string,
    @Query('status', new ParseIntPipe({ optional: true })) status?: number,
  ) {
    return this.registrationService.findAll({
      dropshipperId,
      productId,
      status,
    });
  }

  @Get(':dropshipperId/:productId')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết đăng ký' })
  @ApiParam({
    name: 'dropshipperId',
    description: 'ID của dropshipper (UUID)',
    type: String,
  })
  @ApiParam({
    name: 'productId',
    description: 'ID của sản phẩm (UUID)',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Thông tin đăng ký.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đăng ký.' })
  async findOne(
    @Param('dropshipperId', ParseUUIDPipe) dropshipperId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    const registration = await this.registrationService.findOne(
      dropshipperId,
      productId,
    );
    if (!registration) {
      throw new NotFoundException(
        `Registration not found for Dropshipper ${dropshipperId} and Product ${productId}`,
      );
    }
    return registration;
  }

  @Patch(':dropshipperId/:productId')
  @ApiOperation({
    summary: 'Cập nhật thông tin đăng ký (ví dụ: status, commission)',
  })
  @ApiParam({
    name: 'dropshipperId',
    description: 'ID của dropshipper (UUID)',
    type: String,
  })
  @ApiParam({
    name: 'productId',
    description: 'ID của sản phẩm (UUID)',
    type: String,
  })
  @ApiBody({ type: UpdateRegistrationDto })
  @ApiResponse({ status: 200, description: 'Đăng ký đã được cập nhật.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đăng ký.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  async update(
    @Param('dropshipperId', ParseUUIDPipe) dropshipperId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() updateRegistrationDto: UpdateRegistrationDto,
  ) {
    return this.registrationService.update(
      dropshipperId,
      productId,
      updateRegistrationDto,
    );
  }

  @Delete(':dropshipperId/:productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa đăng ký' })
  @ApiParam({
    name: 'dropshipperId',
    description: 'ID của dropshipper (UUID)',
    type: String,
  })
  @ApiParam({
    name: 'productId',
    description: 'ID của sản phẩm (UUID)',
    type: String,
  })
  @ApiResponse({ status: 204, description: 'Đăng ký đã được xóa.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đăng ký.' })
  async remove(
    @Param('dropshipperId', ParseUUIDPipe) dropshipperId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    await this.registrationService.remove(dropshipperId, productId);
  }
}
