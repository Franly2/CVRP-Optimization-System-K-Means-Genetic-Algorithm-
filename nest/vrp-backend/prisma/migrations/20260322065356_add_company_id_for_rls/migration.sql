/*
  Warnings:

  - Added the required column `companyId` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `DriverLocation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryShiftId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryShiftId` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `ProductSchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('MOBIL', 'MOTOR');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'SUSPENDED');

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DriverLocation" ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryShiftId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "deliveryShiftId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProductSchedule" ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "AccountStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "type" "VehicleType" NOT NULL DEFAULT 'MOTOR';

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "productId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryShift" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "DeliveryShift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DeliveryShiftToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DeliveryShiftToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_DeliveryShiftToProduct_B_index" ON "_DeliveryShiftToProduct"("B");

-- AddForeignKey
ALTER TABLE "DriverLocation" ADD CONSTRAINT "DriverLocation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_deliveryShiftId_fkey" FOREIGN KEY ("deliveryShiftId") REFERENCES "DeliveryShift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryShiftId_fkey" FOREIGN KEY ("deliveryShiftId") REFERENCES "DeliveryShift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryShift" ADD CONSTRAINT "DeliveryShift_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSchedule" ADD CONSTRAINT "ProductSchedule_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeliveryShiftToProduct" ADD CONSTRAINT "_DeliveryShiftToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "DeliveryShift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeliveryShiftToProduct" ADD CONSTRAINT "_DeliveryShiftToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
