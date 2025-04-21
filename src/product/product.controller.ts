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
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { isEqual, pickBy } from 'lodash';
import { ProductSummaryInfoDto } from './dto/summary-product.dto';

@ApiTags('product')
@Controller('product') // Đặt base path là /product
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // GET /product - Lấy tất cả sản phẩm
  @Get() // Route: GET /product
  @ApiOperation({ summary: 'Lấy danh sách tất cả sản phẩm' })
  @ApiResponse({ status: 200, description: 'Danh sách sản phẩm.' })
  async findAll() {
    return await this.productService.findAll();
  }

  // GET /product/supplier/:supplierId - Lấy sản phẩm theo nhà cung cấp
  @Get('supplier/:supplierId') // Route: GET /product/supplier/:supplierId
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm theo ID nhà cung cấp' })
  @ApiParam({
    name: 'supplierId',
    description: 'ID của nhà cung cấp (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách sản phẩm của nhà cung cấp.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà cung cấp.' })
  async findAllBySupplier(
    @Param('supplierId', ParseUUIDPipe) supplierId: string,
  ) {
    const products = await this.productService.findAllBySupplier(supplierId);
    if (products === null) {
      throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
    }
    return products;
  }

  // POST /product/supplier/:supplierId - Tạo sản phẩm cho nhà cung cấp
  @Post('supplier/:supplierId') // Route: POST /product/supplier/:supplierId
  @ApiOperation({ summary: 'Tạo sản phẩm mới cho nhà cung cấp' })
  @ApiParam({
    name: 'supplierId',
    description: 'ID của nhà cung cấp (UUID)',
    type: String,
  })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Sản phẩm đã được tạo thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà cung cấp.' })
  async create(
    @Param('supplierId', ParseUUIDPipe) supplierId: string,
    @Body() createProductDto: CreateProductDto,
  ) {
    const newProduct = await this.productService.create(
      supplierId,
      createProductDto,
    );
    if (newProduct === null) {
      throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
    }
    return newProduct;
  }

  // GET /product/warehouse/:warehouseId - Lấy sản phẩm theo kho
  @Get('warehouse/:warehouseId') // Route: GET /product/warehouse/:warehouseId
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm trong kho (kèm số lượng)' })
  @ApiParam({
    name: 'warehouseId',
    description: 'ID của kho (UUID)',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Danh sách sản phẩm trong kho.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy kho.' })
  async findAllByWarehouse(
    @Param('warehouseId', ParseUUIDPipe) warehouseId: string,
  ) {
    const productsInWarehouse =
      await this.productService.findAllByWarehouse(warehouseId);
    if (productsInWarehouse === null) {
      throw new NotFoundException(`Warehouse with ID ${warehouseId} not found`);
    }
    return productsInWarehouse;
  }

  // GET /product/:id - Lấy chi tiết sản phẩm
  @Get(':id') // Route: GET /product/:id
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một sản phẩm' })
  @ApiParam({ name: 'id', description: 'ID của sản phẩm (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Thông tin chi tiết sản phẩm.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const product = await this.productService.findOne(id);
    if (product === null) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  // PATCH /product/:id/supplier/:supplierId - Cập nhật sản phẩm
  @Patch(':id/supplier/:supplierId') // Route: PATCH /product/:id/supplier/:supplierId
  @ApiOperation({
    summary:
      'Cập nhật thông tin sản phẩm (yêu cầu ID sản phẩm và ID nhà cung cấp)',
  })
  @ApiParam({ name: 'id', description: 'ID của sản phẩm (UUID)', type: String })
  @ApiParam({
    name: 'supplierId',
    description: 'ID của nhà cung cấp (UUID)',
    type: String,
  })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: 200,
    description:
      'Sản phẩm đã được cập nhật thành công hoặc không có gì thay đổi.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sản phẩm hoặc nhà cung cấp không khớp.',
  }) // Cập nhật mô tả lỗi 404
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('supplierId', ParseUUIDPipe) supplierId: string, // Thêm supplierId vào param
    @Body() updateProductDto: UpdateProductDto,
  ) {
    // Kiểm tra sản phẩm tồn tại VÀ thuộc nhà cung cấp này
    const existingProduct = await this.productService.findOne(id);
    if (existingProduct === null || existingProduct.supplierId !== supplierId) {
      // Ném lỗi nếu không tìm thấy sản phẩm hoặc sản phẩm không thuộc nhà cung cấp được chỉ định
      throw new NotFoundException(
        `Product with ID ${id} associated with Supplier ID ${supplierId} not found`,
      );
    }

    const updatedFields = pickBy(updateProductDto, (value, key) => {
      return key in existingProduct && !isEqual(value, existingProduct[key]);
    });

    if (Object.keys(updatedFields).length === 0) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Không có trường nào cần cập nhật.',
        data: existingProduct,
      };
    }

    // Gọi service để cập nhật (service hiện tại chỉ cần id sản phẩm)
    return await this.productService.update(id, updatedFields);
    // Lưu ý: Nếu logic nghiệp vụ yêu cầu xác thực lại supplierId trong service khi update,
    // bạn cần điều chỉnh phương thức `update` trong ProductService.
  }

  // DELETE /product/:id - Xóa sản phẩm
  @Delete(':id') // Route: DELETE /product/:id
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa sản phẩm' })
  @ApiParam({ name: 'id', description: 'ID của sản phẩm (UUID)', type: String })
  @ApiResponse({ status: 204, description: 'Sản phẩm đã được xóa thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm.' })
  @ApiResponse({ status: 400, description: 'Không thể xóa do ràng buộc.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const deletedProduct = await this.productService.remove(id);
      if (deletedProduct === null) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw error;
    }
  }

  @Get(':id/summary')
  @ApiOperation({
    summary: 'Lấy thông tin tổng hợp về sản phẩm',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của sản phẩm (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin tổng hợp về sản phẩm.',
    type: ProductSummaryInfoDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm.' })
  async getSummaryInfo(@Param('id', ParseUUIDPipe) id: string) {
    const summaryInfo = await this.productService.getSummaryInfo(id);
    if (summaryInfo === null) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return summaryInfo;
  }
}
