import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  NotFoundException,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Patch,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationStatusDto } from './dto/update-registration.dto';
import { RegistrationResponseDto } from './dto/response-registration.dto';
import { RegistrationSummaryDto } from './dto/summary-registration.dto';

@ApiTags('registration')
@Controller('registration')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  // POST /registration - Tạo mới đăng ký
  @Post()
  @ApiOperation({ summary: 'Tạo mới đăng ký bán sản phẩm' })
  @ApiBody({ type: CreateRegistrationDto })
  @ApiResponse({
    status: 201,
    description: 'Đăng ký đã được tạo.',
    type: RegistrationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({
    status: 404,
    description: 'Sản phẩm hoặc dropshipper không tồn tại.',
  })
  @ApiResponse({ status: 409, description: 'Đăng ký đã tồn tại.' })
  async create(@Body() createRegistrationDto: CreateRegistrationDto) {
    const { productId, dropshipperId } = createRegistrationDto;

    // Kiểm tra sự tồn tại của sản phẩm và dropshipper
    const { productExists, dropshipperExists } =
      await this.registrationService.validateEntities(productId, dropshipperId);

    if (!productExists) {
      throw new NotFoundException(`Sản phẩm với ID ${productId} không tồn tại`);
    }

    if (!dropshipperExists) {
      throw new NotFoundException(
        `Dropshipper với ID ${dropshipperId} không tồn tại`,
      );
    }

    // Tạo đăng ký mới
    const registration = await this.registrationService.create(
      createRegistrationDto,
    );

    if (!registration) {
      throw new BadRequestException('Đăng ký đã tồn tại');
    }

    return registration;
  }

  // GET /registration/by-supplier/:supplierId - Lấy đăng ký theo nhà cung cấp và trạng thái
  @Get('by-supplier/:supplierId')
  @ApiOperation({
    summary: 'Lấy tất cả đăng ký theo nhà cung cấp và trạng thái (tùy chọn)',
  })
  @ApiParam({
    name: 'supplierId',
    description: 'ID của nhà cung cấp (UUID)',
    type: String,
  })
  @ApiQuery({
    name: 'status',
    description: 'Trạng thái đăng ký (0: chờ duyệt, 1: đã duyệt, 2: từ chối)',
    type: Number,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách đăng ký.',
    type: [RegistrationResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Nhà cung cấp không tồn tại.' })
  async findBySupplier(
    @Param('supplierId', ParseUUIDPipe) supplierId: string,
    @Query('status') status?: number,
  ) {
    // Kiểm tra nhà cung cấp tồn tại
    const supplierExists =
      await this.registrationService.supplierExists(supplierId);
    if (!supplierExists) {
      throw new NotFoundException(
        `Nhà cung cấp với ID ${supplierId} không tồn tại`,
      );
    }

    return await this.registrationService.findBySupplier(supplierId, status);
  }

  // GET /registration/by-dropshipper/:dropshipperId - Lấy đăng ký theo dropshipper và trạng thái
  @Get('by-dropshipper/:dropshipperId')
  @ApiOperation({
    summary: 'Lấy tất cả đăng ký theo dropshipper và trạng thái (tùy chọn)',
  })
  @ApiParam({
    name: 'dropshipperId',
    description: 'ID của dropshipper (UUID)',
    type: String,
  })
  @ApiQuery({
    name: 'status',
    description: 'Trạng thái đăng ký (0: chờ duyệt, 1: đã duyệt, 2: từ chối)',
    type: Number,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách đăng ký.',
    type: [RegistrationResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Dropshipper không tồn tại.' })
  async findByDropshipper(
    @Param('dropshipperId', ParseUUIDPipe) dropshipperId: string,
    @Query('status') status?: number,
  ) {
    // Kiểm tra dropshipper tồn tại
    const { dropshipperExists } =
      await this.registrationService.validateEntities('', dropshipperId);
    if (!dropshipperExists) {
      throw new NotFoundException(
        `Dropshipper với ID ${dropshipperId} không tồn tại`,
      );
    }

    return await this.registrationService.findByDropshipper(
      dropshipperId,
      status,
    );
  }

  // GET /registration/pending/supplier/:supplierId - Lấy tất cả đăng ký đang đợi duyệt của một nhà cung cấp
  @Get('pending/supplier/:supplierId')
  @ApiOperation({
    summary: 'Lấy tất cả đăng ký đang đợi duyệt của một nhà cung cấp',
  })
  @ApiParam({
    name: 'supplierId',
    description: 'ID của nhà cung cấp (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách đăng ký đang đợi duyệt.',
    type: [RegistrationResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Nhà cung cấp không tồn tại.' })
  async findPendingBySupplier(
    @Param('supplierId', ParseUUIDPipe) supplierId: string,
  ) {
    // Kiểm tra nhà cung cấp tồn tại
    const supplierExists =
      await this.registrationService.supplierExists(supplierId);
    if (!supplierExists) {
      throw new NotFoundException(
        `Nhà cung cấp với ID ${supplierId} không tồn tại`,
      );
    }

    return await this.registrationService.findPendingBySupplier(supplierId);
  }

  // PATCH /registration/approve/supplier/:supplierId/product/:productId/dropshipper/:dropshipperId - Chấp nhận đăng ký
  @Patch(
    'approve/supplier/:supplierId/product/:productId/dropshipper/:dropshipperId',
  )
  @ApiOperation({ summary: 'Chấp nhận đăng ký' })
  @ApiParam({
    name: 'supplierId',
    description: 'ID của nhà cung cấp (UUID)',
    type: String,
  })
  @ApiParam({
    name: 'productId',
    description: 'ID của sản phẩm (UUID)',
    type: String,
  })
  @ApiParam({
    name: 'dropshipperId',
    description: 'ID của dropshipper (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Đăng ký đã được chấp nhận.',
    type: RegistrationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Đăng ký không tồn tại hoặc nhà cung cấp không hợp lệ.',
  })
  async approve(
    @Param('supplierId', ParseUUIDPipe) supplierId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('dropshipperId', ParseUUIDPipe) dropshipperId: string,
  ) {
    // Kiểm tra sản phẩm thuộc nhà cung cấp
    const isValidProduct =
      await this.registrationService.isProductBelongsToSupplier(
        productId,
        supplierId,
      );

    if (!isValidProduct) {
      throw new BadRequestException(
        `Sản phẩm với ID ${productId} không thuộc nhà cung cấp với ID ${supplierId}`,
      );
    }

    // Cập nhật trạng thái đăng ký thành chấp nhận (1)
    const registration = await this.registrationService.updateStatus(
      productId,
      dropshipperId,
      1,
    );

    if (!registration) {
      throw new NotFoundException(`Đăng ký không tồn tại`);
    }

    return registration;
  }

  // PATCH /registration/reject/supplier/:supplierId/product/:productId/dropshipper/:dropshipperId - Từ chối đăng ký
  @Patch(
    'reject/supplier/:supplierId/product/:productId/dropshipper/:dropshipperId',
  )
  @ApiOperation({ summary: 'Từ chối đăng ký' })
  @ApiParam({
    name: 'supplierId',
    description: 'ID của nhà cung cấp (UUID)',
    type: String,
  })
  @ApiParam({
    name: 'productId',
    description: 'ID của sản phẩm (UUID)',
    type: String,
  })
  @ApiParam({
    name: 'dropshipperId',
    description: 'ID của dropshipper (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Đăng ký đã bị từ chối.',
    type: RegistrationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Đăng ký không tồn tại hoặc nhà cung cấp không hợp lệ.',
  })
  async reject(
    @Param('supplierId', ParseUUIDPipe) supplierId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('dropshipperId', ParseUUIDPipe) dropshipperId: string,
  ) {
    // Kiểm tra sản phẩm thuộc nhà cung cấp
    const isValidProduct =
      await this.registrationService.isProductBelongsToSupplier(
        productId,
        supplierId,
      );

    if (!isValidProduct) {
      throw new BadRequestException(
        `Sản phẩm với ID ${productId} không thuộc nhà cung cấp với ID ${supplierId}`,
      );
    }

    // Cập nhật trạng thái đăng ký thành từ chối (2)
    const registration = await this.registrationService.updateStatus(
      productId,
      dropshipperId,
      2,
    );

    if (!registration) {
      throw new NotFoundException(`Đăng ký không tồn tại`);
    }

    return registration;
  }

  // DELETE /registration/product/:productId/dropshipper/:dropshipperId - Hủy đăng ký
  @Delete('product/:productId/dropshipper/:dropshipperId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hủy đăng ký đã có' })
  @ApiParam({
    name: 'productId',
    description: 'ID của sản phẩm (UUID)',
    type: String,
  })
  @ApiParam({
    name: 'dropshipperId',
    description: 'ID của dropshipper (UUID)',
    type: String,
  })
  @ApiResponse({ status: 204, description: 'Đăng ký đã được xóa.' })
  @ApiResponse({ status: 404, description: 'Đăng ký không tồn tại.' })
  async remove(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('dropshipperId', ParseUUIDPipe) dropshipperId: string,
  ) {
    const registration = await this.registrationService.remove(
      productId,
      dropshipperId,
    );

    if (!registration) {
      throw new NotFoundException(`Đăng ký không tồn tại`);
    }

    // Không trả về gì cho 204 No Content
  }
  // DELETE /registration/dropshipper/:dropshipperId/supplier/:supplierId - Xóa tất cả đăng ký của dropshipper với supplier
  @Delete('dropshipper/:dropshipperId/supplier/:supplierId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xóa tất cả đăng ký của một dropshipper với một nhà cung cấp',
  })
  @ApiParam({
    name: 'dropshipperId',
    description: 'ID của dropshipper (UUID)',
    type: String,
  })
  @ApiParam({
    name: 'supplierId',
    description: 'ID của nhà cung cấp (UUID)',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Số lượng đăng ký đã xóa.' })
  @ApiResponse({
    status: 404,
    description: 'Dropshipper hoặc nhà cung cấp không tồn tại.',
  })
  async removeAllBySupplier(
    @Param('dropshipperId', ParseUUIDPipe) dropshipperId: string,
    @Param('supplierId', ParseUUIDPipe) supplierId: string,
  ) {
    // Kiểm tra dropshipper tồn tại
    const { dropshipperExists } =
      await this.registrationService.validateEntities('', dropshipperId);
    if (!dropshipperExists) {
      throw new NotFoundException(
        `Dropshipper với ID ${dropshipperId} không tồn tại`,
      );
    }

    // Kiểm tra nhà cung cấp tồn tại
    const supplierExists =
      await this.registrationService.supplierExists(supplierId);
    if (!supplierExists) {
      throw new NotFoundException(
        `Nhà cung cấp với ID ${supplierId} không tồn tại`,
      );
    }

    return await this.registrationService.removeAllByDropshipperAndSupplier(
      dropshipperId,
      supplierId,
    );
  }

  @Get(':dropshipperId/:productId/summary')
  @ApiOperation({
    summary: 'Lấy thông tin tổng hợp về đăng ký bán sản phẩm của dropshipper',
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
  @ApiResponse({
    status: 200,
    description: 'Thông tin tổng hợp về đăng ký.',
    type: RegistrationSummaryDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đăng ký.' })
  async getRegistrationSummary(
    @Param('dropshipperId', ParseUUIDPipe) dropshipperId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    const summaryInfo = await this.registrationService.getRegistrationSummary(
      dropshipperId,
      productId,
    );

    if (summaryInfo === null) {
      throw new NotFoundException(
        `Registration for dropshipper ${dropshipperId} and product ${productId} not found`,
      );
    }

    return summaryInfo;
  }
}
