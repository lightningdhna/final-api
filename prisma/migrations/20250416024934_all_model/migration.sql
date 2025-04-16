-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "volume" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "weight" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locationX" DOUBLE PRECISION NOT NULL,
    "locationY" DOUBLE PRECISION NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "timeToLoad" INTEGER NOT NULL DEFAULT 0,
    "supplierId" TEXT NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarehouseProduct" (
    "warehouseId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WarehouseProduct_pkey" PRIMARY KEY ("warehouseId","productId")
);

-- CreateTable
CREATE TABLE "Truck" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "maxWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxVolume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageSpeed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "timeActive" TIMESTAMP(3) NOT NULL,
    "timeInactive" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Truck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "timeCreated" TIMESTAMP(3) NOT NULL,
    "status" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "volume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "locationX" DOUBLE PRECISION NOT NULL,
    "locationY" DOUBLE PRECISION NOT NULL,
    "note" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "planDate" TIMESTAMP(3) NOT NULL,
    "status" INTEGER NOT NULL,
    "truckId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "warehouseId" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "executionTime" INTEGER NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseProduct" ADD CONSTRAINT "WarehouseProduct_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseProduct" ADD CONSTRAINT "WarehouseProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "Truck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
