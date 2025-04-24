import { ApiProperty } from '@nestjs/swagger';

// Định nghĩa DTO cho thông tin tổng hợp theo khoảng thời gian (tổng/tháng/năm)
export class PeriodMetricsDto {
  @ApiProperty({ description: 'Số lượng đơn hàng đã thực hiện', example: 120 })
  orderCount!: number;

  @ApiProperty({ 
    description: 'Tổng thời gian vận hành (đơn vị: giờ)', 
    example: 345.5 
  })
  operationTime!: number;

  @ApiProperty({ 
    description: 'Tổng quãng đường di chuyển (đơn vị: km)', 
    example: 5280.7 
  })
  totalDistance!: number;
}

// DTO chính cho thông tin tổng hợp của xe tải
export class TruckSummaryInfoDto {
  @ApiProperty({
    description: 'ID của xe tải',
    example: '3bc04716-1a42-4d12-983f-5b0941d8d831',
  })
  truckId!: string;

  @ApiProperty({
    description: 'Tên của xe tải',
    example: 'Xe Tải A',
  })
  truckName!: string;

  @ApiProperty({
    description: 'Loại xe tải',
    example: 'Container 20 tấn',
  })
  truckType!: string;

  @ApiProperty({
    description: 'Thông tin tổng hợp tất cả thời gian',
    type: PeriodMetricsDto,
  })
  allTime!: PeriodMetricsDto;

  @ApiProperty({
    description: 'Thông tin tổng hợp theo tháng hiện tại',
    type: PeriodMetricsDto,
  })
  currentMonth!: PeriodMetricsDto;

  @ApiProperty({
    description: 'Thông tin tổng hợp theo năm hiện tại',
    type: PeriodMetricsDto,
  })
  currentYear!: PeriodMetricsDto;

  @ApiProperty({ description: 'Tháng của thống kê', example: 4 })
  month!: number;

  @ApiProperty({ description: 'Năm của thống kê', example: 2025 })
  year!: number;

  @ApiProperty({ 
    description: 'Ngày xe tải được tạo', 
    example: '2023-01-01T00:00:00Z' 
  })
  createdAt!: Date;

  @ApiProperty({ 
    description: 'Hiệu suất sử dụng (tỷ lệ phần trăm thời gian hoạt động/tổng thời gian)', 
    example: 85.5 
  })
  utilizationRate!: number;
} 