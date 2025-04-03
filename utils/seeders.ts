/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';

import { Product } from './models';

const vietnameseFruitsAndFoods = [
  'Táo',
  'Cam',
  'Xoài',
  'Chuối',
  'Dưa hấu',
  'Ổi',
  'Lê',
  'Mít',
  'Sầu riêng',
  'Chôm chôm',
  'Phở',
  'Bún bò',
  'Cơm tấm',
  'Bánh mì',
  'Bánh xèo',
  'Chả giò',
  'Nem nướng',
  'Bánh cuốn',
];

// Hàm tạo một sản phẩm
function createProduct(): Product {
  const name =
    vietnameseFruitsAndFoods[
      Math.floor(Math.random() * vietnameseFruitsAndFoods.length)
    ];
  const date = faker.date.between({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 ngày trước
    to: new Date(Date.now()), // Ngày hiện tại
  });
  const supplierId = uuidv4();
  const price = Math.floor(Math.random() * 100_001) * 1_000; // Giá tròn đến hàng nghìn
  const note = Math.random() > 0.7 ? faker.lorem.sentence() : undefined; // 50% có note, 50% không có

  return {
    id: uuidv4(),
    name,
    date,
    supplierId,
    price,
    note,
  };
}

export function seedProduct(count?: number): Product[] | Product {
  if (typeof count === 'number' && count >= 0) {
    const products: Product[] = [];
    for (let i = 1; i <= count; i++) {
      products.push(createProduct());
    }
    return products;
  }

  // Nếu `number` không được truyền vào hoặc không hợp lệ, trả về một sản phẩm duy nhất
  return createProduct();
}

const test = () => {
  const products = seedProduct(1.1);
  console.log(products);
};
test();
