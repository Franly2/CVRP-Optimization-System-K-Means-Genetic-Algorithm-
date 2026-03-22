/*
  Warnings:

  - A unique constraint covering the columns `[plateNumber,companyId]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Vehicle_plateNumber_key";

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_plateNumber_companyId_key" ON "Vehicle"("plateNumber", "companyId");
