import { Product } from './models';
import { PrismaClient } from '.prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { seedProduct } from './seeders';
import 'dotenv/config';

const prisma = new PrismaClient().$extends(withAccelerate());

export const seedProductRecord = async (count: number) => {
  const products = await seedProduct(count);
  if (Array.isArray(products)) {
    // Nếu `products` là một mảng, sử dụng `createMany`
    await prisma.product.createMany({ data: products });
    console.log(`${products.length} sản phẩm đã được thêm vào cơ sở dữ liệu.`);
  } else {
    // Nếu `products` là một sản phẩm duy nhất, sử dụng `create`
    await prisma.product.create({ data: products });
    console.log(`1 sản phẩm đã được thêm vào cơ sở dữ liệu.`);
  }
};

const main = async () => {
  await seedProductRecord(10);
};

// main();
