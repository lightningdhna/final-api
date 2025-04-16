-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "dropshipperId" TEXT;

-- CreateTable
CREATE TABLE "Dropshipper" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Dropshipper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registration" (
    "dropshipperId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "commissionFee" DOUBLE PRECISION NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" INTEGER NOT NULL,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("dropshipperId","productId")
);

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_dropshipperId_fkey" FOREIGN KEY ("dropshipperId") REFERENCES "Dropshipper"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_dropshipperId_fkey" FOREIGN KEY ("dropshipperId") REFERENCES "Dropshipper"("id") ON DELETE SET NULL ON UPDATE CASCADE;
