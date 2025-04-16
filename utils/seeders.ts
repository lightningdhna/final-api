import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';

// Định nghĩa các interface/model đơn giản cho seed
export interface Supplier {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  date: Date;
  supplierId: string;
  price: number;
  note?: string;
  weight: number;
  volume: number;
}

export interface Warehouse {
  id: string;
  name: string;
  locationX: number;
  locationY: number;
  capacity: number;
  timeToLoad: number;
  supplierId: string;
}

export interface Truck {
  id: string;
  name: string;
  type: string;
  maxWeight: number;
  maxVolume: number;
  averageSpeed: number;
  timeActive: Date;
  timeInactive: Date;
}

export interface Dropshipper {
  id: string;
  name: string;
}

export interface Registration {
  dropshipperId: string;
  productId: string;
  commissionFee: number;
  createdDate: Date;
  status: number; // 0: pending, 1: approved, 2: rejected
}

export interface Order {
  id: string;
  productId: string;
  dropshipperId?: string | null;
  timeCreated: Date;
  status: number;
  quantity: number;
  volume: number;
  weight: number;
  locationX: number;
  locationY: number;
  note?: string;
}

// Seed Supplier
export function seedSupplier(count = 5): Supplier[] {
  const suppliers: Supplier[] = [];
  for (let i = 0; i < count; i++) {
    suppliers.push({
      id: uuidv4(),
      name: faker.company.name(),
    });
  }
  return suppliers;
}

// Seed Product (nhận vào danh sách supplierId hợp lệ)
export function seedProduct(supplierIds: string[], count = 10): Product[] {
  const products: Product[] = [];
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
  for (let i = 0; i < count; i++) {
    const name =
      vietnameseFruitsAndFoods[
        Math.floor(Math.random() * vietnameseFruitsAndFoods.length)
      ];
    const date = faker.date.between({
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      to: new Date(Date.now()),
    });
    const supplierId =
      supplierIds[Math.floor(Math.random() * supplierIds.length)];
    const price = Math.floor(Math.random() * 100_001) * 1_000;
    const note = Math.random() > 0.7 ? faker.lorem.sentence() : undefined;
    const weight = parseFloat((Math.random() * 10).toFixed(2));
    const volume = parseFloat((Math.random() * 5).toFixed(2));
    products.push({
      id: uuidv4(),
      name,
      date,
      supplierId,
      price,
      note,
      weight,
      volume,
    });
  }
  return products;
}

// Seed Warehouse (nhận vào danh sách supplierId hợp lệ)
export function seedWarehouse(supplierIds: string[], count = 5): Warehouse[] {
  const warehouses: Warehouse[] = [];
  for (let i = 0; i < count; i++) {
    warehouses.push({
      id: uuidv4(),
      name: `Kho ${faker.location.city()} ${i + 1}`,
      locationX: faker.number.float({ min: 0, max: 1000 }),
      locationY: faker.number.float({ min: 0, max: 1000 }),
      capacity: faker.number.int({ min: 100, max: 10000 }),
      timeToLoad: faker.number.int({ min: 5, max: 60 }),
      supplierId: supplierIds[Math.floor(Math.random() * supplierIds.length)],
    });
  }
  return warehouses;
}

// Seed Truck
export function seedTruck(count = 5): Truck[] {
  const types = ['Xe tải nhỏ', 'Xe tải lớn', 'Xe container'];
  const trucks: Truck[] = [];
  for (let i = 0; i < count; i++) {
    const now = new Date();
    trucks.push({
      id: uuidv4(),
      name: `Truck ${i + 1}`,
      type: types[Math.floor(Math.random() * types.length)],
      maxWeight: parseFloat((Math.random() * 10000 + 1000).toFixed(2)),
      maxVolume: parseFloat((Math.random() * 100 + 10).toFixed(2)),
      averageSpeed: parseFloat((Math.random() * 80 + 20).toFixed(2)),
      timeActive: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        6,
        0,
        0,
      ),
      timeInactive: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        18,
        0,
        0,
      ),
    });
  }
  return trucks;
}

// Seed Dropshipper
export function seedDropshipper(count = 5): Dropshipper[] {
  const dropshippers: Dropshipper[] = [];
  for (let i = 0; i < count; i++) {
    dropshippers.push({
      id: uuidv4(),
      name: faker.person.fullName(),
    });
  }
  return dropshippers;
}

// Seed Registration (nhận vào danh sách dropshipperId và productId hợp lệ)
export function seedRegistration(
  dropshipperIds: string[],
  productIds: string[],
  count = 20,
): Registration[] {
  const registrations: Registration[] = [];
  for (let i = 0; i < count; i++) {
    const dropshipperId =
      dropshipperIds[Math.floor(Math.random() * dropshipperIds.length)];
    const productId =
      productIds[Math.floor(Math.random() * productIds.length)];
    const commissionFee = parseFloat((Math.random() * 100).toFixed(2));
    const createdDate = faker.date.recent({ days: 30 });
    const status = faker.number.int({ min: 0, max: 2 }); // 0: pending, 1: approved, 2: rejected
    registrations.push({
      dropshipperId,
      productId,
      commissionFee,
      createdDate,
      status,
    });
  }
  return registrations;
}

// Seed Order (nhận vào danh sách productId và dropshipperId hợp lệ)
export function seedOrder(
  productIds: string[],
  count = 10,
  dropshipperIds?: string[],
): Order[] {
  const orders: Order[] = [];
  for (let i = 0; i < count; i++) {
    const productId = productIds[Math.floor(Math.random() * productIds.length)];
    // 50% đơn có dropshipperId, 50% không
    let dropshipperId: string | null = null;
    if (dropshipperIds && dropshipperIds.length > 0 && Math.random() > 0.5) {
      dropshipperId =
        dropshipperIds[Math.floor(Math.random() * dropshipperIds.length)];
    }
    const quantity = faker.number.int({ min: 1, max: 100 });
    const volume = parseFloat((Math.random() * 5).toFixed(2));
    const weight = parseFloat((Math.random() * 10).toFixed(2));
    orders.push({
      id: uuidv4(),
      productId,
      dropshipperId,
      timeCreated: faker.date.recent({ days: 10 }),
      status: faker.number.int({ min: 0, max: 3 }),
      quantity,
      volume,
      weight,
      locationX: faker.number.float({ min: 0, max: 1000 }),
      locationY: faker.number.float({ min: 0, max: 1000 }),
      note: Math.random() > 0.7 ? faker.lorem.sentence() : undefined,
    });
  }
  return orders;
}