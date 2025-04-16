import { PrismaClient } from '@prisma/client';
import {
  seedSupplier,
  seedProduct,
  seedWarehouse,
  seedTruck,
  seedOrder,
  seedDropshipper,
  seedRegistration,
} from './seeders';
import 'dotenv/config';

const prisma = new PrismaClient();

// Seed Supplier
export async function seedSuppliers(count = 10) {
  const suppliers = seedSupplier(count);
  await prisma.supplier.createMany({ data: suppliers });
  return suppliers;
}

// Seed Product
export async function seedProducts(suppliers: ReturnType<typeof seedSupplier>) {
  const products: any[] = [];
  for (const supplier of suppliers) {
    products.push(...seedProduct([supplier.id], 30));
  }
  await prisma.product.createMany({ data: products });
  return products;
}

// Seed Warehouse: mỗi supplier có 10-20 warehouse
export async function seedWarehouses(
  suppliers: ReturnType<typeof seedSupplier>,
) {
  const warehouses: any[] = [];
  for (const supplier of suppliers) {
    const warehouseCount = Math.floor(Math.random() * 11) + 10; // 10-20
    const supplierWarehouses = seedWarehouse([supplier.id], warehouseCount);
    warehouses.push(...supplierWarehouses);
  }
  await prisma.warehouse.createMany({ data: warehouses });
  return warehouses;
}

// Seed WarehouseProduct
export async function seedWarehouseProducts(
  warehouses: any[],
  products: any[],
) {
  const warehouseProducts: {
    warehouseId: string;
    productId: string;
    quantity: number;
  }[] = [];
  for (const warehouse of warehouses) {
    const productCount = Math.floor(Math.random() * 6) + 15; // 15-20
    const shuffledProducts = products.sort(() => 0.5 - Math.random());
    const selectedProducts = shuffledProducts.slice(0, productCount);
    for (const product of selectedProducts) {
      warehouseProducts.push({
        warehouseId: warehouse.id,
        productId: product.id,
        quantity: Math.floor(Math.random() * 100) + 1,
      });
    }
  }
  await prisma.warehouseProduct.createMany({ data: warehouseProducts });
  return warehouseProducts;
}

// Seed Truck
export async function seedTrucks(count = 20) {
  const trucks = seedTruck(count);
  await prisma.truck.createMany({ data: trucks });
  return trucks;
}

// Seed Dropshipper
export async function seedDropshippers(count = 20) {
  const dropshippers = seedDropshipper(count);
  await prisma.dropshipper.createMany({ data: dropshippers });
  return dropshippers;
}

// Seed Registration: mỗi dropshipper đăng ký với khoảng 30 sản phẩm
export async function seedRegistrations(
  dropshippers: any[],
  products: any[],
) {
  const registrations: any[] = [];
  for (const dropshipper of dropshippers) {
    // Chọn ngẫu nhiên 30 sản phẩm cho mỗi dropshipper
    const shuffledProducts = products.sort(() => 0.5 - Math.random());
    const selectedProducts = shuffledProducts.slice(0, 30);
    for (const product of selectedProducts) {
      registrations.push({
        dropshipperId: dropshipper.id,
        productId: product.id,
        commissionFee: parseFloat((Math.random() * 100).toFixed(2)),
        createdDate: new Date(),
        status: Math.floor(Math.random() * 3), // 0, 1, 2
      });
    }
  }
  await prisma.registration.createMany({ data: registrations });
  return registrations;
}

// Seed Order
export async function seedOrders(products: any[], dropshippers: any[]) {
  const orders = seedOrder(
    products.map((p) => p.id),
    100,
    dropshippers.map((d) => d.id),
  );
  await prisma.order.createMany({ data: orders });
  return orders;
}

// Main function
async function main() {
  const suppliers = await seedSuppliers(10);
  const products = await seedProducts(suppliers);
  const warehouses = await seedWarehouses(suppliers);
  await seedWarehouseProducts(warehouses, products);
  await seedTrucks(20);
  const dropshippers = await seedDropshippers(20);
  await seedRegistrations(dropshippers, products);
  await seedOrders(products, dropshippers);
  console.log('Seeding completed!');
  await prisma.$disconnect();
}

if (require.main === module) {
  main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
}