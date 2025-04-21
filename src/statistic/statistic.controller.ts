import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { StatisticService } from './statistic.service';
import { SupplierStatisticsDto } from './dto/supplier-statistic.dto';

@ApiTags('statistic')
@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @Get('supplier/:supplierId')
  @ApiOperation({
    summary: 'Lấy thống kê sản phẩm của nhà cung cấp',
    description:
      'Thống kê bao gồm: tồn kho, đơn hàng, doanh số cho mỗi sản phẩm',
  })
  @ApiParam({
    name: 'supplierId',
    description: 'ID của nhà cung cấp (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Thống kê sản phẩm của nhà cung cấp.',
    type: SupplierStatisticsDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà cung cấp.' })
  async getSupplierProductStatistics(
    @Param('supplierId', ParseUUIDPipe) supplierId: string,
  ) {
    const statistics =
      await this.statisticService.getSupplierProductStatistics(supplierId);
    if (!statistics) {
      throw new NotFoundException(
        `Không tìm thấy nhà cung cấp với ID ${supplierId}`,
      );
    }
    return statistics;
  }
}
