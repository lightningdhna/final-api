export interface Product {
  id: string;
  name: string;
  date: Date;
  supplierId: string;
  price: number;
  note?: string;
}
