// filepath: d:\datn\code\final\src\statistic\statistic.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ParseIntPipe } from '@nestjs/common';

@ApiTags('statistic')
@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @Get('counts')
  @ApiOperation({ summary: 'Lấy số lượng tổng quát (orders, products, etc.)' })
  @ApiResponse({ status: 200, description: 'Số lượng các thực thể.' })
  getCounts() {
    return this.statisticService.getCounts();
  }

  @Get('orders/by-status')
  @ApiOperation({ summary: 'Lấy số lượng đơn hàng theo trạng thái' })
  @ApiResponse({
    status: 200,
    description: 'Số lượng đơn hàng theo trạng thái.',
  })
  getOrdersByStatus() {
    return this.statisticService.getOrdersByStatus();
  }

  @Get('products/by-supplier')
  @ApiOperation({ summary: 'Lấy số lượng sản phẩm theo nhà cung cấp' })
  @ApiResponse({
    status: 200,
    description: 'Số lượng sản phẩm theo nhà cung cấp.',
  })
  getProductsBySupplier() {
    return this.statisticService.getProductsBySupplier();
  }

  @Get('registrations/by-status')
  @ApiOperation({ summary: 'Lấy số lượng đăng ký dropship theo trạng thái' })
  @ApiResponse({
    status: 200,
    description: 'Số lượng đăng ký theo trạng thái.',
  })
  getRegistrationsByStatus() {
    return this.statisticService.getRegistrationsByStatus();
  }

  // Add more statistic endpoints as needed...
  // Example: Get warehouse capacity overview
  // @Get('warehouses/capacity')
  // @ApiOperation({ summary: 'Thống kê sức chứa kho' })
  // getWarehouseCapacityStats() {
  //   return this.statisticService.getWarehouseCapacityStats();
  // }
}
