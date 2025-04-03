-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "supplierId" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
